import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDocumentDto } from './create-admin-document.dto';

export class UpdateAdminDocumentDto extends PartialType(
  CreateAdminDocumentDto,
) {}
