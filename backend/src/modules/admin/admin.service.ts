import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Student } from "../../entity/student.entity";
import { User, UserRole } from "../../entity/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getApplication(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`ID为${id}的学生不存在`);
    }

    return student;
  }

  async deleteApplication(id: number): Promise<{ success: boolean }> {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`ID为${id}的学生不存在`);
    }

    await this.studentRepository.remove(student);
    return { success: true };
  }

  async getStatistics(): Promise<any> {
    const totalApplications = await this.studentRepository.count();

    return {
      totalApplications,
    };
  }

  async createUser(
    username: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException("用户名已存在");
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
