import { PartialType } from '@nestjs/mapped-types';
import { CreateFlagSettingDto } from './create-flag-setting.dto';

export class UpdateFlagSettingDto extends PartialType(CreateFlagSettingDto) {}
