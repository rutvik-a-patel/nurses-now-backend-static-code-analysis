import { PartialType } from '@nestjs/mapped-types';
import { CreateProfessionalReferenceResponseDto } from './create-professional-reference-response.dto';

export class UpdateProfessionalReferenceResponseDto extends PartialType(
  CreateProfessionalReferenceResponseDto,
) {}
