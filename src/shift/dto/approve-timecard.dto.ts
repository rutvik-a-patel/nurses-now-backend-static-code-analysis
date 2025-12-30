import { TIMECARD_STATUS } from '@/shared/constants/enum';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class ApproveTimecardDto {
  @IsOptional()
  approved_by_type?: string;

  @IsUUID()
  @IsOptional()
  approved_by_id?: string;

  @IsString()
  @IsOptional()
  approved_date?: string;

  @IsString()
  @IsOptional()
  additional_details?: string;

  @IsString()
  @IsOptional()
  base_url?: string;

  @IsEnum(TIMECARD_STATUS)
  @IsOptional()
  status?: TIMECARD_STATUS;

  @IsString()
  @IsOptional()
  authority_signature?: string;

  @IsUUID()
  @IsOptional()
  floor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'clock_in must be in the format HH:MM:SS',
  })
  clock_in?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'clock_out must be in the format HH:MM:SS',
  })
  clock_out?: string;

  @IsOptional()
  @IsNumber()
  break_duration?: number;

  @IsOptional()
  @IsNumber()
  total_worked?: number;
}
