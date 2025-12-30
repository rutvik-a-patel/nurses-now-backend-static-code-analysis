import { PartialType } from '@nestjs/mapped-types';
import { CreateFacilityDto } from './create-facility.dto';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { VERIFICATION_STATUS } from '@/shared/constants/enum';

export class UpdateFacilityDto extends PartialType(CreateFacilityDto) {
  @IsOptional()
  @IsNumber()
  login_attempt?: number;

  @IsDateString()
  @IsOptional()
  login_attempt_at?: string;
}

export class RejectFacilityDto {
  @IsOptional()
  @IsString()
  reason_description?: string;

  @IsOptional()
  @IsUUID()
  reason?: string;

  @IsOptional()
  @IsUUID()
  status?: string;

  @IsOptional()
  @IsEnum(VERIFICATION_STATUS)
  verification_status?: string;
}
