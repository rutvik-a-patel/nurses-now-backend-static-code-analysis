import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateFacilityProfileSettingDto {
  @IsOptional()
  @IsEnum(DEFAULT_STATUS)
  status?: DEFAULT_STATUS;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
