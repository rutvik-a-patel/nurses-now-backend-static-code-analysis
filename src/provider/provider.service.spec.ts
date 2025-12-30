import { Test, TestingModule } from '@nestjs/testing';
import { ProviderService } from './provider.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { FindManyOptions, Repository } from 'typeorm';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { EditProviderDto } from './dto/edit-provider.dto';
import { AddProviderDataDto } from './dto/add-provider-data.dto';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { ProviderAvailability } from './entities/provider-availability.entity';
import { TimeLabelSetting } from './entities/time-label-setting.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { ProviderCancelledShift } from '@/shift/entities/provider-cancelled-shift.entity';
import { ProviderLateShift } from '@/shift/entities/provider-late-shift.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { VoidShift } from '@/shift/entities/void-shift.entity';

describe('ProviderService', () => {
  let service: ProviderService;
  let providerRepository: any;
  let competencyTestSettingRepository: any;
  let skillChecklistTemplateRepository: any;

  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
    getRawOne: jest.fn(),
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderService,
        {
          provide: getRepositoryToken(Provider),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
              getManyAndCount: jest
                .fn()
                .mockResolvedValue([[new Provider()], 1]),
              getRawOne: jest.fn().mockResolvedValue(new Provider()),
            })),
          },
        },
        {
          provide: getRepositoryToken(ProviderAvailability),
          useValue: { findOne: jest.fn(), update: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(Certificate),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Speciality),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderNotificationSetting),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderAnalytics),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestSetting),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(SkillChecklistTemplate),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(TimeLabelSetting),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderEvaluation),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityProvider),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProviderCancelledShift),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProviderLateShift),
          useValue: {},
        },

        {
          provide: getRepositoryToken(StatusSetting),
          useValue: {},
        },
        {
          provide: BranchAppService,
          useValue: {
            updateEmployee: jest.fn(),
            createEmployee: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(VoidShift),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProviderService>(ProviderService);
    providerRepository = module.get<Repository<Provider>>(
      getRepositoryToken(Provider),
    );

    competencyTestSettingRepository = module.get<
      Repository<CompetencyTestSetting>
    >(getRepositoryToken(CompetencyTestSetting));
    skillChecklistTemplateRepository = module.get<
      Repository<SkillChecklistTemplate>
    >(getRepositoryToken(SkillChecklistTemplate));
    providerRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    competencyTestSettingRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
    skillChecklistTemplateRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new admin', async () => {
      const createProviderDto = new CreateProviderDto();
      const provider = new Provider();
      providerRepository.save.mockResolvedValue(provider);
      const result = await service.create(createProviderDto);
      expect(providerRepository.save).toHaveBeenCalledWith(createProviderDto);
      expect(result).toEqual(provider);
    });
  });

  describe('findOneWhere', () => {
    it('should find one admin by criteria', async () => {
      const options = { where: { email: 'test@example.com' } };
      const provider = new Provider();
      providerRepository.findOne.mockResolvedValue(provider);
      const result = await service.findOneWhere(options);
      expect(providerRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(provider);
    });
  });

  describe('findAll', () => {
    it('should find one admin by criteria', async () => {
      const options: FindManyOptions<Provider> = { where: { id: '1' } };
      const provider = [new Provider()];
      const count = provider.length;
      providerRepository.findAndCount.mockResolvedValue([provider, count]);
      const result = await service.findAll(options);
      expect(providerRepository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([provider, count]);
    });
  });

  describe('findOneV2', () => {
    let mockProviderQueryBuilder;
    beforeEach(() => {
      mockProviderQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      providerRepository.createQueryBuilder = jest.fn(
        () => mockProviderQueryBuilder,
      );
    });

    it('should return provider data', async () => {
      const id = '1';
      const provider = new Provider();
      mockProviderQueryBuilder.getRawOne.mockResolvedValue(provider);
      const result = await service.findOneV2(id);
      expect(result).toEqual(provider);
      expect(mockProviderQueryBuilder.getRawOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an admin and return the result', async () => {
      const updateProviderDto = new UpdateProviderDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateProviderDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      providerRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateProviderDto);

      expect(providerRepository.update).toHaveBeenCalledWith(id, expectedDto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('findProfileData', () => {
    it('should return all contacts based on query parameters without search', async () => {
      const contacts = new Provider(); // Ensure this matches your expected output
      mockQueryBuilder.getRawOne.mockResolvedValue(contacts);

      const result = await service.findProfileData('id');
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled(); // Ensure 'where' was not called since no search param
      expect(result).toEqual(contacts);
    });
  });

  describe('updateWhere', () => {
    it('should update multiple admins based on a condition', async () => {
      const where = { email: 'update@example.com' };
      const editProviderDto = new EditProviderDto();
      const updateResult = { affected: 3 };
      providerRepository.update.mockResolvedValue(updateResult);
      const updatedProvider = new Provider();
      updatedProvider.id = 'updated-id';
      updatedProvider.first_name = 'First';
      updatedProvider.last_name = 'Last';
      updatedProvider.email = 'updated@example.com';
      updatedProvider.mobile_no = '1234567890';
      updatedProvider.country_code = '+1';
      providerRepository.findOne.mockResolvedValue(updatedProvider);

      const result = await service.updateWhere(where, editProviderDto);
      expect(providerRepository.update).toHaveBeenCalledWith(
        where,
        editProviderDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('addProviderData', () => {
    it('should update multiple admins based on a condition', async () => {
      const where = { email: 'update@example.com' };
      const addProviderDataDto = new AddProviderDataDto();
      const updateResult = { affected: 3 };
      providerRepository.update.mockResolvedValue(updateResult);
      const updatedProvider = new Provider();
      updatedProvider.id = 'created-id';
      updatedProvider.first_name = 'First';
      updatedProvider.last_name = 'Last';
      updatedProvider.email = 'created@example.com';
      updatedProvider.mobile_no = '1234567890';
      updatedProvider.country_code = '+1';
      providerRepository.findOne.mockResolvedValue(updatedProvider);

      const result = await service.addProviderData(where, addProviderDataDto);
      expect(providerRepository.update).toHaveBeenCalledWith(
        where,
        addProviderDataDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('getProviderDetails', () => {
    const id = '1';
    it('should return provider details', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(new Provider());

      const result = await service.getProviderDetails(id);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(`p.id = :id`, {
        id: id,
      });
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(result).toEqual(new Provider());
    });
  });

  describe('getCompetencyList', () => {
    const mockCertificate = new Certificate();
    mockCertificate.id = '1';
    const user = new Provider();
    user.certificate = mockCertificate;
    it('should return test list', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        new CompetencyTestSetting(),
      ]);

      const result = await service.getCompetencyList(user);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `cr.certificate_or_speciality @> :certificate_id AND cs.status = :status`,
        {
          certificate_id: [user?.certificate?.id],
          status: DEFAULT_STATUS.active,
        },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toEqual([new CompetencyTestSetting()]);
    });
  });

  describe('getSkillChecklist', () => {
    const mockCertificate = new Certificate();
    mockCertificate.id = '1';
    const user = new Provider();
    user.certificate = mockCertificate;
    it('should return test list', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        new SkillChecklistTemplate(),
      ]);

      const result = await service.getSkillChecklist(user);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `cr.certificate_or_speciality @> :certificate_id AND st.status = :status`,
        {
          certificate_id: [user?.certificate?.id],
          status: DEFAULT_STATUS.active,
        },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toEqual([new SkillChecklistTemplate()]);
    });
  });
});
