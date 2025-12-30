import { DEFAULT_STATUS, OPTION_TYPE } from '@/shared/constants/enum';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateOptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  order: number;

  @IsUUID()
  @IsOptional()
  reference_form_design: string;
}

export class CreateReferenceFormDesignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  order: number;

  @IsEnum(OPTION_TYPE)
  @IsNotEmpty()
  option_type: OPTION_TYPE;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}

export class CreateReferenceFormDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsEnum(DEFAULT_STATUS)
  status?: DEFAULT_STATUS;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReferenceFormDesignDto)
  reference_form: CreateReferenceFormDesignDto[];

  @IsString()
  @IsOptional()
  created_at_ip?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
