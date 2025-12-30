import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';

export class LocationMapDto {
  @IsOptional()
  @IsString()
  zip_code: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius: number;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  status: string[];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  facility_status: string[];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  certificate_id: string[];
}

export class EntityDetailsDto extends QueryParamsDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsEnum(['provider', 'facility'], {
    message: `type must be either 'provider' or 'facility'`,
  })
  type: string;
}
