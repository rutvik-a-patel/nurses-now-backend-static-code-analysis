import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderCredentialDto } from './create-provider-credential.dto';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CREDENTIAL_STATUS } from '@/shared/constants/enum';

export class UpdateProviderCredentialDto extends PartialType(
  CreateProviderCredentialDto,
) {}

export class ApproveOrRejectProviderCredentialDto {
  @IsOptional()
  @IsString()
  reason_description?: string;

  @IsOptional()
  @IsUUID()
  reason?: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CREDENTIAL_STATUS)
  is_verified: CREDENTIAL_STATUS;

  @IsDateString()
  @IsOptional()
  credential_rejected_at?: string;

  @IsDateString()
  @IsOptional()
  credential_approved_at?: string;
}
