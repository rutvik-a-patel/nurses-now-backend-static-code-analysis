import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsOptional, IsString } from 'class-validator';

export class FilterFacilityDto extends QueryParamsDto {
  @IsOptional()
  @IsString()
  type?: string;
}
