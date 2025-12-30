import { CATEGORY_TYPES, DEFAULT_STATUS } from '@/shared/constants/enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsNotEmpty()
  @IsEnum(CATEGORY_TYPES)
  category: CATEGORY_TYPES;

  @IsNotEmpty()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;
}
