import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderRejectReasonDto } from './create-provider-reject-reason.dto';

export class UpdateProviderRejectReasonDto extends PartialType(
  CreateProviderRejectReasonDto,
) {}
