import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignedCredentialDto } from './create-assigned-credential.dto';

export class UpdateAssignedCredentialDto extends PartialType(
  CreateAssignedCredentialDto,
) {}
