import { IsEnum, IsNotEmpty, IsString, Length, IsArray, ValidateNested, IsOptional, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../../entity/student.entity';
import { GradeLevel, ScoreType, SubjectType } from '../../../entity/exam-score.entity';
import { AchievementLevel } from '../../../entity/achievement.entity';
import { IsConsistentAchievement } from '../../../common/validators/achievement.validator';

export class SubjectDto {
  @IsEnum(SubjectType)
  name: SubjectType;

  @IsEnum(ScoreType)
  scoreType: ScoreType;

  @IsOptional()
  @IsString()
  score?: string;

  @IsOptional()
  @IsString()
  grade?: string;
}

export class ExamScoreDto {
  @IsEnum(GradeLevel)
  gradeLevel: GradeLevel;

  @IsString()
  certificateImage: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectDto)
  subjects: SubjectDto[];
}

export class AchievementDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsEnum(AchievementLevel)
  level?: AchievementLevel;

  @IsOptional()
  @IsISO8601()
  awardDate?: string;

  @IsOptional()
  @IsString()
  certificateImage?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  name: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  @Length(18, 18)
  idNumber: string;

  @IsNotEmpty()
  @IsString()
  photo: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  graduationSchool: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  schoolDistrict: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamScoreDto)
  examScores: ExamScoreDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AchievementDto)
  @IsConsistentAchievement({ message: '如果填写荣誉成就，请确保所有必填字段都已填写' })
  achievements: AchievementDto[] = [];

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  parentName: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  parentWorkplace: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  parentContact: string;
} 