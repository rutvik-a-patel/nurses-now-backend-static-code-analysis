import { SHIFT_TYPE, SHIFT_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FacilityShiftFilterDto extends QueryParamsDto {
  @IsOptional()
  @IsString()
  from_date?: string;

  @IsOptional()
  @IsString()
  to_date?: string;

  @IsOptional()
  @IsString()
  shift_id_from?: string;

  @IsOptional()
  @IsString()
  shift_id_to?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(SHIFT_STATUS, { each: true })
  @Type(() => String)
  status?: SHIFT_STATUS[];

  @IsOptional()
  @IsEnum(SHIFT_TYPE)
  @Type(() => String)
  type?: SHIFT_TYPE;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  certificate: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  speciality: string[];
}
