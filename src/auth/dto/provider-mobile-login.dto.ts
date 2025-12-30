import { CONSTANT } from '@/shared/constants/message';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ProviderMobileLoginDto {
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
}
