import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderAcknowledgementDto } from './create-provider-acknowledgement.dto';

export class UpdateProviderAcknowledgementDto extends PartialType(
  CreateProviderAcknowledgementDto,
) {}
