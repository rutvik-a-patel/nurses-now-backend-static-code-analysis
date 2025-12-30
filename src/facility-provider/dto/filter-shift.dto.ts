import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterShiftDto extends QueryParamsDto {
  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsString()
  @IsUUID(undefined, { each: true })
  certificate?: string[];

  @IsOptional()
  @IsString()
  @IsUUID(undefined, { each: true })
  speciality?: string[];
}
