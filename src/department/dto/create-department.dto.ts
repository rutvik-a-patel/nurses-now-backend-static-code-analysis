import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class DepartmentDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  base_url?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  members: string[];

  @IsOptional()
  @IsString()
  created_at_ip?: string;
}

export class CreateDepartmentDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  delete_department: string[];

  @IsNotEmpty()
  @IsArray()
  @Type(() => DepartmentDto)
  @ValidateNested({ each: true })
  departments: DepartmentDto[];

  @IsOptional()
  @IsString()
  created_at_ip?: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;
}
