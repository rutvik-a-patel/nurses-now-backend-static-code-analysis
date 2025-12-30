import { PartialType } from '@nestjs/mapped-types';
import { CreateProfessionalReferenceRejectReasonDto } from './create-professional-reference-reject-reason.dto';

export class UpdateProfessionalReferenceRejectReasonDto extends PartialType(
  CreateProfessionalReferenceRejectReasonDto,
) {}
