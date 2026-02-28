import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import {
  PracticeSession as PracticeSessionEntity,
  SkillType,
  CefrLevel,
} from './practice-session.models';

export type CreatePracticeSessionDto = {
  studentId: string;
  skillType: SkillType;
  mediaUrl?: string | null;
  transcription?: string | null;
};

export type UpdatePracticeSessionScoresDto = {
  totalScore?: number | null;
  cefrLevel?: CefrLevel | null;
  fluencyScore?: number | null;
  pronunciationScore?: number | null;
  paceScore?: number | null;
  confidenceScore?: number | null;
  contentStructureScore?: number | null;
  transcription?: string | null;
  feedbackExplanation?: string | null;
  improvementSuggestions?: string | null;
};

@Injectable()
export class PracticeSessionService {
  constructor(
    @InjectRepository(PracticeSessionEntity)
    private readonly practiceSessionRepository: MongoRepository<PracticeSessionEntity>,
  ) {}

  async create(dto: CreatePracticeSessionDto): Promise<PracticeSessionEntity> {
    if (!ObjectId.isValid(dto.studentId)) {
      throw new BadRequestException('Invalid student ID format');
    }

    const session = this.practiceSessionRepository.create({
      studentId: dto.studentId,
      skillType: dto.skillType,
      mediaUrl: dto.mediaUrl ?? null,
      transcription: dto.transcription ?? null,
      totalScore: null,
      cefrLevel: null,
      fluencyScore: null,
      pronunciationScore: null,
      paceScore: null,
      confidenceScore: null,
      contentStructureScore: null,
      createdAt: new Date(),
    });

    return this.practiceSessionRepository.save(session);
  }

  async findAll(): Promise<PracticeSessionEntity[]> {
    return this.practiceSessionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PracticeSessionEntity> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid practice session ID format');
    }

    const session = await this.practiceSessionRepository.findOneBy({
      _id: new ObjectId(id),
    });

    if (!session) {
      throw new NotFoundException('Practice session not found');
    }

    return session;
  }

  /** List all practice sessions for a student (for dashboard / history) */
  async findByStudent(studentId: string): Promise<PracticeSessionEntity[]> {
    if (!ObjectId.isValid(studentId)) {
      throw new BadRequestException('Invalid student ID format');
    }

    return this.practiceSessionRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    data: Partial<CreatePracticeSessionDto> & Partial<UpdatePracticeSessionScoresDto>,
  ): Promise<PracticeSessionEntity> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid practice session ID format');
    }

    const session = await this.findOne(id);

    if (data.studentId !== undefined) {
      if (!ObjectId.isValid(data.studentId)) {
        throw new BadRequestException('Invalid student ID format');
      }
      (session as any).studentId = data.studentId;
    }
    if (data.mediaUrl !== undefined) session.mediaUrl = data.mediaUrl;
    if ((data as any).audioFileId !== undefined) {
      (session as any).audioFileId = (data as any).audioFileId;
    }
    if (data.transcription !== undefined) session.transcription = data.transcription;
    if (data.skillType !== undefined) session.skillType = data.skillType;
    if (data.totalScore !== undefined) session.totalScore = data.totalScore;
    if (data.cefrLevel !== undefined) session.cefrLevel = data.cefrLevel;
    if (data.fluencyScore !== undefined) session.fluencyScore = data.fluencyScore;
    if (data.pronunciationScore !== undefined) session.pronunciationScore = data.pronunciationScore;
    if (data.paceScore !== undefined) session.paceScore = data.paceScore;
    if (data.confidenceScore !== undefined) session.confidenceScore = data.confidenceScore;
    if (data.contentStructureScore !== undefined) session.contentStructureScore = data.contentStructureScore;
    if (data.feedbackExplanation !== undefined) session.feedbackExplanation = data.feedbackExplanation;
    if (data.improvementSuggestions !== undefined) session.improvementSuggestions = data.improvementSuggestions;

    return this.practiceSessionRepository.save(session);
  }

  /** Update only the five metrics + totalScore/cefrLevel/transcription (e.g. after AI analysis) */
  async updateScores(
    id: string,
    scores: UpdatePracticeSessionScoresDto,
  ): Promise<PracticeSessionEntity> {
    return this.update(id, scores);
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid practice session ID format');
    }

    const session = await this.findOne(id);
    await this.practiceSessionRepository.remove(session);
    return { message: 'Practice session deleted successfully' };
  }
}
