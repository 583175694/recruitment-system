import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TeacherUploadService } from './teacher-upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('teacher-upload')
@UseGuards(JwtAuthGuard)
export class TeacherUploadController {
  constructor(private readonly teacherUploadService: TeacherUploadService) {}

  /**
   * POST /teacher-upload/resume
   * 教师上传学生简历图片（支持多张，对应多页简历），触发 OCR + LLM 解析
   */
  @Post('resume')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 单文件 10MB
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('只支持 JPG / PNG / WEBP 格式的图片'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadResume(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请上传图片文件');
    }
    const result = await this.teacherUploadService.uploadAndParseResume(files);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /teacher-upload/status/:jobId
   * 查询简历解析状态
   */
  @Get('status/:jobId')
  async getStatus(@Param('jobId') jobId: string) {
    const result = await this.teacherUploadService.getJobResult(jobId);
    return {
      success: true,
      data: result,
    };
  }
}
