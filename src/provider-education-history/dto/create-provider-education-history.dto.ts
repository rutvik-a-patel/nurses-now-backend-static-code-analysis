import { Provider } from '@/provider/entities/provider.entity';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CreateProviderEducationHistoryDto {
  @IsOptional()
  @IsString()
  school: string;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  course: string;

  @IsOptional()
  @IsString()
  degree: string;

  @IsOptional()
  @IsString()
  graduation_date: string;

  @IsOptional()
  @Type(() => Provider)
  provider: Provider;

  @IsOptional()
  created_at_ip: string;

  @IsOptional()
  updated_at_ip: string;
}
