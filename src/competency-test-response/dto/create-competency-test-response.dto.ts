import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCompetencyTestResponseDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  answer: string;

  @IsNotEmpty()
  @IsString()
  correct_answer: string;
}

export class CreateCompetencyTestResponseArrayDto {
  @IsNotEmpty()
  @IsUUID()
  competency_test_score: string;

  @IsArray()
  @IsOptional()
  response?: CreateCompetencyTestResponseDto[];
}
