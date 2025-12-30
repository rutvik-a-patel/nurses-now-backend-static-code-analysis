import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

export class GetFacilityHolidayDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(DEFAULT_STATUS, { each: true })
  status?: DEFAULT_STATUS[];
}
