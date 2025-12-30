import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSkillChecklistQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsOptional()
  @IsUUID()
  skill_checklist_sub_module: string;
}
