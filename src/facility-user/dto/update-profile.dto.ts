import { CONSTANT } from '@/shared/constants/message';
import {
  IsEmail,
  IsLowercase,
  IsMobilePhone,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  email?: string;

  @IsOptional()
  @IsString()
  base_url?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  country_code?: string;

  @IsOptional()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  mobile_no?: string;

  @IsOptional()
  @IsString()
  phone_no?: string;

  @IsOptional()
  @IsString()
  extension?: string;

  @IsOptional()
  @IsString()
  signature?: string;
}
