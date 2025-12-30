import { FILTER_SHIFT_TYPE, SHIFT_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterShiftDashboardDto extends QueryParamsDto {
  @IsString()
  @IsOptional()
  from_date: string;

  @IsString()
  @IsOptional()
  to_date: string;

  @IsOptional()
  @IsEnum(FILTER_SHIFT_TYPE)
  type?: FILTER_SHIFT_TYPE;

  @IsOptional()
  @IsArray()
  @IsEnum(SHIFT_STATUS, { each: true })
  status?: SHIFT_STATUS[];

  @IsArray()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  certificate?: string[];

  @IsArray()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  speciality?: string[];

  @IsArray()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  facility?: string[];

  @IsArray()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  provider?: string[];

  @IsString()
  @IsOptional()
  shift_id?: string;

  @IsArray()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  created_by?: string[];
}
