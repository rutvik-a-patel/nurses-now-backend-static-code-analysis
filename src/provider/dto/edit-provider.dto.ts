import { MARITAL_STATUS } from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsLowercase,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  ValidateNested,
} from 'class-validator';

class AddressDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

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
  country: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state: string;
}

export class EditProviderDto {
  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  nick_name: string;

  @IsOptional()
  @IsString()
  middle_name: string;

  @IsOptional()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  email: string;

  @IsOptional()
  @IsString()
  country_code: string;

  @IsOptional()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  mobile_no: string;

  @IsOptional()
  @IsString()
  emergency_mobile_country_code: string;

  @IsOptional()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  emergency_mobile_no: string;

  @IsOptional()
  @IsString()
  emergency_contact_name: string;

  @IsOptional()
  @IsString()
  relation_with: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsDateString()
  birth_date: Date;

  @IsOptional()
  @IsString()
  base_url?: string;

  @IsOptional()
  @IsString()
  profile_image: string;

  @IsOptional()
  @IsString()
  profession: string;

  @IsOptional()
  @IsString()
  referred_by: string;

  @IsOptional()
  @IsString()
  ssn: string;

  @IsOptional()
  @IsString()
  citizenship: string;

  @IsOptional()
  @IsBoolean()
  veteran_status: boolean;

  @IsOptional()
  @IsString()
  race: string;

  @IsOptional()
  @IsDateString()
  first_contact_date: Date;

  @IsOptional()
  @IsDateString()
  hire_date: Date;

  @IsOptional()
  @IsDateString()
  rehire_date: Date;

  @IsOptional()
  @IsDateString()
  first_work_date: Date;

  @IsOptional()
  @IsDateString()
  last_work_date: Date;

  @IsOptional()
  @IsDateString()
  last_paid_date: Date;

  @IsOptional()
  @IsDateString()
  termination_date: Date;

  @IsOptional()
  @IsString()
  work_comp_code: string;

  @IsOptional()
  @IsString()
  hourly_burden: string;

  @IsOptional()
  @IsDateString()
  employed_at: Date;

  @IsOptional()
  @IsString()
  employee_id: string;

  @IsOptional()
  @IsBoolean()
  is_deceased: boolean;

  @IsOptional()
  @IsDateString()
  deceased_date: Date;

  @IsOptional()
  @IsEnum(MARITAL_STATUS)
  marital_status: MARITAL_STATUS;

  @IsOptional()
  @IsNumber()
  @Max(250, { message: 'Radius must be 250 or less' })
  radius: number;

  @IsOptional()
  @IsString()
  signature_image: string;

  @IsOptional()
  @IsNumber()
  points: number;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsBoolean()
  is_terminated: boolean;

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

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @IsBoolean()
  notify_me: boolean;

  @IsOptional()
  @IsNumber()
  test_attempts?: number;
}
