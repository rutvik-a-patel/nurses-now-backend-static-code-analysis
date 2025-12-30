import { IsBooleanString, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterDropdownDto {
  @IsBooleanString()
  @IsOptional()
  facility: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  certificate: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  speciality: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  status: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  facility_type: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  provider: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  facility_user: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  admin: 'true' | 'false';

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsUUID()
  facility_id: string;

  @IsBooleanString()
  @IsOptional()
  is_corporate_client: 'true' | 'false';
}

export class SearchDropdownDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsBooleanString()
  @IsOptional()
  category: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  document: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  notes: 'true' | 'false';
}

export class SearchUserByTypeDropdownDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsBooleanString()
  @IsOptional()
  admin: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  facility_user: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  provider: 'true' | 'false';

  @IsBooleanString()
  @IsOptional()
  facility: 'true' | 'false';
}
