import { DEFAULT_STATUS } from '@/shared/constants/enum';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  key: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(DEFAULT_STATUS)
  status: DEFAULT_STATUS;

  @IsOptional()
  @IsNumber()
  order: number;

  @IsNotEmpty()
  @IsUUID()
  section: string;
}
