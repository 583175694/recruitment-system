import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { Student } from '../../entity/student.entity';
import { ExamScore, Subject } from '../../entity/exam-score.entity';
import { Achievement } from '../../entity/achievement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, ExamScore, Subject, Achievement]),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {} 