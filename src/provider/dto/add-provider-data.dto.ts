import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  ValidateNested,
} from 'class-validator';

class AddressDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  zip_code: string;

  @IsOptional()
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  apartment: string;

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
  city: string;

  @IsOptional()
  @IsString()
  state: string;
}

export class AddProviderDataDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  middle_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  referred_by: string;

  @IsOptional()
  @IsString()
  profession: string;

  @IsOptional()
  @IsUUID()
  certificate: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  additional_certification: string[];

  @IsOptional()
  @IsUUID()
  speciality: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  additional_speciality: string[];

  @IsOptional()
  @IsLatitude()
  latitude: string;

  @IsOptional()
  @IsLongitude()
  longitude: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  shift_preference: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  preferred_state: string[];

  @IsNotEmpty()
  @IsNumber()
  @Max(250, { message: 'Radius must be 250 or less' })
  radius: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  shift_time: string[];
}
