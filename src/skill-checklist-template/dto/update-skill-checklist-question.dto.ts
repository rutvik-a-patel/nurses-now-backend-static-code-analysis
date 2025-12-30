import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateSkillChecklistQuestionDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  question: string;

  @IsNumber()
  @IsOptional()
  order: number;

  @IsOptional()
  @IsUUID()
  skill_checklist_sub_module: string;

  @IsString()
  @IsOptional()
  updated_at_ip: string;
}
