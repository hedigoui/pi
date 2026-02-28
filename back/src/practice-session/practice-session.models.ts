import {
  Column,
  Entity,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';

export enum SkillType {
  FLUENCY = 'fluency',
  VOCABULARY = 'vocabulary',
  PRONUNCIATION = 'pronunciation',
}

export enum CefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

/** MongoDB collection name: practice_sessions (visible in Compass) */
@Entity('practice_sessions')
export class PracticeSession {
  @ObjectIdColumn()
  _id: ObjectId;

  /** Reference to User (student). Stored as 24-char hex string for TypeORM compatibility. */
  @Column({ type: 'string' })
  studentId: string;

  /**
   * URL to stream the stored audio for this session.
   * For GridFS storage this will look like: /practice-sessions/audio/<fileId>
   */
  @Column({ nullable: true })
  mediaUrl: string | null;

  /**
   * GridFS file id (stringified ObjectId) for the stored audio.
   * Used by the backend to fetch the audio bytes for analysis/streaming.
   */
  @Column({ nullable: true })
  audioFileId: string | null;

  /** Transcribed text from the audio */
  @Column({ nullable: true })
  transcription: string | null;

  @Column({ type: 'enum', enum: SkillType })
  skillType: SkillType;

  /** Overall score 0–100 (derived from metrics or set by evaluator) */
  @Column({ type: 'number', nullable: true })
  totalScore: number | null;

  @Column({ type: 'enum', enum: CefrLevel, nullable: true })
  cefrLevel: CefrLevel | null;

  // —— Five evaluation metrics (0–100 each) ——
  /** Speech fluency */
  @Column({ type: 'number', nullable: true })
  fluencyScore: number | null;

  /** Pronunciation clarity */
  @Column({ type: 'number', nullable: true })
  pronunciationScore: number | null;

  /** Speaking pace */
  @Column({ type: 'number', nullable: true })
  paceScore: number | null;

  /** Confidence indicators */
  @Column({ type: 'number', nullable: true })
  confidenceScore: number | null;

  /** Content structure */
  @Column({ type: 'number', nullable: true })
  contentStructureScore: number | null;

  /** AI-generated explanation of the feedback (why these scores, what they mean) */
  @Column({ nullable: true })
  feedbackExplanation: string | null;

  /** AI-generated suggestions to improve (newline-separated or JSON array string) */
  @Column({ nullable: true })
  improvementSuggestions: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
