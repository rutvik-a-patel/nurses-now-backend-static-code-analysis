import { CreateSkillChecklistQuestionDto } from '@/skill-checklist-template/dto/create-skill-checklist-question.dto';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateSkillChecklistSubModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateSkillChecklistQuestionDto)
  skill_checklist_question: CreateSkillChecklistQuestionDto[];

  @IsOptional()
  @IsUUID()
  skill_checklist_module: string;
}

export class CreateSkillChecklistModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateSkillChecklistSubModuleDto)
  skill_checklist_sub_module: CreateSkillChecklistSubModuleDto[];

  @IsOptional()
  @IsUUID()
  skill_checklist_template: string;
}
