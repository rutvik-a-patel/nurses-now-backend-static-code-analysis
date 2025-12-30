import { Test, TestingModule } from '@nestjs/testing';
import { FacilityDocumentService } from './facility-document.service';
import { FacilityDocument } from './entities/facility-document.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacilityDocumentCategory } from './entities/facility-document-category.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CreateFacilityDocumentCategoryDto } from './dto/create-facility-document-category.dto';
import { CreateFacilityDocumentDto } from './dto/create-facility-document.dto';
import { UpdateFacilityDocumentCategoryDto } from './dto/update-facility-document-category.dto';
import { UpdateFacilityDocumentDto } from './dto/update-facility-document.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { plainToInstance } from 'class-transformer';

describe('FacilityDocumentService', () => {
  let service: FacilityDocumentService;
  let facilityDocument: any;
  let facilityDocumentCategory: any;
  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilityDocumentService,
        {
          provide: getRepositoryToken(FacilityDocument),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue(new FacilityDocument()),
            })),
          },
        },
        {
          provide: getRepositoryToken(FacilityDocumentCategory),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getRawOne: jest
                .fn()
                .mockResolvedValue(new FacilityDocumentCategory()),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<FacilityDocumentService>(FacilityDocumentService);
    facilityDocument = module.get<Repository<FacilityDocument>>(
      getRepositoryToken(FacilityDocument),
    );
    facilityDocumentCategory = module.get<Repository<FacilityDocumentCategory>>(
      getRepositoryToken(FacilityDocumentCategory),
    );
    facilityDocument.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    facilityDocumentCategory.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkCategoryName', () => {
    it('should return category data if name exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new FacilityDocumentCategory());
      const result = await service.checkCategoryName('test');
      expect(result).toEqual(new FacilityDocumentCategory());
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(f.name) = LOWER(:name)',
        {
          name: 'test',
        },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('checkName', () => {
    it('should return document data if name exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new FacilityDocument());
      const result = await service.checkName('test', 'category');
      expect(result).toEqual(new FacilityDocument());
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(f.name) = LOWER(:name)',
        {
          name: 'test',
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'f.facility_document_category = :category',
        { category: 'category' },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    const createFacilityDocumentCategoryDto =
      new CreateFacilityDocumentCategoryDto();
    it('should create new category', async () => {
      facilityDocumentCategory.save.mockResolvedValue(
        new FacilityDocumentCategory(),
      );

      const result = await service.createCategory(
        createFacilityDocumentCategoryDto,
      );
      expect(facilityDocumentCategory.save).toHaveBeenCalledWith(
        createFacilityDocumentCategoryDto,
      );
      expect(result).toEqual(new FacilityDocumentCategory());
    });
  });

  describe('create', () => {
    const createFacilityDocumentDto = new CreateFacilityDocumentDto();
    it('should create new document', async () => {
      facilityDocument.save.mockResolvedValue(new FacilityDocument());

      const result = await service.create(createFacilityDocumentDto);
      expect(facilityDocument.save).toHaveBeenCalledWith(
        createFacilityDocumentDto,
      );
      expect(result).toEqual(new FacilityDocument());
    });
  });

  describe('findAll', () => {
    const where: FindManyOptions<FacilityDocumentCategory> = {
      where: { id: '1' },
    };
    it('should find all category list', async () => {
      facilityDocumentCategory.find.mockResolvedValue([
        new FacilityDocumentCategory(),
      ]);

      const result = await service.findAll(where);
      expect(facilityDocumentCategory.find).toHaveBeenCalledWith(where);
      expect(result).toEqual([new FacilityDocumentCategory()]);
    });
  });

  describe('findOneCategory', () => {
    const where: FindOneOptions<FacilityDocumentCategory> = {
      where: { id: '1' },
    };
    it('should find one category', async () => {
      facilityDocumentCategory.findOne.mockResolvedValue(
        new FacilityDocumentCategory(),
      );

      const result = await service.findOneCategory(where);
      expect(facilityDocumentCategory.findOne).toHaveBeenCalledWith(where);
      expect(result).toEqual(new FacilityDocumentCategory());
    });
  });

  describe('findOneDocument', () => {
    const where: FindOneOptions<FacilityDocument> = {
      where: { id: '1' },
    };
    it('should find one document', async () => {
      facilityDocument.findOne.mockResolvedValue(new FacilityDocument());

      const result = await service.findOneDocument(where);
      expect(facilityDocument.findOne).toHaveBeenCalledWith(where);
      expect(result).toEqual(new FacilityDocument());
    });
  });

  describe('updateCategory', () => {
    const where: FindOptionsWhere<FacilityDocumentCategory> = {
      id: '1',
    };
    const updateFacilityDocumentCategoryDto =
      new UpdateFacilityDocumentCategoryDto();
    it('should update category', async () => {
      facilityDocumentCategory.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateCategory(
        where,
        updateFacilityDocumentCategoryDto,
      );
      expect(facilityDocumentCategory.update).toHaveBeenCalledWith(
        where,
        updateFacilityDocumentCategoryDto,
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('updateDocument', () => {
    const where: FindOptionsWhere<FacilityDocument> = {
      id: '1',
    };
    const updateFacilityDocumentDto = new UpdateFacilityDocumentDto();
    it('should update document', async () => {
      facilityDocument.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateDocument(
        where,
        updateFacilityDocumentDto,
      );
      expect(facilityDocument.update).toHaveBeenCalledWith(
        where,
        plainToInstance(FacilityDocument, updateFacilityDocumentDto),
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('removeCategory', () => {
    const where: FindOptionsWhere<FacilityDocumentCategory> = {
      id: '1',
    };
    const deleteDto = new DeleteDto();
    it('should remove category', async () => {
      facilityDocumentCategory.update.mockResolvedValue({ affected: 1 });

      const result = await service.removeCategory(where, deleteDto);
      expect(facilityDocumentCategory.update).toHaveBeenCalledWith(where, {
        ...deleteDto,
        deleted_at: expect.any(String),
      });
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('removeDocument', () => {
    const where: FindOptionsWhere<FacilityDocument> = {
      id: '1',
    };
    const deleteDto = new DeleteDto();
    it('should remove category', async () => {
      facilityDocument.update.mockResolvedValue({ affected: 1 });

      const result = await service.removeDocument(where, deleteDto);
      expect(facilityDocument.update).toHaveBeenCalledWith(where, {
        ...deleteDto,
        deleted_at: expect.any(String),
      });
      expect(result).toEqual({ affected: 1 });
    });
  });
});
