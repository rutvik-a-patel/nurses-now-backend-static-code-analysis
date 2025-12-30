import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { USER_STATUS } from '@/shared/constants/enum';
import { EditProviderDto } from './edit-provider.dto';

export class UpdateProviderDto extends PartialType(EditProviderDto) {
  @IsOptional()
  @IsEnum(USER_STATUS)
  profile_status?: USER_STATUS;

  @IsOptional()
  @IsNumber()
  login_attempt?: number;

  @IsDateString()
  @IsOptional()
  login_attempt_at?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  status?: string;
}
