import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';

export class DocumentFilter extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  uploaded_by?: string[];

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
  admin_document_category_id?: string[];

  @IsOptional()
  @IsString()
  document_notes?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
