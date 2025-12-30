import { PartialType } from '@nestjs/mapped-types';
import { CreateTimecardRejectReasonDto } from './create-timecard-reject-reason.dto';

export class UpdateTimecardRejectReasonDto extends PartialType(
  CreateTimecardRejectReasonDto,
) {}
