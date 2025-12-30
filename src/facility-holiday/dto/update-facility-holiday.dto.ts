import { PartialType } from '@nestjs/mapped-types';
import { FacilityHolidayItemDto } from './create-facility-holiday.dto';

export class UpdateFacilityHolidayDto extends PartialType(
  FacilityHolidayItemDto,
) {}
