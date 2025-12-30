import { AUTO_ASSIGN } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class FilterCredentialsDto extends QueryParamsDto {
  @IsOptional()
  @IsUUID()
  specialty?: string;

  @IsOptional()
  @IsUUID()
  certificate?: string;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  credentials_category?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(AUTO_ASSIGN, { each: true })
  @Type(() => String)
  auto_assign: AUTO_ASSIGN[];
}
