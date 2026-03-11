import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { H5Application, H5ApplicationStatus } from '../../entity/h5-application.entity';
import { ConfigService } from '@nestjs/config';
import { CosService } from '../cos/cos.service';
import * as https from 'https';
import * as http from 'http';



@Injectable()
export class TeacherUploadService {
  private readonly logger = new Logger(TeacherUploadService.name);

  private readonly glmOcrApiKey: string;
  private readonly glmOcrBaseUrl: string;
  private readonly qwenApiKey: string;
  private readonly qwenBaseUrl: string;
  private readonly qwenModel: string;

  constructor(
    @InjectRepository(H5Application)
    private h5ApplicationRepository: Repository<H5Application>,
    private configService: ConfigService,
    private cosService: CosService,
  ) {
    this.glmOcrApiKey = this.configService.get<string>('GLM_OCR_API_KEY', 'e3fff66c0aa840fb98a8d429e17c6354.unr3m0uVyyytEXRp');
    this.glmOcrBaseUrl = this.configService.get<string>('GLM_OCR_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4');
    this.qwenApiKey = this.configService.get<string>('QWEN_API_KEY', 'sk-1a16a11ecbba4b6c8facd5e13b4ed3dc');
    this.qwenBaseUrl = this.configService.get<string>('QWEN_BASE_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1');
    this.qwenModel = this.configService.get<string>('QWEN_MODEL', 'qwen3.5-flash');
  }

