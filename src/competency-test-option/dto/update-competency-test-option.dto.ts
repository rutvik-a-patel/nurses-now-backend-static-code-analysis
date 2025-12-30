import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateCompetencyTestOptionDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  option?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  is_answer?: boolean;

  @IsOptional()
  @IsUUID()
  competency_test_question?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
