import { PartialType } from '@nestjs/mapped-types';
import { CreateFacilityRejectReasonDto } from './create-facility-reject-reason.dto';

export class UpdateFacilityRejectReasonDto extends PartialType(
  CreateFacilityRejectReasonDto,
) {}
