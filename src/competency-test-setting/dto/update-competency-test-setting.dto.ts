import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  DEFAULT_STATUS,
  EXPIRATION_DURATION_TYPE,
} from '@/shared/constants/enum';
import { Type } from 'class-transformer';
import { UpdateCompetencyTestQuestionDto } from '@/competency-test-question/dto/update-competency-test-question.dto';

export class UpdateCompetencyTestGlobalSettingDto {
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

export class UpdateCompetencyTestSettingDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  required_score?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsEnum(DEFAULT_STATUS)
  @IsOptional()
  status?: DEFAULT_STATUS;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateCompetencyTestQuestionDto)
  competency_test_question?: UpdateCompetencyTestQuestionDto[];

  @IsOptional()
  @IsObject()
  @Type(() => UpdateCompetencyTestGlobalSettingDto)
  @ValidateNested({ each: true })
  global_test_setting?: UpdateCompetencyTestGlobalSettingDto;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  delete_question?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  delete_option?: string[];

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
