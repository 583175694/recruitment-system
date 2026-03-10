import { Controller, Post, Get, Body, UseInterceptors, UploadedFile, Query, Param, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { H5ApplicationService } from './h5-application.service';
import { CreateH5ApplicationDto } from './dto/create-h5-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CosService } from '../cos/cos.service';

@Controller('h5-application')
export class H5ApplicationController {
  constructor(
    private readonly h5ApplicationService: H5ApplicationService,
    private readonly cosService: CosService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
        return cb(new Error('只支持JPG和PNG格式'), false);
      }
      cb(null, true);
    },
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return {
        success: false,
        message: '文件上传失败',
      };
    }

    const url = await this.cosService.uploadFile(file);
    return {
      success: true,
      data: { url },
    };
  }

  @Post('submit')
  async submitApplication(@Body() createDto: CreateH5ApplicationDto) {
    const application = await this.h5ApplicationService.createApplication(createDto);
    return {
      success: true,
      message: '提交成功',
      data: application,
    };
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getApplicationList(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('school') school?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.h5ApplicationService.getApplicationList({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      school,
      startDate,
      endDate,
    });
    return {
      success: true,
      data: result,
    };
  }

  @Get('detail/:id')
  @UseGuards(JwtAuthGuard)
  async getApplicationDetail(@Param('id') id: number) {
    const application = await this.h5ApplicationService.getApplicationDetail(id);
    return {
      success: true,
      data: application,
    };
  }

  @Post('approve/:id')
  @UseGuards(JwtAuthGuard)
  async approveApplication(@Param('id') id: number) {
    await this.h5ApplicationService.updateStatus(id, 'approved');
    return {
      success: true,
      message: '审核通过',
    };
  }

  @Post('reject/:id')
  @UseGuards(JwtAuthGuard)
  async rejectApplication(@Param('id') id: number) {
    await this.h5ApplicationService.updateStatus(id, 'rejected');
    return {
      success: true,
      message: '已驳回',
    };
  }
}
