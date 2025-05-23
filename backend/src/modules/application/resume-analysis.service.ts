import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume, ProcessingStatus } from '../../entity/resume.entity';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResumeAnalysisService {
  private readonly logger = new Logger(ResumeAnalysisService.name);

  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    private configService: ConfigService,
  ) {}

  async createResumeJob(originalFilename: string, storedFilename: string): Promise<number> {
    // 创建一个简历处理任务
    const resume = this.resumeRepository.create({
      originalFilename,
      storedFilename,
      status: ProcessingStatus.PENDING,
    });

    await this.resumeRepository.save(resume);

    // 异步处理简历
    this.processResume(resume.id).catch(error => {
      this.logger.error(`简历处理失败: ${error.message}`, error.stack);
    });

    return resume.id;
  }

  private async processResume(resumeId: number): Promise<void> {
    try {
      const resume = await this.resumeRepository.findOne({
        where: { id: resumeId },
      });

      if (!resume || resume.status !== ProcessingStatus.PENDING) {
        return;
      }

      // 更新状态为处理中
      resume.status = ProcessingStatus.PROCESSING;
      await this.resumeRepository.save(resume);

      // 获取文件路径
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        'resumes',
        resume.storedFilename,
      );

      // 确保文件存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`文件不存在: ${filePath}`);
      }

      // 这里调用AI服务提取信息
      // 在实际应用中，这里可以调用诸如OpenAI、百度智能云等的API进行文档分析
      // 现在我们简单模拟一下分析过程
      const extractedData = await this.simulateAIExtraction(filePath, resume.originalFilename);

      // 更新简历数据
      resume.status = ProcessingStatus.COMPLETED;
      resume.extractedData = extractedData;
      await this.resumeRepository.save(resume);

      this.logger.log(`简历 ${resumeId} 分析完成`);
    } catch (error) {
      // 保存错误信息
      const resume = await this.resumeRepository.findOne({
        where: { id: resumeId },
      });
      
      if (resume) {
        resume.status = ProcessingStatus.FAILED;
        resume.errorMessage = error.message;
        await this.resumeRepository.save(resume);
      }
      
      throw error;
    }
  }

  private async simulateAIExtraction(filePath: string, filename: string): Promise<any> {
    // 这里只是模拟，实际应用中应该调用AI服务
    // 等待一段时间模拟处理过程
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 返回模拟数据
    return {
      name: '张三',
      gender: '男',
      idNumber: '110101200001010010',
      graduationSchool: '某小学',
      schoolDistrict: '某区',
      examScores: [
        {
          gradeLevel: '四年级',
          subjects: [
            { name: '语文', scoreType: 'numeric', score: '92' },
            { name: '数学', scoreType: 'numeric', score: '95' },
            { name: '英语', scoreType: 'numeric', score: '88' }
          ]
        },
        {
          gradeLevel: '五年级',
          subjects: [
            { name: '语文', scoreType: 'numeric', score: '90' },
            { name: '数学', scoreType: 'numeric', score: '94' },
            { name: '英语', scoreType: 'grade', grade: 'A' }
          ]
        },
        {
          gradeLevel: '六年级',
          subjects: [
            { name: '语文', scoreType: 'numeric', score: '93' },
            { name: '数学', scoreType: 'numeric', score: '96' },
            { name: '英语', scoreType: 'numeric', score: '91' }
          ]
        }
      ],
      achievements: [
        {
          name: '三好学生',
          level: '区级',
          awardDate: '2024-03-15'
        }
      ],
      parentName: '张父',
      parentWorkplace: '某企业',
      parentContact: '13800138000'
    };
  }

  async getResumeStatus(resumeId: number): Promise<any> {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new Error('简历不存在');
    }

    return {
      status: resume.status,
      data: resume.status === ProcessingStatus.COMPLETED ? resume.extractedData : null,
      error: resume.errorMessage,
    };
  }
} 