import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { FindManyOptions, Repository } from 'typeorm';

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: {
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    permissionRepository = module.get<Repository<Permission>>(
      getRepositoryToken(Permission),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const where: FindManyOptions<Permission> = { where: { id: '1' } };
    it('should return permission list', async () => {
      permissionRepository.findAndCount.mockResolvedValue([
        [new Permission()],
        1,
      ]);
      const result = await service.findAll(where);
      expect(permissionRepository.findAndCount).toHaveBeenCalledWith(where);
      expect(result).toEqual([[new Permission()], 1]);
    });
  });
});
