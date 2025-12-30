import { Test, TestingModule } from '@nestjs/testing';
import { ShiftService } from './shift.service';
import { Shift } from './entities/shift.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateShiftDto } from './dto/create-shift.dto';
import { plainToInstance } from 'class-transformer';
import {
  DAY,
  DEFAULT_STATUS,
  SHIFT,
  SHIFT_STATUS,
  SHIFT_TYPE,
  TABLE,
} from '@/shared/constants/enum';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { FacilityShiftFilterDto } from './dto/facility-shift-filter.dto';
import { ProviderShiftFilterDto } from './dto/provider-shift-filter.dto';
import { Provider } from '@/provider/entities/provider.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { ProviderScheduledShiftFilterDto } from './dto/provider-scheduled-shift-filter.dto';
import { CONSTANT } from '@/shared/constants/message';
import { Admin } from '@/admin/entities/admin.entity';
import { TimeEntryApproval } from '@/time-entry-approval/entities/time-entry-approval.entity';
import response from '@/shared/response';
import {
  accountingRole,
  active,
  show_cancellation_notes,
} from '@/shared/constants/constant';
import { ProviderAddress } from '@/provider-address/entities/provider-address.entity';
import { ScheduleRequestSetting } from '@/schedule-request-settings/entities/schedule-request-setting.entity';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';
import { AllShiftFilterDto } from './dto/all-shift-filter.dto';
import { ActivityService } from '@/activity/activity.service';
import { ProviderCancelledShift } from './entities/provider-cancelled-shift.entity';
import { DashboardService } from '@/dashboard/dashboard.service';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { ProviderLateShift } from './entities/provider-late-shift.entity';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { NotificationService } from '@/notification/notification.service';
import { ProviderService } from '@/provider/provider.service';
import { AIService } from '@/shared/helpers/ai-service';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { ShiftInvitationService } from '@/shift-invitation/shift-invitation.service';
import { QueueDebugService } from '@/jobs/queue-debug.service';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { RateGroup } from '@/rate-groups/entities/rate-group.entity';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { Disbursement } from '@/disbursement/entities/disbursement.entity';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';

