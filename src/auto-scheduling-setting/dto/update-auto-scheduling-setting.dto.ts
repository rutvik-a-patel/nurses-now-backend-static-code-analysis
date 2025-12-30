import { IsNumber, IsOptional, Max } from 'class-validator';

export class UpdateAutoSchedulingSettingDto {
  @IsNumber()
  @IsOptional()
  @Max(250, { message: 'Radius must be 250 or less' })
  provider_radius?: number;

  @IsNumber()
  @IsOptional()
  running_late_ai_time?: number;

  @IsNumber()
  @IsOptional()
  check_distance_time?: number;

  @IsNumber()
  @IsOptional()
  facility_cancel_time?: number;

  @IsNumber()
  @IsOptional()
  cancel_request_expiry?: number;

  @IsNumber()
  @IsOptional()
  running_late_request_expiry?: number;

  @IsNumber()
  @IsOptional()
  send_another_request?: number;

  @IsNumber()
  @IsOptional()
  post_shift_to_open: number;

  @IsNumber()
  @IsOptional()
  bulk_scheduling_duration: number;
}
