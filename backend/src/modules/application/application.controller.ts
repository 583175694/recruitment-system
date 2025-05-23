import { Controller, Post, Body, Get, Param, Query, ParseIntPipe, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ResumeAnalysisService } from './resume-analysis.service';

@Controller('applications')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly resumeAnalysisService: ResumeAnalysisService,
  ) {}

  @Post()
  async create(@Body() createApplicationDto: CreateApplicationDto) {
    // 验证身份证号
    if (!this.applicationService.validateIdNumber(createApplicationDto.idNumber)) {
      throw new BadRequestException('无效的身份证号');
    }
    
    return this.applicationService.create(createApplicationDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    const filters = {
      name: query.name,
      idNumber: query.idNumber,
      status: query.status,
      gender: query.gender,
      schoolDistrict: query.schoolDistrict,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 10,
    };
    
    return this.applicationService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.findById(id);
  }

  @Post('upload/photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('只允许上传JPG, JPEG或PNG格式的图片'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('未上传文件');
    }
    
    return {
      filename: file.filename,
      path: `/uploads/photos/${file.filename}`,
    };
  }

  @Post('upload/certificate')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/certificates',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
          return cb(new BadRequestException('只允许上传JPG, JPEG, PNG或PDF格式的文件'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadCertificate(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('未上传文件');
    }
    
    return {
      filename: file.filename,
      path: `/uploads/certificates/${file.filename}`,
    };
  }

  @Post('upload/resume')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/resumes',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
          return cb(new BadRequestException('只允许上传PDF、DOC或DOCX格式的文件'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
    }),
  )
  async uploadResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('未上传文件');
    }
    
    // 发送到简历分析服务
    const resumeId = await this.resumeAnalysisService.createResumeJob(
      file.originalname,
      file.filename,
    );
    
    return {
      resumeId,
      filename: file.filename,
      path: `/uploads/resumes/${file.filename}`,
      message: '简历已上传并将进行分析',
    };
  }
} 