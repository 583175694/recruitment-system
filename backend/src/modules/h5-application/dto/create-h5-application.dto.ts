import { IsNotEmpty, IsString, Length, IsArray, ValidateNested, ArrayMaxSize, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class HonorItemDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @IsNotEmpty()
  @IsString()
  grade: string; // '4年级', '5年级', '6年级'

  @IsNotEmpty()
  @IsString()
  imageUrl: string;
}

export class CreateH5ApplicationDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  studentName: string;

  @IsNotEmpty()
  @IsString()
  gender: string; // '男' or '女'

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  graduationSchool: string;

  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  contactPhone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HonorItemDto)
  @ArrayMaxSize(3)
  honors: HonorItemDto[];

  @IsOptional()
  @IsString()
  @Matches(
    /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
    { message: '身份证号格式不正确，请输入有效的18位身份证号' },
  )
  idCardNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificateImages?: string[];
}
