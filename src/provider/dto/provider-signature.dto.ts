import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProviderSignatureDto {
  @IsNotEmpty()
  @IsString()
  signature_image: string;

  @IsOptional()
  @IsString()
  base_url: string;
}
