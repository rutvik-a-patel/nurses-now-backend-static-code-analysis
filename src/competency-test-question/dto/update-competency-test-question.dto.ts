import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateCompetencyTestOptionDto } from '@/competency-test-option/dto/update-competency-test-option.dto';

export class UpdateCompetencyTestQuestionDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  question?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateCompetencyTestOptionDto)
  competency_test_option?: UpdateCompetencyTestOptionDto[];

  @IsOptional()
  @IsUUID()
  competency_test_setting?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
