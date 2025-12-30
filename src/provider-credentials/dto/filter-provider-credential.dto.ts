import { DATE_FILTER } from '@/shared/constants/types';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsArray, IsIn, IsObject, IsOptional, IsUUID } from 'class-validator';

export class FilterProviderCredentialForAdminDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  provider_ids?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  credential_ids?: string[];

  @IsOptional()
  @IsIn(['pending', 'verified', 'rejected', 'expired', 'expiring_soon'], {
    each: true,
  })
  status?: string;

  @IsOptional()
  @IsObject()
  issue_date?: DATE_FILTER[];

  @IsOptional()
  @IsObject()
  expiry_date?: DATE_FILTER[];
}
