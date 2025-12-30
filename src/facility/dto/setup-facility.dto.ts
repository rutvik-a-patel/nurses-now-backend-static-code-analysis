import {
  TIMECARD_ROUNDING_DIRECTION,
  TIME_APPROVAL_METHOD,
  ALLOWED_ENTRIES,
  SCHEDULING_WARNINGS,
  SHIFT_TYPE,
  ORIENTATION_TYPE,
  DEFAULT_STATUS,
} from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsString,
  IsUUID,
  IsMobilePhone,
  ArrayMinSize,
  ValidateNested,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class TimeEntrySettingDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsNumber()
  @IsOptional()
  timecard_rounding: number;

  @IsOptional()
  @IsEnum(TIMECARD_ROUNDING_DIRECTION)
  timecard_rounding_direction: TIMECARD_ROUNDING_DIRECTION;

  @IsNumber()
  @IsOptional()
  default_lunch_duration: number;

  @IsBoolean()
  @IsOptional()
  enforce_geo_fence: boolean;

  @IsNumber()
  @IsOptional()
  geo_fence_radius: number;

  @IsOptional()
  @IsEnum(TIME_APPROVAL_METHOD)
  time_approval_method: TIME_APPROVAL_METHOD;

  @IsOptional()
  @IsArray()
  @IsEnum(ALLOWED_ENTRIES, { each: true })
  @Type(() => String)
  allowed_entries: ALLOWED_ENTRIES[];

  @IsOptional()
  @IsBoolean()
  check_missed_meal_break: boolean;

  @IsString()
  @IsOptional()
  location: string;

  @IsOptional()
  @IsUUID()
  facility: string;
}

export class FacilityPortalSettingDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsOptional()
  @IsBoolean()
  allow_cancellation: boolean;

  @IsOptional()
  @IsNumber()
  cancellation_advance: number;

  @IsOptional()
  @IsBoolean()
  display_provider_request: boolean;

  @IsOptional()
  @IsBoolean()
  accept_provider_request: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(SCHEDULING_WARNINGS, { each: true })
  @Type(() => String)
  scheduling_warnings: SCHEDULING_WARNINGS[];

  @IsOptional()
  @IsBoolean()
  client_confirmation: boolean;

  @IsOptional()
  @IsBoolean()
  display_bill_rate: boolean;

  @IsOptional()
  @IsUUID()
  facility: string;
}

export class FloorDetailDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsOptional()
  beds: number;

  @IsString()
  @IsOptional()
  po_number: string;

  @IsString()
  @IsOptional()
  cost_center: string;

  @IsOptional()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  phone_number: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsUUID()
  speciality: string;

  @IsOptional()
  @IsUUID()
  default_order_contact: string;

  @IsOptional()
  @IsUUID()
  client_contact: string;

  @IsOptional()
  @IsUUID()
  facility: string;
}

export class AccountingSettingDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsNumber()
  @IsOptional()
  billing_cycle: number;

  @IsNumber()
  @IsOptional()
  invoice_due: number;

  @IsOptional()
  @IsUUID()
  facility: string;
}

export class ShiftSettingDto {
  @IsUUID()
  @IsOptional()
  id?: string;

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
  @IsUUID()
  facility: string;

  @IsOptional()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;

  @IsString()
  @IsOptional()
  shift_time_id?: string;
}

export class SetupFacility {
  @IsOptional()
  @IsNumber()
  invoice_pay_duration: number;

  @IsOptional()
  @IsString()
  first_shift: string;

  @IsBoolean()
  @IsOptional()
  is_floor: boolean;

  @IsOptional()
  @IsEnum(SHIFT_TYPE)
  default_order_type: SHIFT_TYPE;

  @IsOptional()
  @IsEnum(ORIENTATION_TYPE)
  orientation_process: ORIENTATION_TYPE;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  certificate: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  speciality: string[];

  @IsString()
  @IsOptional()
  work_comp_code: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ShiftSettingDto)
  shift_setting: ShiftSettingDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TimeEntrySettingDto)
  time_entry_setting: TimeEntrySettingDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FacilityPortalSettingDto)
  facility_portal_setting: FacilityPortalSettingDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AccountingSettingDto)
  accounting_setting: AccountingSettingDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorDetailDto)
  floor_details?: FloorDetailDto[];
}
