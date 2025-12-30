import { Test, TestingModule } from '@nestjs/testing';
import { RoleSectionPermissionController } from './role-section-permission.controller';
import { RoleSectionPermissionService } from './role-section-permission.service';
import { RoleService } from '@/role/role.service';
import { SectionService } from '@/section/section.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Role } from '@/role/entities/role.entity';
import { Section } from '@/section/entities/section.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { RoleSectionPermission } from './entities/role-section-permission.entity';

describe('RoleSectionPermissionController', () => {
  let controller: RoleSectionPermissionController;
  let roleSectionPermissionService: any;
  let roleService: any;
  let sectionService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleSectionPermissionController],
      providers: [
        {
          provide: RoleSectionPermissionService,
          useValue: {
            getSectionAndPermissionByRoleId: jest.fn(),
            getPermissions: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            findOneWhere: jest.fn(),
          },
        },
        {
          provide: SectionService,
          useValue: {
            findOneWhere: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoleSectionPermissionController>(
      RoleSectionPermissionController,
    );
    roleSectionPermissionService = module.get<RoleSectionPermissionService>(
      RoleSectionPermissionService,
    );
    roleService = module.get<RoleService>(RoleService);
    sectionService = module.get<SectionService>(SectionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRolePermission', () => {
    const id = '1';
    const section_id = '1';
    it('should return bad request if record not found', async () => {
      roleService.findOneWhere.mockResolvedValue(null);

      const result = await controller.getRolePermission(id, section_id);
      expect(roleService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should get permission detail', async () => {
      const mockRole = new Role();
      const mockSection = new Section();
      const mockPermission = [new RoleSectionPermission()];
      roleService.findOneWhere.mockResolvedValue(mockRole);
      sectionService.findOneWhere.mockResolvedValue(mockSection);
      roleSectionPermissionService.getSectionAndPermissionByRoleId.mockResolvedValue(
        mockPermission,
      );

      const result = await controller.getRolePermission(id, section_id);
      expect(roleService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(sectionService.findOneWhere).toHaveBeenCalledWith({
        where: { id: section_id, status: DEFAULT_STATUS.active },
      });
      expect(
        roleSectionPermissionService.getSectionAndPermissionByRoleId,
      ).toHaveBeenCalledWith(id, section_id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Permission'),
          data: { ...mockSection, permissions: mockPermission },
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      roleService.findOneWhere.mockRejectedValue(error);

      const result = await controller.getRolePermission(id, section_id);
      expect(roleService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getSectionPermissions', () => {
    const section_id = '1';
    it('should return section permissions', async () => {
      const mockSection = new Section();
      const mockPermission = [new RoleSectionPermission()];
      sectionService.findOneWhere.mockResolvedValue(mockSection);
      roleSectionPermissionService.getPermissions.mockResolvedValue(
        mockPermission,
      );

      const result = await controller.getSectionPermissions(section_id);
      expect(sectionService.findOneWhere).toHaveBeenCalledWith({
        where: { id: section_id, status: DEFAULT_STATUS.active },
      });
      expect(roleSectionPermissionService.getPermissions).toHaveBeenCalledWith(
        section_id,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Permission'),
          data: { ...mockSection, permissions: mockPermission },
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      sectionService.findOneWhere.mockRejectedValue(error);

      const result = await controller.getSectionPermissions(section_id);
      expect(sectionService.findOneWhere).toHaveBeenCalledWith({
        where: { id: section_id, status: DEFAULT_STATUS.active },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
