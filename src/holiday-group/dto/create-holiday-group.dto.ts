import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { IsAfterDate } from '@/shared/decorator/is-after-date.decorator';
import { IsBeforeDate } from '@/shared/decorator/is-before-date.decorator';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateHolidayGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsBeforeDate('end_date', true, {
    message: 'start_date must be before end_date',
  })
  start_date: string;

  @IsString()
  @IsNotEmpty()
  @IsAfterDate('start_date', true, {
    message: 'end_date must be after start_date',
  })
  end_date: string;

  @IsString()
  @IsNotEmpty()
  start_time: string;

  @IsString()
  @IsNotEmpty()
  end_time: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;
}
