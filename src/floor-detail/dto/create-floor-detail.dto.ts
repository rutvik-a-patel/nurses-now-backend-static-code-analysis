import { CONSTANT } from '@/shared/constants/message';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateFloorDetailDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  beds: number;

  @IsString()
  @IsOptional()
  po_number: string;

  @IsString()
  @IsOptional()
  cost_center: string;

  @IsOptional()
  @IsMobilePhone(undefined, {}, { message: CONSTANT.VALIDATION.CONTACT_FORMAT })
  phone_number: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsUUID()
  speciality: string;

  @IsOptional()
  @IsUUID()
  default_order_contact: string;

  @IsOptional()
  @IsUUID()
  client_contact: string;

  @IsNotEmpty()
  @IsUUID()
  facility: string;
}
