import { DNR_TYPE } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class FilterDnrReportDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facility_id?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  provider_id?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificate_id?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(DNR_TYPE, { each: true })
  dnr_type?: DNR_TYPE[];

  @IsOptional()
  @IsString()
  facility?: string;

  @IsOptional()
  @IsString()
  staff?: string;
}
