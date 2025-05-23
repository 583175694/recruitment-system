import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  originalFilename: string;

  @Column({ length: 255 })
  storedFilename: string;

  @Column({ type: 'enum', enum: ProcessingStatus, default: ProcessingStatus.PENDING })
  status: ProcessingStatus;

  @Column({ type: 'json', nullable: true })
  extractedData: any;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 