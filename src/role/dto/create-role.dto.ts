import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DEFAULT_STATUS } from '@/shared/constants/enum';

export class SubSectionPermissionDto {
  @IsNotEmpty()
  @IsUUID()
  permission_id: string;

  @IsNotEmpty()
  @IsBoolean()
  has_access: boolean;
}

class SectionPermissionDto {
  @IsNotEmpty()
  @IsUUID()
  sub_section_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubSectionPermissionDto)
  permissions: SubSectionPermissionDto[];
}

class RolePermissionDto {
  @IsNotEmpty()
  @IsUUID()
  section_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionPermissionDto)
  sub_sections: SectionPermissionDto[];
}

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionDto)
  sections?: RolePermissionDto[];

  @IsOptional()
  @IsEnum(DEFAULT_STATUS)
  status?: DEFAULT_STATUS;
}
