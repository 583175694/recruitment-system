import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const COS = require('cos-nodejs-sdk-v5');

@Injectable()
export class CosService {
  private cosClient: InstanceType<typeof COS>;
  private bucket: string;
  private region: string;
  private directory = 'recruitment-h5';

  constructor(private configService: ConfigService) {
    this.cosClient = new COS({
      SecretId: this.configService.get<string>('COS_SECRET_ID'),
      SecretKey: this.configService.get<string>('COS_SECRET_KEY'),
    });
    this.bucket = this.configService.get<string>('COS_BUCKET');
    this.region = this.configService.get<string>('COS_REGION');
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname);
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const key = `${this.directory}/${randomName}${ext}`;

    return new Promise((resolve, reject) => {
      this.cosClient.putObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: file.buffer,
          ContentLength: file.size,
          ContentType: file.mimetype,
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
            resolve(url);
          }
        },
      );
    });
  }
}
