import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class SubmitReportDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  time_sheets?: any;

  @IsString()
  @IsOptional()
  base_url?: string;

  @IsString()
  @IsOptional()
  provider_signature?: string;

  @IsOptional()
  updated_at_ip?: string;
}
