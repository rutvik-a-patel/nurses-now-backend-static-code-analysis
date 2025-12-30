import { OrientationAction } from '@/shared/constants/enum';
import { IsNotEmpty, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class OrientationQueryDto {
  @IsNotEmpty()
  @IsEnum(OrientationAction)
  action: OrientationAction;

  @IsNotEmpty()
  @IsUUID()
  facility_id: string;

  @IsNotEmpty()
  @IsUUID()
  provider_id: string;

  @IsOptional()
  @IsUUID()
  shift_id?: string;

  @IsOptional()
  @IsUUID()
  reason_id?: string;
}

export class OrientationPacketDto {
  @IsOptional()
  facility_id?: string;

  @IsOptional()
  provider_id?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  base_url: string;

  @IsNotEmpty()
  filename: string;

  @IsNotEmpty()
  original_filename: string;
}

export class NewRequestOrientationDto {
  @IsOptional()
  facility_id?: string;

  @IsOptional()
  is_read?: boolean;
}
