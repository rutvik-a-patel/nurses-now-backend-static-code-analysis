import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFlagSettingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  color: string;

  @IsNotEmpty()
  @IsEnum(DEFAULT_STATUS)
  @IsString()
  status: DEFAULT_STATUS;
}
