import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderGeneralSettingDto } from './create-provider-general-setting.dto';

export class UpdateProviderGeneralSettingDto extends PartialType(
  CreateProviderGeneralSettingDto,
) {}
