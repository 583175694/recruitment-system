import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { AdminModule } from "./modules/admin/admin.module";
import { ApplicationModule } from "./modules/application/application.module";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 3306),
        username: configService.get("DB_USERNAME", "root"),
        password: configService.get("DB_PASSWORD", "123456"),
        database: configService.get("DB_DATABASE", "recruitment"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: configService.get<boolean>("DB_SYNCHRONIZE", false),
        // 添加连接池配置，防止连接耗尽
        extra: {
          connectionLimit: 10, // 最大连接数
          connectTimeout: 60000, // 连接超时
          acquireTimeout: 60000, // 获取连接超时
          timeout: 60000, // 查询超时
        },
        // 启用日志，方便排查问题
        logging: configService.get<boolean>("DB_LOGGING", false),
      }),
    }),

    // 文件上传模块
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        storage: diskStorage({
          destination: "./uploads",
          filename: (req, file, cb) => {
            const randomName = Array(32)
              .fill(null)
              .map(() => Math.round(Math.random() * 16).toString(16))
              .join("");
            return cb(null, `${randomName}${extname(file.originalname)}`);
          },
        }),
      }),
    }),

    // 业务模块
    AuthModule,
    AdminModule,
    ApplicationModule,
  ],
})
export class AppModule {}
