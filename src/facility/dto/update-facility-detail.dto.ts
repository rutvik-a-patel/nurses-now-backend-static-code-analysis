import { PartialType } from '@nestjs/mapped-types';
import { AddFacilityDto } from './add-facility.dto';

export class UpdateFacilityDetailDto extends PartialType(AddFacilityDto) {}
