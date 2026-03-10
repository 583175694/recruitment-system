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

  @ManyToOne(() => QrCode)
  @JoinColumn({ name: 'qrCodeId' })
  qrCode: QrCode;

  @Column()
  qrCodeId: number;

  @Column({ length: 50 })
  studentName: string;

  @Column({ length: 10 })
  gender: string;

  @Column({ length: 100 })
  graduationSchool: string;

  @Column({ length: 20 })
  contactPhone: string;

  @Column({ length: 18, nullable: true })
  idCardNumber: string;

  @Column({ type: 'json' })
  honors: HonorItem[];

  @Column({ type: 'json', nullable: true })
  certificateImages: string[];

  @Column({
    type: 'enum',
    enum: H5ApplicationStatus,
    default: H5ApplicationStatus.PENDING,
  })
  status: H5ApplicationStatus;

  @CreateDateColumn()
  submittedAt: Date;
}
