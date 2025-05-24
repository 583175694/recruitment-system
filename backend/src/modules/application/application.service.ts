import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, Gender } from '../../entity/student.entity';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<Student> {
    const studentData = createApplicationDto;

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
      birthDate: studentData.birthDate ? new Date(studentData.birthDate) : null,
    });
    
    await this.studentRepository.save(student);

    // 返回创建的学生记录
    return this.findById(student.id);
  }

  async findById(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`ID为${id}的学生不存在`);
    }

    return student;
  }

  async findAll(filters?: any): Promise<{ students: Student[]; total: number }> {
    const { name, gender, graduationSchool, page = 1, limit = 10 } = filters || {};
    
    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .orderBy('student.createdAt', 'DESC');
    
    if (name) {
      queryBuilder.andWhere('student.name LIKE :name', { name: `%${name}%` });
    }
    
    if (gender) {
      queryBuilder.andWhere('student.gender = :gender', { gender });
    }
    
    if (graduationSchool) {
      queryBuilder.andWhere('student.graduationSchool LIKE :graduationSchool', 
        { graduationSchool: `%${graduationSchool}%` });
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