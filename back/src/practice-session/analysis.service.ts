import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { PracticeSessionService } from './practice-session.service';
import { CefrLevel } from './practice-session.models';
import {
  GROQ_API_BASE,
  GROQ_WHISPER_MODEL,
  GROQ_CHAT_MODEL,
  MONGO_URI,
  MONGO_DB_NAME,
  GRIDFS_BUCKET_NAME,
} from './constants';

let gridClient: MongoClient | null = null;
let gridBucket: GridFSBucket | null = null;

async function getGridFsBucket(): Promise<GridFSBucket> {
  if (!gridClient) {
    gridClient = new MongoClient(MONGO_URI);
    await gridClient.connect();
  }
  if (!gridBucket) {
    const db = gridClient.db(MONGO_DB_NAME);
    gridBucket = new GridFSBucket(db, { bucketName: GRIDFS_BUCKET_NAME });
  }
  return gridBucket;
}

export type AnalysisResult = {
  transcription: string;
  fluencyScore: number;
  pronunciationScore: number;
  paceScore: number;
  confidenceScore: number;
  contentStructureScore: number;
  totalScore: number;
  cefrLevel?: CefrLevel;
};

@Injectable()
export class AnalysisService {
  constructor(private readonly practiceSessionService: PracticeSessionService) {}

  /**
   * Run AI analysis: transcribe audio with Groq Whisper, then score transcript with Groq LLM.
   * Only GROQ_API_KEY is required in .env (Hugging Face no longer needed).
   */
  async analyze(sessionId: string): Promise<ReturnType<PracticeSessionService['findOne']>> {
    const session = await this.practiceSessionService.findOne(sessionId);
    if (!session.mediaUrl || !(session as any).audioFileId) {
      throw new BadRequestException('Session has no audio. Record or upload audio first.');
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      throw new BadRequestException('GROQ_API_KEY is not set. Add it to .env.');
    }

    const fileIdStr = (session as any).audioFileId as string;
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(fileIdStr);
    } catch {
      throw new BadRequestException('Invalid stored audio id on session.');
    }

    const { buffer, mimeType } = await this.getAudioFromGridFs(objectId);
    const ext = mimeType === 'audio/mpeg' ? '.mp3' : mimeType === 'audio/wav' ? '.wav' : '.webm';

    // 1) Transcribe with Groq Whisper (free, same API key)
    const transcription = await this.transcribeWithGroq(groqKey, buffer, `audio${ext}`, mimeType);

    // 2) Score with Groq LLM
    const scores = await this.scoreTranscriptWithGroq(groqKey, transcription);

    // 3) Get AI feedback explanation and improvement suggestions
    const { feedbackExplanation, improvementSuggestions } = await this.getFeedbackAndSuggestions(
      groqKey,
      transcription,
      scores,
    );

