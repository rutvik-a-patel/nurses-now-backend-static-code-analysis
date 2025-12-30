import { DEFAULT_STATUS, DNR_TYPE } from '@/shared/constants/enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDnrReasonDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsEnum(DNR_TYPE)
  reason_type: DNR_TYPE;

  @IsNotEmpty()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;

  @IsString()
  @IsOptional()
  created_at_ip?: string;
}
