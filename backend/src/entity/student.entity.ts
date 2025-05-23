import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Achievement } from './achievement.entity';
import { ExamScore } from './exam-score.entity';

export enum Gender {
  MALE = '男',
  FEMALE = '女',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ length: 18 })
  idNumber: string;

  @Column({ length: 200 })
  photo: string;

  @Column({ length: 100 })
  graduationSchool: string;

  @Column({ length: 50 })
  schoolDistrict: string;

  @OneToMany(() => ExamScore, examScore => examScore.student, { cascade: true })
  examScores: ExamScore[];

  @OneToMany(() => Achievement, achievement => achievement.student, { cascade: true })
  achievements: Achievement[];

  @Column({ length: 50 })
  parentName: string;

  @Column({ length: 100 })
  parentWorkplace: string;

  @Column({ length: 20 })
  parentContact: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  reviewComments: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 