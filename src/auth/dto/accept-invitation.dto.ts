import { CONSTANT } from '@/shared/constants/message';
import {
  IsEmail,
  IsLowercase,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class AcceptInvitationDto {
  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  @IsOptional()
  mobile_no?: string;

  @IsString()
  @IsOptional()
  country_code?: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;
}
