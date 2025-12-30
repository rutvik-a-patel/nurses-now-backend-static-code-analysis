import { DAY, SHIFT, SHIFT_TYPE } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsOptional } from 'class-validator';

export class ProviderShiftFilterDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(SHIFT_TYPE, { each: true })
  @ArrayMinSize(1)
  @Type(() => String)
  shift_type: SHIFT_TYPE[];

  @IsOptional()
  @IsEnum(SHIFT)
  shift: SHIFT;

  @IsOptional()
  @IsEnum(DAY)
  day: DAY;
}
