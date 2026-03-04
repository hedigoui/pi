// src/oral-performance/oral-performance.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OralPerformanceController } from './oral-performance.controller';
import { OralPerformanceService } from './oral-performance.service';
import { OralPerformance } from './oral-performance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OralPerformance])],
  controllers: [OralPerformanceController],
  providers: [OralPerformanceService],
  exports: [OralPerformanceService],
})
export class OralPerformanceModule {}