import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Student } from '../../entity/student.entity';
import { ExamScore, Subject } from '../../entity/exam-score.entity';
import { Achievement } from '../../entity/achievement.entity';
import { User } from '../../entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, ExamScore, Subject, Achievement, User]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {} 