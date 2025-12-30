import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderWorkHistoryDto } from './create-provider-work-history.dto';

export class UpdateProviderWorkHistoryDto extends PartialType(
  CreateProviderWorkHistoryDto,
) {}
