import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsCategoryService } from './credentials-category.service';
import { CredentialsCategory } from './entities/credentials-category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateCredentialsCategoryDto } from './dto/create-credentials-category.dto';
import { UpdateCredentialsCategoryDto } from './dto/update-credentials-category.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { FilterCredentialsDto } from './dto/filter-credentials.dto';
import { plainToInstance } from 'class-transformer';

describe('CredentialsCategoryService', () => {
  let service: CredentialsCategoryService;
  let credentialsCategoryRepository: any;
  let credentialRepository: any;
  let providerCredentialRepository: any;
  const mockQueryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([new CredentialsCategory()]),
    getOne: jest.fn().mockResolvedValue([new CredentialsCategory()]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsCategoryService,
        {
          provide: getRepositoryToken(CredentialsCategory),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Credential),
          useValue: {
            find: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderCredential),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<CredentialsCategoryService>(
      CredentialsCategoryService,
    );
    credentialsCategoryRepository = module.get<Repository<CredentialsCategory>>(
      getRepositoryToken(CredentialsCategory),
    );
    credentialRepository = module.get<Repository<Credential>>(
      getRepositoryToken(Credential),
    );
    providerCredentialRepository = module.get<Repository<ProviderCredential>>(
      getRepositoryToken(ProviderCredential),
    );
    credentialsCategoryRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
    credentialRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    providerCredentialRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new Credential Category', async () => {
      const createCredentialsCategoryDto = new CreateCredentialsCategoryDto();
      const mockCategory = new CredentialsCategory();
      credentialsCategoryRepository.save.mockResolvedValue(mockCategory);
      const result = await service.create(createCredentialsCategoryDto);
      expect(credentialsCategoryRepository.save).toHaveBeenCalledWith(
        createCredentialsCategoryDto,
      );
      expect(result).toEqual(
        plainToInstance(CredentialsCategory, mockCategory),
      );
    });
  });

  describe('findOneWhere', () => {
    it('should find one Credential Category by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockCategory = new CredentialsCategory();
      credentialsCategoryRepository.findOne.mockResolvedValue(mockCategory);
      const result = await service.findOneWhere(options);
      expect(credentialsCategoryRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(
        plainToInstance(CredentialsCategory, mockCategory),
      );
    });
  });

  describe('findAll', () => {
    it('should return credential category list', async () => {
      const mockCategories = [
        new CredentialsCategory(),
        new CredentialsCategory(),
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockCategories);

      const result = await service.findAll(new FilterCredentialsDto());

      expect(result).toEqual(mockCategories);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an Credential Category and return the result', async () => {
      const updateCredentialsCategoryDto = new UpdateCredentialsCategoryDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateCredentialsCategoryDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      credentialsCategoryRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateCredentialsCategoryDto);

      expect(credentialsCategoryRepository.update).toHaveBeenCalledWith(
        id,
        expectedDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('checkRequirementExist', () => {
    const id = '1';
    it('should return false if document length is null', async () => {
      credentialRepository.count.mockResolvedValue(0);

      const result = await service.checkRequirementExist(id);

      expect(credentialRepository.count).toHaveBeenCalledWith({
        relations: { credentials_category: true },
        where: { credentials_category: { id } },
      });
      expect(result).toEqual(false);
    });

    it('should return false if document length is null', async () => {
      credentialRepository.count.mockResolvedValue(1);
      providerCredentialRepository.count.mockResolvedValue(1);

      const result = await service.checkRequirementExist(id);

      expect(credentialRepository.count).toHaveBeenCalledWith({
        relations: { credentials_category: true },
        where: { credentials_category: { id } },
      });

      expect(providerCredentialRepository.count).toHaveBeenCalledWith({
        where: { credential: { credentials_category: { id } } },
      });
      expect(result).toEqual(true);
    });

    it('should return true if credentials exist but providerCredential does not', async () => {
      credentialRepository.count.mockResolvedValue(1);
      providerCredentialRepository.count.mockResolvedValue(0);

      const result = await service.checkRequirementExist(id);

      expect(credentialRepository.count).toHaveBeenCalledWith({
        relations: { credentials_category: true },
        where: { credentials_category: { id } },
      });

      expect(providerCredentialRepository.count).toHaveBeenCalledWith({
        where: { credential: { credentials_category: { id } } },
      });
      expect(result).toEqual(true);
    });
  });

  describe('remove', () => {
    it('should mark a Credential Category as deleted', async () => {
      const deleteDto = new DeleteDto();
      const updateResult: any = { affected: 1 };
      credentialRepository.update.mockResolvedValue(updateResult);
      credentialsCategoryRepository.update.mockResolvedValue(updateResult);
      const id = '1';

      const result = await service.remove(id, deleteDto);

      expect(credentialRepository.update).toHaveBeenCalledWith(
        { credentials_category: { id }, deleted_at: IsNull() },
        {
          deleted_at: expect.any(String),
          deleted_at_ip: deleteDto.deleted_at_ip,
        },
      );
      expect(credentialsCategoryRepository.update).toHaveBeenCalledWith(
        { id: id, deleted_at: IsNull() },
        {
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('checkName', () => {
    it('should return certificate data if name exists', async () => {
      const mockCategory = new CredentialsCategory();
      mockQueryBuilder.getOne.mockResolvedValue(mockCategory);
      credentialsCategoryRepository.createQueryBuilder = jest.fn(
        () => mockQueryBuilder,
      );
      const result = await service.checkName('name');
      expect(result).toEqual(mockCategory);
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(c.name) = LOWER(:name)',
        {
          name: 'name',
        },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });
});
