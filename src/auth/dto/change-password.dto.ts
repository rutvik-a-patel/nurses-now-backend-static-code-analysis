import { CONSTANT } from '@/shared/constants/message';
import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  email: string;

  @IsString()
  @IsNotEmpty()
  old_password: string;

  @IsStrongPassword()
  @IsString()
  @IsNotEmpty()
  new_password: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;
}
