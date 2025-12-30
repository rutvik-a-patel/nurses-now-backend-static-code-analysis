import { CONSTANT } from '@/shared/constants/message';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  IsMobilePhone,
  IsOptional,
  IsString,
  IsLowercase,
  IsUUID,
} from 'class-validator';

export class SignupFacilityDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNotEmpty()
  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsStrongPassword({ minLength: 6 })
  password: string;

  @IsOptional()
  @IsString()
  base_url?: string;

  @IsNotEmpty()
  @IsString()
  country_code: string;

  @IsNotEmpty()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  mobile_no: string;

  @IsOptional()
  created_at_ip?: string;

  @IsOptional()
  updated_at_ip?: string;
}
