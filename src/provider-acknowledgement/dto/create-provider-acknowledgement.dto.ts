import { ProviderGeneralSettingSubSection } from '@/provider-general-setting/entities/provider-general-setting-sub-section.entity';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AcknowledgementQuestion {
  @IsNotEmpty()
  @Type(() => ProviderGeneralSettingSubSection)
  acknowledgementSetting: ProviderGeneralSettingSubSection;

  @IsNotEmpty()
  @IsBoolean()
  response: boolean;

  @IsOptional()
  @IsString()
  remark: string;
}

export class CreateProviderAcknowledgementDto {
  @IsOptional()
  @IsString()
  base_url: string;

  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AcknowledgementQuestion)
  acknowledgementQuestions: AcknowledgementQuestion[];
}
