import { TIMECARD_FILTER_TYPE, TIMECARD_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterTimecardDto extends QueryParamsDto {
  @IsOptional()
  @IsEnum(TIMECARD_FILTER_TYPE)
  status?: TIMECARD_FILTER_TYPE;

  @IsOptional()
  @IsArray()
  @IsEnum(TIMECARD_STATUS, { each: true })
  timecard_status?: TIMECARD_STATUS[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  facility?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  provider?: string[];

  @IsOptional()
  @IsString()
  shift_start_date?: string;

  @IsOptional()
  @IsString()
  shift_end_date?: string;

  @IsOptional()
  @IsString()
  shift_id?: string;
}
