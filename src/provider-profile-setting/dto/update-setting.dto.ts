import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;

  @IsOptional()
  @IsBoolean()
  is_required: boolean;

  @IsOptional()
  @IsString()
  updated_at_ip: string;
}
