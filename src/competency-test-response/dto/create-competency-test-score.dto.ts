import { TEST_STATUS } from '@/shared/constants/enum';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCompetencyTestScoreDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNotEmpty()
  @IsNumber()
  score: number;

  @IsNotEmpty()
  @IsEnum(TEST_STATUS)
  test_status: TEST_STATUS;

  @IsNotEmpty()
  @IsUUID()
  provider: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  competency_test_setting: string;

  @IsNotEmpty()
  @IsNumber()
  required_score: number;

  @IsNotEmpty()
  @IsNumber()
  total_questions: number;

  @IsNotEmpty()
  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  updated_at?: string;
}
