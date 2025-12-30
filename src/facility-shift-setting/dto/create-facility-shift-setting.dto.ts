import { DEFAULT_STATUS } from '@/shared/constants/enum';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateFacilityShiftSettingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  time_code: string;

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
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;

  @IsString()
  @IsOptional()
  shift_time_id?: string;

  @IsString()
  @IsOptional()
  created_at_ip?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
