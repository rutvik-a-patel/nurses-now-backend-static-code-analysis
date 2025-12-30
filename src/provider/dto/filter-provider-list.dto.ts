import { VERIFICATION_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DATE_FILTER } from '@/shared/constants/types';

export class FilterProviderListDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  certificate?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  speciality?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  status?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(VERIFICATION_STATUS, { each: true })
  @Type(() => String)
  verification_status: VERIFICATION_STATUS[];

  @IsOptional()
  @IsObject()
  last_login?: DATE_FILTER[];

  @IsOptional()
  @IsObject()
  created_at?: DATE_FILTER[];

  @IsOptional()
  @IsObject()
  updated_at?: DATE_FILTER[];

  @IsOptional()
  @IsObject()
  first_work_date?: DATE_FILTER[];

  @IsOptional()
  @IsObject()
  last_paid_date?: DATE_FILTER[];

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip_code?: string;
}

export class FilterProviderListForAdminDto extends FilterProviderListDto {
  @IsNotEmpty()
  @IsEnum({ staff: 'staff', applicant: 'applicant' })
  type: 'staff' | 'applicant';

  @IsOptional()
  @IsUUID()
  provider?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  referred_by?: string;
}
