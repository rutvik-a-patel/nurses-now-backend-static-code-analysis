import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSkillChecklistModuleDto } from '@/skill-checklist-module/dto/update-skill-checklist-module.dto';
import { DEFAULT_STATUS } from '@/shared/constants/enum';

export class UpdateSkillChecklistTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DEFAULT_STATUS)
  @IsOptional()
  status?: DEFAULT_STATUS;

  @IsUUID()
  @IsOptional()
  certificate?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  delete_module?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  delete_sub_module?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  delete_question?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSkillChecklistModuleDto)
  skill_checklist_module?: UpdateSkillChecklistModuleDto[];

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
