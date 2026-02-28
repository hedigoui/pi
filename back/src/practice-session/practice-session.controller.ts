import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { PracticeSessionService } from './practice-session.service';
import { SkillType } from './practice-session.models';
import { AnalysisService } from './analysis.service';
import { MONGO_URI, MONGO_DB_NAME, GRIDFS_BUCKET_NAME } from './constants';

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

@Controller('practice-sessions')
export class PracticeSessionController {
  constructor(
    private readonly practiceSessionService: PracticeSessionService,
    private readonly analysisService: AnalysisService,
  ) {}

  @Post()
  async create(
    @Body()
    body: {
      studentId: string;
      skillType: SkillType;
      mediaUrl?: string | null;
      transcription?: string | null;
    },
  ) {
    if (!body.studentId || !body.skillType) {
      throw new BadRequestException('studentId and skillType are required');
    }
    const validSkills = Object.values(SkillType);
    if (!validSkills.includes(body.skillType)) {
      throw new BadRequestException(
        `skillType must be one of: ${validSkills.join(', ')}`,
      );
    }
    return this.practiceSessionService.create(body);
  }

  @Get()
  findAll() {
    return this.practiceSessionService.findAll();
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.practiceSessionService.findByStudent(studentId);
  }

  /** Run AI analysis (transcription + scoring). Requires HUGGINGFACE_TOKEN and GROQ_API_KEY in .env */
  @Post('analyze/:id')
  async analyze(@Param('id') id: string) {
    console.log('[Analyze] Request for session:', id);
    return this.analysisService.analyze(id);
  }

  /** Upload audio for a session into MongoDB GridFS: POST /practice-sessions/upload/:id */
  @Post('upload/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB for Groq free tier
    }),
  )
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile()
    file: {
      fieldname: string;
      originalname: string;
      buffer: Buffer;
      mimetype?: string;
      size?: number;
    },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const maxSize = 25 * 1024 * 1024; // 25MB for Groq free tier
    if (file.size != null && file.size > maxSize) {
      throw new BadRequestException(`File too large. Maximum size is 100 MB (got ${Math.round(file.size / 1024 / 1024)} MB).`);
    }
    const allowedMimePrefix = 'audio/';
    if (file.mimetype && !file.mimetype.startsWith(allowedMimePrefix)) {
      throw new BadRequestException('Only audio files are allowed (e.g. MP3, WAV, WebM, M4A, OGG).');
    }

    const bucket = await getGridFsBucket();
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { sessionId: id },
    });

    await new Promise<void>((resolve, reject) => {
      uploadStream.once('error', reject);
      uploadStream.once('finish', () => resolve());
      uploadStream.end(file.buffer);
    });

    const fileId = uploadStream.id as ObjectId;
    const fileIdStr = fileId.toHexString();
    const mediaUrl = `/practice-sessions/audio/${fileIdStr}`;

    return this.practiceSessionService.update(id, {
      mediaUrl,
      // store GridFS id for backend use
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...( { audioFileId: fileIdStr } as any ),
    });
  }

  /** Stream audio stored in GridFS */
  @Get('audio/:fileId')
  async streamAudio(@Param('fileId') fileId: string, @Res() res: Response) {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(fileId);
    } catch {
      throw new BadRequestException('Invalid audio id');
    }

    const bucket = await getGridFsBucket();
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files.length) {
      throw new NotFoundException('Audio not found');
    }
    const fileInfo = files[0];

    res.set({
      'Content-Type': fileInfo.contentType || 'audio/webm',
    });

    const stream = bucket.openDownloadStream(objectId);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).end('Error reading audio file');
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.practiceSessionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      studentId: string;
      skillType: SkillType;
      mediaUrl: string | null;
      transcription: string | null;
      totalScore: number | null;
      cefrLevel: string | null;
      fluencyScore: number | null;
      pronunciationScore: number | null;
      paceScore: number | null;
      confidenceScore: number | null;
      contentStructureScore: number | null;
    }>,
  ) {
    return this.practiceSessionService.update(id, body as any);
  }

  /** PATCH :id/scores — update only the five metrics + total/CEFR/transcription */
  @Patch(':id/scores')
  updateScores(
    @Param('id') id: string,
    @Body()
    body: {
      totalScore?: number | null;
      cefrLevel?: string | null;
      transcription?: string | null;
      fluencyScore?: number | null;
      pronunciationScore?: number | null;
      paceScore?: number | null;
      confidenceScore?: number | null;
      contentStructureScore?: number | null;
    },
  ) {
    return this.practiceSessionService.updateScores(id, body as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.practiceSessionService.remove(id);
  }
}
