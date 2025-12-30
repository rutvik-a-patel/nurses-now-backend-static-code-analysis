import { ORIENTATION_STATUS } from '@/shared/constants/enum';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProviderOrientationDto {
  @IsNotEmpty()
  @IsUUID()
  facility_id: string;

  @IsOptional()
  @IsUUID()
  provider_id: string;

  @IsOptional()
  @IsString()
  orientation_notes: string;

  @IsOptional()
  @IsString()
  cancel_description: string;

  @IsOptional()
  @IsEnum(ORIENTATION_STATUS)
  status: ORIENTATION_STATUS;
}
