import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeSessionController } from './practice-session.controller';
import { PracticeSessionService } from './practice-session.service';
import { AnalysisService } from './analysis.service';
import { PracticeSession } from './practice-session.models';

@Module({
  imports: [TypeOrmModule.forFeature([PracticeSession])],
  controllers: [PracticeSessionController],
  providers: [PracticeSessionService, AnalysisService],
  exports: [PracticeSessionService],
})
export class PracticeSessionModule {}