describe('ShiftService', () => {
  let service: ShiftService;
  let shiftRepository: any;
  let shiftInvitationRepository: any;
  let facilityRepository: any;
  let timeEntryApprovalRepository: any;
  let adminRepository: any;
  let scheduleRequestSettingRepository: any;
  let dashboardService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftService,
        {
          provide: getRepositoryToken(Shift),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            query: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              distinct: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([new Shift()]),
              getRawOne: jest.fn().mockResolvedValue(new Shift()),
            })),
          },
        },
        // Add missing service mocks
        { provide: AIService, useValue: {} },
        {
          provide: NotificationService,
          useValue: { createUserSpecificNotification: jest.fn() },
        },
        {
          provide: FirebaseNotificationService,
          useValue: { sendNotificationToOne: jest.fn() },
        },
        { provide: ShiftInvitationService, useValue: {} },
        { provide: AutoSchedulingService, useValue: {} },
        { provide: ProviderService, useValue: {} },
        { provide: ShiftNotificationService, useValue: {} },
        { provide: EncryptDecryptService, useValue: {} },
        { provide: AutoSchedulingSettingService, useValue: {} },
        {
          provide: getRepositoryToken(ShiftInvitation),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ShiftRequest),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TimeEntryApproval),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ScheduleRequestSetting),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderOrientation),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              setParameter: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue(new Facility()),
            })),
          },
        },
        {
          provide: ActivityService,
          useValue: {
            logShiftActivity: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderCancelledShift),
          useValue: {},
        },
        {
          provide: DashboardService,
          useValue: { getApplicationProgress: jest.fn() },
        },
        {
          provide: getRepositoryToken(Timecard),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProviderLateShift),
          useValue: {},
        },
        {
          provide: QueueDebugService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(RateGroup),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityHoliday),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Disbursement),
          useValue: {},
        },
        {
          provide: BranchAppService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AccountingSetting),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ShiftService>(ShiftService);
    shiftRepository = module.get<Repository<Shift>>(getRepositoryToken(Shift));
    shiftInvitationRepository = module.get<Repository<ShiftInvitation>>(
      getRepositoryToken(ShiftInvitation),
    );
    facilityRepository = module.get<Repository<Facility>>(
      getRepositoryToken(Facility),
    );
    timeEntryApprovalRepository = module.get<Repository<TimeEntryApproval>>(
      getRepositoryToken(TimeEntryApproval),
    );
    adminRepository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
    scheduleRequestSettingRepository = module.get<
      Repository<ScheduleRequestSetting>
    >(getRepositoryToken(ScheduleRequestSetting));
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDatesForWeekdaysInRange', () => {
    it('should return the correct dates for weekdays in range', () => {
      const result = service.getDatesForWeekdaysInRange(
        '2023-01-01',
        '2023-01-14',
        [0, 1],
      );
      expect(result).toEqual([
        '2023-01-01',
        '2023-01-02',
        '2023-01-08',
        '2023-01-09',
      ]);
    });
  });

  describe('incrementDate', () => {
    it('should increment the date correctly', () => {
      const result = service.incrementDate('2024-12-31', 2);
      expect(result).toBe('2025-01-02');
    });

    it('should handle month transition correctly', () => {
      const result = service.incrementDate('2023-01-31', 1);
      expect(result).toBe('2023-02-01');
    });

    it('should handle leap year correctly', () => {
      const result = service.incrementDate('2024-02-28', 1);
      expect(result).toBe('2024-02-29');
    });

    it('should handle non-leap year correctly', () => {
      const result = service.incrementDate('2023-02-28', 1);
      expect(result).toBe('2023-03-01');
    });
  });

  describe('createConsecutiveDaysShift', () => {
    it('should create consecutive days shift correctly', async () => {
      const createShiftDto = new CreateShiftDto();
      createShiftDto.openings = 2;
      createShiftDto.start_date = '2023-01-01';
      createShiftDto.end_date = '2023-01-01';
      await service.createConsecutiveDaysShift(createShiftDto);
    });
  });

  describe('createConsecutiveWeeksShift', () => {
    it('should create consecutive weeks shift correctly', async () => {
      const createShiftDto = new CreateShiftDto();
      createShiftDto.openings = 2;
      createShiftDto.start_date = '2023-01-01';
      createShiftDto.days = [0, 1]; // Sundays and Mondays

      const dateList = ['2023-01-01', '2023-01-02', '2023-01-08', '2023-01-09'];
      jest
        .spyOn(service, 'getDatesForWeekdaysInRange')
        .mockReturnValue(dateList);
      await service.createConsecutiveWeeksShift(createShiftDto);

      expect(service.getDatesForWeekdaysInRange).toHaveBeenCalledWith(
        '2023-01-01',
        '2023-01-15',
        [0, 1],
      );
    });
  });

  describe('createShiftForSpecificDates', () => {
    it('should create shifts for specific dates correctly', async () => {
      const createShiftDto = new CreateShiftDto();
      createShiftDto.specific_dates = [
        { date: '2023-01-01', openings: 2 },
        { date: '2023-01-02', openings: 3 },
      ];

      await service.createShiftForSpecificDates(createShiftDto);
    });
  });

  describe('createShift', () => {
    it('should create shifts and invitations correctly', async () => {
      const createShiftDto = new CreateShiftDto();
      createShiftDto.openings = 1;
      createShiftDto.invited_provider = ['provider1', 'provider2'];

      const mockShift = { id: '1' } as Shift;
      jest.spyOn(service, 'create').mockResolvedValue(mockShift);
      jest.spyOn(shiftInvitationRepository, 'save').mockResolvedValue(null);

      await service.createShift(createShiftDto);
      expect(shiftInvitationRepository.save).toHaveBeenCalledWith([
        { provider: 'provider1', shift: '1' },
        { provider: 'provider2', shift: '1' },
      ]);
    });

    it('should create shifts without invitations if no invited providers', async () => {
      const createShiftDto = new CreateShiftDto();
      createShiftDto.openings = 2;

      const mockShift = { id: '1' } as Shift;
      jest.spyOn(service, 'create').mockResolvedValue(mockShift);
      jest.spyOn(shiftInvitationRepository, 'save');

      await service.createShift(createShiftDto);

      expect(service.create).toHaveBeenCalledTimes(2);
      expect(service.create).toHaveBeenCalledWith(createShiftDto);

      expect(shiftInvitationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('cloneShift', () => {
    const mockShift = new Shift();
    it('should clone shift successfully', async () => {
      shiftRepository.save.mockResolvedValue(mockShift);

      const result = await service.cloneShift(mockShift);
      expect(shiftRepository.save).toHaveBeenCalledWith(mockShift);
      expect(result).toEqual(plainToInstance(Shift, mockShift));
    });
  });

  describe('findOneWhere', () => {
    const mockShift = new Shift();
    it('should find one shift', async () => {
      const option: any = { where: { id: '1' } };
      shiftRepository.findOne.mockResolvedValue(mockShift);

      const result = await service.findOneWhere(option);
      expect(shiftRepository.findOne).toHaveBeenCalledWith(option);
      expect(result).toEqual(plainToInstance(Shift, mockShift));
    });
  });

  describe('updateWhere', () => {
    const where: any = { id: '1' };
    const updateShiftDto = new UpdateShiftDto();
    it('should find one shift', async () => {
      shiftRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateWhere(where, updateShiftDto);
      expect(shiftRepository.update).toHaveBeenCalledWith(
        where,
        updateShiftDto,
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('update', () => {
    const id = '1';
    const updateShiftDto = new UpdateShiftDto();
    it('should find one shift', async () => {
      shiftRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(id, updateShiftDto);
      expect(shiftRepository.update).toHaveBeenCalledWith(id, {
        ...updateShiftDto,
        updated_at: expect.any(String),
      });
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('remove', () => {
    const where: any = { id: '1' };
    const deleteDto = new DeleteDto();
    it('should find one shift', async () => {
      shiftRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.remove(where, deleteDto);
      expect(shiftRepository.update).toHaveBeenCalledWith(
        { ...where, deleted_at: IsNull() },
        {
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('findAll', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([new Shift()]),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    it('should return all un-posted shift list', async () => {
      const id = '1';

      const mockShifts = [new Shift()];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockShifts);

      await service.findAll(id);

      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });

  describe('findAllShift', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([new Shift()]),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    const id = '1';
    const queryParamsDto = new FacilityShiftFilterDto();
    it('should return all posted shift list without filters', async () => {
      const mockShifts = [new Shift(), new Shift()]; // Ensure this matches your expected output
      const count = mockShifts.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(mockShifts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.findAllShift(id, queryParamsDto);

      expect(result).toEqual([mockShifts, count]);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should return all posted shift list with filters', async () => {
      queryParamsDto.search = '0119';
      queryParamsDto.from_date = expect.any(String);
      queryParamsDto.to_date = expect.any(String);
      queryParamsDto.shift_id_from = '0010';
      queryParamsDto.shift_id_to = '0020';
      queryParamsDto.certificate = ['1'];
      queryParamsDto.speciality = ['1'];
      queryParamsDto.status = [SHIFT_STATUS.scheduled];
      queryParamsDto.type = SHIFT_TYPE.per_diem_shifts;
      const mockShifts = [new Shift(), new Shift()];
      const count = mockShifts.length;

      mockQueryBuilder.getRawMany.mockResolvedValue(mockShifts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      await service.findAllShift(id, queryParamsDto);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('shiftDetail', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(new Shift()),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    const id = '1';
    it('should return null if shift not found', async () => {
      shiftRepository.findOne.mockResolvedValue(null);

      const result = await service.shiftDetail(id);
      expect(result).toEqual(null);
    });

    it('should return shift details', async () => {
      const mockShift = new Shift();
      mockShift.created_by_type = TABLE.admin;
      mockShift.updated_by_type = TABLE.admin;
      mockShift.cancelled_by_type = TABLE.admin;
      shiftRepository.findOne.mockResolvedValue(mockShift);

      await service.shiftDetail(id);
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });

    it('should return shift details', async () => {
      const mockShift = new Shift();
      mockShift.created_by_type = TABLE.facility;
      mockShift.updated_by_type = TABLE.facility;
      mockShift.cancelled_by_type = TABLE.facility;
      shiftRepository.findOne.mockResolvedValue(mockShift);

      await service.shiftDetail(id);
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });

    it('should return shift details', async () => {
      const mockShift = new Shift();
      mockShift.created_by_type = TABLE.provider;
      mockShift.updated_by_type = TABLE.provider;
      mockShift.cancelled_by_type = TABLE.provider;
      shiftRepository.findOne.mockResolvedValue(mockShift);

      await service.shiftDetail(id);
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });
  });

  describe('getProviderShifts', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([new Shift()]),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    const provider = new Provider();
    provider.address = [new ProviderAddress()];
    provider.certificate = new Certificate();
    provider.preferred_state = ['1'];
    const status = new StatusSetting();
    status.id = 'ss-1234';
    status.name = active;
    provider.status = status;

    const queryParamsDto = new ProviderShiftFilterDto();

    it('should return all shift list without filters', async () => {
      const mockShifts = [new Shift(), new Shift()]; // Ensure this matches your expected output
      const count = mockShifts.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(mockShifts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.getProviderShifts(queryParamsDto, provider);

      expect(result).toEqual([mockShifts, count]);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should return all shift list with filters', async () => {
      queryParamsDto.search = 'test';
      queryParamsDto.day = DAY.weekend;
      queryParamsDto.shift = SHIFT.day;
      queryParamsDto.shift_type = [SHIFT_TYPE.per_diem_shifts];
      const mockShifts = [new Shift(), new Shift()];
      const count = mockShifts.length;

      mockQueryBuilder.getRawMany.mockResolvedValue(mockShifts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      await service.getProviderShifts(queryParamsDto, provider);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should return all shift list with filters', async () => {
      queryParamsDto.search = 'test';
      queryParamsDto.day = DAY.weekday;
      queryParamsDto.shift = SHIFT.evening;
      queryParamsDto.shift_type = [SHIFT_TYPE.per_diem_shifts];
      const mockShifts = [new Shift(), new Shift()];
      const count = mockShifts.length;

      mockQueryBuilder.getRawMany.mockResolvedValue(mockShifts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      await service.getProviderShifts(queryParamsDto, provider);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should return all shift list with filters', async () => {
      queryParamsDto.search = 'test';
      queryParamsDto.day = DAY.weekday;
      queryParamsDto.shift = SHIFT.night;
      queryParamsDto.shift_type = [SHIFT_TYPE.per_diem_shifts];
      const mockShifts = [new Shift(), new Shift()];
      const count = mockShifts.length;

      mockQueryBuilder.getRawMany.mockResolvedValue(mockShifts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      await service.getProviderShifts(queryParamsDto, provider);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('getProviderShiftsWithinRadius', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([new Shift()]),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    const provider = new Provider();
    provider.address = [new ProviderAddress()];
    provider.certificate = new Certificate();
    provider.speciality = new Speciality();
    provider.speciality.id = '1';
    provider.preferred_state = ['1'];

    const latitude = '0.000';
    const longitude = '0.000';
    const radius = 50;
    it('should return all shift list without filters', async () => {
      const mockShifts = [new Shift(), new Shift()]; // Ensure this matches your expected output
      const count = mockShifts.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(mockShifts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.getProviderShiftsWithinRadius(
        provider,
        latitude,
        longitude,
        radius,
      );

      expect(result).toEqual([mockShifts, count]);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('getShiftDetailsForProvider', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(new Shift()),
        setParameters: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    it('should return shift details', async () => {
      const id = '1';
      const mockProvider = new Provider();
      mockProvider.id = '21';
      mockProvider.certificate = new Certificate();
      mockProvider.speciality = new Speciality();
      mockProvider.address = [new ProviderAddress()];
      dashboardService.getApplicationProgress.mockResolvedValue({
        overall_progress: 100,
      });
      await service.getShiftDetailsForProvider(id, mockProvider);
      expect(dashboardService.getApplicationProgress).toHaveBeenCalledWith(
        mockProvider,
      );
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });
  });

  describe('getFacilityDetailsForProvider', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(new Facility()),
        leftJoin: jest.fn().mockReturnThis(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      facilityRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    it('should return shift details', async () => {
      const id = '1';
      const userId = '1';

      await service.getFacilityDetailsForProvider(id, userId);
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });
  });

  describe('getFacilityShifts', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([new Shift()]),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    it('should return shift details', async () => {
      const id = '1';
      const queryParamsDto = new QueryParamsDto();
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];

      await service.getFacilityShifts(id, queryParamsDto, mockProvider);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('getFacilityShifts', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([new Shift()]),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    it('should return shift list', async () => {
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];
      const providerScheduledShiftFilterDto =
        new ProviderScheduledShiftFilterDto();
      providerScheduledShiftFilterDto.order = { start_date: 'DESC' };

      await service.getProviderScheduledShifts(
        providerScheduledShiftFilterDto,
        mockProvider,
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should return shift list with filters', async () => {
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];
      const providerScheduledShiftFilterDto =
        new ProviderScheduledShiftFilterDto();
      providerScheduledShiftFilterDto.search = 'test';
      providerScheduledShiftFilterDto.status = SHIFT_STATUS.requested;
      providerScheduledShiftFilterDto.date = '2024-08-07';
      providerScheduledShiftFilterDto.order = { start_date: 'DESC' };
      await service.getProviderScheduledShifts(
        providerScheduledShiftFilterDto,
        mockProvider,
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should return shift list with filters', async () => {
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];
      const providerScheduledShiftFilterDto =
        new ProviderScheduledShiftFilterDto();
      providerScheduledShiftFilterDto.search = 'test';
      providerScheduledShiftFilterDto.date = '2024-08-07';
      providerScheduledShiftFilterDto.order = { start_date: 'DESC' };
      await service.getProviderScheduledShifts(
        providerScheduledShiftFilterDto,
        mockProvider,
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should return shift list with filters', async () => {
      const mockProvider = new Provider();
      mockProvider.address = [new ProviderAddress()];
      const providerScheduledShiftFilterDto =
        new ProviderScheduledShiftFilterDto();
      providerScheduledShiftFilterDto.search = 'test';
      providerScheduledShiftFilterDto.status = SHIFT_STATUS.scheduled;
      providerScheduledShiftFilterDto.date = '2024-08-07';
      providerScheduledShiftFilterDto.order = { start_date: 'DESC' };
      await service.getProviderScheduledShifts(
        providerScheduledShiftFilterDto,
        mockProvider,
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('getScheduledShiftDetailsForProvider', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(new Shift()),
        groupBy: jest.fn().mockReturnThis(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    it('should return null if shift not found', async () => {
      const id = '1';
      const mockProvider = new Provider();
      const mockAddress = new ProviderAddress();
      mockAddress.street = 'test';
      mockProvider.address = [mockAddress];
      const timezone = 5;
      shiftRepository.findOne.mockResolvedValue(null);

      const result = await service.getScheduledShiftDetailsForProvider(
        id,
        mockProvider,
        timezone,
      );
      expect(result).toEqual(null);
    });

    it('should return shift details', async () => {
      const id = '1';
      const mockProvider = new Provider();
      const mockAddress = new ProviderAddress();
      mockAddress.street = null;
      mockProvider.address = [mockAddress];
      const timezone = 5;
      const mockSetting = new ScheduleRequestSetting();
      mockSetting.value = '10';
      const mockShift = new Shift();
      mockShift.status = SHIFT_STATUS.requested;
      mockShift.cancelled_by_type = TABLE.facility;
      shiftRepository.findOne.mockResolvedValue(mockShift);
      scheduleRequestSettingRepository.findOne.mockResolvedValueOnce(null);
      scheduleRequestSettingRepository.findOne.mockResolvedValueOnce(
        mockSetting,
      );

      await service.getScheduledShiftDetailsForProvider(
        id,
        mockProvider,
        timezone,
      );
      expect(scheduleRequestSettingRepository.findOne).toHaveBeenNthCalledWith(
        1,
        {
          where: { setting: show_cancellation_notes, value: 'active' },
        },
      );
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });

    it('should return shift details', async () => {
      const id = '1';
      const mockProvider = new Provider();
      const mockAddress = new ProviderAddress();
      mockAddress.street = 'test';
      mockProvider.address = [mockAddress];
      const timezone = 5;
      const mockShift = new Shift();
      mockShift.cancelled_by_type = TABLE.facility;
      const mockSetting = new ScheduleRequestSetting();
      mockSetting.value = '10';
      mockShift.status = SHIFT_STATUS.scheduled;
      shiftRepository.findOne.mockResolvedValue(mockShift);
      scheduleRequestSettingRepository.findOne.mockResolvedValueOnce(
        mockSetting,
      );
      scheduleRequestSettingRepository.findOne.mockResolvedValueOnce(
        mockSetting,
      );

      await service.getScheduledShiftDetailsForProvider(
        id,
        mockProvider,
        timezone,
      );
      expect(scheduleRequestSettingRepository.findOne).toHaveBeenNthCalledWith(
        1,
        {
          where: { setting: show_cancellation_notes, value: 'active' },
        },
      );

      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });
  });

  describe('getCurrentMonthSummaryByDate', () => {
    it('should return month summary as per date', async () => {
      const date = '2024-08-07';
      const provider_id = '1';
      const mockSetting = new ScheduleRequestSetting();

      scheduleRequestSettingRepository.findOne.mockResolvedValueOnce(
        mockSetting,
      );
      await service.getCurrentMonthSummaryByDate(date, provider_id);
    });
  });

  // describe('getFacilityShifts', () => {
  //   let mockQueryBuilder;
  //   beforeEach(() => {
  //     mockQueryBuilder = {
  //       where: jest.fn().mockReturnThis(),
  //       andWhere: jest.fn().mockReturnThis(),
  //       leftJoin: jest.fn().mockReturnThis(),
  //       select: jest.fn().mockReturnThis(),
  //       addOrderBy: jest.fn().mockReturnThis(),
  //       limit: jest.fn().mockReturnThis(),
  //       offset: jest.fn().mockReturnThis(),
  //       getCount: jest.fn().mockReturnThis(),
  //       getRawMany: jest.fn().mockResolvedValue([new Shift()]),
  //     };

  //     // Setup mock for createQueryBuilder to return the mock query builder
  //     shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  //   });
  //   it('should return shift list', async () => {
  //     const id = '1';
  //     const filterTimecardDto = new FilterTimecardDto();

  //     await service.getAllTimeCards(id, filterTimecardDto);
  //     expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
  //     expect(mockQueryBuilder.getCount).toHaveBeenCalled();
  //   });

  //   it('should return shift list with filters', async () => {
  //     const id = '1';
  //     const filterTimecardDto = new FilterTimecardDto();
  //     filterTimecardDto.search = 'test';
  //     filterTimecardDto.timecard_status = [TIMECARD_STATUS.resolved];
  //     filterTimecardDto.start_date = '2023-08-07';
  //     filterTimecardDto.end_date = '2024-08-07';
  //     filterTimecardDto.order = { created_at: 'DESC' };
  //     await service.getAllTimeCards(id, filterTimecardDto);
  //     expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
  //     expect(mockQueryBuilder.getCount).toHaveBeenCalled();
  //   });

  //   it('should return shift list with filters', async () => {
  //     const id = '1';
  //     const filterTimecardDto = new FilterTimecardDto();
  //     filterTimecardDto.search = 'test';
  //     filterTimecardDto.timecard_status = [TIMECARD_STATUS.resolved];
  //     filterTimecardDto.start_date = '2023-08-07';
  //     filterTimecardDto.end_date = '2024-08-07';
  //     filterTimecardDto.order = { 's.created_at': 'DESC' };
  //     await service.getAllTimeCards(id, filterTimecardDto);
  //     expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
  //     expect(mockQueryBuilder.getCount).toHaveBeenCalled();
  //   });
  // });

  // describe('getAllTimeCardDetails', () => {
  //   let mockQueryBuilder;
  //   beforeEach(() => {
  //     mockQueryBuilder = {
  //       where: jest.fn().mockReturnThis(),
  //       leftJoin: jest.fn().mockReturnThis(),
  //       select: jest.fn().mockReturnThis(),
  //       getRawOne: jest.fn().mockResolvedValue(new Shift()),
  //     };

  //     // Setup mock for createQueryBuilder to return the mock query builder
  //     shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  //   });
  //   const id = '1';
  //   it('should return null if shift not found', async () => {
  //     shiftRepository.findOne.mockResolvedValue(null);

  //     const result = await service.getAllTimeCardDetails(id);
  //     expect(shiftRepository.findOne).toHaveBeenCalledWith({
  //       where: { id: id },
  //       select: {
  //         id: true,
  //         timecard_approve_type: true,
  //         timecard_rejected_type: true,
  //       },
  //     });
  //     expect(result).toEqual(null);
  //   });

  //   it('should return shift details', async () => {
  //     const mockShift = new Shift();
  //     mockShift.timecard_approve_type = TABLE.facility;
  //     mockShift.timecard_rejected_type = TABLE.facility;
  //     shiftRepository.findOne.mockResolvedValue(mockShift);

  //     await service.getAllTimeCardDetails(id);
  //     expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
  //   });

  //   it('should return shift details', async () => {
  //     const mockShift = new Shift();
  //     mockShift.timecard_approve_type = TABLE.facility_user;
  //     mockShift.timecard_rejected_type = TABLE.facility_user;
  //     shiftRepository.findOne.mockResolvedValue(mockShift);

  //     await service.getAllTimeCardDetails(id);
  //     expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
  //   });
  // });

  describe('calculateClockOutAndBreakDuration', () => {
    const req: any = { user: { id: '1', role: TABLE.provider } };
    const shift = new Shift();
    shift.facility = new Facility();
    shift.provider = new Provider();

    shift.facility.name = 'test';
    shift.provider.id = '1';
    it('should return CLOCK_IN message if clock_in is provided', async () => {
      const updateShiftDto = new UpdateShiftDto();
      updateShiftDto.clock_in = '08:00:00';
      const result = await service.calculateClockOutAndBreakDuration(
        updateShiftDto,
        shift,
        req,
      );
      expect(result.message).toBe(CONSTANT.SUCCESS.CLOCK_IN);
      expect(result.updateShiftDto.status).toBe(SHIFT_STATUS.ongoing);
    });

    it('should return BREAK_STARTED message if break_start_time is provided', async () => {
      shift.total_break = 4;
      const mockTime = new TimeEntryApproval();
      mockTime.value = '4';
      const updateShiftDto = new UpdateShiftDto();
      updateShiftDto.break_start_time = '11:00:10'; // 1 hour in seconds
      timeEntryApprovalRepository.findOne.mockResolvedValue(mockTime);
      const result = await service.calculateClockOutAndBreakDuration(
        updateShiftDto,
        shift,
        req,
      );
      expect(result.message).toBe(CONSTANT.SUCCESS.BREAK_STARTED);
      expect(result.responseBody).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.BREAK_LIMIT_REACHED,
          data: {},
        }),
      );
      expect(result.updateShiftDto.status).toBe(SHIFT_STATUS.ongoing);
    });

    it('should calculate total_worked time and return CLOCK_OUT message if clock_out is provided', async () => {
      const updateShiftDto = new UpdateShiftDto();
      shift.break_duration = 3600; // 1 hour break
      updateShiftDto.clock_out = '17:00:00';
      updateShiftDto.clock_out_date = '2024-08-01';

      const result = await service.calculateClockOutAndBreakDuration(
        updateShiftDto,
        shift,
        req,
      );

      expect(result.message).toBe(CONSTANT.SUCCESS.CLOCK_OUT);
      expect(result.updateShiftDto.status).toBe(SHIFT_STATUS.completed);
    });

    it('should calculate break duration and return BREAK_ENDED message if break_end_time is provided', async () => {
      const updateShiftDto = new UpdateShiftDto();
      shift.break_start_time = '11:00:10'; // 1 hour in seconds
      updateShiftDto.break_end_time = '12:00:10'; // 2 hours in seconds

      const result = await service.calculateClockOutAndBreakDuration(
        updateShiftDto,
        shift,
        req,
      );
      expect(result.message).toBe(CONSTANT.SUCCESS.BREAK_ENDED);
      expect(result.updateShiftDto.break_start_time).toBeNull();
      expect(result.updateShiftDto.break_end_time).toBeNull();
    });

    it('should set status to ongoing if neither clock_out nor break_end_time are provided', async () => {
      const updateShiftDto = new UpdateShiftDto();
      updateShiftDto.clock_in = '08:00:00';
      const result = await service.calculateClockOutAndBreakDuration(
        updateShiftDto,
        shift,
        req,
      );
      expect(result.updateShiftDto.status).toBe(SHIFT_STATUS.ongoing);
    });
  });

  describe('calculateTimestamp', () => {
    it('should calculate timestamp with positive timezone offset', () => {
      const timezone = '02:00';
      const currentTime = new Date(new Date().toUTCString()).getTime();
      const offset = (2 * 60 + 0) * 60000; // 2 hours in milliseconds

      const result = service.calculateTimestamp(timezone);
      expect(result).toBe(currentTime + offset);
    });
  });

  describe('getAllAdmins', () => {
    it('should return admin list', async () => {
      adminRepository.find.mockResolvedValue([new Admin()]);

      const result = await service.getAllAdmins();
      expect(adminRepository.find).toHaveBeenCalledWith({
        where: {
          role: {
            role_section_permission: {
              section: { name: accountingRole, status: DEFAULT_STATUS.active },
            },
          },
        },
      });
      expect(result).toEqual([new Admin()]);
    });
  });

  describe('checkIsProviderAvailable', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(new Shift()),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });
    const shift = new ShiftRequest();
    shift.provider = new Provider();
    shift.shift = new Shift();
    it('should check is provider available or not', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new Shift());

      const result = await service.checkIsProviderAvailable(shift);
      expect(result).toEqual(new Shift());
    });
  });

  describe('findAllShiftsWithFilters', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([new Shift()]),
      };

      shiftRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });

    const filterDto = new AllShiftFilterDto();

    it('should return all shifts without filters', async () => {
      const mockShifts = [new Shift(), new Shift()];
      const count = mockShifts.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(mockShifts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.findAllShiftsWithFilters(filterDto);

      expect(result).toEqual([mockShifts, count]);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should apply search filter correctly', async () => {
      filterDto.search = 'test';
      await service.findAllShiftsWithFilters(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `(
          s.shift_id ILIKE :search OR 
          f.name ILIKE :search OR 
          provider.first_name ILIKE :search OR 
          provider.last_name ILIKE :search OR 
          CONCAT(provider.first_name, ' ', provider.last_name) ILIKE :search OR 
          a.first_name ILIKE :search OR 
          a.last_name ILIKE :search OR 
          CONCAT(a.first_name, ' ', a.last_name) ILIKE :search OR 
          fu.first_name ILIKE :search OR 
          fu.last_name ILIKE :search OR 
          CONCAT(fu.first_name, ' ', fu.last_name) ILIKE :search OR 
          s.created_by_type::text ILIKE :search OR 
          s.status::text ILIKE :search OR 
          sp.name ILIKE :search OR 
          sp.abbreviation ILIKE :search OR 
          c.name ILIKE :search OR 
          c.abbreviation ILIKE :search
        )`,
        { search: '%test%' },
      );
    });

    it('should apply certificate filter correctly', async () => {
      filterDto.certificate = ['cert1', 'cert2'];
      await service.findAllShiftsWithFilters(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'c.id IN (:...certificateIds)',
        { certificateIds: ['cert1', 'cert2'] },
      );
    });

    it('should apply speciality filter correctly', async () => {
      filterDto.speciality = ['spec1', 'spec2'];
      await service.findAllShiftsWithFilters(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sp.id IN (:...specialityIds)',
        { specialityIds: ['spec1', 'spec2'] },
      );
    });

    it('should apply facility filter correctly', async () => {
      filterDto.facility = ['fac1', 'fac2'];
      await service.findAllShiftsWithFilters(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'f.id IN (:...facilityIds)',
        { facilityIds: ['fac1', 'fac2'] },
      );
    });

    it('should apply status filter correctly', async () => {
      filterDto.status = [SHIFT_STATUS.auto_scheduling, SHIFT_STATUS.completed];
      await service.findAllShiftsWithFilters(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        's.status IN (:...status)',
        { status: [SHIFT_STATUS.auto_scheduling, SHIFT_STATUS.completed] },
      );
    });

    it('should apply shift ID range filter correctly', async () => {
      filterDto.shift_id_from = '001';
      filterDto.shift_id_to = '100';
      await service.findAllShiftsWithFilters(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        's.shift_id BETWEEN :from_id AND :to_id',
        { from_id: '001', to_id: '100' },
      );
    });

    it('should apply ordering correctly', async () => {
      filterDto.order = { created_at: 'DESC' };
      await service.findAllShiftsWithFilters(filterDto);

      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'created_at',
        'DESC',
        'NULLS LAST',
      );
    });

    it('should apply pagination correctly', async () => {
      filterDto.limit = '10';
      filterDto.offset = '0';
      await service.findAllShiftsWithFilters(filterDto);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
    });
  });
});
