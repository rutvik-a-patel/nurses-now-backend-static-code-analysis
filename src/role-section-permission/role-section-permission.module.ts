import { Module } from '@nestjs/common';
import { RoleSectionPermissionService } from './role-section-permission.service';
import { RoleSectionPermissionController } from './role-section-permission.controller';
import { RoleService } from '@/role/role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSectionPermission } from './entities/role-section-permission.entity';
import { Role } from '@/role/entities/role.entity';
import { SectionService } from '@/section/section.service';
import { Section } from '@/section/entities/section.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Activity } from '@/activity/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleSectionPermission,
      Role,
      Section,
      Admin,
      Activity,
    ]),
  ],
  controllers: [RoleSectionPermissionController],
  providers: [RoleSectionPermissionService, RoleService, SectionService],
})
export class RoleSectionPermissionModule {}
