import { PartialType } from '@nestjs/mapped-types';
import { CreateHolidayGroupDto } from './create-holiday-group.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DEFAULT_STATUS } from '@/shared/constants/enum';

export class UpdateHolidayGroupDto extends PartialType(CreateHolidayGroupDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;
}
