import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum Gender {
  MALE = '男',
  FEMALE = '女',
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

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ length: 20, nullable: true })
  ethnicity: string;

  @Column({ length: 100 })
  graduationSchool: string;

  @Column({ length: 200, nullable: true })
  homeAddress: string;

  @Column({ length: 50, nullable: true })
  guardianName: string;

  @Column({ length: 50, nullable: true })
  guardianRelation: string;

  @Column({ length: 20, nullable: true })
  guardianContact: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 