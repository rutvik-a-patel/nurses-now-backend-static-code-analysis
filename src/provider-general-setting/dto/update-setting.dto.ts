import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;

  @IsOptional()
  @IsString()
  placeholder: string;

  @IsOptional()
  @IsString()
  updated_at_ip: string;
}