    // 4) Update session
    return this.practiceSessionService.updateScores(sessionId, {
      transcription,
      fluencyScore: scores.fluencyScore,
      pronunciationScore: scores.pronunciationScore,
      paceScore: scores.paceScore,
      confidenceScore: scores.confidenceScore,
      contentStructureScore: scores.contentStructureScore,
      totalScore: scores.totalScore,
      cefrLevel: scores.cefrLevel ?? undefined,
      feedbackExplanation: feedbackExplanation || null,
      improvementSuggestions: improvementSuggestions || null,
    });
  }

  /**
   * Ask Groq LLM for a short feedback explanation and 3–5 concrete suggestions to improve.
   */
  private async getFeedbackAndSuggestions(
    apiKey: string,
    transcript: string,
    scores: Omit<AnalysisResult, 'transcription'>,
  ): Promise<{ feedbackExplanation: string; improvementSuggestions: string }> {
    const systemPrompt = `You are an English speaking coach. Given a speech transcript and the scores (0–100) for fluency, pronunciation, pace, confidence, and content structure, provide:
1. feedbackExplanation: 2–4 short sentences explaining what the scores mean and why (e.g. what the learner did well, what needs work). Plain text, no bullet points.
2. improvementSuggestions: exactly 3 to 5 concrete, actionable suggestions to improve their level (e.g. "Practice word stress on multisyllabic words", "Try longer monologues to improve fluency"). Return this as a JSON array of strings.

Reply with ONLY a valid JSON object with keys "feedbackExplanation" (string) and "improvementSuggestions" (array of strings). No other text or markdown.`;

    const userMessage = `Transcript:\n${transcript}\n\nScores: fluency ${scores.fluencyScore}, pronunciation ${scores.pronunciationScore}, pace ${scores.paceScore}, confidence ${scores.confidenceScore}, content structure ${scores.contentStructureScore}. Total: ${scores.totalScore}, CEFR: ${scores.cefrLevel ?? 'N/A'}.`;

    try {
      const res = await axios.post<{ choices?: Array<{ message?: { content?: string } }> }>(
        `${GROQ_API_BASE}/chat/completions`,
        {
          model: GROQ_CHAT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.4,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const raw = res.data?.choices?.[0]?.message?.content?.trim();
      if (!raw) {
        return { feedbackExplanation: '', improvementSuggestions: '' };
      }

      let jsonStr = raw;
      const codeMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeMatch) jsonStr = codeMatch[1].trim();

      const parsed = JSON.parse(jsonStr) as {
        feedbackExplanation?: string;
        improvementSuggestions?: string[];
      };
      const explanation = typeof parsed.feedbackExplanation === 'string' ? parsed.feedbackExplanation.trim() : '';
      const suggestionsArray = Array.isArray(parsed.improvementSuggestions)
        ? parsed.improvementSuggestions.map((s) => (typeof s === 'string' ? s.trim() : String(s))).filter(Boolean)
        : [];
      const suggestionsText = suggestionsArray.join('\n');

      return { feedbackExplanation: explanation, improvementSuggestions: suggestionsText };
    } catch (_) {
      return { feedbackExplanation: '', improvementSuggestions: '' };
    }
  }

  private async transcribeWithGroq(
    apiKey: string,
    audioBuffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    formData.append('file', blob, filename);
    formData.append('model', GROQ_WHISPER_MODEL);
    formData.append('response_format', 'json');

    const res = await fetch(`${GROQ_API_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!res.ok) {
      const errBody = await res.text();
      let msg = `Transcription failed (${res.status})`;
      try {
        const errJson = JSON.parse(errBody);
        if (errJson.error?.message) msg = errJson.error.message;
      } catch (_) {}
      throw new BadRequestException(msg);
    }

    const data = (await res.json()) as { text?: string };
    return (data?.text || '').trim() || '(No speech detected)';
  }

  private async getAudioFromGridFs(
    fileId: ObjectId,
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    const bucket = await getGridFsBucket();
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) {
      throw new BadRequestException('Stored audio file not found in GridFS.');
    }
    const fileInfo = files[0];

    const chunks: Buffer[] = [];
    const stream = bucket.openDownloadStream(fileId);

    return await new Promise<{ buffer: Buffer; mimeType: string }>((resolve, reject) => {
      stream.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('error', (err) => reject(err));
      stream.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          mimeType: (fileInfo.contentType as string) || 'audio/webm',
        });
      });
    });
  }

  private async scoreTranscriptWithGroq(
    apiKey: string,
    transcript: string,
  ): Promise<Omit<AnalysisResult, 'transcription'>> {
    const systemPrompt = `You are an English speaking assessor. Given a speech transcript, rate the speaker from 0 to 100 on:
- fluencyScore: speech fluency and flow
- pronunciationScore: clarity of pronunciation (infer from word choice and structure if needed)
- paceScore: appropriate speaking pace
- confidenceScore: confidence indicators in the delivery
- contentStructureScore: organization and structure of content

Reply with ONLY a valid JSON object containing these five keys with integer values 0-100. Then add "totalScore" (average of the five, integer) and "cefrLevel" (one of: A1, A2, B1, B2, C1, C2). No other text. Example: {"fluencyScore":70,"pronunciationScore":65,"paceScore":75,"confidenceScore":70,"contentStructureScore":72,"totalScore":70,"cefrLevel":"B2"}`;

    const userMessage = `Transcript:\n\n${transcript}`;

    try {
      const res = await axios.post<{ choices?: Array<{ message?: { content?: string } }> }>(
        `${GROQ_API_BASE}/chat/completions`,
        {
          model: GROQ_CHAT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const raw = res.data?.choices?.[0]?.message?.content?.trim();
      if (!raw) {
        throw new Error('Empty response from scoring API');
      }

      // Strip markdown code block if present
      let jsonStr = raw;
      const codeMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeMatch) jsonStr = codeMatch[1].trim();

      const parsed = JSON.parse(jsonStr) as Record<string, number | string>;
      const fluencyScore = clamp(Number(parsed.fluencyScore), 0, 100);
      const pronunciationScore = clamp(Number(parsed.pronunciationScore), 0, 100);
      const paceScore = clamp(Number(parsed.paceScore), 0, 100);
      const confidenceScore = clamp(Number(parsed.confidenceScore), 0, 100);
      const contentStructureScore = clamp(Number(parsed.contentStructureScore), 0, 100);
      const totalScore =
        typeof parsed.totalScore === 'number'
          ? clamp(Math.round(parsed.totalScore), 0, 100)
          : Math.round(
              (fluencyScore + pronunciationScore + paceScore + confidenceScore + contentStructureScore) / 5,
            );
      const cefrLevel = parseCefr(parsed.cefrLevel);

      return {
        fluencyScore,
        pronunciationScore,
        paceScore,
        confidenceScore,
        contentStructureScore,
        totalScore,
        cefrLevel,
      };
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Scoring failed';
      throw new BadRequestException(`Scoring failed: ${msg}`);
    }
  }
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.round(Math.max(min, Math.min(max, n)));
}

function parseCefr(value: unknown): CefrLevel | undefined {
  const s = String(value || '').toUpperCase().trim();
  const valid: CefrLevel[] = [CefrLevel.A1, CefrLevel.A2, CefrLevel.B1, CefrLevel.B2, CefrLevel.C1, CefrLevel.C2];
  return valid.includes(s as CefrLevel) ? (s as CefrLevel) : undefined;
}
