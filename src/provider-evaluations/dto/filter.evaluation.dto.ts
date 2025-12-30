import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsOptional } from 'class-validator';

export class FilterEvaluationDto extends QueryParamsDto {
  @IsOptional()
  from_date: string;

  @IsOptional()
  to_date: string;
}
