import { ENTITY_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsOptional, IsArray, IsUUID, IsEnum } from 'class-validator';

export class ContactFilterDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  role?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(ENTITY_STATUS, { each: true })
  status?: ENTITY_STATUS[];
}
