import { CONSTANT } from '@/shared/constants/message';
import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
} from 'class-validator';

export class ProviderEmailSignupDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  created_at_ip?: string;

  @IsOptional()
  updated_at_ip?: string;

  @IsOptional()
  @IsString()
  referral_by?: string;
}
