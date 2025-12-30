import { PartialType } from '@nestjs/mapped-types';
import { CreateReferFacilityDto } from './create-refer-facility.dto';

export class UpdateReferFacilityDto extends PartialType(
  CreateReferFacilityDto,
) {}
