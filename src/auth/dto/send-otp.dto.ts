import { CONSTANT } from '@/shared/constants/message';
import {
  IsString,
  IsNotEmpty,
  IsMobilePhone,
  IsOptional,
} from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  country_code: string;

  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  @IsNotEmpty()
  mobile_no: string;

  @IsString()
  @IsOptional()
  created_at_ip?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
