import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleSectionPermissionService } from '@/role-section-permission/role-section-permission.service';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { SubSectionPermissionDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IRequest } from '@/shared/constants/types';
import { Role } from './entities/role.entity';
import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';
import { Section } from '@/section/entities/section.entity';
import { SubSection } from '@/sub-section/entities/sub-section.entity';
import { Permission } from '@/permission/entities/permission.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: any;
  let roleSectionPermissionService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: {
            create: jest.fn(),
            prepareSectionData: jest.fn(),
            saveRoleSectionPermission: jest.fn(),
            getAllRoles: jest.fn(),
            findOneWhere: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
            updateRolePermissions: jest.fn(),
            duplicateRole: jest.fn(),
            isRoleInUse: jest.fn(),
            roleActivityLog: jest.fn(),
            roleActivityUpdateLog: jest.fn(),
          },
        },
        {
          provide: RoleSectionPermissionService,
          useValue: {
            getSingleRole: jest.fn(),
            getSectionPermissions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    roleService = module.get<RoleService>(RoleService);
    roleSectionPermissionService = module.get<RoleSectionPermissionService>(
      RoleSectionPermissionService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRole', () => {
    const req = {
      user: {
        id: 'user-id',
        role: 'admin',
        first_name: 'John',
        last_name: 'Doe',
      },
    } as IRequest;

    it('should create a role and return success response', async () => {
      const roleDto = {
        name: 'Admin',
        description: 'Admin role',
        sections: [],
      };
      const role = { id: '1', name: 'Admin' };
      const sectionData = [];

      roleService.create.mockResolvedValue(role);
      roleService.prepareSectionData.mockResolvedValue(sectionData);
      roleService.saveRoleSectionPermission.mockResolvedValue(null);
      roleService.roleActivityLog.mockResolvedValue(null);

      const result = await controller.createRole(roleDto, req);

      expect(roleService.create).toHaveBeenCalledWith({
        name: roleDto.name,
        description: roleDto.description,
      });
      expect(roleService.prepareSectionData).toHaveBeenCalledWith(role.id, []);
      expect(roleService.saveRoleSectionPermission).toHaveBeenCalledWith(
        sectionData,
      );
      expect(roleService.roleActivityLog).toHaveBeenCalled();
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Role'),
          data: role,
        }),
      );
    });

    it('should handle sections and create role section permissions', async () => {
      const roleDto = {
        name: 'Admin',
        description: 'Admin role',
        sections: [
          {
            section_id: 'section1',
            sub_sections: [
              {
                sub_section_id: 'subsection1',
                permissions: [
                  { permission_id: 'permission1', has_access: true },
                ],
              },
            ],
          },
        ],
      };

      const role = { id: '1', name: 'Admin' };
      const sectionData = [{ role: '1', section: 'section2' }];

      roleService.create.mockResolvedValue(role);
      roleService.prepareSectionData.mockResolvedValue(sectionData);
      roleService.saveRoleSectionPermission.mockResolvedValue(null);
      roleService.roleActivityLog.mockResolvedValue(null);

      const result = await controller.createRole(roleDto, req);

      expect(roleService.create).toHaveBeenCalledWith({
        name: roleDto.name,
        description: roleDto.description,
      });

      expect(roleService.prepareSectionData).toHaveBeenCalledWith(role.id, [
        'section1',
      ]);

      expect(roleService.saveRoleSectionPermission).toHaveBeenCalledWith([
        {
          role: role.id,
          section: 'section1',
          sub_section: 'subsection1',
          permission: 'permission1',
          has_access: true,
        },
        ...sectionData,
      ]);

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Role'),
          data: role,
        }),
      );
    });

    it('should return failure response on error', async () => {
      const roleDto = {
        name: 'Admin',
        description: 'Admin role',
        sections: [],
      };
      const error = new Error('Something went wrong');

      roleService.create.mockRejectedValue(error);

      const result = await controller.createRole(roleDto, req);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getRole', () => {
    it('should return a list of roles with pagination', async () => {
      const queryParamsDto = new QueryParamsDto();
      const roles = [{ id: '1', name: 'Admin' }];
      const count = 1;

      roleService.getAllRoles.mockResolvedValue([roles, count]);

      const result = await controller.getRole(queryParamsDto);

      expect(roleService.getAllRoles).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Role'),
          total: count,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: roles,
        }),
      );
    });

    it('should return a not found response if no roles are found', async () => {
      const queryParamsDto = new QueryParamsDto();
      const roles = [];
      const count = 0;

      roleService.getAllRoles.mockResolvedValue([roles, count]);

      const result = await controller.getRole(queryParamsDto);

      expect(roleService.getAllRoles).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Role'),
          total: count,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: roles,
        }),
      );
    });

    it('should return failure response on error', async () => {
      const queryParamsDto = new QueryParamsDto();
      const error = new Error('Something went wrong');

      roleService.getAllRoles.mockRejectedValue(error);

      const result = await controller.getRole(queryParamsDto);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getSingleRole', () => {
    it('should return a single role with permissions', async () => {
      const roleId = '1';
      const role = { id: roleId, name: 'Admin' };
      const permissions = [{ section: 'Dashboard', has_access: true }];

      roleService.findOneWhere.mockResolvedValue(role);
      roleSectionPermissionService.getSingleRole.mockResolvedValue(permissions);

      const result = await controller.getSingleRole(roleId);

      expect(roleService.findOneWhere).toHaveBeenCalledWith({
        where: { id: roleId },
      });
      expect(roleSectionPermissionService.getSingleRole).toHaveBeenCalledWith(
        roleId,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Role'),
          data: {
            ...role,
            permissions: permissions,
          },
        }),
      );
    });

    it('should return bad request if role not found', async () => {
      const roleId = '1';

      roleService.findOneWhere.mockResolvedValue(null);

      const result = await controller.getSingleRole(roleId);

      expect(roleService.findOneWhere).toHaveBeenCalledWith({
        where: { id: roleId },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return failure response on error', async () => {
      const roleId = '1';
      const error = new Error('Something went wrong');

      roleService.findOneWhere.mockRejectedValue(error);

      const result = await controller.getSingleRole(roleId);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getRolePermissions', () => {
    it('should return role permissions', async () => {
      const roleId = '1';
      const permissions = [{ section: 'Dashboard', has_access: true }];

      roleSectionPermissionService.getSectionPermissions.mockResolvedValue(
        permissions,
      );

      const result = await controller.getRolePermissions(roleId);

      expect(
        roleSectionPermissionService.getSectionPermissions,
      ).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Permission'),
          data: permissions,
        }),
      );
    });

    it('should return failure response on error', async () => {
      const roleId = '1';
      const error = new Error('Something went wrong');

      roleSectionPermissionService.getSectionPermissions.mockRejectedValue(
        error,
      );

      const result = await controller.getRolePermissions(roleId);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const req = {
      user: {
        id: 'user-id',
        role: 'admin',
        first_name: 'John',
        last_name: 'Doe',
      },
    } as IRequest;

    it('should delete a role and return success response', async () => {
      const roleId = '1';
      const deleteDto = new DeleteDto();
      const result = { affected: 1 };
      const findRole = { id: roleId, name: 'Admin' };

      roleService.isRoleInUse.mockResolvedValue(false);
      roleService.findOneWhere.mockResolvedValue(findRole);
      roleService.remove.mockResolvedValue(result);
      roleService.roleActivityLog.mockResolvedValue(null);

      const responseResult = await controller.remove(roleId, deleteDto, req);

      expect(roleService.isRoleInUse).toHaveBeenCalledWith(roleId);
      expect(roleService.findOneWhere).toHaveBeenCalledWith({
        where: { id: roleId },
      }); // ADD THIS
      expect(roleService.remove).toHaveBeenCalledWith(roleId, deleteDto);
      expect(roleService.roleActivityLog).toHaveBeenCalled();
      expect(responseResult).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Role'),
          data: {},
        }),
      );
    });

    it('should return not found response if no role was deleted', async () => {
      const roleId = '1';
      const deleteDto = new DeleteDto();
      const result = { affected: 0 };
      const findRole = { id: roleId, name: 'Admin' };

      roleService.isRoleInUse.mockResolvedValue(false);
      roleService.findOneWhere.mockResolvedValue(findRole);
      roleService.remove.mockResolvedValue(result);
      roleService.roleActivityLog.mockResolvedValue(null);

      const responseResult = await controller.remove(roleId, deleteDto, req);

      expect(roleService.isRoleInUse).toHaveBeenCalledWith(roleId);
      expect(roleService.remove).toHaveBeenCalledWith(roleId, deleteDto);
      expect(responseResult).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Role'),
          data: {},
        }),
      );
    });

    it('should return bad request if role is in use', async () => {
      const roleId = '1';
      const deleteDto = new DeleteDto();

      roleService.isRoleInUse.mockResolvedValue(true);

      const responseResult = await controller.remove(roleId, deleteDto, req);

      expect(roleService.isRoleInUse).toHaveBeenCalledWith(roleId);
      expect(roleService.remove).not.toHaveBeenCalled();
      expect(responseResult).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Role'),
          data: {},
        }),
      );
    });

    it('should return failure response on error', async () => {
      const roleId = '1';
      const deleteDto = new DeleteDto();
      const error = new Error('Something went wrong');

      roleService.isRoleInUse.mockRejectedValue(error);

      const responseResult = await controller.remove(roleId, deleteDto, req);

      expect(responseResult).toEqual(response.failureResponse(error));
    });
  });

  describe('updateRole', () => {
    const req = {
      user: {
        id: 'user-id',
        role: 'admin',
        first_name: 'John',
        last_name: 'Doe',
        name: 'John Doe',
      },
    } as IRequest;
    const id = '1';
    const updateRoleDto = new UpdateRoleDto();
    updateRoleDto.sections = [
      {
        section_id: 'section1',
        sub_sections: [
          {
            sub_section_id: 'sub1',
            permissions: [
              {
                permission_id: 'perm1',
                has_access: true,
              } as SubSectionPermissionDto,
            ],
          },
        ],
      },
    ];

    it('should return bad request if role not found', async () => {
      roleService.findOneWhere.mockResolvedValue(null);

      const result = await controller.updateRole(id, updateRoleDto, req);

      expect(roleService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          role_section_permission: {
            permission: true,
            section: true,
            sub_section: true,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Role'),
          data: {},
        }),
      );
    });

    it('should update the role and return success response', async () => {
      const mockRole = new Role();
      mockRole.id = id;
      mockRole.status = DEFAULT_STATUS.active;
      mockRole.role_section_permission = [new RoleSectionPermission()];

      const mockSection = new Section();
      mockSection.id = 'section1';
      mockSection.name = 'Section 1';

      const mockSubSection = new SubSection();
      mockSubSection.id = 'sub1';
      mockSubSection.name = 'Sub Section 1';

      const mockPermission = new Permission();
      mockPermission.id = 'perm1';

      mockRole.role_section_permission[0].section = mockSection;
      mockRole.role_section_permission[0].sub_section = mockSubSection;
      mockRole.role_section_permission[0].permission = mockPermission;
      mockRole.role_section_permission[0].has_access = false;

      const updatedRole = { ...mockRole };

      // First call returns role with permissions, second call returns updated role
      roleService.findOneWhere
        .mockResolvedValueOnce(mockRole)
        .mockResolvedValueOnce(updatedRole);
      roleService.update.mockResolvedValue({ id });
      roleService.updateRolePermissions.mockResolvedValue({ affected: 1 });
      roleService.roleActivityUpdateLog.mockResolvedValue(null);
      roleService.roleActivityLog.mockResolvedValue(null);

      const result = await controller.updateRole(id, updateRoleDto, req);

      expect(roleService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          role_section_permission: {
            section: true,
            sub_section: true,
            permission: true,
          },
        },
      });
      expect(roleService.update).toHaveBeenCalledWith(id, {
        sections: undefined,
      });

      expect(roleService.updateRolePermissions).toHaveBeenCalledWith(
        {
          role: { id },
          section: { id: 'section1' },
          sub_section: { id: 'sub1' },
          permission: { id: 'perm1' },
        },
        { has_access: true },
      );

      expect(roleService.roleActivityUpdateLog).toHaveBeenCalled();
      expect(roleService.roleActivityLog).toHaveBeenCalled();

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Role'),
          data: {},
        }),
      );
    });

    it('should return failure response on error', async () => {
      const error = new Error('Something went wrong');

      roleService.findOneWhere.mockRejectedValue(error);

      const responseResult = await controller.updateRole(
        id,
        updateRoleDto,
        req,
      );

      expect(responseResult).toEqual(response.failureResponse(error));
    });
  });

  describe('duplicateRole', () => {
    const id = '1';

    it('should duplicate the role and return success response', async () => {
      const duplicatedRole = { id: '2', name: 'Cloned Role' };
      roleService.duplicateRole.mockResolvedValue(duplicatedRole);

      const result = await controller.duplicateRole(id);

      expect(roleService.duplicateRole).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Role Cloned'),
          data: duplicatedRole,
        }),
      );
    });

    it('should return failure response in case of error', async () => {
      const error = new Error('Some error');
      roleService.duplicateRole.mockRejectedValue(error);

      const result = await controller.duplicateRole(id);

      expect(roleService.duplicateRole).toHaveBeenCalledWith(id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
