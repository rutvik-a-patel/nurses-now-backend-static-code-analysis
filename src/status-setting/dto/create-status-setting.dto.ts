import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DEFAULT_STATUS, USER_TYPE } from '@/shared/constants/enum';

export class CreateStatusSettingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  background_color: string;

  @IsNotEmpty()
  @IsString()
  text_color: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DEFAULT_STATUS)
  status?: DEFAULT_STATUS;

  @IsNotEmpty()
  @IsEnum(USER_TYPE)
  status_for: USER_TYPE;

  @IsString()
  @IsOptional()
  created_at_ip?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
