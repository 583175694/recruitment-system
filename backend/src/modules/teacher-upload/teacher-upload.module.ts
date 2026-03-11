import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherUploadController } from './teacher-upload.controller';
import { TeacherUploadService } from './teacher-upload.service';
import { H5Application } from '../../entity/h5-application.entity';
import { AuthModule } from '../auth/auth.module';
import { CosModule } from '../cos/cos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([H5Application]),
    AuthModule,
    CosModule,
  ],
  controllers: [TeacherUploadController],
  providers: [TeacherUploadService],
})
export class TeacherUploadModule {}
