import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export class InitialShiftDto {
  @IsLatitude()
  @IsOptional()
  latitude: string;

  @IsLongitude()
  @IsOptional()
  longitude: string;

  @IsString()
  @IsOptional()
  radius: string;
}
