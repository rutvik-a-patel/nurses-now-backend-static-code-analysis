import { TIMECARD_STATUS } from '@/shared/constants/enum';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class RejectTimecardDto {
  @IsEnum(TIMECARD_STATUS)
  @IsOptional()
  status?: TIMECARD_STATUS;

  @IsString()
  @IsOptional()
  rejected_date?: string;

  @IsUUID()
  @IsOptional()
  rejected_by_id?: string;

  @IsOptional()
  rejected_by_type?: string;

  @IsString()
  @IsOptional()
  rejection_description?: string;

  @IsUUID()
  @IsNotEmpty()
  timecard_reject_reason: string;

  @IsString()
  @IsOptional()
  additional_details?: string;

  @IsString()
  @IsOptional()
  base_url?: string;

  @IsString()
  @IsOptional()
  authority_signature?: string;
}
