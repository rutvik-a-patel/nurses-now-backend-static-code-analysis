import { CreateCompetencyTestQuestionDto } from '@/competency-test-question/dto/create-competency-test-question.dto';
import {
  DEFAULT_STATUS,
  EXPIRATION_DURATION_TYPE,
} from '@/shared/constants/enum';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateCompetencyTestGlobalSettingDto {
  @IsOptional()
  @IsNumber()
  expires_in?: number;

  @IsEnum(EXPIRATION_DURATION_TYPE)
  @IsOptional()
  expiration_duration_type?: EXPIRATION_DURATION_TYPE;

  @IsOptional()
  @IsNumber()
  total_attempts?: number;

  @IsOptional()
  @IsNumber()
  reassignment_duration?: number;

  @IsEnum(EXPIRATION_DURATION_TYPE)
  @IsOptional()
  reassignment_duration_type?: EXPIRATION_DURATION_TYPE;

  @IsOptional()
  @IsString()
  competency_test_setting?: string;
}

export class CreateCompetencyTestSettingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  required_score: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsEnum(DEFAULT_STATUS)
  @IsOptional()
  status?: DEFAULT_STATUS;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateCompetencyTestQuestionDto)
  competency_test_question: CreateCompetencyTestQuestionDto[];

  @IsOptional()
  @IsObject()
  @Type(() => CreateCompetencyTestGlobalSettingDto)
  @ValidateNested({ each: true })
  global_test_setting?: CreateCompetencyTestGlobalSettingDto;

  @IsString()
  @IsOptional()
  created_at_ip?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
