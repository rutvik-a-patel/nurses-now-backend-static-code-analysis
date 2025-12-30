import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateProviderSavedFacilityDto {
  @IsOptional()
  @IsUUID()
  provider?: string;

  @IsNotEmpty()
  @IsUUID()
  facility: string;
}
