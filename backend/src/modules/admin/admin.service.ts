import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, ApplicationStatus } from '../../entity/student.entity';
import { ExamScore, Subject } from '../../entity/exam-score.entity';
import { Achievement } from '../../entity/achievement.entity';
import { User, UserRole } from '../../entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(ExamScore)
    private examScoreRepository: Repository<ExamScore>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async updateApplicationStatus(id: number, status: ApplicationStatus, reviewComments?: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['examScores', 'examScores.subjects', 'achievements'],
    });

    if (!student) {
      throw new NotFoundException(`ID为${id}的学生不存在`);
    }

    student.status = status;
    if (reviewComments) {
      student.reviewComments = reviewComments;
    }

    return this.studentRepository.save(student);
  }

  async getStatistics(): Promise<any> {
    const totalApplications = await this.studentRepository.count();
    const pendingApplications = await this.studentRepository.count({
      where: { status: ApplicationStatus.PENDING },
    });
    const reviewingApplications = await this.studentRepository.count({
      where: { status: ApplicationStatus.REVIEWING },
    });
    const approvedApplications = await this.studentRepository.count({
      where: { status: ApplicationStatus.APPROVED },
    });
    const rejectedApplications = await this.studentRepository.count({
      where: { status: ApplicationStatus.REJECTED },
    });

    return {
      totalApplications,
      pendingApplications,
      reviewingApplications,
      approvedApplications,
      rejectedApplications,
    };
  }

  async createUser(username: string, password: string, name: string, role: UserRole): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      name,
      role,
    });

    await this.userRepository.save(user);
    
    const { password: _, ...result } = user;
    return result as User;
  }
} 