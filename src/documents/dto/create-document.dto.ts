import { AdminDocument } from '@/admin-document/entities/admin-document.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { DEFAULT_STATUS, TABLE } from '@/shared/constants/enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  base_url?: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  original_filename?: string;

  @IsOptional()
  @IsString()
  document_notes?: string;

  @IsOptional()
  @IsString()
  uploaded_by_id?: string;

  @IsOptional()
  @IsEnum(TABLE)
  uploaded_by_type?: TABLE;

  @IsOptional()
  @IsString()
  admin_document_category?: AdminDocument;

  @IsOptional()
  @IsString()
  provider?: Provider;

  @IsOptional()
  @IsString()
  facility?: Facility;

  @IsOptional()
  @IsEnum(DEFAULT_STATUS)
  status?: DEFAULT_STATUS;

  @IsOptional()
  @IsString()
  uploaded_at?: Date;
}
