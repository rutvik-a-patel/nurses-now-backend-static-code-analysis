import { PartialType } from '@nestjs/mapped-types';
import { CreateFacilityShiftSettingDto } from './create-facility-shift-setting.dto';

export class UpdateFacilityShiftSettingDto extends PartialType(
  CreateFacilityShiftSettingDto,
) {}
