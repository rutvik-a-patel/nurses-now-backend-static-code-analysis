import {
  IsArray,
  IsBoolean,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ColumnConfig } from '@/shared/constants/constant';
import { Type } from 'class-transformer';

export class ColumnConfigDto {
  @IsString()
  columnKey: string;

  @IsBoolean()
  visible: boolean;

  @IsInt()
  @Min(1)
  order: number;
}

export class UpdateColumnsPreferenceDto {
  @IsString()
  table_type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnConfigDto)
  columns_config: ColumnConfig[];
}
