import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEDocResponseDto {
  @IsOptional()
  @IsString()
  base_url?: string;

  @IsNotEmpty()
  @IsString()
  document: string;

  @IsOptional()
  @IsString()
  original_filename?: string;

  @IsBoolean()
  @IsOptional()
  is_other?: boolean;

  @IsUUID()
  @IsNotEmpty()
  e_doc: string;

  @IsUUID()
  @IsOptional()
  provider?: string;

  @IsOptional()
  @IsString()
  created_at_ip?: string;
}
