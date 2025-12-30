import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderSavedFacilityDto } from './create-provider-saved-facility.dto';

export class UpdateProviderSavedFacilityDto extends PartialType(
  CreateProviderSavedFacilityDto,
) {}
