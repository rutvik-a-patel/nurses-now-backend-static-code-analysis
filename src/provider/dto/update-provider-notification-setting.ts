import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProviderNotificationSettingDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProviderNotificationSettingDto)
  provider_notification_setting: ProviderNotificationSettingDto[];
}

export class ProviderNotificationSettingDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @IsBoolean()
  @IsOptional()
  push?: boolean;
}
