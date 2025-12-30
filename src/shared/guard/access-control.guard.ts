import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CONSTANT } from '@/shared/constants/message';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { TABLE } from '../constants/enum';
import { FacilityUserPermission } from '@/facility-user/entities/facility-user-permission.entity';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user = request['user'];

    if (user.role === TABLE.admin) {
      // Extract metadata (the required permission for the route)
      const permission = this.reflector.get<string>(
        'permission',
        context.getHandler(),
      );
      const section = this.reflector.get<{
        section: string;
        subsection: string;
      }>('section', context.getClass());

      if (!permission || !section) {
        return true; // No permissions required, allow access
      }

      const roleId = user.role_id;

      // Query to check if the user's role has access
      const hasAccess = await this.dataSource
        .getRepository(RoleSectionPermission)
        .createQueryBuilder('rsp')
        .innerJoin('rsp.sub_section', 'ss')
        .innerJoin('rsp.section', 's')
        .innerJoin('rsp.permission', 'p')
        .where('rsp.role_id = :roleId', { roleId })
        .andWhere('s.name = :section', { section: section.section })
        .andWhere('ss.name = :subsection', {
          subsection: section.subsection,
        })
        .andWhere('p.name IN (:...permission)', {
          permission: [permission],
        })
        .andWhere('rsp.has_access = true')
        .getCount();

      if (hasAccess === 0) {
        throw new ForbiddenException(CONSTANT.ERROR.FORBIDDEN);
      }

      return true;
    }

    if (user.role === TABLE.facility_user) {
      // Implement validation logic if needed
      const facilityContactPermission = this.reflector.get<string[]>(
        'facilityContactPermission',
        context.getHandler(),
      );
      if (
        !facilityContactPermission ||
        facilityContactPermission.length === 0
      ) {
        return true;
      }
      const hasFacilityContactPermission = await this.dataSource
        .getRepository(FacilityUserPermission)
        .createQueryBuilder('fup')
        .innerJoin('fup.facility_permission', 'facility_permission')
        .where(
          'fup.facility_user = :facilityUserId AND fup.has_access = true',
          {
            facilityUserId: user.id,
          },
        )
        .andWhere('facility_permission.name IN (:...permission)', {
          permission: facilityContactPermission,
        })
        .getCount();

      if (hasFacilityContactPermission === 0) {
        throw new ForbiddenException(CONSTANT.ERROR.FORBIDDEN);
      }

      return true;
    }
    return true;
  }
}
