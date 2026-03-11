import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QrCode } from './qr-code.entity';

export enum H5ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface HonorItem {
  name: string;
  grade: string;
  imageUrl: string;
}

@Entity()
export class H5Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QrCode, { nullable: true })
  @JoinColumn({ name: 'qrCodeId' })
  qrCode: QrCode;

  @Column({ nullable: true })
  qrCodeId: number;

  @Column({ length: 50, default: '' })
  studentName: string;

  @Column({ length: 10, default: '' })
  gender: string;

  @Column({ length: 100, default: '' })
  graduationSchool: string;

  @Column({ length: 20, default: '' })
  contactPhone: string;

  @Column({ length: 18, nullable: true })
  idCardNumber: string;

  @Column({ type: 'json', nullable: true })
  honors: HonorItem[];

  @Column({ type: 'json', nullable: true })
  certificateImages: string[];

  @Column({
    type: 'enum',
    enum: H5ApplicationStatus,
    default: H5ApplicationStatus.PENDING,
  })
  status: H5ApplicationStatus;

  // 教师上传来源字段
  @Column({ length: 50, nullable: true })
  sourceType: string; // 'teacher' | null (家长提交)

  @Column({ length: 100, nullable: true })
  schoolDistrict: string; // 所属区域

  @Column({ length: 50, nullable: true })
  serialNumber: string; // 序号

  @Column({ length: 200, nullable: true })
  teacherJobId: string; // 教师上传任务ID，用于状态查询

  @CreateDateColumn()
  submittedAt: Date;
}
