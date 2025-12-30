import { PartialType } from '@nestjs/mapped-types';
import { CreateReferenceFormOptionDto } from './create-reference-form-option.dto';

export class UpdateReferenceFormOptionDto extends PartialType(
  CreateReferenceFormOptionDto,
) {}
