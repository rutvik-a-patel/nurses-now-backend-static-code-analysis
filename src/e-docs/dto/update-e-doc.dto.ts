import { PartialType } from '@nestjs/mapped-types';
import { CreateEDocDto } from './create-e-doc.dto';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EXPIRATION_DURATION_TYPE } from '@/shared/constants/enum';

export class UpdateEDocDto extends PartialType(CreateEDocDto) {
  @IsOptional()
  @IsString()
  new_file?: string;

  @IsOptional()
  @IsString()
  attachment_label?: string;

  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @IsArray()
  ref?: any;

  @IsOptional()
  @IsBoolean()
  require_download?: boolean;

  @IsOptional()
  @IsEnum(EXPIRATION_DURATION_TYPE)
  expiration_period?: EXPIRATION_DURATION_TYPE;

  @IsOptional()
  @IsNumber()
  expiration_duration?: number;

  @IsOptional()
  @IsArray()
  field_settings?: any;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;
}
