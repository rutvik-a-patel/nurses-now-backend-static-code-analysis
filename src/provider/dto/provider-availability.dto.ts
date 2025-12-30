import { AVAILABLE_TYPE, DEFAULT_STATUS, DAYS } from '@/shared/constants/enum';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  ValidateNested,
  IsString,
} from 'class-validator';
import { ShiftTimePreferenceDto } from './update-preference-setting.dto';

export class AvailabilityStatusDTO {
  @IsEnum(AVAILABLE_TYPE)
  @IsNotEmpty()
  availability_type: AVAILABLE_TYPE;

  @IsOptional()
  @IsDateString()
  date?: string | null;

  @IsOptional()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;

  @IsEnum(DAYS)
  @IsNotEmpty()
  day: DAYS;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShiftTimePreferenceDto)
  shift_time: ShiftTimePreferenceDto;

  @IsOptional()
  @IsUUID()
  provider: string;

  @IsOptional()
  @IsInt()
  order: number;

  @IsOptional()
  @IsString()
  created_at_ip?: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;
}
