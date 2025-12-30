import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @IsOptional()
  @IsString()
  signature?: string;

  @IsOptional()
  @IsString()
  phone_no?: string;

  @IsOptional()
  @IsString()
  extension?: string;

  @IsOptional()
  @IsBoolean()
  is_email_verified?: boolean;

  @IsOptional()
  @IsNumber()
  login_attempt?: number;

  @IsDateString()
  @IsOptional()
  login_attempt_at?: string;
}
