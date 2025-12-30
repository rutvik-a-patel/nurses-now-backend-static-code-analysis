import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SocialSignupProvider {
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
  password?: string;

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

  @IsOptional()
  @IsString()
  mobile_no?: string;
}
