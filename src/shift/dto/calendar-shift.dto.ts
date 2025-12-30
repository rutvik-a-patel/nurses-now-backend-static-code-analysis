import { CALENDAR_SHIFT_STATUS } from '@/shared/constants/enum';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CalendarShiftDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsString()
  @IsNotEmpty()
  start_date: string;

  @IsString()
  @IsNotEmpty()
  end_date: string;

  @IsOptional()
  @IsEnum(CALENDAR_SHIFT_STATUS, { each: true })
  @Type(() => String)
  status?: CALENDAR_SHIFT_STATUS[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  certificate_id?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  speciality_id: string[];

  @IsOptional()
  @IsString()
  from_shift_id: string;

  @IsOptional()
  @IsString()
  to_shift_id: string;

  @IsOptional()
  @IsString()
  filter_by: string;
}
