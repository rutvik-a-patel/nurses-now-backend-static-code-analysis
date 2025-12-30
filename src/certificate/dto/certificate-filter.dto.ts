import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsOptional, IsArray, IsUUID, IsString } from 'class-validator';

export class CertSpecFilterQueryDto extends MultiSelectQueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  certificate?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  speciality?: string[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  abbreviation?: string;
}
