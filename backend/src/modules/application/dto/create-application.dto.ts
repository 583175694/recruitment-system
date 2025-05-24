import { IsEnum, IsNotEmpty, IsString, Length, IsISO8601, IsOptional } from 'class-validator';
import { Gender } from '../../../entity/student.entity';

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

  @IsOptional()
  @IsISO8601()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  ethnicity?: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  graduationSchool: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  homeAddress?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  guardianName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  guardianRelation?: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  guardianContact?: string;
} 