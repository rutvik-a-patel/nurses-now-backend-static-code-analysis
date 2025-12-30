import { CreateCompetencyTestOptionDto } from '@/competency-test-option/dto/create-competency-test-option.dto';
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

export class CreateCompetencyTestQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsOptional()
  @IsUUID()
  competency_test_setting?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateCompetencyTestOptionDto)
  competency_test_option: CreateCompetencyTestOptionDto[];
}
