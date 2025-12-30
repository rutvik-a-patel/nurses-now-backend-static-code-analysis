import { PartialType } from '@nestjs/mapped-types';
import { CreateFacilityDocumentCategoryDto } from './create-facility-document-category.dto';

export class UpdateFacilityDocumentCategoryDto extends PartialType(
  CreateFacilityDocumentCategoryDto,
) {}
