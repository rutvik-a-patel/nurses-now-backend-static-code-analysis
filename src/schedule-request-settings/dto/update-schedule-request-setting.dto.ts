import { IsOptional, IsString } from 'class-validator';

export class UpdateScheduleRequestSettingDto {
  @IsString()
  @IsOptional()
  value: string;

  @IsString()
  @IsOptional()
  updated_at_ip: string;
}
