import { CONSTANT } from '@/shared/constants/message';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  IsMobilePhone,
  IsOptional,
  IsLowercase,
} from 'class-validator';

export class SignupFacilityUserDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  email: string;

  @IsNotEmpty()
  @IsStrongPassword({ minLength: 8 })
  password: string;

  @IsNotEmpty()
  country_code: string;

  @IsNotEmpty()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  mobile_no: string;

  @IsOptional()
  created_at_ip?: string;

  @IsOptional()
  updated_at_ip?: string;
}
