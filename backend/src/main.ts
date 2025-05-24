import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { ValidationExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS
  app.enableCors();
  
  // 配置全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      // 简单地创建一个包含验证错误的 BadRequestException
      return new BadRequestException(errors);
    }
  }));
  
  // 应用全局过滤器
  app.useGlobalFilters(new ValidationExceptionFilter());
  
  // 配置静态文件服务
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  
  // 设置全局前缀
  app.setGlobalPrefix('recruitment-api');
  
  // 启动应用
  await app.listen(3031);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap(); 