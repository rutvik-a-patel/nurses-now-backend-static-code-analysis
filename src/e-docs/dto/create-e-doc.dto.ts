import { CONSTANT } from '@/shared/constants/message';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEDocDto {
  @IsNotEmpty({ message: CONSTANT.ERROR.REQUIRED('Document Name') })
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  document_group: string;

  @IsOptional()
  @IsString()
  base_url?: string;

  @IsNotEmpty()
  @IsString()
  document: string;

  @IsNotEmpty()
  @IsString()
  original_filename: string;

  @IsOptional()
  @IsBoolean()
  is_replaced?: boolean;

  @IsOptional()
  @IsString()
  created_at_ip?: string;
}
