import { Test, TestingModule } from '@nestjs/testing';
import { SpecialityService } from './speciality.service';
import { Speciality } from './entities/speciality.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { Shift } from '@/shift/entities/shift.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Credential } from '@/credentials/entities/credential.entity';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { DEFAULT_STATUS } from '@/shared/constants/enum';

describe('SpecialityService', () => {
  let service: SpecialityService;
  let providerRepository: any;
  let shiftRepository: any;
  let mockSpecialityRepository: jest.Mocked<Repository<Speciality>>;
  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecialityService,
        {
          provide: getRepositoryToken(Speciality),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder) as any, // suppress TS error
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
              getRawOne: jest.fn(),
              getCount: jest.fn(),
            })) as any, // suppress TS error
          },
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Credential),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getCount: jest.fn(),
            })) as any, // suppress TS error
          },
        },
      ],
    }).compile();

    service = module.get<SpecialityService>(SpecialityService);
    mockSpecialityRepository = module.get(getRepositoryToken(Speciality));
    providerRepository = module.get<Repository<Provider>>(
      getRepositoryToken(Provider),
    );
    shiftRepository = module.get<Repository<Shift>>(getRepositoryToken(Shift));
    // Patch credentialRepository for all tests
    const credentialRepo = service[
      'credentialRepository'
    ] as Repository<Credential>;
    credentialRepo.createQueryBuilder = jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
    })) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new speciality with random colors', async () => {
      const createDto: CreateSpecialityDto = {
        name: 'Neurology',
        abbreviation: 'NEURO',
        status: DEFAULT_STATUS.active,
        certificates: [],
        display: true,
        workforce_portal_alias: 'neurology',
        text_color: '#000000',
        background_color: '#FFFFFF',
      };
      const speciality = new Speciality();
      speciality.id = '1';
      speciality.name = 'Neurology';
      speciality.text_color = '#000000';
      speciality.background_color = '#FFFFFF';

      mockSpecialityRepository.save.mockResolvedValue(speciality);

      const result = await service.create(createDto);
      expect(mockSpecialityRepository.save).toHaveBeenCalledWith({
        ...createDto,
        text_color: expect.any(String),
        background_color: expect.any(String),
      });
      expect(result).toEqual(speciality);
    });
  });

  describe('findOneWhere', () => {
    it('should find one speciality by criteria', async () => {
      const speciality = new Speciality();
      speciality.id = '1';
      speciality.name = 'Neurology';

      mockSpecialityRepository.findOne.mockResolvedValue(speciality);

      const result = await service.findOneWhere({
        where: { name: 'Neurology' },
      });
      expect(mockSpecialityRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Neurology' },
      });
      expect(result).toEqual(speciality);
    });

    it('should return null if no speciality found', async () => {
      mockSpecialityRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneWhere({
        where: { name: 'NonExistent' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return specialities list with search and pagination', async () => {
      const queryParamsDto = new QueryParamsDto();
      queryParamsDto.search = 'test';
      queryParamsDto.limit = '10';
      queryParamsDto.offset = '0';
      queryParamsDto.order = { name: 'ASC' };

      const specialities = [new Speciality(), new Speciality()];
      const count = specialities.length;

      mockQueryBuilder.getRawMany.mockResolvedValue(specialities);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const [result, total] = await service.findAll(queryParamsDto);

      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(sp.name ILIKE :search OR sp.abbreviation ILIKE :search)',
        expect.any(Object),
      );
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalled();
      expect(result).toEqual(specialities);
      expect(total).toBe(count);
    });
  });

  describe('update', () => {
    it('should update a speciality', async () => {
      const id = '1';
      const updateDto = {
        name: 'Updated Neurology',
        abbreviation: 'UNEURO',
      };
      const updateResult: UpdateResult = {
        affected: 1,
        raw: [],
        generatedMaps: [],
      };

      mockSpecialityRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateDto);
      expect(mockSpecialityRepository.update).toHaveBeenCalledWith(id, {
        ...updateDto,
        updated_at: expect.any(String),
      });
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark a speciality as deleted', async () => {
      const id = '1';
      const deleteDto = { deleted_at_ip: '127.0.0.1' };
      const updateResult: UpdateResult = {
        affected: 1,
        raw: [],
        generatedMaps: [],
      };

      mockSpecialityRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove(id, deleteDto);
      expect(mockSpecialityRepository.update).toHaveBeenCalledWith(
        { id, deleted_at: IsNull() },
        {
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('checkName', () => {
    it('should find speciality by name case-insensitive', async () => {
      const speciality = new Speciality();
      mockQueryBuilder.getOne.mockResolvedValue(speciality);

      const result = await service.checkName({ name: 'Neurology' });

      expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
        'LOWER(s.name) = LOWER(:name)',
        { name: 'Neurology' },
      );
      expect(result).toEqual(speciality);
    });

    it('should return null if no speciality found with name', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.checkName({ name: 'NonExistent' });
      expect(result).toBeNull();
    });
  });

  describe('getSpecialityDetails', () => {
    it('should return speciality details with certificates', async () => {
      const id = '1';
      const specialityDetails = {
        id,
        name: 'Neurology',
        abbreviation: 'NEURO',
        status: 'active',
        display: true,
        workforce_portal_alias: 'neurology',
        text_color: '#000000',
        background_color: '#FFFFFF',
        certificates: [],
      };

      mockQueryBuilder.getRawOne.mockResolvedValue(specialityDetails);

      const result = await service.getSpecialityDetails(id);

      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('s.id = :id', { id });
      expect(result).toEqual(specialityDetails);
    });

    it('should return null if speciality not found', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(null);

      const result = await service.getSpecialityDetails('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('isSpecialityUsed', () => {
    let mockProviderQueryBuilder: any;
    let mockCredentialQueryBuilder: any;

    beforeEach(() => {
      mockProviderQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
      };

      mockCredentialQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
      };

      // Mock provider repository
      providerRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockProviderQueryBuilder);

      // Mock credential repository
      const credentialRepo = service[
        'credentialRepository'
      ] as Repository<Credential>;
      credentialRepo.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockCredentialQueryBuilder) as any;
      // Always mock shiftRepository.count for all tests
      shiftRepository.count = jest.fn().mockResolvedValue(0);
    });

    it('should return true if speciality is in use', async () => {
      const id = '1';

      // Mock provider count
      mockProviderQueryBuilder.getCount.mockResolvedValue(1);

      // Mock shift count
      shiftRepository.count = jest.fn().mockResolvedValue(0);

      // Mock credentials count
      mockCredentialQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.isSpecialityUsed(id);

      expect(mockProviderQueryBuilder.where).toHaveBeenCalledWith(
        'p.speciality_id = :id',
        { id: id },
      );
      expect(mockProviderQueryBuilder.orWhere).toHaveBeenCalledWith(
        'p.additional_speciality @> :id2',
        { id2: [id] },
      );
      expect(result).toBe(true);
    });

    it('should return false if speciality is not in use', async () => {
      const id = '1';

      // Mock all counts to return 0
      mockProviderQueryBuilder.getCount.mockResolvedValue(0);
      shiftRepository.count = jest.fn().mockResolvedValue(0);
      mockCredentialQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.isSpecialityUsed(id);
      expect(result).toBe(false);
    });
  });
});
