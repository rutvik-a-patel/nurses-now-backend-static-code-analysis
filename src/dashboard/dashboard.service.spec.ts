import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { Repository } from 'typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { ProviderAddress } from '@/provider-address/entities/provider-address.entity';
import { SkillChecklistModuleService } from '@/skill-checklist-module/skill-checklist-module.service';
import { Credential } from '@/credentials/entities/credential.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { active } from '@/shared/constants/constant';

describe('DashboardService', () => {
  let service: DashboardService;
  let providerRepository: Repository<Provider>;
  let providerCredentialRepository: any;
  let shiftRepository: Repository<Shift>;

  const mockProviderRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockProviderCredentialRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      distinctOn: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      getCount: jest.fn(),
    }),
  };

  const mockShiftRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
      getCount: jest.fn(),
    }),
  };

  const mockCredentialRepository = {};
  const mockEDocResponseRepository = {};
  const mockEDocRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Provider),
          useValue: mockProviderRepository,
        },
        {
          provide: getRepositoryToken(ProviderCredential),
          useValue: mockProviderCredentialRepository,
        },
        { provide: getRepositoryToken(Shift), useValue: mockShiftRepository },
        { provide: SkillChecklistModuleService, useValue: {} },
        {
          provide: getRepositoryToken(Credential),
          useValue: mockCredentialRepository,
        },
        {
          provide: getRepositoryToken(EDocResponse),
          useValue: mockEDocResponseRepository,
        },
        { provide: getRepositoryToken(EDoc), useValue: mockEDocRepository },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    providerRepository = module.get<Repository<Provider>>(
      getRepositoryToken(Provider),
    );
    providerCredentialRepository = module.get<Repository<ProviderCredential>>(
      getRepositoryToken(ProviderCredential),
    );
    shiftRepository = module.get<Repository<Shift>>(getRepositoryToken(Shift));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneProviderWhere', () => {
    it('should return a provider instance', async () => {
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];
      mockProviderRepository.findOne.mockResolvedValue(mockProvider);

      const result = await service.findOneProviderWhere({
        where: { id: '1' },
      });

      expect(providerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockProvider);
    });
  });

  describe('getProviderCredentialsSummary', () => {
    it('should return a list of provider credentials and the count', async () => {
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];
      const queryParamsDto = new QueryParamsDto();
      const credentialsList = [new ProviderCredential()];
      const count = 1;
      providerCredentialRepository
        .createQueryBuilder()
        .getRawMany.mockResolvedValue(credentialsList);
      providerCredentialRepository
        .createQueryBuilder()
        .getCount.mockResolvedValue(count);

      const result = await service.getProviderCredentialsSummary(
        mockProvider,
        queryParamsDto,
      );

      expect(result).toEqual([credentialsList, count]);
    });
  });

  describe('getOngoingShiftSummary', () => {
    it('should return the ongoing shift summary for the provider', async () => {
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];
      const ongoingShift = new Shift();
      mockShiftRepository
        .createQueryBuilder()
        .getRawOne.mockResolvedValue(ongoingShift);

      const result = await service.getOngoingShiftSummary(mockProvider);

      expect(shiftRepository.createQueryBuilder().getRawOne).toHaveBeenCalled();
      expect(result).toEqual(ongoingShift);
    });
  });

  describe('getUpcomingShiftSummary', () => {
    it('should return the upcoming shift summary for the provider', async () => {
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];
      const timezone = 120;
      const upcomingShift = { ...new Shift(), total_scheduled_shift: 3 };
      mockShiftRepository
        .createQueryBuilder()
        .getRawOne.mockResolvedValue(upcomingShift);

      const result = await service.getUpcomingShiftSummary(
        mockProvider,
        timezone,
      );

      expect(shiftRepository.createQueryBuilder().getRawOne).toHaveBeenCalled();
      expect(result).toEqual(upcomingShift);
    });
  });

  describe('getAvailableShiftCount', () => {
    it('should return the count of available shifts for the provider', async () => {
      const mockCertificate = new Certificate();
      const mockSpeciality = new Speciality();
      mockCertificate.id = '1';
      mockSpeciality.id = '1';
      const mockProvider = new Provider();
      const status = new StatusSetting();
      status.id = 'ss-1234';
      status.name = active;
      mockProvider.status = status;
      mockProvider.address = [new ProviderAddress()];
      mockProvider.certificate = mockCertificate;
      mockProvider.speciality = mockSpeciality;
      mockProvider.preferred_state = ['1'];
      const availableShiftCount = 5;
      mockShiftRepository
        .createQueryBuilder()
        .getCount.mockResolvedValue(availableShiftCount);

      const result = await service.getAvailableShiftCount(mockProvider);

      expect(shiftRepository.createQueryBuilder().getCount).toHaveBeenCalled();
      expect(result).toEqual(availableShiftCount);
    });
  });

  describe('getProviderDashboard', () => {
    it('should return the provider dashboard summary', async () => {
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];
      const timezone = 120;
      const ongoingShift = new Shift();
      const upcomingShift = { ...new Shift(), total_scheduled_shift: 3 };
      const availableShifts = 5;

      jest
        .spyOn(service, 'getOngoingShiftSummary')
        .mockResolvedValue(ongoingShift);
      jest
        .spyOn(service, 'getUpcomingShiftSummary')
        .mockResolvedValue(upcomingShift);
      jest
        .spyOn(service, 'getAvailableShiftCount')
        .mockResolvedValue(availableShifts);

      const result = await service.getProviderDashboard(mockProvider, timezone);

      expect(service.getOngoingShiftSummary).toHaveBeenCalledWith(mockProvider);
      expect(service.getUpcomingShiftSummary).toHaveBeenCalledWith(
        mockProvider,
        timezone,
      );
      expect(service.getAvailableShiftCount).toHaveBeenCalledWith(mockProvider);
      expect(result).toEqual({
        ongoing_shift: ongoingShift,
        upcoming_shift: upcomingShift,
        total_scheduled_shift: expect.any(Number),
        available_shifts: availableShifts,
      });
    });

    it('should return the provider dashboard summary', async () => {
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];
      const timezone = 120;
      const ongoingShift = null;
      const upcomingShift = null;
      const availableShifts = 0;

      jest
        .spyOn(service, 'getOngoingShiftSummary')
        .mockResolvedValue(ongoingShift);
      jest
        .spyOn(service, 'getUpcomingShiftSummary')
        .mockResolvedValue(upcomingShift);
      jest
        .spyOn(service, 'getAvailableShiftCount')
        .mockResolvedValue(availableShifts);

      const result = await service.getProviderDashboard(mockProvider, timezone);

      expect(service.getOngoingShiftSummary).toHaveBeenCalledWith(mockProvider);
      expect(service.getUpcomingShiftSummary).toHaveBeenCalledWith(
        mockProvider,
        timezone,
      );
      expect(service.getAvailableShiftCount).toHaveBeenCalledWith(mockProvider);
      expect(result).toEqual({
        ongoing_shift: ongoingShift,
        upcoming_shift: upcomingShift,
        total_scheduled_shift: expect.any(Number),
        available_shifts: availableShifts,
      });
    });
  });
});
