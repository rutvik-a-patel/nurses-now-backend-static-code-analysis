import { DEFAULT_STATUS } from '@/shared/constants/enum';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCertificateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  abbreviation: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;

  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  specialities?: string[];

  @IsBoolean()
  @IsNotEmpty()
  display: boolean;

  @IsString()
  @IsOptional()
  workforce_portal_alias?: string;

  @IsString()
  @IsOptional()
  text_color?: string;

  @IsString()
  @IsOptional()
  background_color?: string;

  @IsString()
  @IsOptional()
  created_at_ip?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
