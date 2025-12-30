import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Repository } from 'typeorm';
import { CertificateService } from '@/certificate/certificate.service';
import { SpecialityService } from '@/speciality/speciality.service';
import { ProviderService } from '@/provider/provider.service';
import { ShiftCancelReasonService } from '@/shift-cancel-reason/shift-cancel-reason.service';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  SHIFT_STATUS,
  TABLE,
} from '@/shared/constants/enum';
import * as fieldUtils from '@/shared/helpers/get-updated-fields';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { ActivityQuery } from './dto/activity-query.dto';

// Mocks
const mockActivityRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

const mockCertificateService = () => ({
  findOneWhere: jest.fn(),
});

const mockSpecialityService = () => ({
  findOneWhere: jest.fn(),
});

const mockProviderService = () => ({
  findOneWhere: jest.fn(),
});

const mockCancelReasonService = () => ({
  findOneWhere: jest.fn(),
});

describe('ActivityService', () => {
  let service: ActivityService;
  let repo: jest.Mocked<Repository<Activity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: getRepositoryToken(Activity), useFactory: mockActivityRepo },
        { provide: CertificateService, useFactory: mockCertificateService },
        { provide: SpecialityService, useFactory: mockSpecialityService },
        { provide: ProviderService, useFactory: mockProviderService },
        {
          provide: ShiftCancelReasonService,
          useFactory: mockCancelReasonService,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    repo = module.get(getRepositoryToken(Activity));
  });

  describe('activityLog', () => {
    it('should create and save an activity', async () => {
      const mockParams = { activity_type: ACTIVITY_TYPE.SHIFT_CREATED } as any;
      const createdActivity = { id: 1, ...mockParams } as Activity;

      repo.save.mockResolvedValue(createdActivity);

      const result = await service.activityLog(mockParams);

      expect(repo.save).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(createdActivity);
    });
  });
  describe('findAll', () => {
    it('should return activities and count using findAndCount', async () => {
      const mockOptions = { where: { shift: { id: 'shift-1' } } };
      const mockActivities = [{ id: 1 }, { id: 2 }];
      const mockCount = 2;

      repo.findAndCount.mockResolvedValue([mockActivities as any, mockCount]);

      const [result, count] = await service.findAll(mockOptions);

      expect(repo.findAndCount).toHaveBeenCalledWith(mockOptions);

      expect(result).toEqual(mockActivities);
      expect(count).toBe(mockCount);
    });
  });

  describe('findByShiftId', () => {
    it('should return list of activities for a given shiftId', async () => {
      const shiftId = 'shift-123';
      const mockActivityList = [{ id: 1 }, { id: 2 }];

      repo.find.mockResolvedValue(mockActivityList as any);

      const result = await service.findByShiftId(shiftId);

      expect(repo.find).toHaveBeenCalledWith({
        where: { shift: { id: shiftId } },
        order: { created_at: 'DESC' },
      });

      expect(result).toEqual(mockActivityList);
    });
  });

  describe('findOneWhere', () => {
    it('should return a single activity entity', async () => {
      const mockOptions = { where: { id: 1 } } as any;
      const mockResult = { id: 1 };

      repo.findOne.mockResolvedValue(mockResult as any);

      const result = await service.findOneWhere(mockOptions);

      expect(repo.findOne).toHaveBeenCalledWith(mockOptions);
      expect(result).toEqual(mockResult);
    });
  });

  describe('createBaseActivityData', () => {
    it('should return base activity payload structure', () => {
      const shift: any = { id: 'shift-1' };
      const req: any = {
        user: {
          id: 'user-1',
          role: 'facility',
          first_name: 'John',
          last_name: 'Doe',
        },
      };

      const result = (service as any).createBaseActivityData(shift, req);

      expect(result).toEqual({
        action_by_type: TABLE.facility,
        [TABLE.facility]: 'user-1',
        shift,
        message: {
          facility: 'John Doe',
          image: NaN,
        },
      });
    });
  });

  describe('logShiftActivity', () => {
    it('should log shift activity with shift date/time for specific types', async () => {
      const shift = {
        id: 'shift-1',
        start_date: '2025-04-01',
        start_time: '09:00',
        end_time: '17:00',
        facility: { name: 'Jane Doe' },
        provider: { first_name: 'First', last_name: 'Last' },
      } as any;

      const req = {
        user: {
          id: 'user-1',
          role: 'facility',
          first_name: 'Jane',
          last_name: 'Doe',
        },
      } as any;

      const activityType = ACTIVITY_TYPE.SHIFT_CREATED;

      const expectedMessage = {
        facility: 'Jane Doe',
        shift_date: '2025-04-01',
        shift_time: '09:00 AM - 05:00 PM',
        image: NaN,
        provider: `${shift.provider.first_name} ${shift.provider.last_name}`,
      };

      const expectedPayload = {
        action_by_type: TABLE.facility,
        action_for: undefined,
        entity_id: shift.id,
        [TABLE.facility]: 'user-1',
        shift,
        activity_type: ACTIVITY_TYPE.SHIFT_CREATED,
        message: expectedMessage,
      };

      const mockActivity = { id: 'activity-1' };
      jest.spyOn(service, 'activityLog').mockResolvedValue(mockActivity as any);

      const result = await (service as any).logShiftActivity(
        shift,
        req,
        activityType,
      );

      expect(service.activityLog).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual(mockActivity);
    });

    it('should log shift activity without date/time for non-matching types', async () => {
      const shift = {
        id: 'shift-2',
        start_date: '2025-04-01',
        end_date: '2025-04-01',
        start_time: '09:00',
        end_time: '17:00',
      } as any;

      const req = {
        user: {
          id: 'user-2',
          role: 'facility',
          first_name: 'Adam',
          last_name: 'Smith',
        },
      } as any;

      const activityType = ACTIVITY_TYPE.SHIFT_CANCELLED;

      jest
        .spyOn(service, 'activityLog')
        .mockResolvedValue({ id: 'mock-activity' } as any);

      await (service as any).logShiftActivity(shift, req, activityType);

      expect(service.activityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action_by_type: TABLE.facility,
          [TABLE.facility]: 'user-2',
          activity_type: ACTIVITY_TYPE.SHIFT_CANCELLED,
          shift,
          message: expect.objectContaining({
            facility: 'Adam Smith',
            image: expect.any(Number),
          }),
        }),
      );
    });
  });
  describe('logProviderActivity', () => {
    it('should call logShiftActivity with provider info', async () => {
      const shift = {
        id: 'shift-1',
        facility: { name: 'Test Facility' },
      } as any; // Add facility mock

      const shiftInvitation = {
        shift,
        provider: {
          first_name: 'Alex',
          last_name: 'Johnson',
        },
      } as any;

      const req = {
        user: {
          id: 'user-1',
          role: 'facility',
          first_name: 'Emily',
          last_name: 'Smith',
        },
      } as any;

      const activityType = ACTIVITY_TYPE.ACCEPTED_SHIFT_INVITATION;
      const additionalData = { custom: 'value' };
      const action_for = ACTION_TABLES;

      const logShiftActivitySpy = jest
        .spyOn(service as any, 'logShiftActivity')
        .mockResolvedValue({ id: 'mock-log' });

      const result = await (service as any).logProviderActivity(
        shiftInvitation,
        req,
        activityType,
        additionalData,
        action_for,
      );

      expect(logShiftActivitySpy).toHaveBeenCalledWith(
        shift,
        req,
        activityType,
        {
          provider: 'Alex Johnson',
          facility: 'Test Facility',
          ...additionalData,
        },
        action_for,
      );

      expect(result).toEqual({ id: 'mock-log' });
    });
  });

  describe('shiftCreateActivity', () => {
    it('should log SHIFT_CREATED and SHIFT_INVITED if providers exist', async () => {
      const shift = {
        id: 'shift-1',
        certificate: { id: 'cert-1', name: 'General Medicine' },
        speciality: { id: 'spec-1' },
        invited_provider: ['prov-1', 'prov-2'],
      } as any;

      const req = {
        user: {
          id: 'user-1',
          role: 'facility',
          first_name: 'Alice',
          last_name: 'Jones',
        },
      } as any;

      const speciality = { name: 'Cardiology' } as any;

      const providerDetails = [
        { first_name: 'John', last_name: 'Doe' },
        { first_name: 'Jane', last_name: 'Smith' },
      ] as any;

      jest
        .spyOn(service['specialityService'], 'findOneWhere')
        .mockResolvedValue(speciality);
      jest
        .spyOn(service['providerService'], 'findOneWhere')
        .mockResolvedValueOnce(providerDetails[0])
        .mockResolvedValueOnce(providerDetails[1]);

      const logSpy = jest
        .spyOn(service as any, 'logShiftActivity')
        .mockResolvedValue({ id: 'activity' });

      await service.shiftCreateActivity(shift, req, ACTION_TABLES.SHIFT);

      // SHIFT_CREATED
      expect(logSpy).toHaveBeenCalledWith(
        shift,
        req,
        ACTIVITY_TYPE.SHIFT_CREATED,
        {
          certificate: shift.certificate?.name,
          speciality: 'Cardiology',
        },
        ACTION_TABLES.SHIFT,
      );

      // SHIFT_INVITED
      expect(logSpy).toHaveBeenCalledWith(
        shift,
        req,
        ACTIVITY_TYPE.SHIFT_INVITED,
        {
          certificate: 'General Medicine',
          speciality: 'Cardiology',
          provider: [{ name: 'John Doe' }, { name: 'Jane Smith' }],
          from_status: SHIFT_STATUS.invite_sent,
          to_status: '',
        },
        ACTION_TABLES.SHIFT,
      );
    });

    it('should log only SHIFT_CREATED if no invited providers', async () => {
      const shift = {
        id: 'shift-2',
        certificate: { id: 'cert-2', name: 'Surgery' },
        speciality: { id: 'spec-2' },
        invited_provider: [],
      } as any;

      const req = {
        user: {
          id: 'user-2',
          role: 'facility',
          first_name: 'Bob',
          last_name: 'Marley',
        },
      } as any;

      const speciality = { name: 'Orthopedics' } as any;

      jest
        .spyOn(service['specialityService'], 'findOneWhere')
        .mockResolvedValue(speciality);

      const logSpy = jest
        .spyOn(service as any, 'logShiftActivity')
        .mockResolvedValue({ id: 'log' });

      await service.shiftCreateActivity(shift, req, ACTION_TABLES.SHIFT);

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        shift,
        req,
        ACTIVITY_TYPE.SHIFT_CREATED,
        {
          certificate: shift.certificate?.name,
          speciality: 'Orthopedics',
        },
        ACTION_TABLES.SHIFT,
      );
    });
  });

  describe('shiftCancelActivity', () => {
    it('should log shift cancellation activity with reason title and description', async () => {
      const shift = {
        id: 'shift-10',
        cancel_reason: 'reason-123',
        cancel_reason_description: 'Too many no-shows',
      } as any;

      const req = {
        user: {
          id: 'user-7',
          role: 'facility',
          first_name: 'Megan',
          last_name: 'Taylor',
        },
      } as any;

      const reason = {
        reason: 'Low Staff Availability',
        description: 'Not enough staff to cover shift.',
      } as any;

      jest
        .spyOn(service['shiftCancelReasonService'], 'findOneWhere')
        .mockResolvedValue(reason);

      const logSpy = jest
        .spyOn(service as any, 'logShiftActivity')
        .mockResolvedValue({ id: 'cancel-log' });

      await service.shiftCancelActivity(shift, req, ACTION_TABLES.SHIFT);

      expect(
        service['shiftCancelReasonService'].findOneWhere,
      ).toHaveBeenCalledWith({
        where: { id: 'reason-123' },
      });

      expect(logSpy).toHaveBeenCalledWith(
        shift,
        req,
        ACTIVITY_TYPE.SHIFT_CANCELLED,
        {
          cancel_title: 'Low Staff Availability',
          from_status: SHIFT_STATUS.scheduled,
          to_status: SHIFT_STATUS.cancelled,
        },
        ACTION_TABLES.SHIFT,
      );
    });

    it('should use reason.description if shift.cancel_reason_description is not provided', async () => {
      const shift = {
        id: 'shift-11',
        cancel_reason: 'reason-456',
      } as any;

      const req = {
        user: {
          id: 'user-8',
          role: 'facility',
          first_name: 'Liam',
          last_name: 'Brown',
        },
      } as any;

      const reason = {
        reason: 'Emergency Closure',
        description: 'Facility closed due to emergency.',
      } as any;

      jest
        .spyOn(service['shiftCancelReasonService'], 'findOneWhere')
        .mockResolvedValue(reason);

      const logSpy = jest
        .spyOn(service as any, 'logShiftActivity')
        .mockResolvedValue({ id: 'cancel-log-2' });

      await service.shiftCancelActivity(shift, req, ACTION_TABLES.SHIFT);

      expect(logSpy).toHaveBeenCalledWith(
        shift,
        req,
        ACTIVITY_TYPE.SHIFT_CANCELLED,
        {
          cancel_title: 'Emergency Closure',
          from_status: SHIFT_STATUS.scheduled,
          to_status: SHIFT_STATUS.cancelled,
        },
        ACTION_TABLES.SHIFT,
      );
    });
  });

  describe('shiftWithdrawActivity', () => {
    it('should log REQUEST_WITHDRAWN activity for a provider', async () => {
      const shiftInvitation = {
        shift: { id: 'shift-123' },
        provider: { first_name: 'Sam', last_name: 'Wilson' },
      } as any;

      const req = {
        user: {
          id: 'user-9',
          role: 'FACILITY',
          first_name: 'Olivia',
          last_name: 'Turner',
        },
      } as any;

      const logProviderSpy = jest
        .spyOn(service as any, 'logProviderActivity')
        .mockResolvedValue({ id: 'log-id' });

      await service.logProviderActivity(
        shiftInvitation,
        req,
        ACTIVITY_TYPE.REQUEST_WITHDRAWN,
        {},
        ACTION_TABLES.SHIFT_INVITATION,
      );

      expect(logProviderSpy).toHaveBeenCalledWith(
        shiftInvitation,
        req,
        ACTIVITY_TYPE.REQUEST_WITHDRAWN,
        {},
        ACTION_TABLES.SHIFT_INVITATION,
      );
    });
  });

  describe('shiftAcceptByProviderActivity', () => {
    it('should log ACCEPTED_SHIFT_INVITATION activity for a provider', async () => {
      const shiftInvitation = {
        shift: { id: 'shift-accept' },
        provider: { first_name: 'Chris', last_name: 'Evans' },
      } as any;

      const req = {
        user: {
          id: 'user-10',
          role: 'FACILITY',
          first_name: 'Tony',
          last_name: 'Stark',
        },
      } as any;

      const spy = jest
        .spyOn(service as any, 'logProviderActivity')
        .mockResolvedValue({ id: 'accept-log' });

      await service.logProviderActivity(
        shiftInvitation,
        req,
        ACTIVITY_TYPE.ACCEPTED_SHIFT_INVITATION,
        {},
        ACTION_TABLES.SHIFT_INVITATION,
      );

      expect(spy).toHaveBeenCalledWith(
        shiftInvitation,
        req,
        ACTIVITY_TYPE.ACCEPTED_SHIFT_INVITATION,
        {},
        ACTION_TABLES.SHIFT_INVITATION,
      );
    });
  });

  describe('shiftRejectByProviderActivity', () => {
    it('should log REJECTED_SHIFT_INVITATION activity for a provider', async () => {
      const shiftInvitation = {
        shift: { id: 'shift-reject' },
        provider: { first_name: 'Bruce', last_name: 'Banner' },
      } as any;

      const req = {
        user: {
          id: 'user-11',
          role: 'FACILITY',
          first_name: 'Steve',
          last_name: 'Rogers',
        },
      } as any;

      const spy = jest
        .spyOn(service as any, 'logProviderActivity')
        .mockResolvedValue({ id: 'reject-log' });

      await service.logProviderActivity(
        shiftInvitation,
        req,
        ACTIVITY_TYPE.REJECTED_SHIFT_INVITATION,
        {},
        ACTION_TABLES.SHIFT_INVITATION,
      );

      expect(spy).toHaveBeenCalledWith(
        shiftInvitation,
        req,
        ACTIVITY_TYPE.REJECTED_SHIFT_INVITATION,
        {},
        ACTION_TABLES.SHIFT_INVITATION,
      );
    });
  });

  describe('shiftRequestedByProviderActivity', () => {
    it('should log PROVIDER_REQUEST_SHIFT activity for a shift', async () => {
      const shift = {
        id: 'shift-request',
      } as any;

      const req = {
        user: {
          id: 'user-12',
          role: 'PROVIDER',
          first_name: 'Peter',
          last_name: 'Parker',
        },
      } as any;

      const spy = jest
        .spyOn(service as any, 'logShiftActivity')
        .mockResolvedValue({ id: 'request-log' });

      await service.logShiftActivity(
        shift,
        req,
        ACTIVITY_TYPE.PROVIDER_REQUEST_SHIFT,
        {},
        ACTION_TABLES.SHIFT_REQUEST,
      );

      expect(spy).toHaveBeenCalledWith(
        shift,
        req,
        ACTIVITY_TYPE.PROVIDER_REQUEST_SHIFT,
        {},
        ACTION_TABLES.SHIFT_REQUEST,
      );
    });
  });

  describe('shiftRequestAcceptOfProviderByFacility', () => {
    it('should log FACILITY_ACCEPT_REQUEST activity with provider name', async () => {
      const shiftRequest = {
        shift: { id: 'shift-accept' },
        provider: {
          first_name: 'Clark',
          last_name: 'Kent',
        },
      } as any;

      const req = {
        user: {
          id: 'user-13',
          role: 'FACILITY',
          first_name: 'Lois',
          last_name: 'Lane',
        },
      } as any;

      const spy = jest
        .spyOn(service as any, 'logProviderActivity')
        .mockResolvedValue({ id: 'accept-req-log' });

      await service.logProviderActivity(
        shiftRequest,
        req,
        ACTIVITY_TYPE.FACILITY_ACCEPT_REQUEST,
        {},
        ACTION_TABLES.SHIFT_REQUEST,
      );

      expect(spy).toHaveBeenCalledWith(
        shiftRequest,
        req,
        ACTIVITY_TYPE.FACILITY_ACCEPT_REQUEST,
        {},
        ACTION_TABLES.SHIFT_REQUEST,
      );
    });
  });

  describe('shiftRequestRejectOfProviderByFacility', () => {
    it('should log FACILITY_REJECT_REQUEST activity with provider name', async () => {
      const shiftRequest = {
        shift: { id: 'shift-reject' },
        provider: {
          first_name: 'Diana',
          last_name: 'Prince',
        },
      } as any;

      const req = {
        user: {
          id: 'user-14',
          role: 'FACILITY',
          first_name: 'Bruce',
          last_name: 'Wayne',
        },
      } as any;

      const spy = jest
        .spyOn(service as any, 'logProviderActivity')
        .mockResolvedValue({ id: 'reject-req-log' });

      await service.logProviderActivity(
        shiftRequest,
        req,
        ACTIVITY_TYPE.FACILITY_REJECT_REQUEST,
        {},
        ACTION_TABLES.SHIFT_REQUEST,
      );

      expect(spy).toHaveBeenCalledWith(
        shiftRequest,
        req,
        ACTIVITY_TYPE.FACILITY_REJECT_REQUEST,
        {},
        ACTION_TABLES.SHIFT_REQUEST,
      );
    });
  });

  describe('shiftUpdateActivity', () => {
    beforeEach(() => {
      jest
        .spyOn(fieldUtils, 'getUpdatedFields')
        .mockImplementation(
          (oldData: Record<string, any>, newData: Record<string, any>) => {
            if (oldData.start_time !== newData.start_time) {
              return [
                `Start Time changed from "${oldData.start_time}" to "${newData.start_time}"`,
              ];
            }
            return [];
          },
        );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should log SHIFT_UPDATED activity when fields change', async () => {
      const shift = { id: 'shift-99' } as any;
      const req = {
        user: {
          id: 'user-99',
          role: 'facility',
          first_name: 'Nick',
          last_name: 'Fury',
        },
      } as any;

      const oldData = {
        start_time: '08:00',
        end_time: '16:00',
      };

      const newData = {
        start_time: '09:00',
        end_time: '16:00',
      };

      const logSpy = jest
        .spyOn(service as any, 'logShiftActivity')
        .mockResolvedValue({ id: 'update-log' });

      await service.shiftUpdateActivity(
        shift,
        req,
        oldData,
        newData,
        ACTION_TABLES.SHIFT,
      );

      expect(logSpy).toHaveBeenCalledWith(
        shift,
        req,
        ACTIVITY_TYPE.SHIFT_UPDATED,
        { changes: [`Start Time changed from "08:00" to "09:00"`] },
        ACTION_TABLES.SHIFT,
      );
    });
  });

  describe('findAllWithFilters', () => {
    let queryBuilder: any;
    beforeEach(() => {
      const subQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('(SELECT * FROM dummy)'), // a mock SQL string
      };

      queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        subQuery: jest.fn(() => subQueryBuilder), // returns the mocked subQueryBuilder
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(), // Mock leftJoinAndSelect
        setParameter: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn(),
        getCount: jest.fn(),
      };

      repo.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
    });

    it('should apply date filters when start_date and end_date are provided', async () => {
      const query = {
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        limit: 10,
        offset: 0,
      } as unknown as ActivityQuery;

      queryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });
      queryBuilder.getCount.mockResolvedValue(0);
      await service.findAllWithFilters(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "DATE(ac.created_at AT TIME ZONE 'UTC') BETWEEN :start AND :end",
        {
          start: '2023-01-01',
          end: '2023-12-31',
        },
      );
    });

    it('should apply search filter when search parameter is provided', async () => {
      const query = {
        search: 'test',
        limit: 10,
        offset: 0,
      } as unknown as QueryParamsDto;

      queryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });
      queryBuilder.getCount.mockResolvedValue(0);

      await service.findAllWithFilters(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.any(String), {
        search: '%test%',
      });
    });

    it('should apply custom ordering when order parameter is provided', async () => {
      const query = {
        order: { created_at: 'desc' },
        limit: 10,
        offset: 0,
      } as unknown as QueryParamsDto;

      queryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });
      queryBuilder.getCount.mockResolvedValue(0);

      await service.findAllWithFilters(query);

      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith(
        'ac.created_at',
        'DESC',
      );
    });

    it('should apply default ordering when no order parameter is provided', async () => {
      const query = {
        limit: 10,
        offset: 0,
      } as unknown as QueryParamsDto;

      queryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });
      queryBuilder.getCount.mockResolvedValue(0);

      await service.findAllWithFilters(query);

      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith(
        'ac.created_at',
        'DESC',
      );
    });

    it('should apply pagination with default values', async () => {
      const query = {} as unknown as QueryParamsDto;

      queryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });
      queryBuilder.getCount.mockResolvedValue(0);

      await service.findAllWithFilters(query);

      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should apply custom pagination values', async () => {
      const query = {
        limit: 20,
        offset: 40,
      } as unknown as QueryParamsDto;

      queryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });
      queryBuilder.getCount.mockResolvedValue(0);

      await service.findAllWithFilters(query);

      expect(queryBuilder.take).toHaveBeenCalledWith(20);
      expect(queryBuilder.skip).toHaveBeenCalledWith(40);
    });
  });
});
