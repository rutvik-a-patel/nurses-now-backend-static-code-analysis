import { USER_TYPE } from '@/shared/constants/enum';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class FilterShiftCancelReasonDto extends MultiSelectQueryParamsDto {
  @IsNotEmpty()
  @IsEnum(USER_TYPE)
  user_type: USER_TYPE;
}
