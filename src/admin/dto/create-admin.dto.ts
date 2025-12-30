import { Role } from '@/role/entities/role.entity';
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
  IsUUID,
} from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsLowercase()
  @IsEmail({}, { message: CONSTANT.ERROR.INVALID_EMAIL })
  email: string;

  @IsNotEmpty()
  @IsString()
  country_code: string;

  @IsNotEmpty()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  mobile_no: string;

  @IsOptional()
  @IsString()
  base_url?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty()
  @IsUUID()
  role: Role;

  @IsNotEmpty()
  @IsEnum(ENTITY_STATUS)
  status: ENTITY_STATUS;

  @IsOptional()
  @IsString()
  created_at_ip?: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;
}
