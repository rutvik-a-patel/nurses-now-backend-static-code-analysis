import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CompleteProfileDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  facility_type: string;

  @IsNotEmpty()
  @IsNumber()
  total_beds: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  base_url?: string;

  @IsOptional()
  @IsString()
  street_address: string;

  @IsOptional()
  @IsString()
  house_no?: string;

  @IsOptional()
  @IsString()
  zip_code: string;

  @IsOptional()
  @IsString()
  place_id: string;

  @IsOptional()
  @IsLatitude()
  latitude: string;

  @IsOptional()
  @IsLongitude()
  longitude: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  city: string;
}
