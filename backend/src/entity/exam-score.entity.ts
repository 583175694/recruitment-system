import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Student } from './student.entity';

export enum GradeLevel {
  GRADE_4 = '四年级',
  GRADE_5 = '五年级',
  GRADE_6 = '六年级',
}

export enum ScoreType {
  NUMERIC = 'numeric',  // 数字分数
  GRADE = 'grade',      // 等级评价
}

export enum SubjectType {
  CHINESE = '语文',
  MATHEMATICS = '数学',
  ENGLISH = '英语',
}

@Entity()
export class ExamScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({
    type: 'enum',
    enum: GradeLevel,
  })
  gradeLevel: GradeLevel;

  @Column({ 
    type: 'enum',
    enum: ScoreType,
    default: ScoreType.NUMERIC
  })
  scoreType: ScoreType;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ length: 10, nullable: true })
  grade: string;

  @Column({ length: 255, nullable: true })
  certificateImage: string;

  @OneToMany(() => Subject, subject => subject.examScore, { cascade: true, eager: true })
  subjects: Subject[];
}

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExamScore, examScore => examScore.subjects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_score_id' })
  examScore: ExamScore;

  @Column({
    type: 'enum',
    enum: SubjectType,
  })
  name: SubjectType;

  @Column({ 
    type: 'enum',
    enum: ScoreType,
    default: ScoreType.NUMERIC
  })
  scoreType: ScoreType;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ length: 10, nullable: true })
  grade: string;
} 