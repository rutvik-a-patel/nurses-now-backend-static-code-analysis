import { PartialType } from '@nestjs/mapped-types';
import { CreateCredentialsCategoryDto } from './create-credentials-category.dto';

export class UpdateCredentialsCategoryDto extends PartialType(
  CreateCredentialsCategoryDto,
) {}
