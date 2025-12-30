import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, SubSectionPermissionDto } from './dto/create-role.dto';
import { AuthGuard } from '@nestjs/passport';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { RoleSectionPermissionService } from '@/role-section-permission/role-section-permission.service';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { ACTIVITY_TYPE, DEFAULT_STATUS } from '@/shared/constants/enum';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { IRequest } from '@/shared/constants/types';

@Controller('role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly roleSectionPermissionService: RoleSectionPermissionService,
  ) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto, @Req() req: IRequest) {
    try {
      const roleSectionPermissionArr = [];
      const sectionIds = [];

      const role = await this.roleService.create({
        name: createRoleDto.name,
        description: createRoleDto?.description,
      });

      if (createRoleDto?.sections && createRoleDto.sections.length) {
        const { sections } = createRoleDto;

        sections.forEach(({ section_id, sub_sections }) => {
          if (sub_sections.length) {
            sectionIds.push(section_id);

            sub_sections.forEach(({ sub_section_id, permissions }) => {
              permissions.forEach(({ permission_id, has_access }) => {
                roleSectionPermissionArr.push({
                  role: role.id,
                  section: section_id,
                  sub_section: sub_section_id,
                  permission: permission_id,
                  has_access: has_access,
                });
              });
            });
          }
        });

        const sectionData = await this.roleService.prepareSectionData(
          role.id,
          sectionIds,
        );
        roleSectionPermissionArr.push(...sectionData);
      } else {
        const sectionData = await this.roleService.prepareSectionData(
          role.id,
          [],
        );
        roleSectionPermissionArr.push(...sectionData);
      }

      await this.roleService.saveRoleSectionPermission(
        roleSectionPermissionArr,
      );

      // Log the activity
      await this.roleService.roleActivityLog(
        req,
        role.id,
        ACTIVITY_TYPE.ROLE_CREATED,
        {
          [req.user.role]: `${req.user.first_name} ${req.user.last_name}`,
          role: createRoleDto.name,
          description: createRoleDto.description,
        },
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Role'),
        data: role,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async getRole(@Query() queryParamsDto: MultiSelectQueryParamsDto) {
    try {
      const [list, count] = await this.roleService.getAllRoles(queryParamsDto);
      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Role')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Role'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: list,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('single-role/:id')
  async getSingleRole(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const role = await this.roleService.findOneWhere({ where: { id: id } });

      if (!role) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      const permissions =
        await this.roleSectionPermissionService.getSingleRole(id);

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Role'),
        data: {
          ...role,
          permissions: permissions,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('/:id')
  async getRolePermissions(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const data =
        await this.roleSectionPermissionService.getSectionPermissions(id);

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Permission'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete('/:id')
  async remove(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
    @Req() req: IRequest,
  ) {
    try {
      const isInUse = await this.roleService.isRoleInUse(id);
      if (isInUse) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Role'),
          data: {},
        });
      }
      const findRole = await this.roleService.findOneWhere({
        where: { id: id },
      });
      const result = await this.roleService.remove(id, deleteDto);
      // Log the activity
      await this.roleService.roleActivityLog(
        req,
        id,
        ACTIVITY_TYPE.ROLE_DELETED,
        {
          [req.user.role]: `${req.user.first_name} ${req.user.last_name}`,
          role: findRole.name,
        },
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Role')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Role'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('/:id')
  async updateRole(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: IRequest,
  ) {
    try {
      const role = await this.roleService.findOneWhere({
        where: { id },
        relations: {
          role_section_permission: {
            section: true,
            sub_section: true,
            permission: true,
          },
        },
      });

      const { sections } = updateRoleDto;
      if (!role) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Role'),
          data: {},
        });
      }

      // check if role can be deactivated
      if (
        role.status === DEFAULT_STATUS.active &&
        updateRoleDto.status === DEFAULT_STATUS.in_active
      ) {
        const isInUse = await this.roleService.isRoleInUse(id);
        if (isInUse) {
          return response.badRequest({
            message: CONSTANT.ERROR.CANNOT_UPDATE_INUSE_RECORD('Role'),
            data: {},
          });
        }
      }

      delete updateRoleDto.sections;
      await this.roleService.update(id, updateRoleDto);

      // Track which sections and sub-sections were updated
      const updatedSections = new Set<string>();
      const updatedSubSections = new Set<string>();

      if (sections && sections.length) {
        for (const section of sections) {
          const { section_id, sub_sections } = section;

          for (const sub_section of sub_sections) {
            const { sub_section_id, permissions } = sub_section;

            for (const permission of permissions as SubSectionPermissionDto[]) {
              const existing = role.role_section_permission.find(
                (rsp) =>
                  rsp.section.id === section_id &&
                  rsp.sub_section.id === sub_section_id &&
                  rsp.permission.id === permission.permission_id,
              );

              const oldAccess = existing?.has_access ?? null;
              const newAccess = permission.has_access;

              // if permission toggled, track section
              if (oldAccess !== newAccess) {
                updatedSections.add(existing?.section?.name ?? section_id);
                updatedSubSections.add(
                  existing?.sub_section?.name ?? sub_section_id,
                );
              }

              await this.roleService.updateRolePermissions(
                {
                  role: { id: role.id },
                  section: { id: section_id },
                  sub_section: { id: sub_section_id },
                  permission: { id: permission.permission_id },
                },
                { has_access: permission.has_access },
              );
            }
          }
        }
      }

      const updatedData = await this.roleService.findOneWhere({
        where: { id },
      });

      // existing status change log
      await this.roleService.roleActivityUpdateLog(
        req,
        role.id,
        role,
        updatedData,
      );

      if (updatedSections.size > 0) {
        await this.roleService.roleActivityLog(
          req,
          role.id,
          ACTIVITY_TYPE.ROLE_PERMISSION_UPDATED,
          {
            updated_by: req.user.id,
            updated_by_name: req.user.name,
            changes: {
              section: Array.from(updatedSections),
              sub_sections: Array.from(updatedSubSections),
            },
          },
        );
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_UPDATED('Role'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post(':id')
  async duplicateRole(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const data = await this.roleService.duplicateRole(id);
      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Role Cloned'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
