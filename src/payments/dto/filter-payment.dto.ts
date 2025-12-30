import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class FilterPaymentDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsOptional()
  facility?: string[];

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;
}
