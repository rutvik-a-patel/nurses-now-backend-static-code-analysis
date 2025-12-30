import { ENTITY_STATUS } from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsLatitude,
  IsLongitude,
  IsStrongPassword,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Facility } from '../entities/facility.entity';

export class AddFacilityContact {
  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name: string;

  @IsString()
  @IsOptional()
  country_code: string;

  @IsString()
  @IsOptional()
  mobile_no: string;

  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsNotEmpty()
  send_invite: boolean;

  @IsOptional()
  @IsEnum(ENTITY_STATUS)
  status: ENTITY_STATUS;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  permissions: string[];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  facility_id: string[];

  @IsOptional()
  @IsStrongPassword({ minLength: 6 })
  password: string;

  @IsOptional()
  @IsUUID()
  primary_facility: Facility;
}

export class AddFacilityDto {
  @IsUUID()
  @IsOptional()
  master_facility_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  base_url: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsUUID()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  is_master?: boolean;

  @IsString()
  @IsOptional()
  country_code: string;

  @IsString()
  @IsOptional()
  mobile_no: string;

  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  @IsOptional()
  email: string;

  @IsUUID()
  @IsOptional()
  facility_type: string;

  @IsNumber()
  @IsOptional()
  total_beds: number;

  // address
  @IsString()
  @IsOptional()
  house_no: string;

  @IsString()
  @IsOptional()
  street_address: string;

  @IsString()
  @IsOptional()
  zip_code: string;

  @IsString()
  @IsOptional()
  place_id: string;

  @IsLatitude()
  @IsOptional()
  latitude: number;

  @IsLongitude()
  @IsOptional()
  longitude: number;

  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  @IsOptional()
  timezone: string;

  @IsString()
  @IsOptional()
  employee_id: string;

  @IsOptional()
  @IsString()
  first_shift?: string;

  @IsOptional()
  @IsString()
  orientation?: string;

  @IsOptional()
  @IsString()
  shift_description?: string;

  @IsOptional()
  @IsString()
  breaks_instruction?: string;

  @IsOptional()
  @IsString()
  dress_code?: string;

  @IsOptional()
  @IsString()
  parking_instruction?: string;

  @IsOptional()
  @IsString()
  doors_locks?: string;

  @IsOptional()
  @IsString()
  timekeeping?: string;

  @IsOptional()
  @IsString()
  general_notes?: string;

  @IsOptional()
  @IsString()
  staff_note?: string;

  @IsOptional()
  @IsString()
  bill_notes?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsBoolean()
  is_corporate_client?: boolean = false;
}
