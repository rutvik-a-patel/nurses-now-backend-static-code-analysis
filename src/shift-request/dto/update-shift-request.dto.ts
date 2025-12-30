import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftRequestDto } from './create-shift-request.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SHIFT_REQUEST_STATUS } from '@/shared/constants/enum';

export class UpdateShiftRequestDto extends PartialType(CreateShiftRequestDto) {
  @IsOptional()
  @IsString()
  @IsEnum(SHIFT_REQUEST_STATUS)
  status: SHIFT_REQUEST_STATUS;
}
