import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import {
  AUTO_ASSIGN,
  DEFAULT_STATUS,
  VALIDATE_UPON,
} from '@/shared/constants/enum';

export class CreateCredentialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsOptional()
  credential_id?: string;

  @IsUUID()
  @IsNotEmpty()
  credentials_category: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  licenses: string[];

  @IsBoolean()
  @IsOptional()
  is_essential?: boolean;

  @IsBoolean()
  @IsOptional()
  expiry_required?: boolean;

  @IsBoolean()
  @IsOptional()
  issued_required?: boolean;

  @IsBoolean()
  @IsOptional()
  document_required?: boolean;

  @IsBoolean()
  @IsOptional()
  doc_number_required?: boolean;

  @IsBoolean()
  @IsOptional()
  approval_required?: boolean;

  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  state_id: string[];

  @IsEnum(AUTO_ASSIGN)
  auto_assign: AUTO_ASSIGN;

  @IsEnum(DEFAULT_STATUS)
  @IsOptional()
  status?: DEFAULT_STATUS;

  @IsEnum(VALIDATE_UPON)
  validate: VALIDATE_UPON;

  @IsUUID()
  @IsOptional()
  created_by?: string;
}
