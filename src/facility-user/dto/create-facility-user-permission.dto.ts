import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';
import { FacilityUser } from '../entities/facility-user.entity';
import { FacilityPermission } from '../entities/facility-permission.entity';

export class CreateFacilityUserPermissionDto {
  @IsNotEmpty()
  @IsUUID()
  facility_permission: FacilityPermission;

  @IsNotEmpty()
  @IsUUID()
  facility_user: FacilityUser;

  @IsNotEmpty()
  @IsBoolean()
  has_access: boolean;
}
