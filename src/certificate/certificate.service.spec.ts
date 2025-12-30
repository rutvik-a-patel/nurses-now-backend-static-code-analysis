import { Test, TestingModule } from '@nestjs/testing';
import { CertificateService } from './certificate.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { Provider } from '@/provider/entities/provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Credential } from '@/credentials/entities/credential.entity';

describe('CertificateService', () => {
  let service: CertificateService;
  let certificateRepository: any;
  let providerRepository: any;
  let shiftRepository: any;
  let credentialRepository: any;
  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateService,
        {
          provide: getRepositoryToken(Certificate),
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
              addOrderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(new Certificate()),
              orWhere: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue(new Certificate()),
              getRawMany: jest.fn().mockResolvedValue([new Certificate()]),
              getCount: jest.fn().mockResolvedValue(1),
            })),
          },
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              orWhere: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue(new Provider()),
              getCount: jest.fn().mockResolvedValue(0),
            })),
          },
        },
        {
          provide: getRepositoryToken(Credential),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(0),
            })),
          },
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            count: jest.fn().mockResolvedValue(0),
          },
        },
      ],
    }).compile();

    service = module.get<CertificateService>(CertificateService);
    certificateRepository = module.get<Repository<Certificate>>(
      getRepositoryToken(Certificate),
    );
    providerRepository = module.get<Repository<Provider>>(
      getRepositoryToken(Provider),
    );
    shiftRepository = module.get<Repository<Shift>>(getRepositoryToken(Shift));
    credentialRepository = module.get<Repository<Shift>>(
      getRepositoryToken(Credential),
    );
    certificateRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    providerRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new certificate', async () => {
      const createCertificateDto = new CreateCertificateDto();
      createCertificateDto.background_color = expect.any(String);
      createCertificateDto.text_color = expect.any(String);
      const certificate = new Certificate();
      certificateRepository.save.mockResolvedValue(certificate);
      const result = await service.create(createCertificateDto);
      expect(certificateRepository.save).toHaveBeenCalledWith(
        createCertificateDto,
      );
      expect(result).toEqual(certificate);
    });
  });

  describe('findOneWhere', () => {
    it('should find one certificate by criteria', async () => {
      const options = { where: { name: 'CN' } };
      const certificate = new Certificate();
      certificateRepository.findOne.mockResolvedValue(certificate);
      const result = await service.findOneWhere(options);
      expect(certificateRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(certificate);
    });
  });

  describe('findAll', () => {
    let mockCertificateQueryBuilder: any;
    beforeEach(() => {
      mockCertificateQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
        getCount: jest.fn(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      certificateRepository.createQueryBuilder = jest.fn(
        () => mockCertificateQueryBuilder,
      );
    });

    it('should return a list of certificates and count', async () => {
      const queryParamsDto = new QueryParamsDto();
      const certificates = [new Certificate(), new Certificate()];
      const count = certificates.length;
      queryParamsDto.search = 'test';
      mockCertificateQueryBuilder.getRawMany.mockResolvedValue(certificates);
      mockCertificateQueryBuilder.getCount.mockResolvedValue(count);
      const result = await service.findAll(queryParamsDto);
      expect(result).toEqual([certificates, count]);
      expect(mockCertificateQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockCertificateQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an certificate and return the result', async () => {
      const updateCertificateDto = new UpdateCertificateDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateCertificateDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      certificateRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateCertificateDto);

      expect(certificateRepository.update).toHaveBeenCalledWith(
        id,
        expectedDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark a certificate as deleted', async () => {
      const deleteDto = { deleted_at_ip: '127.0.0.1' };
      const updateResult: any = { affected: 1 };
      certificateRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove('1', deleteDto);
      expect(certificateRepository.update).toHaveBeenCalledWith(
        { id: '1', deleted_at: IsNull() },
        {
          ...deleteDto,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('checkName', () => {
    it('should return certificate data if name exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new Certificate());
      const dto = { name: 'CertificateName' };
      const result = await service.checkName(dto);
      expect(result).toEqual(new Certificate());
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
        'LOWER(c.name) = LOWER(:name)',
        {
          name: 'CertificateName',
        },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('getCertificateDetails', () => {
    it('should return data', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(new Certificate());
      const result = await service.getCertificateDetails('1');
      expect(result).toEqual(new Certificate());
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(`c.id = :id`, {
        id: '1',
      });
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });
  });

  describe('isCertificateUsed', () => {
    let mockProviderQueryBuilder: any;
    let mockCredentialQueryBuilder: any;

    beforeEach(() => {
      mockProviderQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockCredentialQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      providerRepository.createQueryBuilder = jest.fn(
        () => mockProviderQueryBuilder,
      );
      credentialRepository.createQueryBuilder = jest.fn(
        () => mockCredentialQueryBuilder,
      );
      shiftRepository.count = jest.fn().mockResolvedValue(0);
    });

    const id = '1';

    it('should return true if certificate is used by provider', async () => {
      mockProviderQueryBuilder.getCount.mockResolvedValue(1);
      mockCredentialQueryBuilder.getCount.mockResolvedValue(0);
      shiftRepository.count.mockResolvedValue(0);

      const result = await service.isCertificateUsed(id);

      expect(mockProviderQueryBuilder.where).toHaveBeenCalledWith(
        'p.certificate_id = :id',
        { id },
      );
      expect(mockProviderQueryBuilder.orWhere).toHaveBeenCalledWith(
        'p.additional_certification @> :id2',
        { id2: [id] },
      );
      expect(mockProviderQueryBuilder.getCount).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return true if certificate is used in credentials', async () => {
      mockProviderQueryBuilder.getCount.mockResolvedValue(0);
      mockCredentialQueryBuilder.getCount.mockResolvedValue(1);
      shiftRepository.count.mockResolvedValue(0);

      const result = await service.isCertificateUsed(id);

      expect(mockCredentialQueryBuilder.where).toHaveBeenCalledWith(
        'c.licenses @> :id',
        { id: [id] },
      );
      expect(mockCredentialQueryBuilder.getCount).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return true if certificate is used in shifts', async () => {
      mockProviderQueryBuilder.getCount.mockResolvedValue(0);
      mockCredentialQueryBuilder.getCount.mockResolvedValue(0);
      shiftRepository.count.mockResolvedValue(1);

      const result = await service.isCertificateUsed(id);

      expect(shiftRepository.count).toHaveBeenCalledWith({
        relations: { certificate: true },
        where: { certificate: { id } },
      });
      expect(result).toBe(true);
    });

    it('should return false if certificate is not used anywhere', async () => {
      mockProviderQueryBuilder.getCount.mockResolvedValue(0);
      mockCredentialQueryBuilder.getCount.mockResolvedValue(0);
      shiftRepository.count.mockResolvedValue(0);

      const result = await service.isCertificateUsed(id);

      expect(mockProviderQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockCredentialQueryBuilder.getCount).toHaveBeenCalled();
      expect(shiftRepository.count).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
