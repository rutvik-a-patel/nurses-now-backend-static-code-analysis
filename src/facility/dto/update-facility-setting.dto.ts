import { ORIENTATION_TYPE, SHIFT_TYPE } from '@/shared/constants/enum';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsString,
  ValidateNested,
  IsUUID,
  IsArray,
  IsBoolean,
} from 'class-validator';
import {
  TimeEntrySettingDto,
  FacilityPortalSettingDto,
  ShiftSettingDto,
  AccountingSettingDto,
  FloorDetailDto,
} from './setup-facility.dto';

export class UpdateFacilitySettingDto {
  @IsOptional()
  @IsEnum(SHIFT_TYPE)
  default_order_type: SHIFT_TYPE;

  @IsString()
  @IsOptional()
  work_comp_code: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ShiftSettingDto)
  shift_setting?: ShiftSettingDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TimeEntrySettingDto)
  time_entry_setting?: TimeEntrySettingDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FacilityPortalSettingDto)
  facility_portal_setting?: FacilityPortalSettingDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AccountingSettingDto)
  accounting_setting: AccountingSettingDto;

  @IsOptional()
  @IsString()
  orientation_document?: string;

  @IsOptional()
  @IsBoolean()
  orientation_enabled: boolean;

  @IsOptional()
  @IsEnum(ORIENTATION_TYPE)
  orientation_process: ORIENTATION_TYPE;

  @IsOptional()
  @IsString()
  original_filename?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  certificate?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  speciality?: string[];

  @IsBoolean()
  @IsOptional()
  is_floor: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorDetailDto)
  floor_details?: FloorDetailDto[];
}
