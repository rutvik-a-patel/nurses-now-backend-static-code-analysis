import { Test, TestingModule } from '@nestjs/testing';
import { RoleSectionPermissionService } from './role-section-permission.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleSectionPermission } from './entities/role-section-permission.entity';
import { Section } from '@/section/entities/section.entity';
import { FindManyOptions, Repository } from 'typeorm';

describe('RoleSectionPermissionService', () => {
  let service: RoleSectionPermissionService;
  let roleSectionPermissionRepository: any;
  let sectionRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleSectionPermissionService,
        {
          provide: getRepositoryToken(RoleSectionPermission),
          useValue: {
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest
                .fn()
                .mockResolvedValue([new RoleSectionPermission()]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Section),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([new Section()]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<RoleSectionPermissionService>(
      RoleSectionPermissionService,
    );
    roleSectionPermissionRepository = module.get<
      Repository<RoleSectionPermission>
    >(getRepositoryToken(RoleSectionPermission));
    sectionRepository = module.get<Repository<Section>>(
      getRepositoryToken(Section),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const where: FindManyOptions<RoleSectionPermission> = {
      where: { id: '1' },
    };
    it('should return role permission list', async () => {
      roleSectionPermissionRepository.findAndCount.mockResolvedValue([
        [new RoleSectionPermission()],
        1,
      ]);
      const result = await service.findAll(where);
      expect(roleSectionPermissionRepository.findAndCount).toHaveBeenCalledWith(
        where,
      );
      expect(result).toEqual([[new RoleSectionPermission()], 1]);
    });
  });

  describe('getSectionAndPermissionByRoleId', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      roleSectionPermissionRepository.createQueryBuilder = jest.fn(
        () => mockQueryBuilder,
      );
    });

    it('should return all permission', async () => {
      const mockPermission = [
        new RoleSectionPermission(),
        new RoleSectionPermission(),
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockPermission);

      const result = await service.getSectionAndPermissionByRoleId(
        '1',
        'section_id',
      );

      expect(result).toEqual(mockPermission);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });

  describe('getSectionPermissions', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      sectionRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });

    it('should return all section', async () => {
      const mockSection = [new Section(), new Section()];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockSection);

      const result = await service.getSectionPermissions('1');

      expect(result).toEqual(mockSection);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });

  describe('getPermissions', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      roleSectionPermissionRepository.createQueryBuilder = jest.fn(
        () => mockQueryBuilder,
      );
    });

    it('should return all permission', async () => {
      const mockPermission = [
        new RoleSectionPermission(),
        new RoleSectionPermission(),
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockPermission);

      const result = await service.getPermissions('section_id');

      expect(result).toEqual(mockPermission);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });

  describe('getSingleRole', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      sectionRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });

    it('should return all section', async () => {
      const mockSection = [new Section(), new Section()];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockSection);

      const result = await service.getSingleRole('1');

      expect(result).toEqual(mockSection);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });
});
