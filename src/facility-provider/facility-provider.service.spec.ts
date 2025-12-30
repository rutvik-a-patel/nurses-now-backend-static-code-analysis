import { Test, TestingModule } from '@nestjs/testing';
import { FacilityProviderService } from './facility-provider.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacilityProvider } from './entities/facility-provider.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateFacilityProviderDto } from './dto/create-facility-provider.dto';
import { plainToClass } from 'class-transformer';
import { FlagDnrDto } from './dto/flag-dnr.dto';
import { FACILITY_PROVIDER_FLAGS } from '@/shared/constants/enum';
import { UpdateFacilityProviderDto } from './dto/update-facility-provider.dto';
import { FilterFacilityProviderDto } from './dto/filter-facility-provider.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Facility } from '@/facility/entities/facility.entity';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';

describe('FacilityProviderService', () => {
  let service: FacilityProviderService;
  let facilityProviderRepository: any;
  let providerRepository: any;
  let shiftRepository: any;

  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    innerJoin: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilityProviderService,
        {
          provide: getRepositoryToken(FacilityProvider),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([new FacilityProvider()]),
              innerJoin: jest.fn().mockReturnThis(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: {
            findOne: jest.fn(),
            query: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([new FacilityProvider()]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue(new FacilityProvider()),
            })),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestScore),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CredentialsCategory),
          useValue: {},
        },
        {
          provide: getRepositoryToken(EDocResponse),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CompetencyTestGlobalSetting),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FacilityProviderService>(FacilityProviderService);
    facilityProviderRepository = module.get<Repository<FacilityProvider>>(
      getRepositoryToken(FacilityProvider),
    );
    providerRepository = module.get<Repository<Provider>>(
      getRepositoryToken(Provider),
    );
    shiftRepository = module.get<Repository<Shift>>(getRepositoryToken(Shift));
    shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    facilityProviderRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
    providerRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createFacilityProvider = new CreateFacilityProviderDto();
    it('should create facility provider', async () => {
      facilityProviderRepository.save.mockResolvedValue(new FacilityProvider());
      const result = await service.create(createFacilityProvider);
      expect(facilityProviderRepository.save).toHaveBeenCalledWith(
        plainToClass(FacilityProvider, createFacilityProvider),
      );
      expect(result).toEqual(new FacilityProvider());
    });
  });

  describe('findOneWhere', () => {
    const where: FindOneOptions<FacilityProvider> = { where: { id: '1' } };
    it('should get one facility provider', async () => {
      facilityProviderRepository.findOne.mockResolvedValue(
        new FacilityProvider(),
      );
      const result = await service.findOneWhere(where);
      expect(facilityProviderRepository.findOne).toHaveBeenCalledWith(where);
      expect(result).toEqual(new FacilityProvider());
    });
  });

  describe('flagAsDnr', () => {
    const where: FindOptionsWhere<FacilityProvider> = { id: '1' };
    const flagDnrDto = new FlagDnrDto();
    it('should flag provider as DNR', async () => {
      facilityProviderRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.flagAsDnr(where, flagDnrDto);
      expect(facilityProviderRepository.update).toHaveBeenCalledWith(where, {
        flag: FACILITY_PROVIDER_FLAGS.dnr,
        ...flagDnrDto,
      });
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('updateWhere', () => {
    const where: FindOptionsWhere<FacilityProvider> = { id: '1' };
    const updateFacilityProviderDto = new UpdateFacilityProviderDto();
    it('should flag provider as DNR', async () => {
      facilityProviderRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.updateWhere(
        where,
        updateFacilityProviderDto,
      );
      expect(facilityProviderRepository.update).toHaveBeenCalledWith(
        where,
        updateFacilityProviderDto,
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('getAll', () => {
    const filterFacilityProviderDto = new FilterFacilityProviderDto(); // No search parameter set
    const id = '1'; // No search parameter set
    it('should return all providers based on query parameters without search', async () => {
      const mockProviders = [new FacilityProvider(), new FacilityProvider()]; // Ensure this matches your expected output
      const count = mockProviders.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(mockProviders);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.getAll(filterFacilityProviderDto, id);

      expect(result).toEqual([mockProviders, count]);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should apply search filter when search parameter is provided', async () => {
      filterFacilityProviderDto.search = 'test';
      filterFacilityProviderDto.certificate = ['1'];
      filterFacilityProviderDto.speciality = ['1'];
      filterFacilityProviderDto.flag = [FACILITY_PROVIDER_FLAGS.preferred];
      filterFacilityProviderDto.order = { created_at: 'DESC' };
      const mockProviders = [new FacilityProvider(), new FacilityProvider()];
      const count = mockProviders.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(mockProviders);
      mockQueryBuilder.getRawMany.mockResolvedValue(count);

      await service.getAll(filterFacilityProviderDto, id);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `(p.first_name ILIKE :search OR p.last_name ILIKE :search OR p.first_name || ' ' || p.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(filterFacilityProviderDto.search)}%` },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `c.id IN (:...certificateIds)`,
        { certificateIds: filterFacilityProviderDto.certificate },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `sp.id IN (:...specialityIds)`,
        { specialityIds: filterFacilityProviderDto.speciality },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `fp.flag IN (:...flags)`,
        { flags: filterFacilityProviderDto.flag },
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        `created_at`,
        'DESC',
        'NULLS LAST',
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    const id = '1'; // No search parameter set
    it('should return all providers based on query parameters without search', async () => {
      const mockProvider = new Provider();
      mockQueryBuilder.getRawOne.mockResolvedValue(mockProvider);

      const result = await service.getProviderSummary(id);

      expect(result).toEqual(mockProvider);
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });
  });

  describe('findProviderDetails', () => {
    const where: FindOneOptions<Provider> = { where: { id: '1' } };
    it('should get one provider details', async () => {
      providerRepository.findOne.mockResolvedValue(new Provider());
      const result = await service.findProviderDetails(where);
      expect(providerRepository.findOne).toHaveBeenCalledWith(where);
      expect(result).toEqual(new Provider());
    });
  });

  describe('getScheduledCalendar', () => {
    const start_date = '2024-08-09';
    const end_date = '2024-08-09';
    const facilityProvider = new FacilityProvider();
    facilityProvider.provider = new Provider();
    facilityProvider.facility = new Facility();
    facilityProvider.provider.id = '1';
    facilityProvider.facility.id = '1';
    it('should get calendar list', async () => {
      providerRepository.query.mockResolvedValue([]);
      const result = await service.getScheduledCalendar(
        facilityProvider,
        start_date,
        end_date,
      );
      expect(providerRepository.query).toHaveBeenCalledWith(
        `SELECT * FROM get_provider_shifts_for_month($1, $2, $3, $4)`,
        [
          facilityProvider.provider.id,
          facilityProvider.facility.id,
          start_date,
          end_date,
        ],
      );
      expect(result).toEqual([]);
    });
  });

  describe('getShiftHistory', () => {
    const queryParamsDto = new QueryParamsDto();
    const facilityProvider = new FacilityProvider();
    facilityProvider.provider = new Provider();
    facilityProvider.facility = new Facility();
    facilityProvider.provider.id = '1';
    facilityProvider.facility.id = '1';
    it('should return all shift based on query parameters without search', async () => {
      queryParamsDto.order = { 's.shift_id': 'DESC' };
      const mockShift = [new Shift(), new Shift()]; // Ensure this matches your expected output
      const count = mockShift.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(mockShift);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.getShiftHistory(
        facilityProvider,
        queryParamsDto,
      );

      expect(result).toEqual([mockShift, count]);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should apply order filter when order parameter is provided', async () => {
      queryParamsDto.order = { created_at: 'DESC' };
      const mockShift = [new Shift(), new Shift()]; // Ensure this matches your expected output
      const count = mockShift.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(mockShift);
      mockQueryBuilder.getRawMany.mockResolvedValue(count);

      await service.getShiftHistory(facilityProvider, queryParamsDto);

      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('getProviderDetails', () => {
    const id = '1';
    const facility_id = '1';
    it('should return provider details', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(new Provider());

      const result = await service.getProviderDetails(id, facility_id);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `p.id = :id AND fp.facility_id = :facility_id`,
        {
          id: id,
          facility_id,
        },
      );
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(result).toEqual(new Provider());
    });
  });

  describe('findAllFacilities', () => {
    const id = '1';
    const queryParamsDto = new QueryParamsDto();
    it('should return facility list', async () => {
      queryParamsDto.order = { name: 'ASC' };
      mockQueryBuilder.getRawMany.mockResolvedValue([new Facility()]);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.findAllFacilities(id, queryParamsDto);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `p.id = :providerId`,
        { providerId: id },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toEqual([[new Facility()], 1]);
    });

    it('should return facility list', async () => {
      queryParamsDto.order = { location: 'ASC' };
      mockQueryBuilder.getRawMany.mockResolvedValue([new Facility()]);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.findAllFacilities(id, queryParamsDto);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `p.id = :providerId`,
        { providerId: id },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalled();
      expect(result).toEqual([[new Facility()], 1]);
    });
  });
});
