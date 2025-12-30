import { PartialType } from '@nestjs/mapped-types';
import {
  CreateEvaluationResponseDto,
  CreateProviderEvaluationDto,
} from './create-provider-evaluation.dto';

export class UpdateProviderEvaluationDto extends PartialType(
  CreateProviderEvaluationDto,
) {}

export class UpdateEvaluationResponseDto extends PartialType(
  CreateEvaluationResponseDto,
) {}
