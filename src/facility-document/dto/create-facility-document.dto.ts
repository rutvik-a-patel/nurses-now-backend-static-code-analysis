import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFacilityDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  facility_document_category: string;

  @IsBoolean()
  @IsNotEmpty()
  is_required: boolean;
}
