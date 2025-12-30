import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftDto } from './create-shift.dto';
import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import {
  ADJUSTMENT_STATUS,
  SHIFT_STATUS,
  SHIFT_TYPE,
} from '@/shared/constants/enum';
import { SHIFT_CANCEL_TABLE, SHIFT_TABLE } from '@/shared/constants/types';
import { Type } from 'class-transformer';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  @IsOptional()
  @IsBoolean()
  is_publish?: boolean;

  @IsUUID()
  @IsOptional()
  provider?: string;

  @IsOptional()
  @IsEnum(SHIFT_STATUS)
  status?: SHIFT_STATUS;

  @IsOptional()
  @IsEnum(SHIFT_TYPE)
  @Type(() => String)
  shift_type?: SHIFT_TYPE;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'clock_in must be in the format HH:MM:SS',
  })
  clock_in?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'clock_in_date must be in the format YYYY-MM-DD',
  })
  clock_in_date?: Date;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'clock_out must be in the format HH:MM:SS',
  })
  clock_out?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'clock_out_date must be in the format YYYY-MM-DD',
  })
  clock_out_date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'clock_out_date must be in the format YYYY-MM-DD',
  })
  break_start_date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'break_start_time must be in the format HH:MM:SS',
  })
  break_start_time?: string;

  @IsOptional()
  @IsNumber()
  total_break?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'clock_out_date must be in the format YYYY-MM-DD',
  })
  break_end_date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'break_end_time must be in the format HH:MM:SS',
  })
  break_end_time?: string;

  @IsOptional()
  @IsNumber()
  break_duration?: number;

  @IsOptional()
  @IsNumber()
  total_worked?: number;

  @IsUUID()
  @IsOptional()
  cancel_reason_id?: string;

  @IsString()
  @IsOptional()
  cancel_reason_description?: string;

  @IsUUID()
  @IsOptional()
  cancelled_by_id?: string;

  @IsOptional()
  @IsString()
  cancelled_by_type?: SHIFT_CANCEL_TABLE;

  @IsUUID()
  @IsOptional()
  updated_by_id?: string;

  @IsOptional()
  @IsString()
  updated_by_type?: SHIFT_TABLE;

  @IsOptional()
  @IsString()
  cancelled_on?: string;

  @IsString()
  @IsOptional()
  additional_details?: string;

  @IsOptional()
  @IsString()
  temp_conf_at?: string;

  @IsOptional()
  @IsString()
  client_conf_at?: string;

  @IsOptional()
  @IsBoolean()
  premium_rate?: boolean;

  @IsOptional()
  @IsString()
  modified_at?: string;

  @IsOptional()
  @IsBoolean()
  is_ai_triggered?: boolean;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  total_adjustment?: number;

  @IsOptional()
  @IsNumber()
  time_adjustment?: number;

  @IsOptional()
  @IsNumberString()
  adjustment?: number;

  @IsOptional()
  @IsNumber()
  total_payable_amount?: number;

  @IsOptional()
  @IsNumber()
  total_billable_amount?: number;

  @IsOptional()
  @IsNumber()
  total_billable_adjustment?: number;

  @IsOptional()
  @IsNumber()
  billable_adjustment?: number;

  @IsOptional()
  @IsEnum(ADJUSTMENT_STATUS)
  adjustment_status?: ADJUSTMENT_STATUS;

  @IsOptional()
  @IsEnum(ADJUSTMENT_STATUS)
  bill_adjustment_status?: ADJUSTMENT_STATUS;
}
