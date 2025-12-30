import { EXPIRATION_DURATION_TYPE } from '@/shared/constants/enum';
import { IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateReferenceFormGlobalSettingDto {
  @IsOptional()
  @IsNumber()
  total_reminder_attempts?: number;

  @IsOptional()
  @IsNumber()
  reminder_interval?: number;

  @IsEnum(EXPIRATION_DURATION_TYPE)
  @IsOptional()
  reminder_duration_type?: EXPIRATION_DURATION_TYPE;
}
