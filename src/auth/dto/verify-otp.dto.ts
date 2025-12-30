import { CONSTANT } from '@/shared/constants/message';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  country_code: string;

  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  @IsNotEmpty()
  mobile_no: string;

  @IsNumber()
  @IsNotEmpty()
  otp: number;

  @IsNotEmpty()
  @IsString()
  device_id: string;

  @IsNotEmpty()
  @IsString()
  device_type: string;

  @IsNotEmpty()
  @IsString()
  firebase: string;

  @IsOptional()
  @IsString()
  created_at_ip?: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;
}
