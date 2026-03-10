import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { H5Application, H5ApplicationStatus } from '../../entity/h5-application.entity';
import { CreateH5ApplicationDto } from './dto/create-h5-application.dto';
import { QrCodeService } from '../qrcode/qrcode.service';

@Injectable()
export class H5ApplicationService {
  constructor(
    @InjectRepository(H5Application)
    private h5ApplicationRepository: Repository<H5Application>,
    private qrCodeService: QrCodeService,
  ) {}

  async createApplication(createDto: CreateH5ApplicationDto): Promise<H5Application> {
    // 验证二维码
    const qrCode = await this.qrCodeService.validateToken(createDto.token);

    // 验证荣誉数量
    if (createDto.honors.length === 0 || createDto.honors.length > 3) {
      throw new BadRequestException('学生荣誉必须填写1-3项');
    }

    // 创建申请记录
    const application = this.h5ApplicationRepository.create({
      qrCodeId: qrCode.id,
      studentName: createDto.studentName,
      gender: createDto.gender,
      graduationSchool: createDto.graduationSchool,
      contactPhone: createDto.contactPhone,
      idCardNumber: createDto.idCardNumber || null,
      honors: createDto.honors,
      certificateImages: createDto.certificateImages || [],
      status: H5ApplicationStatus.PENDING,
    });

    const saved = await this.h5ApplicationRepository.save(application);

    // 增加二维码提交计数
    await this.qrCodeService.incrementSubmissionCount(qrCode.id);

    return saved;
  }

  async getApplicationList(params: {
    page: number;
    pageSize: number;
    school?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, pageSize, school, startDate, endDate } = params;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.h5ApplicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.qrCode', 'qrCode');

    if (school) {
      queryBuilder.andWhere('application.graduationSchool LIKE :school', {
        school: `%${school}%`,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('application.submittedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    queryBuilder.orderBy('application.submittedAt', 'DESC').skip(skip).take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async getApplicationDetail(id: number): Promise<H5Application> {
    const application = await this.h5ApplicationRepository.findOne({
      where: { id },
      relations: ['qrCode'],
    });

    if (!application) {
      throw new NotFoundException('申请记录不存在');
    }

    return application;
  }

  async updateStatus(id: number, status: 'approved' | 'rejected'): Promise<void> {
    const application = await this.h5ApplicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('申请记录不存在');
    }

    application.status = status === 'approved' ? H5ApplicationStatus.APPROVED : H5ApplicationStatus.REJECTED;
    await this.h5ApplicationRepository.save(application);
  }
}
