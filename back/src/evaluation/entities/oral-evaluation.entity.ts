// // backend/src/evaluation/entities/oral-evaluation.entity.ts
// import {
//   Entity,
//   ObjectIdColumn,
//   ObjectId,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from 'typeorm';

// export enum EvaluationStatus {
//   PENDING = 'pending',
//   PROCESSING = 'processing',
//   COMPLETED = 'completed',
//   FAILED = 'failed',
// }

// @Entity('oral_evaluations')
// export class OralEvaluation {
//   @ObjectIdColumn()
//   _id: ObjectId;

//   @Column()
//   performanceId: string;

//   @Column()
//   subject: string;

//   @Column('text')
//   transcript: string;

//   @Column('simple-json')
//   speechMetrics: {
//     fluency: number;
//     pronunciation: number;
//     speakingPace: number;
//     confidence: number;
//     details: {
//       totalWords: number;
//       fillerWords: number;
//       averagePauseDuration: number;
//       wordsPerMinute: number;
//       totalSpeakingTime: number;
//     };
//   };

//   @Column('simple-json')
//   contentScores?: {
//     structure: number;
//     coherence: number;
//     topicRelevance: number;
//     grammar: number;
//     vocabulary: number;
//   };

//   @Column('simple-json')
//   contentAnalysis?: {
//     summary: string;
//     keyPoints: string[];
//     strengths: string[];
//     improvements: string[];
//   };

//   @Column('simple-json')
//   assemblyAIRaw?: any;

//   @Column('simple-json')
//   openAIRaw?: any;

//   @Column({
//     type: 'enum',
//     enum: EvaluationStatus,
//     default: EvaluationStatus.PENDING,
//   })
//   status: EvaluationStatus;

//   @Column()
//   errorMessage?: string;

//   @Column()
//   language: string = 'en';

//   @Column()
//   processingTime?: number;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   @Column()
//   evaluatedAt?: Date;
// }


// backend/src/evaluation/entities/oral-evaluation.entity.ts
import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EvaluationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('oral_evaluations')
export class OralEvaluation {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  performanceId: string;

  @Column()
  subject: string;

  @Column('text')
  transcript: string;

  @Column('simple-json')
  speechMetrics: {
    fluency: number;
    pronunciation: number;
    speakingPace: number;
    confidence: number;
    details: {
      totalWords: number;
      fillerWords: number;
      averagePauseDuration: number;
      wordsPerMinute: number;
      totalSpeakingTime: number;
    };
  };

  // UPDATED: Content scores from Gemini
  @Column('simple-json', { nullable: true })
  contentScores?: {
    contentStructure: number;  // Renamed from 'structure' to match Gemini
    coherence: number;
    topicRelevance: number;
    grammar: number;
    vocabulary: number;
  };

  // UPDATED: Content analysis with more fields
  @Column('simple-json', { nullable: true })
  contentAnalysis?: {
    summary: string;
    keyPoints: string[];
    strengths: string[];
    improvements: string[];
    cefrLevel: string;  // NEW: CEFR level (A1-C2)
  };

  // NEW: Detailed feedback from Gemini
  @Column('simple-json', { nullable: true })
  detailedContentFeedback?: {
    structure: string;           // Feedback on organization
    contentGaps: string[];       // Missing important points
    vocabularySuggestions: string[]; // Alternative word choices
  };

  @Column('simple-json', { nullable: true })
  assemblyAIRaw?: any;

  @Column('simple-json', { nullable: true })
  geminiRaw?: any;  // Renamed from openAIRaw to geminiRaw

  @Column({
    type: 'enum',
    enum: EvaluationStatus,
    default: EvaluationStatus.PENDING,
  })
  status: EvaluationStatus;

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ nullable: true })
  processingTime?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  evaluatedAt?: Date;
}