import { DEFAULT_STATUS, USER_TYPE } from '@/shared/constants/enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShiftCancelReasonDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsEnum(DEFAULT_STATUS)
  status?: DEFAULT_STATUS;

  @IsNotEmpty()
  @IsEnum(USER_TYPE)
  user_type: USER_TYPE;

  @IsOptional()
  @IsString()
  created_at_ip?: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;
}
