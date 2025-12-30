import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleSectionPermissionService } from '@/role-section-permission/role-section-permission.service';
import { SectionService } from '@/section/section.service';
import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';
import {
  FindOneOptions,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Admin } from '@/admin/entities/admin.entity';
import { Activity } from '@/activity/entities/activity.entity';

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: any;
  let roleSectionPermissionRepository: any;
  let roleSectionPermissionService: any;
  let sectionService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([new Role()]),
            })),
          },
        },
        {
          provide: getRepositoryToken(RoleSectionPermission),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: RoleSectionPermissionService,
          useValue: {
            getPermissions: jest.fn(),
          },
        },
        {
          provide: SectionService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    roleSectionPermissionRepository = module.get<
      Repository<RoleSectionPermission>
    >(getRepositoryToken(RoleSectionPermission));
    roleSectionPermissionService = module.get<RoleSectionPermissionService>(
      RoleSectionPermissionService,
    );
    sectionService = module.get<SectionService>(SectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createRoleDto = new CreateRoleDto();
    it('should create new role', async () => {
      roleRepository.save.mockResolvedValue(new Role());
      const result = await service.create(createRoleDto);
      expect(roleRepository.save).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(new Role());
    });
  });

  describe('findOneWhere', () => {
    const options: FindOneOptions<Role> = { where: { id: '1' } };
    it('should get one role detail', async () => {
      roleRepository.findOne.mockResolvedValue(new Role());
      const result = await service.findOneWhere(options);
      expect(roleRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(new Role());
    });
  });

  describe('saveRoleSectionPermission', () => {
    const roleSectionPermission = [new RoleSectionPermission()];
    it('should create new role section permission', async () => {
      roleSectionPermissionRepository.save.mockResolvedValue(
        new RoleSectionPermission(),
      );
      const result = await service.saveRoleSectionPermission(
        roleSectionPermission,
      );
      expect(roleSectionPermissionRepository.save).toHaveBeenCalledWith(
        roleSectionPermission,
      );
      expect(result).toEqual(new RoleSectionPermission());
    });
  });

  describe('updateRolePermissions', () => {
    const where: FindOptionsWhere<RoleSectionPermission> = { id: '1' };
    const data = { has_access: true };
    it('should update role permission', async () => {
      roleSectionPermissionRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.updateRolePermissions(where, data);
      expect(roleSectionPermissionRepository.update).toHaveBeenCalledWith(
        where,
        {
          ...data,
          updated_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('getAllRoles', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([new Role()]),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      roleRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    const queryParams = new QueryParamsDto();
    it('should apply search filter when search parameter is provided', async () => {
      queryParams.search = 'test'; // Setting a search parameter
      const roles = [new Role(), new Role()];
      mockQueryBuilder.getRawMany.mockResolvedValue(roles);

      await service.getAllRoles(queryParams);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `name ILIKE :search`,
        { search: `%${parseSearchKeyword(queryParams.search)}%` },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should remove role', async () => {
      roleRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.remove(id, deleteDto);
      expect(roleRepository.update).toHaveBeenCalledWith(
        { id: id, deleted_at: IsNull() },
        {
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('update', () => {
    const id = '1';
    const updateRoleDto = new UpdateRoleDto();
    it('should update role', async () => {
      roleRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.update(id, updateRoleDto);
      expect(roleRepository.update).toHaveBeenCalledWith(id, {
        ...updateRoleDto,
        updated_at: expect.any(String),
      });
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('prepareSectionData', () => {
    const roleId = '123';

    it('should return an empty array if no sections are found', async () => {
      sectionService.findAll.mockResolvedValue([]);
      const result = await service.prepareSectionData(roleId);
      expect(sectionService.findAll).toHaveBeenCalledWith({
        where: { id: Not(In([])) },
      });
      expect(result).toEqual([]);
    });

    it('should return role section permissions array', async () => {
      const sectionIds = ['1', '2'];
      const mockSections = [{ id: '1' }, { id: '2' }];
      const mockPermissions = [
        {
          id: '1',
          permission: [{ id: '1' }, { id: '2' }],
        },
      ];
      sectionService.findAll.mockResolvedValue(mockSections);
      roleSectionPermissionService.getPermissions.mockResolvedValue(
        mockPermissions,
      );

      const result = await service.prepareSectionData(roleId, sectionIds);

      expect(result).toEqual([
        {
          role: roleId,
          section: '1',
          sub_section: '1',
          permission: '1',
          has_access: false,
        },
        {
          role: roleId,
          section: '1',
          sub_section: '1',
          permission: '2',
          has_access: false,
        },
        {
          role: roleId,
          section: '2',
          sub_section: '1',
          permission: '1',
          has_access: false,
        },
        {
          role: roleId,
          section: '2',
          sub_section: '1',
          permission: '2',
          has_access: false,
        },
      ]);
    });
  });

  describe('duplicateRole', () => {
    const roleId = 'role1';
    it('should duplicate role and its permissions', async () => {
      const mockRole = {
        id: roleId,
        name: 'Admin',
        description: 'Admin role',
        status: 'active',
      };
      const mockNewRole = { ...mockRole, id: 'newRoleId' };
      const mockRoleSectionPermissions = [
        {
          id: 'perm1',
          section: { id: 'section1' },
          sub_section: { id: 'subsection1' },
          permission: { id: 'perm1' },
          has_access: true,
          status: 'active',
        },
      ];

      service.findOneWhere = jest.fn().mockResolvedValue(mockRole);
      service.create = jest.fn().mockResolvedValue(mockNewRole);
      roleSectionPermissionRepository.find.mockResolvedValue(
        mockRoleSectionPermissions,
      );

      await service.duplicateRole(roleId);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: { id: roleId },
        select: { id: true, name: true, description: true, status: true },
      });
      expect(service.create).toHaveBeenCalledWith({
        name: 'Admin',
        description: 'Admin role',
        status: 'active',
      });
      expect(roleSectionPermissionRepository.find).toHaveBeenCalledWith({
        relations: {
          section: true,
          sub_section: true,
          permission: true,
        },
        where: { role: { id: roleId } },
        select: {
          id: true,
          status: true,
          has_access: true,
        },
      });
      expect(roleSectionPermissionRepository.save).toHaveBeenCalledWith([
        {
          role: 'newRoleId',
          section: 'section1',
          sub_section: 'subsection1',
          permission: 'perm1',
          has_access: true,
          status: 'active',
        },
      ]);
    });
  });
});
