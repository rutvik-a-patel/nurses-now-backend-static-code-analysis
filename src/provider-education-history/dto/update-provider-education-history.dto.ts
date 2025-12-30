import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderEducationHistoryDto } from './create-provider-education-history.dto';

export class UpdateProviderEducationHistoryDto extends PartialType(
  CreateProviderEducationHistoryDto,
) {}
