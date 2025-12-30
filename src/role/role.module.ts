import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';
import { RoleSectionPermissionService } from '@/role-section-permission/role-section-permission.service';
import { Section } from '@/section/entities/section.entity';
import { SectionService } from '@/section/section.service';
import { Admin } from '@/admin/entities/admin.entity';
import { Activity } from '@/activity/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      RoleSectionPermission,
      Section,
      Admin,
      Activity,
    ]),
  ],
  controllers: [RoleController],
  providers: [RoleService, RoleSectionPermissionService, SectionService],
})
export class RoleModule {}
