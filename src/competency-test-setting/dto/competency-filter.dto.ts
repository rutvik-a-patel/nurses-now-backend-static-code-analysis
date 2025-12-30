import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';

export class CompetencyFilterDto extends MultiSelectQueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  duration?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  required_score?: string[];
}
