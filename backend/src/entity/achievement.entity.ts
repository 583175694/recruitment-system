import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';

export enum AchievementLevel {
  SCHOOL = '校级',
  DISTRICT = '区级',
  CITY = '市级',
  PROVINCE = '省级',
  NATIONAL = '国家级',
}

@Entity()
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, student => student.achievements)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: AchievementLevel,
  })
  level: AchievementLevel;

  @Column({ length: 255 })
  certificateImage: string;

  @Column({ type: 'date' })
  awardDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;
} 