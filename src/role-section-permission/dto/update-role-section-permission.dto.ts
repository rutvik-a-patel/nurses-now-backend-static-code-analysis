import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleSectionPermissionDto } from './create-role-section-permission.dto';

export class UpdateRoleSectionPermissionDto extends PartialType(
  CreateRoleSectionPermissionDto,
) {}
