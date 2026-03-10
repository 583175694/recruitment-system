import { Controller, Post, Get, UseGuards, Param } from '@nestjs/common';
import { QrCodeService } from './qrcode.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('qrcode')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateQrCode() {
    const result = await this.qrCodeService.generateQrCode();
    return {
      success: true,
      data: result,
    };
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async getActiveQrCode() {
    const qrCode = await this.qrCodeService.getActiveQrCode();
    return {
      success: true,
      data: qrCode,
    };
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getQrCodeList() {
    const list = await this.qrCodeService.getQrCodeList();
    return {
      success: true,
      data: list,
    };
  }

  @Get('validate/:token')
  async validateToken(@Param('token') token: string) {
    const qrCode = await this.qrCodeService.validateToken(token);
    return {
      success: true,
      data: qrCode,
    };
  }
}
