import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { defaultLimit, defaultOffset } from '../constants/constant';
import { ORDER_BY } from '../constants/types';
import { DEFAULT_STATUS } from '../constants/enum';

export class QueryParamsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  limit: string = defaultLimit;

  @IsOptional()
  @IsString()
  offset: string = defaultOffset;

  @IsObject()
  @IsOptional()
  order: ORDER_BY = { created_at: 'DESC' };

  @IsString()
  @IsOptional()
  start_date?: string;

  @IsString()
  @IsOptional()
  end_date?: string;
}

export class MultiSelectQueryParamsDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(DEFAULT_STATUS, { each: true })
  status?: DEFAULT_STATUS[];
}

export class UserNotificationQuery extends QueryParamsDto {
  @IsOptional()
  is_read: boolean;
}
