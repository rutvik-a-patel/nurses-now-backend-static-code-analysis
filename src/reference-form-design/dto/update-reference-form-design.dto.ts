import { DEFAULT_STATUS, OPTION_TYPE } from '@/shared/constants/enum';
import { Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';

export class UpdateOptionDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsNumber()
  order: number;

  @IsUUID()
  @IsOptional()
  reference_form_design: string;
}

export class UpdateReferenceFormDesignDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsNumber()
  order: number;

  @IsEnum(OPTION_TYPE)
  @IsOptional()
  option_type: OPTION_TYPE;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateOptionDto)
  options: UpdateOptionDto[];
}

export class UpdateReferenceFormDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @IsEnum(DEFAULT_STATUS)
  status?: DEFAULT_STATUS;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateReferenceFormDesignDto)
  reference_form?: UpdateReferenceFormDesignDto[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  delete_question?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  delete_option?: string[];

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
