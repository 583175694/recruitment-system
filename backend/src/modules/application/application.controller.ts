import { Controller, Post, Body, Get, Param, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('applications')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
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
      gender: query.gender,
      graduationSchool: query.graduationSchool,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 10,
    };
    
    return this.applicationService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.findById(id);
  }
} 