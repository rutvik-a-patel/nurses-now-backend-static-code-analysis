import { PartialType } from '@nestjs/mapped-types';
import { CreateFacilityUserDto } from './create-facility-user.dto';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class UpdateFacilityUserDto extends PartialType(CreateFacilityUserDto) {
  @IsOptional()
  @IsNumber()
  login_attempt?: number;

  @IsOptional()
  @IsDateString()
  login_attempt_at?: string;
}
