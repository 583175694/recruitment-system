import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { Student } from '../../entity/student.entity';
import { ExamScore, Subject } from '../../entity/exam-score.entity';
import { Achievement } from '../../entity/achievement.entity';
import { ResumeAnalysisService } from './resume-analysis.service';
import { Resume } from '../../entity/resume.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, ExamScore, Subject, Achievement, Resume]),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService, ResumeAnalysisService],
  exports: [ApplicationService],
})
export class ApplicationModule {} 