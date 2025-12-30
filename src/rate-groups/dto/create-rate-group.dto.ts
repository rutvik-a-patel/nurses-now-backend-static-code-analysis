import {
  DAY_TYPE,
  DAYS_OF_WEEK,
  SHIFT_TIME_CODE,
} from '@/shared/constants/enum';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateRateGroupDto {
  @IsOptional()
  @IsNumber()
  holiday_pay: number;

  @IsOptional()
  @IsNumber()
  holiday_bill: number;

  @IsOptional()
  @IsEnum(DAYS_OF_WEEK)
  weekend_pay_start_day: DAYS_OF_WEEK;

  @IsOptional()
  @IsString()
  weekend_pay_start_time: string;

  @IsOptional()
  @IsEnum(DAYS_OF_WEEK)
  weekend_pay_end_day: DAYS_OF_WEEK;

  @IsOptional()
  @IsString()
  weekend_pay_end_time: string;

  @IsOptional()
  @IsEnum(DAYS_OF_WEEK)
  weekend_bill_start_day: DAYS_OF_WEEK;

  @IsOptional()
  @IsString()
  weekend_bill_start_time: string;

  @IsOptional()
  @IsEnum(DAYS_OF_WEEK)
  weekend_bill_end_day: DAYS_OF_WEEK;

  @IsOptional()
  @IsString()
  weekend_bill_end_time: string;

  @IsOptional()
  @IsNumber()
  overtime_bill_after_hours: number;

  @IsOptional()
  @IsNumber()
  overtime_bill_calculation: number;

  @IsOptional()
  @IsNumber()
  overtime_pay_calculation: number;

  @IsOptional()
  @IsNumber()
  premium_pay: number;

  @IsOptional()
  @IsNumber()
  premium_bill: number;

  @IsOptional()
  @IsBoolean()
  allow_overtime: boolean;

  @IsOptional()
  @IsUUID()
  facility: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  deleted_rate_sheets?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRateSheetDto)
  rate_sheets: CreateRateSheetDto[];
}

export class CreateRateSheetDto {
  @IsOptional()
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  certificate: string;

  @IsOptional()
  @IsEnum(DAY_TYPE)
  day_type: DAY_TYPE;

  @IsOptional()
  @IsEnum(SHIFT_TIME_CODE)
  shift_time: SHIFT_TIME_CODE;

  @IsOptional()
  @IsNumber()
  reg_pay: number;

  @IsOptional()
  @IsNumber()
  reg_bill: number;

  @IsOptional()
  @IsNumber()
  ot_bill: number;

  @IsOptional()
  @IsNumber()
  ot_pay: number;

  @IsOptional()
  @IsNumber()
  premium_pay: number;

  @IsOptional()
  @IsNumber()
  premium_bill: number;
}
