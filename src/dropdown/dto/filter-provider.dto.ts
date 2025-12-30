import { FILTER_PROVIDER_BY } from '@/shared/constants/enum';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class FilterProviderDto {
  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  @IsOptional()
  start_date: string;

  @IsString()
  @IsOptional()
  end_date: string;

  @IsString()
  @IsOptional()
  start_time: string;

  @IsString()
  @IsOptional()
  end_time: string;

  @IsUUID()
  @IsOptional()
  facility_id: string;

  @IsUUID()
  @IsNotEmpty()
  certificate_id: string;

  @IsUUID()
  @IsNotEmpty()
  speciality_id: string;

  @IsEnum(FILTER_PROVIDER_BY)
  @IsOptional()
  filter: FILTER_PROVIDER_BY;
}

export class FilterProviderV2Dto extends FilterProviderDto {
  @IsArray()
  dates: string[];
}
