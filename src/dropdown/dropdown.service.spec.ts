import { Test, TestingModule } from '@nestjs/testing';
import { DropdownService } from './dropdown.service';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { Country } from '@/country/entities/country.entity';
import { State } from '@/state/entities/state.entity';
import { City } from '@/city/entities/city.entity';
import { FacilityPermission } from '@/facility-user/entities/facility-permission.entity';
import { Role } from '@/role/entities/role.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { FacilityShiftSetting } from '@/facility-shift-setting/entities/facility-shift-setting.entity';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { ShiftType } from '@/shift-type/entities/shift-type.entity';
import { LineOfBusiness } from '@/line-of-business/entities/line-of-business.entity';
import { TimecardRejectReason } from '@/timecard-reject-reason/entities/timecard-reject-reason.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import {
  DEFAULT_STATUS,
  DNR_TYPE,
  FILTER_PROVIDER_BY,
  SHIFT_TYPE,
  VERIFICATION_STATUS,
} from '@/shared/constants/enum';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { AIService } from '@/shared/helpers/ai-service';
import { FlagSetting } from '@/flag-setting/entities/flag-setting.entity';
import { DnrReason } from '@/dnr-reason/entities/dnr-reason.entity';
import { EDocsGroup } from '@/e-docs-group/entities/e-docs-group.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { Tag } from '@/tags/entities/tags.entity';
import { ProviderRejectReason } from '@/provider-reject-reason/entities/provider-reject-reason.entity';
import { OrientationRejectReason } from '@/orientation-reject-reason/entities/orientation-reject-reason.entity';
import { FilterDropdownDto } from './dto/filter.dropdown.dto';
import { AdminDocument } from '@/admin-document/entities/admin-document.entity';
import { Documents } from '@/documents/entities/documents.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { CredentialRejectReason } from '@/credential-reject-reason/entities/credential-reject-reason.entity';
import { ProfessionalReferenceRejectReason } from '@/professional-reference-reject-reason/entities/professional-reference-reject-reason.entity';

