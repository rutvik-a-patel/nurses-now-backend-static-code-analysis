import { DNR_TYPE, FACILITY_PROVIDER_FLAGS } from '@/shared/constants/enum';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateFacilityProviderDto {
  @IsEnum(FACILITY_PROVIDER_FLAGS)
  @IsOptional()
  flag?: FACILITY_PROVIDER_FLAGS;

  @IsEnum(DNR_TYPE)
  @IsOptional()
  dnr_type?: DNR_TYPE;

  @IsOptional()
  dnr_at?: string;

  @IsOptional()
  dnr_reason?: string;

  @IsOptional()
  dnr_description?: string;

  @IsOptional()
  created_by_id?: string;

  @IsOptional()
  created_by_type?: string;

  @IsOptional()
  @IsBoolean()
  self_dnr?: boolean;

  @IsOptional()
  @IsString()
  self_dnr_reason?: string;

  @IsOptional()
  @IsString()
  self_dnr_description?: string;
  @IsOptional()
  @IsString()
  self_dnr_at?: string;
}
