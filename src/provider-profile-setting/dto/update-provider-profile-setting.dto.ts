import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderProfileSettingDto } from './create-provider-profile-setting.dto';

export class UpdateProviderProfileSettingDto extends PartialType(
  CreateProviderProfileSettingDto,
) {}
