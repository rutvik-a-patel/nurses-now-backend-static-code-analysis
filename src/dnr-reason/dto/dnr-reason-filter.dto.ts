import { DNR_TYPE } from '@/shared/constants/enum';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class DnrReasonFilterDto extends MultiSelectQueryParamsDto {
  @IsOptional()
  @IsEnum(DNR_TYPE)
  reason_type?: DNR_TYPE;
}
