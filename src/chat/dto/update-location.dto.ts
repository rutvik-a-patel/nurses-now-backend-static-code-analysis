import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateLocationDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  shiftId: string;

  @IsOptional()
  @IsString()
  worked_time: string;

  @IsOptional()
  @IsLatitude()
  latitude: number;

  @IsOptional()
  @IsLongitude()
  longitude: number;
}
