import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class GetHolidayGroupQueryParamsDto extends QueryParamsDto {
  @IsNotEmpty()
  @IsUUID()
  facility_holiday_id?: string;
}

export class GetHolidayGroupDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(DEFAULT_STATUS, { each: true })
  status?: DEFAULT_STATUS[];
}
