import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from './department.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { DepartmentDto } from './dto/create-department.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let departmentRepository: any;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: getRepositoryToken(Department),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
    departmentRepository = module.get<Repository<Department>>(
      getRepositoryToken(Department),
    );
    departmentRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDepartmentDto = [new DepartmentDto()];
    it('should create new department', async () => {
      departmentRepository.save.mockResolvedValue([new Department()]);

      const result = await service.create(createDepartmentDto);
      expect(departmentRepository.save).toHaveBeenCalledWith(
        createDepartmentDto,
      );
      expect(result).toEqual([new Department()]);
    });
  });

  describe('remove', () => {
    const where: FindOptionsWhere<Department> = { id: '1' };
    const deleteDto = new DeleteDto();
    it('should create new department', async () => {
      departmentRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.remove(where, deleteDto);
      expect(departmentRepository.update).toHaveBeenCalledWith(
        { ...where, deleted_at: IsNull() },
        {
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('findAll', () => {
    const id = '1';
    it('should return department list', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([new Department()]);

      const result = await service.findAll(id);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toEqual([new Department()]);
    });
  });
});
