import {
  IsBoolean,
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AppleSignupDto {
  @IsOptional()
  @IsLowercase()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  is_private_email?: boolean;

  @IsOptional()
  @IsBoolean()
  mobile_no?: string;

  @IsNotEmpty()
  @IsString()
  uid: string;

  @IsOptional()
  @IsString()
  display_name?: string;

  @IsOptional()
  @IsString()
  device_id?: string;

  @IsOptional()
  @IsString()
  device_type?: string;

  @IsNotEmpty()
  @IsString()
  firebase: string;

  @IsOptional()
  @IsString()
  device_name?: string;

  @IsOptional()
  @IsString()
  created_at_ip?: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;

  @IsOptional()
  @IsString()
  referral_by?: string;

  @IsOptional()
  @IsString()
  country_code?: string;
}
