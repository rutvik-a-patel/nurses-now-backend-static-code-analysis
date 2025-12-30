import { Test, TestingModule } from '@nestjs/testing';
import { ProviderCredentialsService } from './provider-credentials.service';
import { ProviderCredential } from './entities/provider-credential.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateProviderCredentialDto } from './dto/create-provider-credential.dto';
import { UpdateProviderCredentialDto } from './dto/update-provider-credential.dto';
import { Credential } from '@/credentials/entities/credential.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';

describe('ProviderCredentialsService', () => {
  let service: ProviderCredentialsService;
  let providerCredentialRepository: any;
  let _credentialsRepository: any;

  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    innerJoin: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderCredentialsService,
        {
          provide: getRepositoryToken(ProviderCredential),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest
                .fn()
                .mockResolvedValue([new ProviderCredential()]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Credential),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([new Credential()]),
            })),
            query: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(CredentialsCategory),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest
                .fn()
                .mockResolvedValue([new CredentialsCategory()]),
            })),
            query: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(EDoc),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([new EDoc()]),
            })),
          },
        },
        {
          provide: getRepositoryToken(EDocResponse),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ count: 0 }),
              getRawMany: jest.fn().mockResolvedValue([]),
            })),
          },
        },
        {
          provide: getRepositoryToken(StatusSetting),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProviderCredentialsService>(
      ProviderCredentialsService,
    );
    providerCredentialRepository = module.get<Repository<ProviderCredential>>(
      getRepositoryToken(ProviderCredential),
    );
    _credentialsRepository = module.get<Repository<Credential>>(
      getRepositoryToken(Credential),
    );
    service['credentialsRepository'].createQueryBuilder = jest.fn(
      () => mockQueryBuilder as unknown as SelectQueryBuilder<Credential>,
    );
    service['credentialsCategoryRepository'].createQueryBuilder = jest.fn(
      () =>
        mockQueryBuilder as unknown as SelectQueryBuilder<CredentialsCategory>,
    );
    service['providerCredentialRepository'].createQueryBuilder = jest.fn(
      () =>
        mockQueryBuilder as unknown as SelectQueryBuilder<ProviderCredential>,
    );
    service['eDocsRepository'].createQueryBuilder = jest.fn(
      () => mockQueryBuilder as unknown as SelectQueryBuilder<EDoc>,
    );
    service['eDocResponseRepository'].createQueryBuilder = jest.fn(
      () => mockQueryBuilder as unknown as SelectQueryBuilder<EDocResponse>,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new provider credential and append timestamp to pdf', async () => {
      const createProviderCredentialDto = new CreateProviderCredentialDto();
      createProviderCredentialDto.original_filename = 'demo.pdf';
      const mockCredential = new ProviderCredential();
      service['credentialsRepository'].findOne = jest
        .fn()
        .mockResolvedValue({ approval_required: false });
      providerCredentialRepository.save = jest
        .fn()
        .mockResolvedValue(mockCredential);
      const result = await service.create(createProviderCredentialDto);
      expect(providerCredentialRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expect.any(ProviderCredential));
      expect(createProviderCredentialDto.original_filename).toMatch(
        /demo_\d+\.pdf/,
      );
    });
    it('should create a new provider credential without changing non-pdf filename', async () => {
      const createProviderCredentialDto = new CreateProviderCredentialDto();
      createProviderCredentialDto.original_filename = 'demo.jpg';
      const mockCredential = new ProviderCredential();
      service['credentialsRepository'].findOne = jest
        .fn()
        .mockResolvedValue({ approval_required: false });
      providerCredentialRepository.save = jest
        .fn()
        .mockResolvedValue(mockCredential);
      const result = await service.create(createProviderCredentialDto);
      expect(providerCredentialRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expect.any(ProviderCredential));
      expect(createProviderCredentialDto.original_filename).toBe('demo.jpg');
    });
    it('should not set is_verified if credential requires approval', async () => {
      const createProviderCredentialDto = new CreateProviderCredentialDto();
      createProviderCredentialDto.original_filename = 'demo.pdf';
      service['credentialsRepository'].findOne = jest
        .fn()
        .mockResolvedValue({ approval_required: true });
      providerCredentialRepository.save = jest
        .fn()
        .mockResolvedValue(new ProviderCredential());
      await service.create(createProviderCredentialDto);
      expect(createProviderCredentialDto.is_verified).toBeUndefined();
    });
    it('should not set is_verified if credential does not exist', async () => {
      const createProviderCredentialDto = new CreateProviderCredentialDto();
      createProviderCredentialDto.original_filename = 'demo.pdf';
      // Mock credentialsRepository.findOne to simulate credential does not exist
      service['credentialsRepository'].findOne = jest
        .fn()
        .mockResolvedValue(null);
      providerCredentialRepository.save = jest
        .fn()
        .mockResolvedValue(new ProviderCredential());
      await service.create(createProviderCredentialDto);
      expect(createProviderCredentialDto.is_verified).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return a list of credentials and count', async () => {
      const options = {};
      const mockCredential = [
        new ProviderCredential(),
        new ProviderCredential(),
      ];
      const count = mockCredential.length;
      providerCredentialRepository.findAndCount.mockResolvedValue([
        mockCredential,
        count,
      ]);
      const result = await service.findAll(options);
      expect(providerCredentialRepository.findAndCount).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual([mockCredential, count]);
    });
  });

  describe('findOneWhere', () => {
    it('should find one credential history by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockCredential = new ProviderCredential();
      providerCredentialRepository.findOne.mockResolvedValue(mockCredential);
      const result = await service.findOneWhere(options);
      expect(providerCredentialRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(mockCredential);
    });
    it('should return null if not found', async () => {
      providerCredentialRepository.findOne.mockResolvedValue(null);
      const result = await service.findOneWhere({ where: { id: 'notfound' } });
      expect(result).toBeNull();
    });
  });

  describe('updateWhere', () => {
    it('should update a credential and return the result', async () => {
      const updateProviderCredentialDto = new UpdateProviderCredentialDto();
      const where: any = { id: '1' };
      const updateResult = { affected: 1 };
      providerCredentialRepository.update.mockResolvedValue(updateResult);
      const result = await service.updateWhere(
        where,
        updateProviderCredentialDto,
      );
      expect(providerCredentialRepository.update).toHaveBeenCalledWith(
        where,
        expect.any(Object),
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('getAllCredentialsCategory', () => {
    it('should return all credentials category', async () => {
      const user = new Provider();
      user.id = 'user1';
      user.certificate = new Certificate();
      user.certificate.id = 'cert1';
      user.speciality = new Speciality();
      user.speciality.id = 'spec1';
      const mockResult = [{ id: 'cat1', name: 'Category 1', credentials: [] }];

      // Mock the query method directly since the service uses raw SQL
      service['credentialsCategoryRepository'].query = jest
        .fn()
        .mockResolvedValue(mockResult);

      const result = await service.getAllCredentialsCategory(user, false);
      expect(result).toEqual(mockResult);
      expect(
        service['credentialsCategoryRepository'].query,
      ).toHaveBeenCalledWith(expect.any(String), [
        user.id,
        user.certificate.id,
        user.speciality.id,
        'pre_hire',
      ]);
    });
    it('should add pc.id IS NOT NULL filter if isResponse is true', async () => {
      const user = new Provider();
      user.id = 'user1';
      user.certificate = new Certificate();
      user.certificate.id = 'cert1';
      user.speciality = new Speciality();
      user.speciality.id = 'spec1';
      const mockResult = [{ id: 'cat1', name: 'Category 1', credentials: [] }];

      // Mock the query method directly since the service uses raw SQL
      service['credentialsCategoryRepository'].query = jest
        .fn()
        .mockResolvedValue(mockResult);

      await service.getAllCredentialsCategory(user, true);

      // Verify the query was called with raw SQL that includes the isResponse filter
      expect(
        service['credentialsCategoryRepository'].query,
      ).toHaveBeenCalledWith(expect.stringContaining('pc.id IS NOT NULL'), [
        user.id,
        user.certificate.id,
        user.speciality.id,
        'pre_hire',
      ]);
    });
  });

  describe('getOtherCredentialsCategory', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return other provider credential list (previous_document is null)', async () => {
      const certificate_id = '1';
      const search = 'test';
      const mockCredential = [new Credential(), new Credential()];
      const user = new Provider();
      user.id = 'provider-id';
      user.certificate = new Certificate();
      user.certificate.id = certificate_id;
      user.speciality = new Speciality();
      user.speciality.id = '2';

      // Mock the query method to return mock credentials
      service['credentialsRepository'].query = jest
        .fn()
        .mockResolvedValue(mockCredential);

      const result = await service.getOtherCredentialsCategory(user, search);

      expect(service['credentialsRepository'].query).toHaveBeenCalledWith(
        expect.stringContaining('FROM view_credentials_category v'),
        expect.arrayContaining([
          user.id,
          user.certificate.id,
          user.speciality.id,
        ]),
      );
      expect(result).toEqual(mockCredential);
    });
    it('should return other provider credential list (previous_document is NOT null)', async () => {
      const certificate_id = '1';
      const search = 'test';
      const mockCredential = [new Credential()];
      const user = new Provider();
      user.id = 'provider-id';
      user.certificate = new Certificate();
      user.certificate.id = certificate_id;
      user.speciality = new Speciality();
      user.speciality.id = '2';

      // Mock the query method to return mock credentials
      service['credentialsRepository'].query = jest
        .fn()
        .mockResolvedValue(mockCredential);

      const result = await service.getOtherCredentialsCategory(user, search);

      expect(service['credentialsRepository'].query).toHaveBeenCalledWith(
        expect.stringContaining('FROM view_credentials_category v'),
        expect.arrayContaining([
          user.id,
          user.certificate.id,
          user.speciality.id,
        ]),
      );
      expect(result).toEqual(mockCredential);
    });

    it('should filter by search if search is provided', async () => {
      const certificate_id = '1';
      const search = 'nurse';
      const user = new Provider();
      user.id = 'provider-id';
      user.certificate = new Certificate();
      user.certificate.id = certificate_id;
      user.speciality = new Speciality();
      user.speciality.id = '2';

      // Mock the query method to return empty array
      service['credentialsRepository'].query = jest.fn().mockResolvedValue([]);

      await service.getOtherCredentialsCategory(user, search);

      // Check that the query method was called with the search parameter
      expect(service['credentialsRepository'].query).toHaveBeenCalledWith(
        expect.stringContaining('v.credential_name ILIKE $4'),
        expect.arrayContaining([
          user.id,
          user.certificate.id,
          user.speciality.id,
          expect.stringContaining('nurse'),
        ]),
      );
    });

    it('should not call andWhere for search if search is empty', async () => {
      const certificate_id = '1';
      const search = '';
      const user = new Provider();
      user.id = 'provider-id';
      user.certificate = new Certificate();
      user.certificate.id = certificate_id;
      user.speciality = new Speciality();
      user.speciality.id = '2';

      // Mock the query method to return empty array
      service['credentialsRepository'].query = jest.fn().mockResolvedValue([]);

      await service.getOtherCredentialsCategory(user, search);

      // Check that the query method was called without the search filter
      expect(service['credentialsRepository'].query).toHaveBeenCalledWith(
        expect.not.stringContaining('v.credential_name ILIKE $4'),
        [user.id, user.certificate.id, user.speciality.id],
      );
    });
  });

  describe('getOtherCredentialsData', () => {
    it('should return other credentials data for provider', async () => {
      const provider_id = 'provider1';
      const mockResult = [{ id: '1', credential: 'Test' }];
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockResult),
      };
      service['providerCredentialRepository'].createQueryBuilder = jest.fn(
        () =>
          mockQueryBuilder as unknown as SelectQueryBuilder<ProviderCredential>,
      );

      const result = await service.getOtherCredentialsData(provider_id);
      expect(result).toEqual(mockResult);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });

  describe('getEDocForProvider', () => {
    const user = new Provider();
    user.certificate = new Certificate();
    user.certificate.id = '1';
    user.speciality = new Speciality();
    user.speciality.id = '1';
    it('should get e docs for provider', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([new EDoc()]);
      const result = await service.getEDocForProvider(user);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toEqual([new EDoc()]);
    });
  });
});
