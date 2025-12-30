import { PartialType } from '@nestjs/mapped-types';
import { CreateEDocsGroupDto } from './create-e-docs-group.dto';

export class UpdateEDocsGroupDto extends PartialType(CreateEDocsGroupDto) {}
