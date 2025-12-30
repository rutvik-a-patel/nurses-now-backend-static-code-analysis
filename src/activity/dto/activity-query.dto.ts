import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ACTION_TABLES } from '@/shared/constants/enum';

export class ActivityQuery extends QueryParamsDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsEnum(ACTION_TABLES, {
    each: true,
    message: `Invalid value 'action_for' field`,
  })
  action_for?: ACTION_TABLES[];

  @IsOptional()
  @IsUUID('4', { each: true })
  entity_id?: string[];
}
