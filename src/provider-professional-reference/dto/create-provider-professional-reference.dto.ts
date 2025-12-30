import { Provider } from '@/provider/entities/provider.entity';
import {
  ProfessionalReferenceStatus,
  SEND_FORM_BY,
} from '@/shared/constants/enum';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProviderProfessionalReferenceDto {
  @IsOptional()
  @IsString()
  employer: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  country_code: string;

  @IsOptional()
  @IsString()
  mobile_no: string;

  @IsOptional()
  @IsString()
  start_date: string;

  @IsOptional()
  @IsString()
  end_date: string;

  @IsOptional()
  @IsString()
  position: string;

  @IsOptional()
  @Type(() => Provider)
  provider: Provider;

  @IsNotEmpty()
  @IsEnum(SEND_FORM_BY)
  send_form_by: SEND_FORM_BY;

  @IsOptional()
  created_at_ip: string;

  @IsOptional()
  updated_at_ip: string;

  @IsOptional()
  @IsEnum(ProfessionalReferenceStatus)
  status: ProfessionalReferenceStatus;

  @IsOptional()
  reason: string;

  @IsOptional()
  reason_description: string;
}
