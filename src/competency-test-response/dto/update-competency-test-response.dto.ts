import { PartialType } from '@nestjs/mapped-types';
import { CreateCompetencyTestResponseDto } from './create-competency-test-response.dto';

export class UpdateCompetencyTestResponseDto extends PartialType(
  CreateCompetencyTestResponseDto,
) {}
