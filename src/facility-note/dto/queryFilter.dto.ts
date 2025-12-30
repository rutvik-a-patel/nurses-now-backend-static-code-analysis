import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class FacilityNoteFilterDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tag_id?: string[];

  @IsOptional()
  @IsUUID()
  created_by?: string;

  @IsOptional()
  @IsUUID()
  relates_to?: string;
}
