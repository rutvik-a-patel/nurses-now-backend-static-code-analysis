import { Test, TestingModule } from '@nestjs/testing';
import { AdminDocumentService } from './admin-document.service';
import { AdminDocument } from './entities/admin-document.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateAdminDocumentDto } from './dto/create-admin-document.dto';
import { UpdateAdminDocumentDto } from './dto/update-admin-document.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CATEGORY_TYPES } from '@/shared/constants/enum';
import { Documents } from '@/documents/entities/documents.entity';

describe('AdminDocumentService', () => {
  let service: AdminDocumentService;
  let adminDocumentRepository: any;
  const mockQueryBuilder: any = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(new AdminDocument()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDocumentService,
        {
          provide: getRepositoryToken(AdminDocument),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue(new AdminDocument()),
            })),
          },
        },
        {
          provide: getRepositoryToken(Documents),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminDocumentService>(AdminDocumentService);
    adminDocumentRepository = module.get<Repository<AdminDocument>>(
      getRepositoryToken(AdminDocument),
    );
    adminDocumentRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new category', async () => {
      const createAdminDocumentDto = new CreateAdminDocumentDto();
      const mockCategory = new AdminDocument();
      adminDocumentRepository.save.mockResolvedValue(mockCategory);
      const result = await service.create(createAdminDocumentDto);
      expect(adminDocumentRepository.save).toHaveBeenCalledWith(
        createAdminDocumentDto,
      );
      expect(result).toEqual(mockCategory);
    });
  });

  describe('checkName', () => {
    const name = 'test';
    const category = CATEGORY_TYPES.agency;
    const id = '1';
    it('should check name is exist or not', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new AdminDocument());

      const result = await service.checkName(name, category, id);
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(new AdminDocument());
    });
  });

  describe('findOneWhere', () => {
    it('should find one category by criteria', async () => {
      const options: FindOneOptions<AdminDocument> = { where: { id: '1' } };
      const mockCategory = new AdminDocument();
      adminDocumentRepository.findOne.mockResolvedValue(mockCategory);
      const result = await service.findOneWhere(options);
      expect(adminDocumentRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should find all category', async () => {
      const mockCategory = new AdminDocument();
      mockQueryBuilder.getRawMany.mockResolvedValue([mockCategory]);
      const result = await service.findAll();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('update', () => {
    it('should update category and return the result', async () => {
      const updateAdminDocumentDto = new UpdateAdminDocumentDto();
      const option: FindOptionsWhere<AdminDocument> = { id: '1' };
      const updateResult = { affected: 1 };

      adminDocumentRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(option, updateAdminDocumentDto);
      expect(adminDocumentRepository.update).toHaveBeenCalledWith(
        option,
        updateAdminDocumentDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark a category as deleted', async () => {
      const deleteDto = new DeleteDto();
      const option: FindOptionsWhere<AdminDocument> = { id: '1' };
      adminDocumentRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.remove(option, deleteDto);
      expect(adminDocumentRepository.update).toHaveBeenCalledWith(option, {
        ...deleteDto,
        deleted_at: expect.any(String),
      });
      expect(result).toEqual({ affected: 1 });
    });
  });
});
