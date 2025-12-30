import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class SkillChecklistResponseDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  answer: number;
}
