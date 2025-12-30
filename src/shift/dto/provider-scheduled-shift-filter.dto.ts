import { SHIFT_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ProviderScheduledShiftFilterDto extends QueryParamsDto {
  @IsOptional()
  @IsString()
  date: string;

  @IsOptional()
  @IsEnum(SHIFT_STATUS)
  status: SHIFT_STATUS;
}
