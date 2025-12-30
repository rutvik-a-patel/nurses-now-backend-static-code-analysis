import { EvaluationType, TABLE } from '@/shared/constants/enum';
import { ProviderEvaluation } from '../entities/provider-evaluation.entity';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Provider } from '@/provider/entities/provider.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Type } from 'class-transformer';

export class CreateProviderEvaluationDto {
  @IsNotEmpty()
  @IsEnum(EvaluationType)
  type: EvaluationType;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  value: number;

  @IsOptional()
  @IsUUID()
  provider_evaluation?: ProviderEvaluation;
}

export class CreateEvaluationResponseDto {
  @IsNotEmpty()
  @IsUUID()
  provider: Provider;

  @IsOptional()
  @IsUUID()
  facility: Facility;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsEnum([TABLE.admin, TABLE.facility, TABLE.facility_user])
  evaluated_by?: Exclude<TABLE, TABLE.provider>;

  @IsOptional()
  @IsUUID()
  evaluated_by_id?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateProviderEvaluationDto)
  evaluation_response: CreateProviderEvaluationDto[];
}
