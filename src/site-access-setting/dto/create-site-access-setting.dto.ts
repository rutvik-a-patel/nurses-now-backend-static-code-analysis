import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSiteAccessSettingDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  base_url?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  theme_color?: string;

  @IsString()
  @IsOptional()
  created_at_ip?: string;
}
