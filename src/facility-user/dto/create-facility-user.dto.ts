import { Facility } from '@/facility/entities/facility.entity';
import { ENTITY_STATUS } from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import {
  IsEmail,
  IsEnum,
  IsLowercase,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
} from 'class-validator';

export class CreateFacilityUserDto {
  @IsNotEmpty()
  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  email: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsStrongPassword({ minLength: 6 })
  password: string;

  @IsNotEmpty()
  country_code: string;

  @IsNotEmpty()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  mobile_no: string;

  @IsOptional()
  is_email_verified?: boolean;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  facility_id?: string[];

  @IsOptional()
  @IsUUID()
  primary_facility?: Facility;

  @IsNotEmpty()
  @IsUUID(undefined, { each: true })
  permissions: string[];

  @IsOptional()
  @IsEnum(ENTITY_STATUS)
  status?: ENTITY_STATUS;

  @IsOptional()
  created_at_ip?: string;

  @IsOptional()
  updated_at_ip?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
