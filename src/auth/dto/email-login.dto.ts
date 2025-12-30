import { CONSTANT } from '@/shared/constants/message';
import {
  IsBoolean,
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class EmailLoginDto {
  @IsNotEmpty()
  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  device_id: string;

  @IsOptional()
  @IsString()
  device_name?: string;

  @IsNotEmpty()
  @IsString()
  device_type: string;

  @IsOptional()
  @IsString()
  firebase?: string;

  @IsOptional()
  @IsString()
  created_at_ip?: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;

  @IsBoolean()
  remember_me: boolean = false;
}
