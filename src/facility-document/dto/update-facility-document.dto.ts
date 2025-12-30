import { PartialType } from '@nestjs/mapped-types';
import { CreateFacilityDocumentDto } from './create-facility-document.dto';

export class UpdateFacilityDocumentDto extends PartialType(
  CreateFacilityDocumentDto,
) {}
