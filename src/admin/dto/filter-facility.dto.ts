import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterFacilityDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  facility_type: string[];

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  is_corporate_client?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  status?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  name?: string[]; // for facility name filtering

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip_code?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  contact_id?: string[];
}
