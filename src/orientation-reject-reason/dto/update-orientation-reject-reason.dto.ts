import { PartialType } from '@nestjs/mapped-types';
import { CreateOrientationRejectReasonDto } from './create-orientation-reject-reason.dto';

export class UpdateOrientationRejectReasonDto extends PartialType(
  CreateOrientationRejectReasonDto,
) {}
