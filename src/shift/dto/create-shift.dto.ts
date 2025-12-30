import { REPEAT_ON, SHIFT_TYPE } from '@/shared/constants/enum';
import { SHIFT_TABLE } from '@/shared/constants/types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';

class SpecificDateDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'date must be in the format YYYY-MM-DD',
  })
  date: string;

  @IsNotEmpty()
  @IsNumber()
  openings: number;
}

export class CreateShiftDto {
  @IsNotEmpty()
  @IsUUID()
  certificate: string;

  @IsNotEmpty()
  @IsUUID()
  speciality: string;

  @IsOptional()
  @IsString()
  shift_id?: string;

  @IsNotEmpty()
  @IsUUID()
  facility: string;

  @IsNotEmpty()
  @IsEnum(SHIFT_TYPE)
  @Type(() => String)
  shift_type: SHIFT_TYPE;

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

  @IsNotEmpty()
  @IsNumber()
  openings: number;

  @IsOptional()
  @IsBoolean()
  is_repeat: boolean;

  @IsOptional()
  @IsEnum(REPEAT_ON)
  @Type(() => String)
  repeat_on?: REPEAT_ON;

  @IsOptional()
  @IsArray()
  @IsNumber(undefined, { each: true })
  days: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificDateDto)
  specific_dates?: SpecificDateDto[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  invited_provider: string[];

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'start_date must be in the format YYYY-MM-DD',
  })
  start_date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'end_date must be in the format YYYY-MM-DD',
  })
  end_date: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  @IsOptional()
  created_by_id?: string;

  @IsOptional()
  @IsString()
  created_by_type?: SHIFT_TABLE;

  @IsUUID()
  @IsOptional()
  updated_by_id?: string;

  @IsOptional()
  @IsString()
  updated_by_type?: SHIFT_TABLE;

  @IsOptional()
  @IsBoolean()
  premium_rate?: boolean;
}
