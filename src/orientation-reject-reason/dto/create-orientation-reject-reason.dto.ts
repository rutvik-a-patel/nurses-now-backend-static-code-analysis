import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateOrientationRejectReasonDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DEFAULT_STATUS)
  @IsOptional()
  status?: DEFAULT_STATUS;

  @IsString()
  @IsOptional()
  created_at_ip?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
