import { CONSTANT } from '@/shared/constants/message';
import {
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsLowercase,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateReferFacilityDto {
  @IsNotEmpty()
  @IsString()
  facility_name: string;

  @IsNotEmpty()
  @IsString()
  contact_person: string;

  @IsNotEmpty()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  contact_number: string;

  @IsNotEmpty()
  @IsEmail()
  @IsLowercase()
  email: string;

  @IsOptional()
  @IsString()
  extra_details: string;

  @IsOptional()
  @IsString()
  street_address: string;

  @IsOptional()
  @IsString()
  zip_code: string;

  @IsOptional()
  @IsLatitude()
  latitude: string;

  @IsOptional()
  @IsLongitude()
  longitude: string;

  @IsOptional()
  @IsString()
  place_id: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsUUID()
  provider: string;
}
