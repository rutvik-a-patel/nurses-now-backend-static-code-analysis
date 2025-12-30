import { Admin } from '@/admin/entities/admin.entity';
import {
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateFacilityNoteDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsUUID()
  @IsOptional()
  created_by_id?: Admin;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  relates_to?: string[];
}
