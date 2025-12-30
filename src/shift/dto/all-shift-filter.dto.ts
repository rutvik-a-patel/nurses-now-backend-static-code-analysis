import { SHIFT_TYPE, SHIFT_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AllShiftFilterDto extends QueryParamsDto {
  @IsOptional()
  @IsString()
  from_date?: string;

  @IsOptional()
  @IsString()
  to_date?: string;

  @IsOptional()
  @IsString()
  shift_id?: string;

  @IsOptional()
  @IsString()
  shift_id_from?: string;

  @IsOptional()
  @IsString()
  shift_id_to?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(SHIFT_STATUS, { each: true })
  status?: SHIFT_STATUS[];

  @IsOptional()
  @IsEnum(SHIFT_TYPE)
  @Type(() => String)
  shift_type?: SHIFT_TYPE;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  certificate?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  speciality?: string[];

  @IsOptional()
  @ArrayMaxSize(9, {
    message: 'Facility filter should not exceed more than 10 selections',
  })
  @IsUUID(undefined, {
    each: true,
    message: 'Invalid facility Ids / Too many facilities selected',
  })
  facility?: string[];

  @IsOptional()
  @ArrayMaxSize(9, {
    message: 'Facility filter should not exceed more than 10 selections',
  })
  @IsUUID(undefined, {
    each: true,
    message: 'Invalid provider Ids / Too many providers selected',
  })
  provider_id?: string[];

  @IsOptional()
  @IsString()
  provider_name?: string;

  @IsOptional()
  @IsString()
  created_by?: string;
}
