import { ReferenceFormDesign } from '@/reference-form-design/entities/reference-form-design.entity';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsEmail,
} from 'class-validator';

const trimToNull = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};
export class CreateProfessionalReferenceResponseDto {
  @IsOptional()
  @IsUUID()
  reference_form_design?: ReferenceFormDesign;

  @IsNotEmpty()
  @IsString()
  answer: string;

  @IsString()
  @IsOptional()
  created_at_ip?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}

export class ReferencePersonDto {
  @IsOptional()
  @IsString()
  @Transform(trimToNull)
  employers: string | null;

  @IsOptional()
  @IsString()
  @Transform(trimToNull)
  name: string | null;

  @IsOptional()
  @IsString()
  @Transform(trimToNull)
  title: string | null;

  @IsOptional()
  @IsEmail()
  @Transform(trimToNull)
  email: string | null;

  @IsOptional()
  @IsString()
  @Transform(trimToNull)
  country_code: string | null;

  @IsOptional()
  @IsString()
  @Transform(trimToNull)
  mobile_no: string | null;
}

export class ProfessionalReferenceSubmissionDto {
  @ValidateNested({ each: true })
  @Type(() => CreateProfessionalReferenceResponseDto)
  @IsArray()
  responses: CreateProfessionalReferenceResponseDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ReferencePersonDto)
  reference_person: ReferencePersonDto;
}
