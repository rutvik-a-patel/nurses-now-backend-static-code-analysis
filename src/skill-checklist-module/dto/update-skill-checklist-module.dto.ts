import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSkillChecklistQuestionDto } from '@/skill-checklist-template/dto/update-skill-checklist-question.dto';

export class UpdateSkillChecklistSubModuleDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSkillChecklistQuestionDto)
  skill_checklist_question: UpdateSkillChecklistQuestionDto[];

  @IsOptional()
  @IsUUID()
  skill_checklist_module: string;

  @IsString()
  @IsOptional()
  updated_at_ip: string;
}

export class UpdateSkillChecklistModuleDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsOptional()
  order: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSkillChecklistSubModuleDto)
  skill_checklist_sub_module: UpdateSkillChecklistSubModuleDto[];

  @IsOptional()
  @IsUUID()
  skill_checklist_template: string;

  @IsString()
  @IsOptional()
  updated_at_ip: string;
}
