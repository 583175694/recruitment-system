import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { H5ApplicationController } from './h5-application.controller';
import { H5ApplicationService } from './h5-application.service';
import { H5Application } from '../../entity/h5-application.entity';
import { QrCodeModule } from '../qrcode/qrcode.module';
import { AuthModule } from '../auth/auth.module';
import { CosModule } from '../cos/cos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([H5Application]),
    QrCodeModule,
    AuthModule,
    CosModule,
  ],
  controllers: [H5ApplicationController],
  providers: [H5ApplicationService],
  exports: [H5ApplicationService],
})
export class H5ApplicationModule {}
