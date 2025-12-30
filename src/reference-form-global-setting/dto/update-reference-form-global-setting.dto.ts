import { PartialType } from '@nestjs/mapped-types';
import { CreateReferenceFormGlobalSettingDto } from './create-reference-form-global-setting.dto';

export class UpdateReferenceFormGlobalSettingDto extends PartialType(
  CreateReferenceFormGlobalSettingDto,
) {}