  /**
   * 上传并解析多张简历图片，将结果存入 H5Application 表
   */
  async uploadAndParseResume(
    files: Express.Multer.File[],
  ): Promise<{ jobId: string; message: string }> {
    const jobId = `teacher_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 异步处理，立即返回
    this.processResume(files, jobId).catch((err) => {
      this.logger.error(`简历处理失败 [${jobId}]: ${err.message}`, err.stack);
    });

    return { jobId, message: `简历上传成功（共 ${files.length} 张），正在识别处理中，请稍候刷新查看结果` };
  }

  /**
   * 查询处理结果（通过 teacherJobId 匹配）
   */
  async getJobResult(jobId: string): Promise<any> {
    const application = await this.h5ApplicationRepository
      .createQueryBuilder('app')
      .where('app.teacherJobId = :jobId', { jobId })
      .getOne();

    if (!application) {
      return { status: 'processing', message: '正在处理中，请稍候' };
    }

    return { status: 'completed', data: application };
  }

  private async processResume(files: Express.Multer.File[], jobId: string): Promise<void> {
    try {
      this.logger.log(`开始处理简历 [${jobId}]，共 ${files.length} 张图片: ${files.map(f => f.originalname).join(', ')}`);

      // 1. 并发上传所有图片到 COS
      this.logger.log(`[${jobId}] 并发上传 ${files.length} 张图片到 COS...`);
      const imageUrls = await Promise.all(files.map(f => this.cosService.uploadFile(f)));
      this.logger.log(`[${jobId}] COS 上传完成，URLs: ${imageUrls.join(', ')}`);

      // 2. 并发对所有图片调用 GLM-OCR，按页顺序拼接文字
      this.logger.log(`[${jobId}] 并发调用 GLM-OCR 识别 ${imageUrls.length} 张图片...`);
      const ocrResults = await Promise.all(imageUrls.map((url, idx) =>
        this.callGlmOcr(url).then(text => {
          this.logger.log(`[${jobId}] 第 ${idx + 1} 张 OCR 完成，文字长度: ${text.length}`);
          return text;
        })
      ));
      // 多页内容用分隔符拼接
      const ocrText = ocrResults
        .map((text, idx) => `===== 第 ${idx + 1} 页 =====\n${text}`)
        .join('\n\n');
      this.logger.log(`[${jobId}] 全部 OCR 完成，合并文字总长度: ${ocrText.length}`);

      // 3. 调用 Qwen 解析结构化信息
      this.logger.log(`[${jobId}] 调用 Qwen 结构化解析...`);
      const parsed = await this.callQwenParse(ocrText);
      this.logger.log(`[${jobId}] Qwen 解析完成: ${JSON.stringify(parsed)}`);

      // 4. 创建 H5Application 记录
      const applicationData: Partial<H5Application> = {
        studentName: parsed.studentName || '',
        gender: parsed.gender || '',
        graduationSchool: parsed.graduationSchool || '',
        contactPhone: parsed.contactPhone || '',
        schoolDistrict: parsed.schoolDistrict || '',
        honors: parsed.honors || [],
        certificateImages: [],
        status: H5ApplicationStatus.PENDING,
        qrCodeId: null,
        teacherJobId: jobId,
        sourceType: 'teacher',
        serialNumber: parsed.serialNumber || '',
      };
      const application: H5Application = this.h5ApplicationRepository.create(applicationData);
      const saved: H5Application = await this.h5ApplicationRepository.save(application);
      this.logger.log(`[${jobId}] 简历记录已保存，id: ${saved.id}`);
    } catch (error) {
      this.logger.error(`[${jobId}] 处理失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 调用 GLM-OCR API 进行图片文字识别
   * 接口：/api/paas/v4/layout_parsing
   * 请求体：{model: 'glm-ocr', file: 'https://...'}
   * 结果在 response.md_results
   */
  private async callGlmOcr(imageUrl: string): Promise<string> {
    const payload = {
      model: 'glm-ocr',
      file: imageUrl,
    };

    this.logger.log(`[GLM-OCR] 请求 URL: ${this.glmOcrBaseUrl}/layout_parsing`);
    this.logger.log(`[GLM-OCR] 图片 URL: ${imageUrl}`);

    const response = await this.httpPost(
      `${this.glmOcrBaseUrl}/layout_parsing`,
      payload,
      {
        Authorization: this.glmOcrApiKey,
        'Content-Type': 'application/json',
      },
    );

    this.logger.log(`[GLM-OCR] 响应 id: ${response?.id}, usage: ${JSON.stringify(response?.usage)}`);

    // 如果是错误响应
    if (response?.error) {
      throw new Error(`GLM-OCR API 错误: ${JSON.stringify(response.error)}`);
    }

    // 结果在 md_results 字段
    const mdResults = response?.md_results;
    if (mdResults) {
      return typeof mdResults === 'string' ? mdResults : JSON.stringify(mdResults);
    }

    throw new Error(`GLM-OCR 返回内容为空，完整响应: ${JSON.stringify(response).slice(0, 500)}`);
  }

  /**
   * 调用 Qwen3.5-Flash 解析 OCR 文本，提取结构化字段
   */
  private async callQwenParse(ocrText: string): Promise<{
    serialNumber?: string;
    studentName?: string;
    gender?: string;
    graduationSchool?: string;
    schoolDistrict?: string;
    contactPhone?: string;
    honors?: Array<{ name: string; grade: string; imageUrl: string }>;
  }> {
    const systemPrompt = `你是一个专业的学生信息提取助手。请从以下简历OCR识别文本中提取结构化信息。

需要提取的字段（没有的字段返回空字符串或空数组）：
- serialNumber: 序号（如果有）
- studentName: 学生姓名
- gender: 性别（男/女）
- graduationSchool: 毕业学校
- schoolDistrict: 所属区域
- contactPhone: 联系电话
- honors: 小学曾获荣誉或证书（数组，每项包含 name(荣誉名称)、grade(年级，如果没有则为空字符串)、imageUrl(留空字符串)）

请严格以 JSON 格式返回，不要包含任何其他文字说明，格式如下：
{
  "serialNumber": "",
  "studentName": "",
  "gender": "",
  "graduationSchool": "",
  "schoolDistrict": "",
  "contactPhone": "",
  "honors": [{"name": "", "grade": "", "imageUrl": ""}]
}`;

    const payload = {
      model: this.qwenModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下是简历OCR识别文本：\n\n${ocrText}` },
      ],
      max_tokens: 2048,
      enable_thinking: false,
    };

    const response = await this.httpPost(
      `${this.qwenBaseUrl}/chat/completions`,
      payload,
      {
        Authorization: `Bearer ${this.qwenApiKey}`,
        'Content-Type': 'application/json',
      },
    );

    this.logger.log(`[Qwen] 完整响应: ${JSON.stringify(response).slice(0, 2000)}`);

    if (response?.error) {
      throw new Error(`Qwen API 错误: ${JSON.stringify(response.error)}`);
    }

    let content = response?.choices?.[0]?.message?.content || '{}';
    // 去除 markdown 代码块包裹
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      return JSON.parse(content);
    } catch {
      this.logger.warn(`Qwen 返回内容无法解析为 JSON: ${content}`);
      return {};
    }
  }

  /**
   * 通用 HTTP POST 请求（使用 Node.js 内置 https 模块）
   */
  private httpPost(url: string, body: any, headers: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
      const bodyStr = JSON.stringify(body);
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const lib = isHttps ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(bodyStr),
        },
        timeout: 120000,
      };

      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`响应解析失败: ${data.slice(0, 200)}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });

      req.write(bodyStr);
      req.end();
    });
  }
}
