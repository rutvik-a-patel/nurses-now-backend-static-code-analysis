import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { CreateSkillChecklistModuleDto } from '@/skill-checklist-module/dto/create-skill-checklist-module.dto';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateSkillChecklistTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(DEFAULT_STATUS)
  @IsOptional()
  status?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateSkillChecklistModuleDto)
  skill_checklist_module: CreateSkillChecklistModuleDto[];

  @IsString()
  @IsOptional()
  created_at_ip?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
