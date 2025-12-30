import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLineOfBusinessDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  work_comp_code: string;

  @IsEnum(DEFAULT_STATUS)
  @IsString()
  @IsNotEmpty()
  status: DEFAULT_STATUS;

  @IsString()
  @IsOptional()
  created_at_ip?: string;

  @IsString()
  @IsOptional()
  updated_at_ip?: string;
}
