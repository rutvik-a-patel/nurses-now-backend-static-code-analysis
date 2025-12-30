import { OTP_TYPE } from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import {
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ResendOtpDto {
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  @IsOptional()
  mobile_no: string;

  @IsString()
  @IsOptional()
  country_code: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  @IsEnum(OTP_TYPE)
  type: OTP_TYPE;

  @IsOptional()
  updated_at_ip?: string;
}
