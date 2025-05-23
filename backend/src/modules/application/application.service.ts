import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, ApplicationStatus, Gender } from '../../entity/student.entity';
import { ExamScore, Subject } from '../../entity/exam-score.entity';
import { Achievement } from '../../entity/achievement.entity';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(ExamScore)
    private examScoreRepository: Repository<ExamScore>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<Student> {
    const { examScores, achievements, ...studentData } = createApplicationDto;

    // 检查身份证号是否已存在
    const existingStudent = await this.studentRepository.findOne({
      where: { idNumber: studentData.idNumber },
    });
    
    if (existingStudent) {
      throw new BadRequestException('身份证号已存在，该学生已经申请');
    }

    // 创建学生记录
    const student = this.studentRepository.create({
      ...studentData,
      status: ApplicationStatus.PENDING,
    });
    
    await this.studentRepository.save(student);

    // 保存考试成绩
    if (examScores && examScores.length > 0) {
      for (const scoreDto of examScores) {
        // 创建考试记录
        const examScore = this.examScoreRepository.create({
          gradeLevel: scoreDto.gradeLevel,
          certificateImage: scoreDto.certificateImage,
          student: student,
        });
        
        // 保存考试记录
        const savedExamScore = await this.examScoreRepository.save(examScore);
        
        // 处理每个科目
        if (scoreDto.subjects && scoreDto.subjects.length > 0) {
          const subjectEntities = scoreDto.subjects.map(subjectDto => {
            // 将score从string转换为number
            const scoreValue = subjectDto.score ? parseFloat(subjectDto.score) : null;
            
            return this.subjectRepository.create({
              name: subjectDto.name,
              scoreType: subjectDto.scoreType,
              score: scoreValue,
              grade: subjectDto.grade,
              examScore: savedExamScore,
            });
          });
          
          await this.subjectRepository.save(subjectEntities);
        }
      }
    }

    // 保存荣誉成就
    if (achievements && achievements.length > 0) {
      // 过滤掉空的荣誉项（没有填写name或其他必填字段的项）
      const validAchievements = achievements.filter(ach => 
        ach.name && ach.level && ach.awardDate && ach.certificateImage
      );
      
      if (validAchievements.length > 0) {
        const achievementEntities = validAchievements.map(achievementDto =>
          this.achievementRepository.create({
            ...achievementDto,
            awardDate: new Date(achievementDto.awardDate),
            student,
          }),
        );
        await this.achievementRepository.save(achievementEntities);
      }
    }

    // 重新加载包含关联数据的学生
    return this.findById(student.id);
  }

  async findById(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['examScores', 'examScores.subjects', 'achievements'],
    });

    if (!student) {
      throw new NotFoundException(`ID为${id}的学生不存在`);
    }

    return student;
  }

  async findAll(filters?: any): Promise<{ students: Student[]; total: number }> {
    const { status, name, graduationSchool, schoolDistrict, page = 1, limit = 10 } = filters || {};
    
    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.examScores', 'examScores')
      .leftJoinAndSelect('examScores.subjects', 'subjects')
      .leftJoinAndSelect('student.achievements', 'achievements')
      .orderBy('student.createdAt', 'DESC');
    
    if (status) {
      queryBuilder.andWhere('student.status = :status', { status });
    }
    
    if (name) {
      queryBuilder.andWhere('student.name LIKE :name', { name: `%${name}%` });
    }
    
    if (graduationSchool) {
      queryBuilder.andWhere('student.graduationSchool LIKE :graduationSchool', 
        { graduationSchool: `%${graduationSchool}%` });
    }
    
    if (schoolDistrict) {
      queryBuilder.andWhere('student.schoolDistrict = :schoolDistrict', { schoolDistrict });
    }
    
    // 计算分页
    const skip = (page - 1) * limit;
    
    // 获取总数
    const total = await queryBuilder.getCount();
    
    // 获取分页数据
    const students = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();
    
    return { students, total };
  }

  async updateStatus(id: number, status: ApplicationStatus, reviewComments?: string): Promise<Student> {
    const student = await this.findById(id);
    
    student.status = status;
    if (reviewComments) {
      student.reviewComments = reviewComments;
    }
    
    return this.studentRepository.save(student);
  }

  // 身份证号验证
  validateIdNumber(idNumber: string): boolean {
    // 基本格式检查：18位，最后一位可能是X
    const pattern = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]$/;
    
    if (!pattern.test(idNumber)) {
      return false;
    }
    
    // 可以添加更复杂的校验逻辑，如校验码验证
    // 这里只做基本格式验证
    return true;
  }
} 