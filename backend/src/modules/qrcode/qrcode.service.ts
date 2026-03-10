import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCode, QrCodeStatus } from '../../entity/qr-code.entity';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(QrCode)
    private qrCodeRepository: Repository<QrCode>,
  ) {}

  async generateQrCode(): Promise<{ qrCode: QrCode; imageDataUrl: string }> {
    // 将所有旧的二维码设置为过期
    await this.qrCodeRepository.update(
      { status: QrCodeStatus.ACTIVE },
      { status: QrCodeStatus.EXPIRED, expiredAt: new Date() },
    );

    // 生成新的二维码
    const token = uuidv4();
    const qrCode = this.qrCodeRepository.create({
      token,
      status: QrCodeStatus.ACTIVE,
    });

    await this.qrCodeRepository.save(qrCode);

    // 生成二维码图片（Base64）
    const url = `${process.env.H5_BASE_URL || 'http://localhost:5173'}/h5/apply?token=${token}`;
    const imageDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
    });

    return { qrCode, imageDataUrl };
  }

  async getActiveQrCode(): Promise<QrCode | null> {
    return this.qrCodeRepository.findOne({
      where: { status: QrCodeStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async getQrCodeList(): Promise<QrCode[]> {
    return this.qrCodeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async validateToken(token: string): Promise<QrCode> {
    const qrCode = await this.qrCodeRepository.findOne({
      where: { token },
    });

    if (!qrCode) {
      throw new NotFoundException('二维码不存在');
    }

    if (qrCode.status === QrCodeStatus.EXPIRED) {
      throw new NotFoundException('二维码已失效，请联系学校获取最新二维码');
    }

    return qrCode;
  }

  async incrementSubmissionCount(qrCodeId: number): Promise<void> {
    await this.qrCodeRepository.increment({ id: qrCodeId }, 'submissionCount', 1);
  }
}
