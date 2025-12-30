import { PartialType } from '@nestjs/mapped-types';
import { CreateStatusSettingDto } from './create-status-setting.dto';

export class UpdateStatusSettingDto extends PartialType(
  CreateStatusSettingDto,
) {}
