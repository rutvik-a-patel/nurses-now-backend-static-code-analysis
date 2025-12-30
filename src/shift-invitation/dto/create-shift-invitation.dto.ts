import { SHIFT_INVITATION_STATUS, SHIFT_STATUS } from '@/shared/constants/enum';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateShiftInvitationDto {
  @IsNotEmpty()
  @IsUUID()
  provider: string;

  @IsNotEmpty()
  @IsUUID()
  shift: string;

  @IsOptional()
  @IsEnum(SHIFT_INVITATION_STATUS)
  status?: SHIFT_INVITATION_STATUS;

  @IsOptional()
  @IsEnum(SHIFT_STATUS)
  shift_status?: SHIFT_STATUS;

  @IsOptional()
  @IsString()
  created_at?: string;
}
