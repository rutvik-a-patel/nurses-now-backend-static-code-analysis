import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { IsAfterDate } from '@/shared/decorator/is-after-date.decorator';
import { IsBeforeDate } from '@/shared/decorator/is-before-date.decorator';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class FacilityHolidayItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsBeforeDate('end_date', true, {
    message: 'start_date must be before end_date',
  })
  start_date: string;

  @IsString()
  @IsNotEmpty()
  @IsAfterDate('start_date', true, {
    message: 'end_date must be after start_date',
  })
  end_date: string;

  @IsString()
  @IsNotEmpty()
  start_time: string;

  @IsString()
  @IsNotEmpty()
  end_time: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;

  @IsNotEmpty()
  @IsUUID()
  facility: string;

  @IsOptional()
  @IsUUID()
  holiday_group: string; // create only

  @IsOptional()
  @IsUUID()
  id: string; // update only
}

export class CreateAndUpdateBulkFacilityHolidayDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FacilityHolidayItemDto)
  holidays: FacilityHolidayItemDto[];
}
