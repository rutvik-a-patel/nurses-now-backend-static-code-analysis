import { FACILITY_PROVIDER_FLAGS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsUUID,
  IsString,
} from 'class-validator';
import { DATE_FILTER } from '@/shared/constants/types';

export class FilterFacilityProviderDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  certificate: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  speciality: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(FACILITY_PROVIDER_FLAGS, { each: true })
  @Type(() => String)
  flag?: FACILITY_PROVIDER_FLAGS[];

  @IsOptional()
  @IsObject()
  last_scheduled?: DATE_FILTER;

  @IsOptional()
  @IsObject()
  next_scheduled?: DATE_FILTER;

  @IsOptional()
  @IsString()
  staff?: string;

  @IsOptional()
  @IsUUID()
  provider?: string;
}

export class FilterFacilityProviderWithStaffDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  provider_id: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  facility_id: string[];

  @IsOptional()
  @IsString()
  location: string;
}
