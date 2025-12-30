import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RoleSectionPermissionService } from './role-section-permission.service';
import { RoleService } from '@/role/role.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { SectionService } from '@/section/section.service';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';

@Controller('role-section-permission')
export class RoleSectionPermissionController {
  constructor(
    private readonly roleSectionPermissionService: RoleSectionPermissionService,
    private readonly roleService: RoleService,
    private readonly sectionService: SectionService,
  ) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('/:id')
  async getRolePermission(
    @Param('id', UUIDValidationPipe) id: string,
    @Query('section_id') section_id: string,
  ) {
    try {
      const role = await this.roleService.findOneWhere({ where: { id: id } });

      if (!role) {
        return response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      const section = await this.sectionService.findOneWhere({
        where: { id: section_id, status: DEFAULT_STATUS.active },
      });

      const roleSectionPermissions =
        await this.roleSectionPermissionService.getSectionAndPermissionByRoleId(
          id,
          section_id,
        );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Permission'),
        data: { ...section, permissions: roleSectionPermissions },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('section-permission/:id')
  async getSectionPermissions(
    @Param('id', UUIDValidationPipe) section_id: string,
  ) {
    try {
      const section = await this.sectionService.findOneWhere({
        where: { id: section_id, status: DEFAULT_STATUS.active },
      });

      const roleSectionPermissions =
        await this.roleSectionPermissionService.getPermissions(section_id);

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Permission'),
        data: { ...section, permissions: roleSectionPermissions },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
