import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CancelShiftDto {
  @IsUUID()
  @IsNotEmpty()
  cancel_reason: string;

  @IsString()
  @IsOptional()
  cancel_reason_description: string;

  @IsUUID()
  @IsOptional()
  cancelled_by_id: string;

  @IsOptional()
  @IsString()
  cancelled_request_from?: string;
}
