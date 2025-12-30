import { CREDENTIAL_STATUS, ORIENTATION_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class FilterProviderOrientationDto extends QueryParamsDto {
  @IsOptional()
  @IsEnum(ORIENTATION_STATUS, { each: true })
  status: ORIENTATION_STATUS[];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  certificate_id: string[];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  speciality_id: string[];
}

export class OrientationDocQueryDto {
  @IsOptional()
  @IsUUID()
  provider_id: string;

  @IsOptional()
  @IsUUID()
  facility_id: string;

  @IsOptional()
  @IsUUID()
  reason: string;

  @IsOptional()
  @IsEnum(CREDENTIAL_STATUS)
  is_verified: CREDENTIAL_STATUS;

  @IsOptional()
  @IsUUID()
  document_id: string;
}
