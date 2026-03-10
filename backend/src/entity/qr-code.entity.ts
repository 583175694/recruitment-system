import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum QrCodeStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

@Entity()
export class QrCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  token: string;

  @Column({
    type: 'enum',
    enum: QrCodeStatus,
    default: QrCodeStatus.ACTIVE,
  })
  status: QrCodeStatus;

  @Column({ type: 'int', default: 0 })
  submissionCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  expiredAt: Date;
}
