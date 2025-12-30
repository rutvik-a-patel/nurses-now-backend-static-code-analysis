import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateProfessionalReferenceRejectReasonDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;
}
