import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftCancelReasonDto } from './create-shift-cancel-reason.dto';

export class UpdateShiftCancelReasonDto extends PartialType(
  CreateShiftCancelReasonDto,
) {}
