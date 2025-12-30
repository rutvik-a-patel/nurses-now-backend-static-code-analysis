import { CONSTANT } from '@/shared/constants/message';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ProviderMobileSignupDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  @IsNotEmpty()
  mobile_no: string;

  @IsString()
  @IsNotEmpty()
  country_code: string;

  @IsNotEmpty()
  @IsString()
  device_id: string;

  @IsOptional()
  @IsString()
  device_name?: string;

  @IsNotEmpty()
  @IsString()
  device_type: string;

  @IsOptional()
  @IsString()
  firebase?: string;

  @IsOptional()
  created_at_ip?: string;

  @IsOptional()
  updated_at_ip?: string;

  @IsOptional()
  @IsString()
  referral_by?: string;
}
