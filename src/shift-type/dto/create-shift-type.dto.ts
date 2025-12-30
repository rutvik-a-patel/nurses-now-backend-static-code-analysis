import { DEFAULT_STATUS, SHIFT_TYPE } from '@/shared/constants/enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShiftTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(SHIFT_TYPE)
  shift_type: SHIFT_TYPE;

  @IsOptional()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;
}
