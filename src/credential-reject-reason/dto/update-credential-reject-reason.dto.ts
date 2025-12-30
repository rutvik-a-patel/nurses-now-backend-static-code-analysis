import { PartialType } from '@nestjs/mapped-types';
import { CreateCredentialRejectReasonDto } from './create-credential-reject-reason.dto';

export class UpdateCredentialRejectReasonDto extends PartialType(
  CreateCredentialRejectReasonDto,
) {}
