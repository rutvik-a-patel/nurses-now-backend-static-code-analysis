import { SHIFT_TABLE } from '@/shared/constants/types';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class ShiftScheduleDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'date must be in the format YYYY-MM-DD',
  })
  start_date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'date must be in the format YYYY-MM-DD',
  })
  end_date: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  openings: number;
}

export class CreateBatchShiftDto {
  @IsNotEmpty()
  @IsUUID()
  certificate: string;

  @IsNotEmpty()
  @IsUUID()
  speciality: string;

  @IsNotEmpty()
  @IsUUID()
  facility: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Follower should not be empty' })
  follower: string;

  @IsOptional()
  @IsUUID()
  floor: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'start_time must be in the format HH:MM:SS',
  })
  start_time: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'end_time must be in the format HH:MM:SS',
  })
  end_time: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  invited_provider: string[];

  @IsOptional()
  @IsBoolean()
  premium_rate?: boolean;

  @IsOptional()
  @IsString()
  description?: string; // internal shift note

  @IsArray()
  @ArrayMinSize(1, {
    message: 'Please select the shift dates from the calendar',
  })
  @ValidateNested({ each: true })
  @Type(() => ShiftScheduleDto)
  schedules: ShiftScheduleDto[];

  @IsUUID()
  @IsOptional()
  created_by_id?: string;

  @IsUUID()
  @IsOptional()
  updated_by_id?: string;

  @IsOptional()
  created_by_type?: SHIFT_TABLE;

  @IsOptional()
  updated_by_type?: SHIFT_TABLE;

  @IsOptional()
  @IsBoolean()
  is_orientation?: boolean;
}
