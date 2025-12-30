import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderProfessionalReferenceDto } from './create-provider-professional-reference.dto';

export class UpdateProviderProfessionalReferenceDto extends PartialType(
  CreateProviderProfessionalReferenceDto,
) {}