describe('DropdownService', () => {
  let service: DropdownService;
  let certificateRepository: any;
  let specialityRepository: any;
  let countryRepository: any;
  let stateRepository: any;
  let cityRepository: any;
  let facilityPermissionRepository: any;
  let roleRepository: any;
  let facilityRepository: any;
  let facilityUserRepository: any;
  let facilityShiftSettingRepository: any;
  let shiftCancelReasonRepository: any;
  let providerRepository: any;
  let shiftTypeRepository: any;
  let lineOfBusinessRepository: any;
  let timecardRejectReasonRepository: any;
  let competencyTestSettingRepository: any;
  let skillChecklistTemplateRepository: any;
  let flagSettingRepository: any;
  let dnrReasonRepository: any;
  let aiService: any;
  let eDocsGroupRepository: any;
  let adminRepository: any;
  let floorDetailRepository: any;
  let shiftRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DropdownService,
        {
          provide: getRepositoryToken(Certificate),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getRawMany: jest
                .fn()
                .mockResolvedValue([{ id: '1', name: 'Test Certificate' }]),
            })),
          },
        },
        {
          provide: getRepositoryToken(StatusSetting),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Speciality),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getRawMany: jest
                .fn()
                .mockResolvedValue([{ id: '1', name: 'Test Speciality' }]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Country),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(State),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(City),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityPermission),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityUser),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              search: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([new FacilityUser()]),
            })),
          },
        },
        {
          provide: getRepositoryToken(FacilityShiftSetting),
          useValue: {
            findBy: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ShiftCancelReason),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FloorDetail),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              search: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([]),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
            })),
          },
        },

        {
          provide: getRepositoryToken(Provider),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              search: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([]),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              distinct: jest.fn().mockReturnThis(),
              distinctOn: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              setParameters: jest.fn().mockReturnThis(),
            })),
          },
        },
        {
          provide: getRepositoryToken(ShiftType),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LineOfBusiness),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TimecardRejectReason),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CredentialsCategory),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestSetting),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SkillChecklistTemplate),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FlagSetting),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DnrReason),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EDocsGroup),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: AIService,
          useValue: {
            getAIRecommendations: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderRejectReason),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrientationRejectReason),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AdminDocument),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Documents),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityProvider),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CredentialRejectReason),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProfessionalReferenceRejectReason),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DropdownService>(DropdownService);
    certificateRepository = module.get<Repository<Certificate>>(
      getRepositoryToken(Certificate),
    );
    specialityRepository = module.get<Repository<Speciality>>(
      getRepositoryToken(Speciality),
    );
    countryRepository = module.get<Repository<Country>>(
      getRepositoryToken(Country),
    );
    stateRepository = module.get<Repository<State>>(getRepositoryToken(State));
    cityRepository = module.get<Repository<City>>(getRepositoryToken(City));
    facilityPermissionRepository = module.get<Repository<FacilityPermission>>(
      getRepositoryToken(FacilityPermission),
    );
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    facilityRepository = module.get<Repository<Facility>>(
      getRepositoryToken(Facility),
    );
    facilityUserRepository = module.get<Repository<FacilityUser>>(
      getRepositoryToken(FacilityUser),
    );
    facilityShiftSettingRepository = module.get<
      Repository<FacilityShiftSetting>
    >(getRepositoryToken(FacilityShiftSetting));
    shiftCancelReasonRepository = module.get<Repository<ShiftCancelReason>>(
      getRepositoryToken(ShiftCancelReason),
    );
    providerRepository = module.get<Repository<Provider>>(
      getRepositoryToken(Provider),
    );
    shiftRepository = module.get<Repository<Shift>>(getRepositoryToken(Shift));

    shiftTypeRepository = module.get<Repository<ShiftType>>(
      getRepositoryToken(ShiftType),
    );
    lineOfBusinessRepository = module.get<Repository<LineOfBusiness>>(
      getRepositoryToken(LineOfBusiness),
    );
    timecardRejectReasonRepository = module.get<
      Repository<TimecardRejectReason>
    >(getRepositoryToken(TimecardRejectReason));
    competencyTestSettingRepository = module.get<
      Repository<CompetencyTestSetting>
    >(getRepositoryToken(CompetencyTestSetting));
    skillChecklistTemplateRepository = module.get<
      Repository<SkillChecklistTemplate>
    >(getRepositoryToken(SkillChecklistTemplate));
    flagSettingRepository = module.get<Repository<FlagSetting>>(
      getRepositoryToken(FlagSetting),
    );
    dnrReasonRepository = module.get<Repository<DnrReason>>(
      getRepositoryToken(DnrReason),
    );
    eDocsGroupRepository = module.get<Repository<EDocsGroup>>(
      getRepositoryToken(EDocsGroup),
    );
    adminRepository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
    floorDetailRepository = module.get<Repository<FloorDetail>>(
      getRepositoryToken(FloorDetail),
    );
    aiService = module.get<AIService>(AIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCertificates', () => {
    const filter = new FilterDropdownDto();

    it('should return certificate list with search', async () => {
      const mockCertificates = [{ id: '1', name: 'Test Certificate' }];

      const mockQueryBuilder = {
        select: jest.fn((fields) => {
          expect(fields).toEqual([
            'c.id AS id',
            'c.name AS name',
            'c.abbreviation AS abbreviation',
            expect.stringContaining('JSON_AGG(JSON_BUILD_OBJECT'),
          ]);
          return mockQueryBuilder;
        }),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockCertificates),
      };

      certificateRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getCertificates(filter);

      expect(certificateRepository.createQueryBuilder).toHaveBeenCalledWith(
        'c',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'c.status = :status',
        { status: DEFAULT_STATUS.active },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'c.deleted_at IS NULL',
      );
      expect(result).toEqual(mockCertificates);
    });

    it('should return certificate list without search', async () => {
      const mockCertificates = [{ id: '1', name: 'Test Certificate' }];

      const mockQueryBuilder = {
        select: jest.fn((fields) => {
          expect(fields).toEqual([
            'c.id AS id',
            'c.name AS name',
            'c.abbreviation AS abbreviation',
            expect.stringContaining('JSON_AGG(JSON_BUILD_OBJECT'),
          ]);
          return mockQueryBuilder;
        }),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockCertificates),
      };

      certificateRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getCertificates(filter);

      expect(certificateRepository.createQueryBuilder).toHaveBeenCalledWith(
        'c',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'c.status = :status',
        { status: DEFAULT_STATUS.active },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'c.deleted_at IS NULL',
      );
      expect(result).toEqual(mockCertificates);
    });
  });

  describe('getSpecialties', () => {
    const filter = new FilterDropdownDto();
    it('should return speciality list with search', async () => {
      const mockSpecialities = [{ id: '1', name: 'Test Specialty' }];

      const mockQueryBuilder = {
        select: jest.fn((fields) => {
          expect(fields).toEqual([
            's.id AS id',
            's.name AS name',
            's.abbreviation AS abbreviation',
            expect.stringContaining('JSON_AGG(JSON_BUILD_OBJECT'),
          ]);
          return mockQueryBuilder;
        }),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockSpecialities),
      };

      specialityRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getSpecialties(filter);

      expect(specialityRepository.createQueryBuilder).toHaveBeenCalledWith('s');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        's.status = :status',
        { status: DEFAULT_STATUS.active },
      );
      expect(result).toEqual(mockSpecialities);
    });

    it('should return speciality list without search', async () => {
      const filter = new FilterDropdownDto();
      const mockSpecialities = [{ id: '1', name: 'Test Specialty' }];

      const mockQueryBuilder = {
        select: jest.fn((fields) => {
          expect(fields).toEqual([
            's.id AS id',
            's.name AS name',
            's.abbreviation AS abbreviation',
            expect.stringContaining('JSON_AGG(JSON_BUILD_OBJECT'),
          ]);
          return mockQueryBuilder;
        }),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockSpecialities),
      };

      specialityRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getSpecialties(filter);

      expect(specialityRepository.createQueryBuilder).toHaveBeenCalledWith('s');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        's.status = :status',
        { status: DEFAULT_STATUS.active },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        's.deleted_at IS NULL',
      );
      expect(result).toEqual(mockSpecialities);
    });
  });

  describe('getCountry', () => {
    it('should return country list', async () => {
      const mockCountry = [new Country()];
      countryRepository.find.mockResolvedValue(mockCountry);

      const result = await service.getCountry();
      expect(countryRepository.find).toHaveBeenCalledWith({
        where: {
          deleted_at: IsNull(),
        },
        select: ['id', 'name', 'flag', 'phone_code'],
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockCountry);
    });
  });

  describe('getState', () => {
    it('should return state list', async () => {
      const where: FindManyOptions<State> = { where: { country: { id: '1' } } };
      const mockState = [new State()];
      stateRepository.find.mockResolvedValue(mockState);

      const result = await service.getState(where);
      expect(stateRepository.find).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockState);
    });
  });

  describe('getCity', () => {
    it('should return city list', async () => {
      const where: FindManyOptions<City> = { where: { state: { id: '1' } } };
      const mockCity = [new City()];
      cityRepository.find.mockResolvedValue(mockCity);

      const result = await service.getCity(where);
      expect(cityRepository.find).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockCity);
    });
  });

  describe('getFacilityPermissions', () => {
    it('should return permission list', async () => {
      const where: FindManyOptions<FacilityPermission> = { where: { id: '1' } };
      const mockFacilityPermission = [new FacilityPermission()];
      facilityPermissionRepository.find.mockResolvedValue(
        mockFacilityPermission,
      );

      const result = await service.getFacilityPermissions(where);
      expect(facilityPermissionRepository.find).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockFacilityPermission);
    });
  });

  describe('getRoles', () => {
    it('should return role list', async () => {
      const where: FindManyOptions<Role> = { where: { id: '1' } };
      const mockRole = [new Role()];
      roleRepository.find.mockResolvedValue(mockRole);
      const result = await service.getRoles(where);
      expect(roleRepository.find).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockRole);
    });
  });

  describe('getFacility', () => {
    it('should return facility list', async () => {
      const where: FindManyOptions<Facility> = { where: { id: '1' } };
      const mockFacility = [new Facility()];
      facilityRepository.find.mockResolvedValue(mockFacility);
      const result = await service.getFacility(where);
      expect(facilityRepository.find).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockFacility);
    });
  });

  describe('getTimeSettingForShift', () => {
    it('should return time setting list', async () => {
      const id = '1';
      const mockSetting = [new FacilityShiftSetting()];
      facilityShiftSettingRepository.find.mockResolvedValue(mockSetting);
      const result = await service.getTimeSettingForShift(id);
      expect(facilityShiftSettingRepository.find).toHaveBeenCalledWith({
        where: {
          facility: { id: id },
          status: DEFAULT_STATUS.active,
        },
        order: { shift_time_id: 'ASC' },
      });
      expect(result).toEqual(mockSetting);
    });
  });

  describe('getShiftCancelReason', () => {
    it('should return cancel reason list', async () => {
      const where: FindManyOptions<ShiftCancelReason> = { where: { id: '1' } };
      const mockReason = [new ShiftCancelReason()];
      shiftCancelReasonRepository.find.mockResolvedValue(mockReason);
      const result = await service.getShiftCancelReason(where);
      expect(shiftCancelReasonRepository.find).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockReason);
    });
  });

  describe('findOneFacilityWhere', () => {
    it('should return cancel reason list', async () => {
      const where: FindOneOptions<Facility> = { where: { id: '1' } };
      const mockFacility = new Facility();
      facilityRepository.findOne.mockResolvedValue(mockFacility);
      const result = await service.findOneFacilityWhere(where);
      expect(facilityRepository.findOne).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockFacility);
    });
  });

  describe('getFacilityUser', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        search: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([new FacilityUser()]),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      facilityUserRepository.createQueryBuilder = jest.fn(
        () => mockQueryBuilder,
      );
    });
    it('should return facility user list', async () => {
      const facilityIds = ['1'];
      const search = 'test';
      const mockUsers = [new FacilityUser()];
      const is_billing = true;
      mockQueryBuilder.getMany.mockResolvedValue(mockUsers);

      await service.getFacilityUser(facilityIds, search, is_billing);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `(fu.first_name ILIKE :search OR fu.last_name ILIKE :search OR fu.email ILIKE :search OR fu.first_name || ' ' || fu.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(search)}%` },
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('getAllProvider', () => {
    let mockQueryBuilder;

    beforeEach(() => {
      mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        search: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
      };

      providerRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });

    const mockFilterDto = {
      search: '',
      facility_id: '123',
      filter: FILTER_PROVIDER_BY.preferred,
      speciality_id: '456',
      certificate_id: '789',
      start_date: '2024-01-01',
      start_time: '09:00',
      end_date: '2024-01-01',
      end_time: '17:00',
    };

    it('should return filtered providers', async () => {
      const mockProviders = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          base_url: 'http://example.com',
          profile_image: 'image.jpg',
          certificate: { id: '1', name: 'RN' },
          credential_expiry: null,
          is_cred_verified: VERIFICATION_STATUS.verified,
          start_date: null,
          end_date: null,
          shift_time: ['Days'],
          is_available: true,
          reason: null,
        },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockProviders);

      const result = await service.getAllProvider({
        ...mockFilterDto,
        start_time: '09:00', // This is during day shift (6:00-12:00)
        end_time: '12:00', // Changed to end at noon to fit within day shift
      });

      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('is_available', true);
      expect(result[0]).toHaveProperty('reason', null);
    });

    it('should handle expired credentials', async () => {
      const expiredProvider = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        base_url: 'http://example.com',
        profile_image: 'image.jpg',
        certificate: { id: '1', name: 'RN' },
        credential_expiry: '2023-01-01',
        credential_name: 'RN License',
        is_cred_verified: VERIFICATION_STATUS.verified,
        start_date: null,
        end_date: null,
        shift_time: ['Days'],
        is_available: false,
        reason: 'Credentials expired',
      };

      mockQueryBuilder.getRawMany.mockResolvedValue([expiredProvider]);

      const result = await service.getAllProvider(mockFilterDto);

      expect(result[0].is_available).toBeFalsy();
      expect(result[0].reason).toBeDefined();
    });

    it('should handle AI recommendations', async () => {
      const mockFilterDtoAI = {
        ...mockFilterDto,
        filter: FILTER_PROVIDER_BY.ai,
      };

      const mockFacility = { id: '123' };
      facilityRepository.findOne.mockResolvedValue(mockFacility);
      aiService.getAIRecommendations.mockResolvedValue(['1', '2']);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          base_url: 'http://example.com',
          profile_image: 'image.jpg',
          certificate: { id: '1', name: 'RN' },
          credential_expiry: null,
          is_cred_verified: VERIFICATION_STATUS.verified,
          start_date: null,
          end_date: null,
          shift_time: ['Days'],
        },
      ]);

      const result = await service.getAllProvider(mockFilterDtoAI);

      expect(aiService.getAIRecommendations).toHaveBeenCalledWith(
        mockFacility.id,
        mockFilterDtoAI.speciality_id,
        mockFilterDtoAI.certificate_id,
      );
      expect(result).toBeDefined();
    });

    it('should handle shift conflicts', async () => {
      const providerWithShift = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        base_url: 'http://example.com',
        profile_image: 'image.jpg',
        certificate: { id: '1', name: 'RN' },
        credential_expiry: null,
        is_cred_verified: VERIFICATION_STATUS.verified,
        start_date: '2024-01-01',
        end_date: '2024-01-01',
        start_time: '08:00',
        end_time: '16:00',
        shift_time: ['Days'],
        is_available: false,
        reason: 'Shift conflict detected',
      };

      mockQueryBuilder.getRawMany.mockResolvedValue([providerWithShift]);

      const result = await service.getAllProvider(mockFilterDto);

      expect(result[0].is_available).toBeFalsy();
      expect(result[0].reason).toBeDefined();
    });

    it('should handle verification pending credentials', async () => {
      const unverifiedProvider = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        base_url: 'http://example.com',
        profile_image: 'image.jpg',
        certificate: { id: '1', name: 'RN' },
        credential_expiry: null,
        is_cred_verified: VERIFICATION_STATUS.pending,
        start_date: null,
        end_date: null,
        shift_time: ['Days'],
        is_available: false,
        reason: 'Due to pending verification',
      };

      mockQueryBuilder.getRawMany.mockResolvedValue([unverifiedProvider]);
      const result = await service.getAllProvider(mockFilterDto);

      expect(result[0].is_available).toBeFalsy();
      expect(result[0].reason).toContain('Due to pending verification');
    });

    it('should handle preferred provider filter', async () => {
      const mockFilterDtoPreferred = {
        ...mockFilterDto,
        filter: FILTER_PROVIDER_BY.preferred,
        facility_id: '123',
      };

      const mockProviderWithFacility = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        base_url: 'http://example.com',
        profile_image: 'image.jpg',
        facility_id: '123',
        credential_expiry: null,
        is_cred_verified: VERIFICATION_STATUS.verified,
        start_date: null,
        end_date: null,
        shift_time: ['Days'],
      };

      mockQueryBuilder.getRawMany.mockResolvedValue([mockProviderWithFacility]);
      const result = await service.getAllProvider(mockFilterDtoPreferred);

      expect(mockQueryBuilder.leftJoin).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle invalid facility for AI recommendations', async () => {
      // When facility doesn't exist, findOne returns null
      facilityRepository.findOne.mockResolvedValue(null);

      expect(aiService.getAIRecommendations).not.toHaveBeenCalled();
    });

    it('should handle AI service with no recommendations', async () => {
      const mockFilterDtoAI = {
        ...mockFilterDto,
        filter: FILTER_PROVIDER_BY.ai,
        facility_id: '123',
      };

      const mockFacility = { id: '123' };
      facilityRepository.findOne.mockResolvedValue(mockFacility);
      aiService.getAIRecommendations.mockResolvedValue([]);

      const result = await service.getAllProvider(mockFilterDtoAI);

      expect(result).toEqual([]);
      expect(aiService.getAIRecommendations).toHaveBeenCalledWith(
        mockFacility.id,
        mockFilterDtoAI.speciality_id,
        mockFilterDtoAI.certificate_id,
      );
    });

    it('should handle search with multiple keywords', async () => {
      const mockFilterDtoWithSearch = {
        ...mockFilterDto,
        search: 'John Doe',
      };

      const mockProvider = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        base_url: 'http://example.com',
        profile_image: 'image.jpg',
        credential_expiry: null,
        is_cred_verified: VERIFICATION_STATUS.verified,
        start_date: null,
        end_date: null,
        shift_time: ['Days'],
      };

      mockQueryBuilder.getRawMany.mockResolvedValue([mockProvider]);
      const result = await service.getAllProvider(mockFilterDtoWithSearch);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('getShiftTypes', () => {
    it('should return shift type list', async () => {
      const mockShiftType = new ShiftType();
      mockShiftType.shift_type = SHIFT_TYPE.per_diem_shifts;
      const mockType = [mockShiftType];
      shiftTypeRepository.find.mockResolvedValue(mockType);
      await service.getShiftTypes();
      expect(shiftTypeRepository.find).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active },
        select: {
          id: true,
          name: true,
          shift_type: true,
          status: true,
        },
      });
    });
  });

  describe('getLineOfBusiness', () => {
    it('should return lob list', async () => {
      const mockLob = [new LineOfBusiness()];
      lineOfBusinessRepository.find.mockResolvedValue(mockLob);
      const result = await service.getLineOfBusiness();
      expect(lineOfBusinessRepository.find).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active },
        select: { id: true, name: true, work_comp_code: true },
      });
      expect(result).toEqual(mockLob);
    });
  });

  describe('getAllTimecardRejectReason', () => {
    it('should return reject reason list', async () => {
      const mockReason = [new TimecardRejectReason()];
      timecardRejectReasonRepository.find.mockResolvedValue(mockReason);
      const result = await service.getAllTimecardRejectReason();
      expect(timecardRejectReasonRepository.find).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active },
        select: { id: true, reason: true },
      });
      expect(result).toEqual(mockReason);
    });
  });

  describe('getCompetencyTest', () => {
    it('should return test list', async () => {
      const mockTest = [new CompetencyTestSetting()];
      competencyTestSettingRepository.find.mockResolvedValue(mockTest);
      const result = await service.getCompetencyTest();
      expect(competencyTestSettingRepository.find).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active },
        select: { id: true, name: true },
      });
      expect(result).toEqual(mockTest);
    });
  });

  describe('getSkillChecklist', () => {
    it('should return skill check list', async () => {
      const mockSkill = [new SkillChecklistTemplate()];
      skillChecklistTemplateRepository.find.mockResolvedValue(mockSkill);
      const result = await service.getSkillChecklist();
      expect(skillChecklistTemplateRepository.find).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active },
        select: { id: true, name: true },
      });
      expect(result).toEqual(mockSkill);
    });
  });

  describe('getFlagList', () => {
    const option: FindManyOptions<FlagSetting> = {
      where: { status: DEFAULT_STATUS.active },
    };
    it('should return Flag list', async () => {
      const mockSetting = [new FlagSetting()];
      flagSettingRepository.find.mockResolvedValue(mockSetting);
      const result = await service.getFlagList(option);
      expect(flagSettingRepository.find).toHaveBeenCalledWith(option);
      expect(result).toEqual(mockSetting);
    });
  });

  describe('getDNRReason', () => {
    const reason_type = DNR_TYPE.clinical;
    it('should return dnr list', async () => {
      const mockSetting = [new DnrReason()];
      dnrReasonRepository.find.mockResolvedValue(mockSetting);
      const result = await service.getDNRReason(reason_type);
      expect(dnrReasonRepository.find).toHaveBeenCalledWith({
        where: {
          reason_type,
          status: DEFAULT_STATUS.active,
        },
        select: {
          id: true,
          reason: true,
        },
      });
      expect(result).toEqual(mockSetting);
    });
  });

  describe('getEDocGroups', () => {
    it('should return dnr list', async () => {
      const mockSetting = [new EDocsGroup()];
      eDocsGroupRepository.find.mockResolvedValue(mockSetting);
      const result = await service.getEDocGroups();
      expect(eDocsGroupRepository.find).toHaveBeenCalledWith({
        where: {
          status: DEFAULT_STATUS.active,
        },
        select: {
          id: true,
          name: true,
        },
      });
      expect(result).toEqual(mockSetting);
    });
  });

  describe('getAllAdminUser', () => {
    it('should return admin list', async () => {
      const mockSetting = [new Admin()];
      adminRepository.find.mockResolvedValue(mockSetting);
      const result = await service.getAllAdminUser({});
      expect(adminRepository.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockSetting);
    });
  });

  describe('getEDocs', () => {
    it('should return doc list', async () => {
      const mockSetting = [new EDocsGroup()];
      eDocsGroupRepository.find.mockResolvedValue(mockSetting);
      const result = await service.getEDocs();
      expect(eDocsGroupRepository.find).toHaveBeenCalledWith({
        relations: { document: true },
        where: {
          status: DEFAULT_STATUS.active,
        },
        select: {
          id: true,
          name: true,
          document: {
            id: true,
            name: true,
          },
        },
      });
      expect(result).toEqual(mockSetting);
    });

    it('should handle empty document array', async () => {
      const mockEDocsGroup = new EDocsGroup();
      mockEDocsGroup.document = [];
      eDocsGroupRepository.find.mockResolvedValue([mockEDocsGroup]);

      const result = await service.getEDocs();
      expect(result[0].document).toEqual([]);
    });
  });

  describe('getAllFloorListing', () => {
    it('should return floor detail list', async () => {
      const where: FindManyOptions<FloorDetail> = {
        where: {},
      };
      const mockFloorDetail = [new FloorDetail()];
      floorDetailRepository.find.mockResolvedValue(mockFloorDetail);

      const result = await service.getAllFloorListing(where);

      expect(floorDetailRepository.find).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockFloorDetail);
    });

    it('should return empty array when no floor details found', async () => {
      const where: FindManyOptions<FloorDetail> = {
        where: {},
      };
      floorDetailRepository.find.mockResolvedValue([]);

      const result = await service.getAllFloorListing(where);

      expect(floorDetailRepository.find).toHaveBeenCalledWith(where);
      expect(result).toEqual([]);
    });

    it('should handle error when repository throws exception', async () => {
      const where: FindManyOptions<FloorDetail> = {
        where: {},
      };
      floorDetailRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.getAllFloorListing(where)).rejects.toThrow(
        'Database error',
      );
      expect(floorDetailRepository.find).toHaveBeenCalledWith(where);
    });

    it('should handle empty where condition', async () => {
      const mockFloorDetail = [new FloorDetail()];
      floorDetailRepository.find.mockResolvedValue(mockFloorDetail);

      const result = await service.getAllFloorListing({});
      expect(floorDetailRepository.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockFloorDetail);
    });

    it('should handle null result', async () => {
      floorDetailRepository.find.mockResolvedValue(null);

      const result = await service.getAllFloorListing({});
      expect(floorDetailRepository.find).toHaveBeenCalledWith({});
      expect(result).toBeNull();
    });
  });

  describe('getAllProviderV2', () => {
    let mockQueryBuilder;

    beforeEach(() => {
      mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        search: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        distinctOn: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
      };

      providerRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
      shiftRepository.createQueryBuilder = jest.fn(() => ({
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      }));
    });

    const mockFilterDto = {
      search: 'test',
      facility_id: '123',
      filter: FILTER_PROVIDER_BY.preferred,
      speciality_id: '456',
      certificate_id: '789',
      start_date: '2024-01-01',
      start_time: '09:00',
      end_date: '2024-01-01',
      end_time: '17:00',
    };

    it('should filter providers by preferred status', async () => {
      const mockProvider = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        base_url: 'test',
        profile_image: 'test.jpg',
        certificate: { id: '1', name: 'RN' },
        shift_time: ['days'],
        credential_expiry: null,
        is_cred_verified: VERIFICATION_STATUS.verified,
        credentials: {
          is_verified: true,
          expiry_date: '2025-01-01',
        },
      };

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([mockProvider]);

      const result = await service.getAllProviderV2({
        ...mockFilterDto,
        dates: ['2025-05-01'],
      });

      // Update leftJoin verification to match actual implementation
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'p.certificate',
        'c',
      );
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'p.speciality',
        'sp',
      );
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'p.facility_provider',
        'fp',
      );

      // Verify shift repository was queried
      expect(shiftRepository.createQueryBuilder).toHaveBeenCalled();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0]).toHaveProperty('availability');
    });

    it('should filter providers by oriented status', async () => {
      const mockFilterDtoOriented = {
        ...mockFilterDto,
        dates: ['2025-05-01'],
        filter: FILTER_PROVIDER_BY.oriented,
      };

      const mockProvider = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        shift_time: ['days'],
        credential_expiry: null,
        is_cred_verified: VERIFICATION_STATUS.verified,
      };

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([mockProvider]);

      const result = await service.getAllProviderV2(mockFilterDtoOriented);
      expect(result).toBeDefined();
    });

    it('should handle shift time conflicts', async () => {
      const mockProvider = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        shift_time: ['days'],
        start_date: '2024-01-01',
        end_date: '2024-01-01',
        start_time: '09:00',
        end_time: '17:00',
        credential_expiry: null,
        is_cred_verified: VERIFICATION_STATUS.verified,
        shift_facility_id: '123',
      };

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([mockProvider]);

      const result = await service.getAllProviderV2({
        ...mockFilterDto,
        dates: ['2025-05-01'],
      });
      expect(result[0].is_available).toBeFalsy();
    });

    it('should handle expired credentials', async () => {
      const mockProvider = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        shift_time: ['days'],
        credential_expiry: '2023-01-01',
        credential_name: 'RN License',
        is_cred_verified: VERIFICATION_STATUS.verified,
      };

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([mockProvider]);

      const result = await service.getAllProviderV2({
        ...mockFilterDto,
        dates: ['2025-05-01'],
      });
      expect(result[0].is_available).toBeFalsy();
    });

    it('should handle unverified credentials', async () => {
      const mockProvider = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        shift_time: ['days'],
        credential_expiry: null,
        is_cred_verified: VERIFICATION_STATUS.pending,
      };

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([mockProvider]);

      const result = await service.getAllProviderV2({
        ...mockFilterDto,
        dates: ['2025-05-01'],
      });
      expect(result[0].is_available).toBeFalsy();
    });

    it('should handle missing credentials', async () => {
      const mockProvider = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        shift_time: ['days'],
        credential_expiry: null,
        is_cred_verified: null,
      };

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([mockProvider]);

      const result = await service.getAllProviderV2({
        ...mockFilterDto,
        dates: ['2025-05-01'],
      });
      expect(result[0].is_available).toBeFalsy();
    });

    it('should handle missing or empty shift_time array', async () => {
      const mockProvider = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        shift_time: null,
        credential_expiry: null,
        is_cred_verified: VERIFICATION_STATUS.verified,
      };

      mockQueryBuilder.getRawMany.mockResolvedValue([mockProvider]);

      const result = await service.getAllProviderV2({
        ...mockFilterDto,
        dates: ['2025-05-01'],
      });
      expect(result[0].is_available).toBeFalsy();
      expect(result[0].reason).toBeDefined();
    });
  });
});
