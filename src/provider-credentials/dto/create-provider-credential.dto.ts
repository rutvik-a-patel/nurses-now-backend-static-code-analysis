import { CREDENTIAL_STATUS } from '@/shared/constants/enum';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateProviderCredentialDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  base_url: string;

  @IsOptional()
  @IsString()
  filename: string;

  @IsOptional()
  @IsString()
  original_filename: string;

  @IsOptional()
  @IsString()
  license: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'issue_date must be in the format YYYY-MM-DD',
  })
  issue_date: Date;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'expiry_date must be in the format YYYY-MM-DD',
  })
  expiry_date: Date;

  @IsNotEmpty()
  @IsUUID()
  credential: string;

  @IsOptional()
  @IsUUID()
  provider: string;

  @IsOptional()
  @IsBoolean()
  is_other: boolean;

  @IsOptional()
  @IsEnum(CREDENTIAL_STATUS)
  is_verified: CREDENTIAL_STATUS;

  @IsOptional()
  @IsUUID()
  previous_document: string;
}
