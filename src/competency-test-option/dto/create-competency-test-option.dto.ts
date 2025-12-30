import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCompetencyTestOptionDto {
  @IsString()
  @IsNotEmpty()
  option: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsBoolean()
  @IsOptional()
  is_answer?: boolean;

  @IsOptional()
  @IsUUID()
  competency_test_question?: string;
}
