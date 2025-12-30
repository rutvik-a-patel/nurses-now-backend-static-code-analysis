import { Provider } from '@/provider/entities/provider.entity';
import { CONSTANT } from '@/shared/constants/message';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsMobilePhone,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProviderWorkHistoryDto {
  @IsOptional()
  @IsString()
  employer_name: string;

  @IsOptional()
  @IsString()
  supervisors_name: string;

  @IsOptional()
  @IsString()
  supervisors_title: string;

  @IsOptional()
  @IsString()
  work_phone_country_code: string;

  @IsOptional()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  work_phone: string;
  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  start_date: string;

  @IsOptional()
  @IsString()
  end_date: string;

  @IsOptional()
  @IsBoolean()
  is_teaching_facility: boolean;

  @IsOptional()
  @IsBoolean()
  is_current: boolean;

  @IsOptional()
  @IsBoolean()
  charge_experience: boolean;

  @IsOptional()
  @IsBoolean()
  can_contact_employer: boolean;

  @IsOptional()
  @Type(() => Provider)
  provider: Provider;

  @IsOptional()
  created_at_ip: string;

  @IsOptional()
  updated_at_ip: string;
}
