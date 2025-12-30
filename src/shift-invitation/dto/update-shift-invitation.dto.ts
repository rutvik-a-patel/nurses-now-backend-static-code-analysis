import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftInvitationDto } from './create-shift-invitation.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SHIFT_INVITATION_STATUS } from '@/shared/constants/enum';

export class UpdateShiftInvitationDto extends PartialType(
  CreateShiftInvitationDto,
) {
  @IsOptional()
  @IsString()
  @IsEnum(SHIFT_INVITATION_STATUS)
  status: SHIFT_INVITATION_STATUS;

  @IsOptional()
  @IsString()
  invited_on?: string;
}
