import { PartialType } from '@nestjs/mapped-types';
import { CreateDnrReasonDto } from './create-dnr-reason.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateDnrReasonDto extends PartialType(CreateDnrReasonDto) {
  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
