import { Test, TestingModule } from '@nestjs/testing';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { ShiftRequestService } from '@/shift-request/shift-request.service';
import { ShiftInvitationService } from '@/shift-invitation/shift-invitation.service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { AIService } from '@/shared/helpers/ai-service';
import { Shift } from './entities/shift.entity';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { Notification } from '@/notification/entities/notification.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  ADDRESS_TYPE,
  DEFAULT_STATUS,
  EJS_FILES,
  PushNotificationType,
  REPEAT_ON,
  SHIFT_INVITATION_STATUS,
  SHIFT_STATUS,
  TABLE,
  TIMECARD_STATUS,
} from '@/shared/constants/enum';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CancelShiftDto } from './dto/cancel-shift.dto';
import { In, IsNull, Not } from 'typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { PostShiftDto } from './dto/post-shift.dto';
import { FacilityShiftFilterDto } from './dto/facility-shift-filter.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { ProviderShiftFilterDto } from './dto/provider-shift-filter.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { ProviderScheduledShiftFilterDto } from './dto/provider-scheduled-shift-filter.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { ApproveTimecardDto } from './dto/approve-timecard.dto';
import { RejectTimecardDto } from './dto/reject-timecard.dto';
import { ProviderService } from '@/provider/provider.service';
import { RequestToWorkDto } from './dto/request-work.dto';
import { TimeEntryApprovalService } from '@/time-entry-approval/time-entry-approval.service';
import { uploadSheets } from '@/shared/constants/constant';
import { Admin } from '@/admin/entities/admin.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { AutoSchedulingSetting } from '@/auto-scheduling-setting/entities/auto-scheduling-setting.entity';
import { InitialShiftDto } from './dto/initial-shift.dto';
import { ProviderAddress } from '@/provider-address/entities/provider-address.entity';
import { AllShiftFilterDto } from './dto/all-shift-filter.dto';
import { ActivityService } from '@/activity/activity.service';
import { ProviderCancelledShift } from './entities/provider-cancelled-shift.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as moment from 'moment';
import { DeleteUnPostedDto } from './dto/delete-unposted.dto';
import { IRequest } from '@/shared/constants/types';
import { getQueueToken } from '@nestjs/bull';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import { QueueDebugService } from '@/jobs/queue-debug.service';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { TimecardRejectReason } from '@/timecard-reject-reason/entities/timecard-reject-reason.entity';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';
import { ProviderOrientationService } from '@/provider-orientation/provider-orientation.service';

describe('ShiftController', () => {
  let controller: ShiftController;
  let shiftService: any;
  let shiftRequest: any;
  let shiftInvitationService: any;
  let notificationService: any;
  let firebaseNotificationService: any;
  let shiftNotificationService: any;
  let providerService: any;
  let timeEntryApprovalService: any;
  let encryptDecryptService: any;
  let activityService: any;
  let autoSchedulingSettingService: any;

  const mockQueue = {
    add: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftController],
      providers: [
        {
          provide: getQueueToken('auto-scheduling'),
          useValue: mockQueue,
        },
        {
          provide: ShiftService,
          useValue: {
            createShift: jest.fn(),
            createConsecutiveDaysShift: jest.fn(),
            createConsecutiveWeeksShift: jest.fn(),
            createShiftForSpecificDates: jest.fn(),
            cloneShift: jest.fn(),
            findOneWhere: jest.fn(),
            updateWhere: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findAll: jest.fn(),
            findAllShift: jest.fn(),
            getProviderShifts: jest.fn(),
            getFacilityShifts: jest.fn(),
            getProviderScheduledShifts: jest.fn(),
            shiftDetail: jest.fn(),
            getShiftDetailsForProvider: jest.fn(),
            getFacilityDetailsForProvider: jest.fn(),
            calculateTimestamp: jest.fn(),
            getScheduledShiftDetailsForProvider: jest.fn(),
            calculateClockOutAndBreakDuration: jest.fn(),
            getCurrentMonthSummaryByDate: jest.fn(),
            getAllTimeCards: jest.fn(),
            getAllTimeCardDetails: jest.fn(),
            isClockedInAllowed: jest.fn(),
            getAllAdmins: jest.fn(),
            getProviderShiftsWithinRadius: jest.fn(),
            findAllShiftsWithFilters: jest.fn(),
            findAllWhere: jest.fn(),
            removeShiftRequests: jest.fn(),
            saveProviderCancelledShifts: jest.fn(),
            rejectTimecard: jest.fn(),
            approveTimecard: jest.fn(),
            createTimecard: jest.fn(),
            saveTimeSheet: jest.fn(),
            canUserClockInOrOut: jest.fn(),
            saveFirstWorkedDate: jest.fn(),
            getAIRecommendationsForShift: jest.fn(),
            checkWithComplianceSettings: jest.fn(),
            calculateShiftCost: jest.fn(),
          },
        },
        {
          provide: ShiftRequestService,
          useValue: {
            remove: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: FacilityProviderService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ShiftInvitationService,
          useValue: {
            update: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            findOneWhere: jest.fn(),
            remove: jest.fn(),
            updateOrCreateInvitation: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            createUserSpecificNotification: jest.fn(),
          },
        },
        {
          provide: FirebaseNotificationService,
          useValue: {
            sendNotificationToOne: jest.fn(),
          },
        },
        {
          provide: AutoSchedulingService,
          useValue: {
            filterProviderList: jest.fn(),
            runAutoScheduling: jest.fn(),
            filterByPreferenceOfProvider: jest.fn(),
          },
        },
        {
          provide: ShiftNotificationService,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: AIService,
          useValue: {
            getAIRecommendations: jest.fn(),
          },
        },
        {
          provide: ProviderService,
          useValue: {
            findOneWhere: jest.fn(),
            update: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: TimeEntryApprovalService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: EncryptDecryptService,
          useValue: {
            decrypt: jest.fn(),
          },
        },
        {
          provide: AutoSchedulingSettingService,
          useValue: {
            find: jest.fn(),
            findOneWhere: jest.fn(),
          },
        },
        {
          provide: ActivityService,
          useValue: {
            createBaseActivityData: jest.fn(),
            activityLog: jest.fn(),
            logShiftActivity: jest.fn(),
            logProviderActivity: jest.fn(),
            shiftCreateActivity: jest.fn(),
            shiftCancelActivity: jest.fn(),
            shiftInviteAgainActivity: jest.fn(),
            shiftWithdrawActivity: jest.fn(),
            shiftAcceptByProviderActivity: jest.fn(),
            shiftRejectByProviderActivity: jest.fn(),
            shiftRequestedByProviderActivity: jest.fn(),
            shiftRequestAcceptOfProviderByFacility: jest.fn(),
            shiftRequestRejectOfProviderByFacility: jest.fn(),
            shiftUpdateActivity: jest.fn(),
            findAll: jest.fn(),
            findOneWhere: jest.fn(),
            findByShiftId: jest.fn(),
            commonUpdateActivity: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderCancelledShift),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProviderOrientation),
          useValue: {},
        },
        {
          provide: QueueDebugService,
          useValue: {
            trackJobAdded: jest.fn(),
          },
        },
        {
          provide: AccessControlGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: ProviderOrientationService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<ShiftController>(ShiftController);
    shiftService = module.get<ShiftService>(ShiftService);
    shiftRequest = module.get<ShiftRequestService>(ShiftRequestService);
    shiftInvitationService = module.get<ShiftInvitationService>(
      ShiftInvitationService,
    );
    notificationService = module.get<NotificationService>(NotificationService);
    firebaseNotificationService = module.get<FirebaseNotificationService>(
      FirebaseNotificationService,
    );
    shiftNotificationService = module.get<ShiftNotificationService>(
      ShiftNotificationService,
    );
    providerService = module.get<ProviderService>(ProviderService);
    timeEntryApprovalService = module.get<TimeEntryApprovalService>(
      TimeEntryApprovalService,
    );
    encryptDecryptService = module.get<EncryptDecryptService>(
      EncryptDecryptService,
    );
    activityService = module.get<ActivityService>(ActivityService);
    autoSchedulingSettingService = module.get<AutoSchedulingSettingService>(
      AutoSchedulingSettingService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createShiftDto = new CreateShiftDto();
    const req: any = { user: { id: '1' } };
    it('should create repeat on shift for same day', async () => {
      createShiftDto.repeat_on = REPEAT_ON.same_day;
      const mockShift = { invited_provider: undefined };
      shiftService.createShift.mockResolvedValue(mockShift);

      const result = await controller.create(createShiftDto, req);
      expect(shiftService.createShift).toHaveBeenCalledWith(createShiftDto);
      expect(activityService.shiftCreateActivity).toHaveBeenCalledWith(
        mockShift,
        req,
        ACTION_TABLES.SHIFT,
      );

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Shift'),
          data: {},
        }),
      );
    });

    it('should create repeat on shift for consecutive days', async () => {
      createShiftDto.is_repeat = true;
      createShiftDto.repeat_on = REPEAT_ON.consecutive_days;
      shiftService.createConsecutiveDaysShift.mockResolvedValue(new Shift());

      const result = await controller.create(createShiftDto, req);
      expect(shiftService.createConsecutiveDaysShift).toHaveBeenCalledWith(
        createShiftDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Shift'),
          data: {},
        }),
      );
    });

    it('should create repeat on shift for consecutive weeks', async () => {
      createShiftDto.repeat_on = REPEAT_ON.consecutive_weeks;
      createShiftDto.days = [1, 3];
      shiftService.createConsecutiveWeeksShift.mockResolvedValue(new Shift());

      const result = await controller.create(createShiftDto, req);
      expect(shiftService.createConsecutiveWeeksShift).toHaveBeenCalledWith(
        createShiftDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Shift'),
          data: {},
        }),
      );
    });

    it('should create repeat on shift for consecutive weeks', async () => {
      createShiftDto.is_repeat = true;
      createShiftDto.repeat_on = REPEAT_ON.consecutive_weeks;
      createShiftDto.days = [1, 3];
      shiftService.createConsecutiveWeeksShift.mockResolvedValue(new Shift());

      const result = await controller.create(createShiftDto, req);
      expect(shiftService.createConsecutiveWeeksShift).toHaveBeenCalledWith(
        createShiftDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Shift'),
          data: {},
        }),
      );
    });

    it('should create repeat on shift for specific dates', async () => {
      createShiftDto.is_repeat = true;
      createShiftDto.repeat_on = REPEAT_ON.specific_dates;
      createShiftDto.specific_dates = [{ date: '2024-08-02', openings: 2 }];
      shiftService.createShiftForSpecificDates.mockResolvedValue(new Shift());

      const result = await controller.create(createShiftDto, req);
      expect(shiftService.createShiftForSpecificDates).toHaveBeenCalledWith(
        createShiftDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Shift'),
          data: {},
        }),
      );
    });

    it('should return bad request for bad syntax', async () => {
      createShiftDto.is_repeat = true;
      createShiftDto.repeat_on = null;
      const result = await controller.create(createShiftDto, req);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.BAD_SYNTAX,
          data: {},
        }),
      );
    });

    it('should return failure response', async () => {
      createShiftDto.is_repeat = false;
      const errorMessage = 'Database error';
      shiftService.createShift.mockRejectedValue(new Error(errorMessage));
      const result = await controller.create(createShiftDto, req);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getUnPublishedData', () => {
    const id = '1';
    it('should return record not found if no data found', async () => {
      shiftService.findAll.mockResolvedValue([]);
      const result = await controller.getUnPublishedData(id);
      expect(shiftService.findAll).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          data: [],
        }),
      );
    });

    it('should return success response if data found', async () => {
      shiftService.findAll.mockResolvedValue([new Shift()]);
      const result = await controller.getUnPublishedData(id);
      expect(shiftService.findAll).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
          data: [new Shift()],
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.findAll.mockRejectedValue(new Error(errorMessage));
      const result = await controller.getUnPublishedData(id);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('cloneShift', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };
    it('should return bad request if shift not found', async () => {
      shiftService.findOneWhere.mockResolvedValue(null);

      const result = await controller.cloneShift(id, req);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          certificate: true,
          facility: true,
          floor: true,
          follower: true,
          provider: true,
          speciality: true,
          invited_provider: true,
        },
        select: {
          id: true,
          start_time: true,
          end_time: true,
          is_repeat: true,
          days: true,
          start_date: true,
          end_date: true,
          description: true,
          is_publish: true,
          status: true,
          shift_type: true,
          invited_provider: {
            id: true,
          },
          certificate: {
            id: true,
          },
          facility: {
            id: true,
          },
          floor: {
            id: true,
          },
          follower: {
            id: true,
          },
          provider: {
            id: true,
          },
          speciality: {
            id: true,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should cloned shift if data found', async () => {
      const mockShift = new Shift();
      shiftService.findOneWhere.mockResolvedValue(mockShift);
      shiftService.cloneShift.mockResolvedValue(mockShift);

      const result = await controller.cloneShift(id, req);

      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          certificate: true,
          facility: true,
          floor: true,
          follower: true,
          provider: true,
          speciality: true,
          invited_provider: true,
        },
        select: {
          id: true,
          start_time: true,
          end_time: true,
          is_repeat: true,
          days: true,
          start_date: true,
          end_date: true,
          description: true,
          is_publish: true,
          status: true,
          shift_type: true,
          invited_provider: {
            id: true,
          },
          certificate: {
            id: true,
          },
          facility: {
            id: true,
          },
          floor: {
            id: true,
          },
          follower: {
            id: true,
          },
          provider: {
            id: true,
          },
          speciality: {
            id: true,
          },
        },
      });
      expect(shiftService.cloneShift).toHaveBeenCalledWith({
        ...mockShift,
        created_by_id: req.user.id,
        created_by_type: req.user.role,
        updated_by_id: req.user.id,
        updated_by_type: req.user.role,
      });
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Shift Cloned'),
          data: mockShift,
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.findOneWhere.mockRejectedValue(new Error(errorMessage));
      const result = await controller.cloneShift(id, req);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('cancelShift', () => {
    const id = '1';
    const cancelShiftDto = new CancelShiftDto();
    const req: any = { user: { id: '1', role: TABLE.provider } };

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.findOneWhere.mockRejectedValue(new Error(errorMessage));
      const result = await controller.cancelShift(id, cancelShiftDto, req);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('reOpenShift', () => {
    const id = '3';
    it('should return bad request if shift not found', async () => {
      shiftService.findOneWhere.mockResolvedValue(null);

      const result = await controller.reOpenShift(id);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id, status: SHIFT_STATUS.cancelled },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.findOneWhere.mockRejectedValue(new Error(errorMessage));
      const result = await controller.reOpenShift(id);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('postShift', () => {
    const postShiftDto = new PostShiftDto();
    const req: any = { user: { id: '1', role: TABLE.provider } };
    postShiftDto.shift = ['1', '2'];
    it('should return bad request if no shifts are found', async () => {
      jest.spyOn(shiftService, 'findAllWhere').mockResolvedValue([[]]);

      const result = await controller.postShift(postShiftDto, req);

      expect(shiftService.findAllWhere).toHaveBeenCalledWith({
        where: { id: In(postShiftDto.shift) },
        relations: {
          certificate: true,
          speciality: true,
          follower: true,
          facility: true,
          invited_provider: {
            provider: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: 'No shifts found to post.',
          data: {},
        }),
      );
    });

    it('should run auto-scheduling if no invited providers are found', async () => {
      const mockShifts = [
        {
          id: 'shift-id-1',
          invited_provider: [],
          facility: { id: 'facility-id-1' },
          speciality: { id: 'speciality-id-1' },
          certificate: { id: 'certificate-id-1' },
        },
      ];

      const mockProviders = ['provider-id-1', 'provider-id-2'];
      const mockSetting = { id: 'setting-id-1' };

      jest
        .spyOn(shiftService, 'findAllWhere')
        .mockResolvedValue([mockShifts, 1]); // tuple
      jest
        .spyOn(shiftService, 'getAIRecommendationsForShift')
        .mockResolvedValue({ 'shift-id-1': mockProviders });
      jest
        .spyOn(autoSchedulingSettingService, 'findOneWhere')
        .mockResolvedValue(mockSetting);
      jest.spyOn(shiftService, 'update').mockResolvedValue({ affected: 1 });
      jest.spyOn(activityService, 'logShiftActivity').mockResolvedValue(null);

      const result = await controller.postShift(postShiftDto, req);

      expect(shiftService.findAllWhere).toHaveBeenCalledWith({
        where: { id: In(postShiftDto.shift) },
        relations: {
          certificate: true,
          speciality: true,
          follower: true,
          facility: true,
          invited_provider: { provider: true },
        },
      });

      // write test cases here for for this block

      expect(shiftService.getAIRecommendationsForShift).toHaveBeenCalledWith(
        mockShifts,
      );
      expect(autoSchedulingSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {},
      });

      // expect(mockQueue.add).toHaveBeenCalledWith(
      //   'run-auto-scheduling',
      //   {
      //     providers: mockProviders,
      //     shift: mockShifts[0],
      //     setting: mockSetting,
      //     count: 0,
      //     status: undefined,
      //     req: null,
      //   },
      //   {
      //     jobId: expect.stringContaining('auto-scheduling-shift-id-1-'),
      //     attempts: 3,
      //     delay: 2000,
      //   },
      // );

      expect(activityService.logShiftActivity).toHaveBeenCalledWith(
        mockShifts[0],
        req,
        ACTIVITY_TYPE.AUTO_SCHEDULING_NO_INVITES,
        {
          from_status: 'auto_scheduling',
          to_status: '',
          is_auto_scheduling: true,
        },
        ACTION_TABLES.SHIFT,
      );

      expect(shiftService.update).toHaveBeenCalledWith('shift-id-1', {
        is_publish: true,
        client_conf_at: expect.any(String),
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Shift Posted'),
          data: {},
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.findOneWhere.mockRejectedValue(new Error(errorMessage));
      const result = await controller.postShift(postShiftDto, req);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findAll', () => {
    const id = '1';
    const filterShiftDto = new FacilityShiftFilterDto();
    it('should return not found if shift list not found', async () => {
      shiftService.findAllShift.mockResolvedValue([[], 0]);

      const result = await controller.findAll(id, filterShiftDto);
      expect(shiftService.findAllShift).toHaveBeenCalledWith(
        id,
        filterShiftDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          total: 0,
          limit: +filterShiftDto.limit,
          offset: +filterShiftDto.offset,
          data: [],
        }),
      );
    });

    it('should return not found if shift list not found', async () => {
      const mockList = [new Shift()];
      const mockCount = mockList.length;
      shiftService.findAllShift.mockResolvedValue([mockList, mockCount]);

      const result = await controller.findAll(id, filterShiftDto);
      expect(shiftService.findAllShift).toHaveBeenCalledWith(
        id,
        filterShiftDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
          total: mockCount,
          limit: +filterShiftDto.limit,
          offset: +filterShiftDto.offset,
          data: mockList,
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.findAllShift.mockRejectedValue(new Error(errorMessage));
      const result = await controller.findAll(id, filterShiftDto);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return bad request if shift not found', async () => {
      shiftService.shiftDetail.mockResolvedValue(null);

      const result = await controller.findOne(id);
      expect(shiftService.shiftDetail).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return success message with shift data', async () => {
      const mockShift = new Shift();
      shiftService.shiftDetail.mockResolvedValue(mockShift);

      const result = await controller.findOne(id);
      expect(shiftService.shiftDetail).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
          data: mockShift,
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.shiftDetail.mockRejectedValue(new Error(errorMessage));
      const result = await controller.findOne(id);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateShiftDto = new UpdateShiftDto();
    const req: any = { user: { id: '1', role: TABLE.facility_user } };

    beforeEach(() => {
      jest.clearAllMocks();

      shiftService.findOneWhere = jest.fn();
      shiftService.updateWhere = jest.fn();
      shiftService.overlappingShift = jest.fn();
      shiftInvitationService.findAll = jest.fn();
      providerService.findOneWhere = jest.fn();
    });

    it('should return bad request if shift not found', async () => {
      shiftService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateShiftDto, req);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          certificate: true,
          speciality: true,
          facility: true,
          follower: true,
          floor: true,
          provider: { certificate: true, speciality: true },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return not found if no data updated', async () => {
      updateShiftDto.invited_provider = null;

      const mockShift = new Shift();
      const mockShiftInvitation = new ShiftInvitation();
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockShiftInvitation.provider = mockProvider;
      const mockInvitation = [mockShiftInvitation];
      const mockCount = mockInvitation.length;

      shiftService.findOneWhere.mockResolvedValue(mockShift);
      shiftInvitationService.findAll.mockResolvedValue([
        mockInvitation,
        mockCount,
      ]);
      shiftService.updateWhere.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateShiftDto, req);

      expect(shiftService.findOneWhere).toHaveBeenCalled();
      expect(shiftInvitationService.findAll).toHaveBeenCalled();
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: id },
        {
          ...updateShiftDto,
          updated_by_id: req.user.id,
          updated_by_type: req.user.role,
          modified_at: expect.any(String),
        },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          data: { reason: null, status: null },
        }),
      );
    });

    it('should return success message if shift updated with invited provider', async () => {
      const dto = {
        ...updateShiftDto,
        invited_provider: [],
        certificate: 'cert1',
        speciality: 'spec1',
      };
      const mockShift = new Shift();
      const mockShiftInvitation = new ShiftInvitation();
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockShiftInvitation.provider = mockProvider;
      const mockInvitation = [mockShiftInvitation];
      const mockCount = mockInvitation.length;

      shiftService.findOneWhere.mockResolvedValueOnce(mockShift); // fetch shift
      shiftInvitationService.findAll.mockResolvedValueOnce([
        mockInvitation,
        mockCount,
      ]);
      providerService.findOneWhere.mockImplementation(() =>
        Promise.resolve({}),
      );

      shiftService.overlappingShift.mockResolvedValueOnce(false); // no overlap
      shiftService.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, { ...dto }, req);

      const expectedUpdate = {
        ...dto,
        updated_by_id: req.user.id,
        updated_by_type: req.user.role,
        modified_at: expect.any(String),
      };
      delete expectedUpdate.invited_provider;

      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id },
        expectedUpdate,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Shift'),
          data: { reason: null, status: null },
        }),
      );
    });

    it('should return success message if shift updated with new invited provider', async () => {
      const dto = {
        ...updateShiftDto,
        invited_provider: [],
        certificate: 'cert1',
        speciality: 'spec1',
      };
      const mockShift = new Shift();
      const mockShiftInvitation = new ShiftInvitation();
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockShiftInvitation.provider = mockProvider;
      const mockInvitation = [mockShiftInvitation];
      const mockCount = mockInvitation.length;

      shiftService.findOneWhere.mockResolvedValueOnce(mockShift); // fetch shift
      shiftInvitationService.findAll.mockResolvedValueOnce([
        mockInvitation,
        mockCount,
      ]);
      providerService.findOneWhere.mockImplementation((args) => {
        if (
          args.where?.certificate?.id === 'cert1' &&
          args.where?.speciality?.id === 'spec1'
        ) {
          return Promise.resolve({});
        }
        return Promise.resolve({});
      });
      shiftService.overlappingShift.mockResolvedValueOnce(false); // no overlap
      shiftService.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, { ...dto }, req);

      const expectedUpdate = {
        ...dto,
        updated_by_id: req.user.id,
        updated_by_type: req.user.role,
        modified_at: expect.any(String),
      };
      delete expectedUpdate.invited_provider;

      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id },
        expectedUpdate,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Shift'),
          data: { reason: null, status: null },
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.findOneWhere.mockRejectedValue(new Error(errorMessage));

      const result = await controller.update(id, updateShiftDto, req);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('deleteShift', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should return not found if shift no found', async () => {
      shiftService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.deleteShift(id, deleteDto);

      expect(shiftService.remove).toHaveBeenCalledWith({ id }, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return success message if shift removed', async () => {
      shiftService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.deleteShift(id, deleteDto);

      expect(shiftService.remove).toHaveBeenCalledWith({ id }, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Shift'),
          data: {},
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.remove.mockRejectedValue(new Error(errorMessage));
      const result = await controller.deleteShift(id, deleteDto);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('deleteAllUnPostedShift', () => {
    const id = '1';
    const deleteDto = new DeleteUnPostedDto();
    deleteDto.id = id;
    it('should return not found if shift no found', async () => {
      shiftService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.deleteAllUnPostedShift(deleteDto);

      expect(shiftService.remove).toHaveBeenCalledWith(
        { facility: { id }, is_publish: false },
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return success message if shift removed', async () => {
      shiftService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.deleteAllUnPostedShift(deleteDto);

      expect(shiftService.remove).toHaveBeenCalledWith(
        { facility: { id }, is_publish: false },
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Shift'),
          data: {},
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.remove.mockRejectedValue(new Error(errorMessage));
      const result = await controller.deleteAllUnPostedShift(deleteDto);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getProviderShifts', () => {
    const providerShiftFilterDto = new ProviderShiftFilterDto();
    const req: any = { user: { id: '1' } };
    it('should return not found if shift not found', async () => {
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.getProviderShifts.mockResolvedValue([[], 0]);

      const result = await controller.getProviderShifts(
        providerShiftFilterDto,
        req,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
          status: true,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SHIFT_LIST_PROFILE_INCOMPLETE,
          data: {},
        }),
      );
    });

    it('should return not found if shift not found', async () => {
      const mockProvider = new Provider();
      mockProvider.certificate = new Certificate();
      providerService.findOneWhere.mockResolvedValue(mockProvider);
      shiftService.getProviderShifts.mockResolvedValue([[], 0]);

      const result = await controller.getProviderShifts(
        providerShiftFilterDto,
        req,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
          status: true,
        },
      });
      expect(shiftService.getProviderShifts).toHaveBeenCalledWith(
        providerShiftFilterDto,
        mockProvider,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          total: 0,
          limit: +providerShiftFilterDto.limit,
          offset: +providerShiftFilterDto.offset,
          data: [],
        }),
      );
    });

    it('should return shift list', async () => {
      const mockShift = [new Shift()];
      const mockCount = mockShift.length;
      const mockProvider = new Provider();
      mockProvider.certificate = new Certificate();
      providerService.findOneWhere.mockResolvedValue(mockProvider);
      shiftService.getProviderShifts.mockResolvedValue([mockShift, mockCount]);

      const result = await controller.getProviderShifts(
        providerShiftFilterDto,
        req,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
          status: true,
        },
      });
      expect(shiftService.getProviderShifts).toHaveBeenCalledWith(
        providerShiftFilterDto,
        mockProvider,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
          total: mockCount,
          limit: +providerShiftFilterDto.limit,
          offset: +providerShiftFilterDto.offset,
          data: mockShift,
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      providerService.findOneWhere.mockRejectedValue(new Error(errorMessage));
      const result = await controller.getProviderShifts(
        providerShiftFilterDto,
        req,
      );
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getInitialShifts', () => {
    const req: any = { user: { id: '1' } };
    const initialShiftDto = new InitialShiftDto();
    it('should return not found if shift data not found', async () => {
      const address = new ProviderAddress();
      address.latitude = '0.00';
      address.longitude = '0.00';
      const provider = new Provider();
      provider.address = [address];
      providerService.findOneWhere.mockResolvedValue(provider);
      shiftService.getProviderShiftsWithinRadius.mockResolvedValue([[], 0]);

      const result = await controller.getInitialShifts(req, initialShiftDto);

      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
        },
        relations: {
          address: true,
          certificate: true,
          speciality: true,
        },
      });
      expect(shiftService.getProviderShiftsWithinRadius).toHaveBeenCalledWith(
        provider,
        provider.address[0].latitude,
        provider.address[0].longitude,
        +provider.radius,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          data: [],
        }),
      );
    });
    it('should get initial shift data', async () => {
      initialShiftDto.latitude = '0.00';
      initialShiftDto.longitude = '0.00';
      initialShiftDto.radius = '50';
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.getProviderShiftsWithinRadius.mockResolvedValue([
        [new Shift()],
        1,
      ]);

      const result = await controller.getInitialShifts(req, initialShiftDto);

      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
        },
        relations: {
          address: true,
          certificate: true,
          speciality: true,
        },
      });
      expect(shiftService.getProviderShiftsWithinRadius).toHaveBeenCalledWith(
        new Provider(),
        initialShiftDto.latitude,
        initialShiftDto.longitude,
        +initialShiftDto.radius,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
          data: [new Shift()],
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      providerService.findOneWhere.mockRejectedValue(error);

      const result = await controller.getInitialShifts(req, initialShiftDto);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
        },
        relations: {
          address: true,
          certificate: true,
          speciality: true,
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getShiftDetailsForProvider', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };

    it('should return shift data with success message', async () => {
      const mockShift = new Shift();
      shiftService.findOneWhere.mockResolvedValue({ ...mockShift });
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.getShiftDetailsForProvider.mockResolvedValue(mockShift);

      const result = await controller.getShiftDetailsForProvider(id, req);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id: '1', is_publish: true },
      });
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
          speciality: true,
        },
      });
      expect(shiftService.getShiftDetailsForProvider).toHaveBeenCalledWith(
        id,
        new Provider(),
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
          data: mockShift,
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.findOneWhere.mockRejectedValue(new Error(errorMessage));
      const result = await controller.getShiftDetailsForProvider(id, req);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getFacilityDetailsForProvider', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };
    it('should return not found if facility not found', async () => {
      shiftService.getFacilityDetailsForProvider.mockResolvedValue(null);

      const result = await controller.getFacilityDetailsForProvider(req, id);
      expect(shiftService.getFacilityDetailsForProvider).toHaveBeenCalledWith(
        id,
        req.user.id,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should return facility data with success message', async () => {
      const mockShift = new Shift();
      shiftService.getFacilityDetailsForProvider.mockResolvedValue(mockShift);

      const result = await controller.getFacilityDetailsForProvider(req, id);
      expect(shiftService.getFacilityDetailsForProvider).toHaveBeenCalledWith(
        id,
        req.user.id,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility'),
          data: mockShift,
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.getFacilityDetailsForProvider.mockRejectedValue(
        new Error(errorMessage),
      );
      const result = await controller.getFacilityDetailsForProvider(req, id);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getFacilityShifts', () => {
    const id = '1';
    const queryParamsDto = new QueryParamsDto();
    const req: any = { user: { id: '1' } };
    it('should return not found if shift not found', async () => {
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.getFacilityShifts.mockResolvedValue([[], 0]);

      const result = await controller.getFacilityShifts(
        id,
        queryParamsDto,
        req,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
        },
      });
      expect(shiftService.getFacilityShifts).toHaveBeenCalledWith(
        id,
        queryParamsDto,
        new Provider(),
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should return shift list', async () => {
      const mockShift = [new Shift()];
      const mockCount = mockShift.length;
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.getFacilityShifts.mockResolvedValue([mockShift, mockCount]);

      const result = await controller.getFacilityShifts(
        id,
        queryParamsDto,
        req,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
        },
      });
      expect(shiftService.getFacilityShifts).toHaveBeenCalledWith(
        id,
        queryParamsDto,
        new Provider(),
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockShift,
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      providerService.findOneWhere.mockRejectedValue(new Error(errorMessage));
      const result = await controller.getFacilityShifts(
        id,
        queryParamsDto,
        req,
      );
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getProviderScheduledShifts', () => {
    const providerScheduledShiftFilterDto =
      new ProviderScheduledShiftFilterDto();
    const req: any = { user: { id: '1' } };
    it('should return not found if shift not found', async () => {
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.getProviderScheduledShifts.mockResolvedValue([[], 0]);

      const result = await controller.getProviderScheduledShifts(
        providerScheduledShiftFilterDto,
        req,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
        },
      });
      expect(shiftService.getProviderScheduledShifts).toHaveBeenCalledWith(
        providerScheduledShiftFilterDto,
        new Provider(),
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          total: 0,
          limit: +providerScheduledShiftFilterDto.limit,
          offset: +providerScheduledShiftFilterDto.offset,
          data: [],
        }),
      );
    });

    it('should return shift list', async () => {
      const mockShift = [new Shift()];
      const mockCount = mockShift.length;
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.getProviderScheduledShifts.mockResolvedValue([
        mockShift,
        mockCount,
      ]);

      const result = await controller.getProviderScheduledShifts(
        providerScheduledShiftFilterDto,
        req,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
        },
      });
      expect(shiftService.getProviderScheduledShifts).toHaveBeenCalledWith(
        providerScheduledShiftFilterDto,
        new Provider(),
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
          total: mockCount,
          limit: +providerScheduledShiftFilterDto.limit,
          offset: +providerScheduledShiftFilterDto.offset,
          data: mockShift,
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      providerService.findOneWhere.mockRejectedValue(new Error(errorMessage));
      const result = await controller.getProviderScheduledShifts(
        providerScheduledShiftFilterDto,
        req,
      );
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('withdrawnRequest', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    const req: any = { user: { id: '1' } };
    it('should return record not found if request not withdrawn', async () => {
      shiftRequest.remove.mockResolvedValue({ affected: 0 });
      shiftRequest.findAll.mockResolvedValue([[new Shift()], 1]);
      const result = await controller.withdrawnRequest(id, deleteDto, req);
      expect(shiftRequest.remove).toHaveBeenCalledWith(
        { provider: { id: req?.user?.id }, shift: { id: id } },
        deleteDto,
      );
      expect(shiftRequest.findAll).toHaveBeenCalledWith({
        where: { shift: { id: id } },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Request'),
          data: {},
        }),
      );
    });

    it('should return success response if request withdrawn', async () => {
      shiftRequest.remove.mockResolvedValue({ affected: 1 });
      shiftRequest.findAll.mockResolvedValue([[], 0]);

      const result = await controller.withdrawnRequest(id, deleteDto, req);
      expect(shiftRequest.remove).toHaveBeenCalledWith(
        { provider: { id: req?.user?.id }, shift: { id: id } },
        deleteDto,
      );
      expect(shiftRequest.findAll).toHaveBeenCalledWith({
        where: { shift: { id: id } },
      });
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: id },
        {
          status: SHIFT_STATUS.open,
        },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Request Withdrawn'),
          data: {},
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftRequest.remove.mockRejectedValue(new Error(errorMessage));
      const result = await controller.withdrawnRequest(id, deleteDto, req);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getScheduledShiftDetailsForProvider', () => {
    const id = '1';
    const req: any = { user: { id: '1' }, headers: {} };

    beforeEach(() => {
      req.headers['timezone'] = '+0:00';
    });

    it('should return not found if shift not found', async () => {
      const mockTimezone = '+0:00';
      const mockDiff = 4;
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.calculateTimestamp.mockReturnValue(mockDiff);
      shiftService.getScheduledShiftDetailsForProvider.mockResolvedValue(null);

      const result = await controller.getScheduledShiftDetailsForProvider(
        id,
        req,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
        },
      });
      expect(shiftService.calculateTimestamp).toHaveBeenCalledWith(
        mockTimezone,
      );
      expect(
        shiftService.getScheduledShiftDetailsForProvider,
      ).toHaveBeenCalledWith(id, new Provider(), mockDiff);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return shift data with success message', async () => {
      const mockDiff = 4;
      const mockShift = new Shift();
      const mockSetting: any[] = [
        { id: '1', key: uploadSheets, value: DEFAULT_STATUS.active as string },
      ];
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.calculateTimestamp.mockReturnValue(mockDiff);
      shiftService.getScheduledShiftDetailsForProvider.mockResolvedValue(
        mockShift,
      );
      timeEntryApprovalService.findAll.mockResolvedValue(mockSetting);

      const result = await controller.getScheduledShiftDetailsForProvider(
        id,
        req,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
        },
      });
      expect(shiftService.calculateTimestamp).toHaveBeenCalledWith('+0:00');
      expect(
        shiftService.getScheduledShiftDetailsForProvider,
      ).toHaveBeenCalledWith(id, new Provider(), mockDiff);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
          data: mockShift,
        }),
      );
    });

    it('should handle missing timezone header', async () => {
      delete req.headers['timezone'];
      const mockDiff = 4;
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.calculateTimestamp.mockReturnValue(mockDiff);
      shiftService.getScheduledShiftDetailsForProvider.mockResolvedValue(null);

      const result = await controller.getScheduledShiftDetailsForProvider(
        id,
        req,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
        },
      });
      expect(shiftService.calculateTimestamp).toHaveBeenCalledWith('+0:00');
      expect(
        shiftService.getScheduledShiftDetailsForProvider,
      ).toHaveBeenCalledWith(id, new Provider(), mockDiff);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return failure response on error', async () => {
      const errorMessage = 'Database error';
      providerService.findOneWhere.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const result = await controller.getScheduledShiftDetailsForProvider(
        id,
        req,
      );

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('checkInOutShift', () => {
    const id = '1';
    const updateShiftDto = new UpdateShiftDto();
    const req: any = { user: { id: '1' }, headers: {} };

    beforeEach(() => {
      req.headers['timezone'] = '+0:00';
    });

    it('should return bad request if shift not found', async () => {
      const shiftStatuses = [SHIFT_STATUS.ongoing];
      shiftService.findOneWhere.mockResolvedValue(null);

      const result = await controller.checkInOutShift(id, updateShiftDto, req);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          facility: { time_entry_setting: true },
          follower: true,
          provider: true,
        },
        where: {
          id,
          provider: {
            id: req?.user?.id,
          },
          status: In(shiftStatuses),
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should handle missing timezone header', async () => {
      delete req.headers['timezone'];
      const shiftStatuses = [SHIFT_STATUS.ongoing];
      shiftService.findOneWhere.mockResolvedValue(null);

      const result = await controller.checkInOutShift(id, updateShiftDto, req);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          facility: { time_entry_setting: true },
          follower: true,
          provider: true,
        },
        where: {
          id,
          provider: {
            id: req?.user?.id,
          },
          status: In(shiftStatuses),
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return bad request if taking break limit reached', async () => {
      const mockShift = new Shift();
      updateShiftDto.clock_in = '10:34:00';
      const shiftStatuses = [
        SHIFT_STATUS.ongoing,
        SHIFT_STATUS.scheduled,
        SHIFT_STATUS.running_late,
      ];
      const mockMessage = CONSTANT.SUCCESS.CLOCK_IN;
      shiftService.findOneWhere.mockResolvedValueOnce(mockShift);
      shiftService.findOneWhere.mockResolvedValueOnce(null);
      // shiftService.isClockedInAllowed.mockResolvedValue(false);
      shiftService.calculateClockOutAndBreakDuration.mockReturnValue({
        updateShiftDto,
        message: mockMessage,
        responseBody: response.badRequest({
          message: CONSTANT.ERROR.BREAK_LIMIT_REACHED,
          data: {},
        }),
      });

      const result = await controller.checkInOutShift(id, updateShiftDto, req);

      expect(shiftService.findOneWhere).toHaveBeenCalledTimes(2);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          facility: { time_entry_setting: true },
          follower: true,
          provider: true,
        },
        where: {
          id,
          provider: {
            id: req?.user?.id,
          },
          status: In(shiftStatuses),
        },
      });
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: {
          provider: { id: req.user.id },
          status: SHIFT_STATUS.ongoing,
          id: Not(id),
          clock_in: Not(IsNull()),
          clock_out: IsNull(),
        },
      });
      // expect(shiftService.isClockedInAllowed).toHaveBeenCalledWith(mockShift);
      expect(
        shiftService.calculateClockOutAndBreakDuration,
      ).toHaveBeenCalledWith(updateShiftDto, mockShift, req);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.BREAK_LIMIT_REACHED,
          data: {},
        }),
      );
    });

    it('should return not found if shift not updated', async () => {
      const mockTimezone = '+0:00';
      const mockDiff = 4;
      updateShiftDto.clock_in = '10:34:00';
      const mockShift = new Shift();
      const shiftStatuses = [
        SHIFT_STATUS.ongoing,
        SHIFT_STATUS.scheduled,
        SHIFT_STATUS.running_late,
      ];
      const mockMessage = CONSTANT.SUCCESS.CLOCK_IN;
      shiftService.findOneWhere.mockResolvedValueOnce(mockShift);
      shiftService.findOneWhere.mockResolvedValueOnce(null);
      shiftService.calculateClockOutAndBreakDuration.mockReturnValue({
        updateShiftDto,
        message: mockMessage,
      });
      shiftService.updateWhere.mockResolvedValue({ affected: 0 });
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.calculateTimestamp.mockReturnValue(mockDiff);
      shiftService.getScheduledShiftDetailsForProvider.mockResolvedValue(
        mockShift,
      );

      const result = await controller.checkInOutShift(id, updateShiftDto, req);

      expect(shiftService.findOneWhere).toHaveBeenCalledTimes(2);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          facility: { time_entry_setting: true },
          follower: true,
          provider: true,
        },
        where: {
          id,
          provider: {
            id: req?.user?.id,
          },
          status: In(shiftStatuses),
        },
      });
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: {
          provider: { id: req.user.id },
          status: SHIFT_STATUS.ongoing,
          id: Not(id),
          clock_in: Not(IsNull()),
          clock_out: IsNull(),
        },
      });
      expect(
        shiftService.calculateClockOutAndBreakDuration,
      ).toHaveBeenCalledWith(updateShiftDto, mockShift, req);
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: id },
        updateShiftDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
        },
      });
      expect(shiftService.calculateTimestamp).toHaveBeenCalledWith(
        mockTimezone,
      );
      expect(
        shiftService.getScheduledShiftDetailsForProvider,
      ).toHaveBeenCalledWith(id, new Provider(), mockDiff);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return not found if shift not updated', async () => {
      const mockTimezone = '+0:00';
      const mockDiff = 4;
      updateShiftDto.clock_in = '10:34:00';
      const mockShift = new Shift();
      const shiftStatuses = [
        SHIFT_STATUS.ongoing,
        SHIFT_STATUS.scheduled,
        SHIFT_STATUS.running_late,
      ];
      const mockMessage = CONSTANT.SUCCESS.CLOCK_IN;
      shiftService.findOneWhere.mockResolvedValueOnce(mockShift);
      shiftService.findOneWhere.mockResolvedValueOnce(null);
      shiftService.calculateClockOutAndBreakDuration.mockReturnValue({
        updateShiftDto,
        message: mockMessage,
      });
      shiftService.updateWhere.mockResolvedValue({ affected: 1 });
      providerService.findOneWhere.mockResolvedValue(new Provider());
      shiftService.calculateTimestamp.mockReturnValue(mockDiff);
      shiftService.getScheduledShiftDetailsForProvider.mockResolvedValue(
        mockShift,
      );

      const result = await controller.checkInOutShift(id, updateShiftDto, req);

      expect(shiftService.findOneWhere).toHaveBeenCalledTimes(2);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          facility: { time_entry_setting: true },
          follower: true,
          provider: true,
        },
        where: {
          id,
          provider: {
            id: req?.user?.id,
          },
          status: In(shiftStatuses),
        },
      });
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: {
          provider: { id: req.user.id },
          status: SHIFT_STATUS.ongoing,
          id: Not(id),
          clock_in: Not(IsNull()),
          clock_out: IsNull(),
        },
      });
      expect(
        shiftService.calculateClockOutAndBreakDuration,
      ).toHaveBeenCalledWith(updateShiftDto, mockShift, req);
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: id },
        updateShiftDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
          address: {
            type: ADDRESS_TYPE.default,
          },
        },
        relations: {
          address: true,
          certificate: true,
        },
      });
      expect(shiftService.calculateTimestamp).toHaveBeenCalledWith(
        mockTimezone,
      );
      expect(
        shiftService.getScheduledShiftDetailsForProvider,
      ).toHaveBeenCalledWith(id, new Provider(), mockDiff);
      expect(result).toEqual(
        response.successResponse({
          message: mockMessage,
          data: mockShift,
        }),
      );
    });

    it('should return failure response on error', async () => {
      const errorMessage = 'Database error';
      shiftService.findOneWhere.mockRejectedValue(new Error(errorMessage));

      const result = await controller.checkInOutShift(id, updateShiftDto, req);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('submitShiftReport', () => {
    const id = '1';
    const submitReportDto = new SubmitReportDto();
    it('should return bad request if shift not found', async () => {
      shiftService.findOneWhere.mockResolvedValue(null);

      const result = await controller.submitShiftReport(id, submitReportDto);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        relations: { time_card: true },
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return not found if shift not updated', async () => {
      shiftService.findOneWhere.mockResolvedValue(null);

      const result = await controller.submitShiftReport(id, submitReportDto);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        relations: { time_card: true },
        where: { id },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return success response if report submitted', async () => {
      const mockShift = new Shift();
      shiftService.findOneWhere.mockResolvedValue(mockShift);
      shiftService.saveTimeSheet.mockResolvedValue({ affected: 1 });

      const result = await controller.submitShiftReport(id, submitReportDto);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        relations: { time_card: true },
        where: { id },
      });
      expect(shiftService.saveTimeSheet).toHaveBeenCalledWith(
        submitReportDto,
        mockShift,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Report Submitted'),
          data: {},
        }),
      );
    });

    it('should return failure response on error', async () => {
      const errorMessage = 'Database error';
      shiftService.findOneWhere.mockRejectedValue(new Error(errorMessage));

      const result = await controller.submitShiftReport(id, submitReportDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getShiftCalendarData', () => {
    const date = '2024-08-07';
    const req: any = { user: { id: '1' } };
    it('should return not found if data not found', async () => {
      shiftService.getCurrentMonthSummaryByDate.mockResolvedValue([]);

      const result = await controller.getShiftCalendarData(date, req);
      expect(shiftService.getCurrentMonthSummaryByDate).toHaveBeenCalledWith(
        date,
        req.user.id,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Summary'),

          data: [],
        }),
      );
    });

    it('should return data list', async () => {
      const mockShift = [new Shift()];
      shiftService.getCurrentMonthSummaryByDate.mockResolvedValue(mockShift);

      const result = await controller.getShiftCalendarData(date, req);
      expect(shiftService.getCurrentMonthSummaryByDate).toHaveBeenCalledWith(
        date,
        req.user.id,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Summary'),
          data: mockShift,
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.getCurrentMonthSummaryByDate.mockRejectedValue(
        new Error(errorMessage),
      );
      const result = await controller.getShiftCalendarData(date, req);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getAllTimeCardDetails', () => {
    const id = '1';
    it('should return not found if time card not found', async () => {
      shiftService.getAllTimeCardDetails.mockResolvedValue(null);

      const result = await controller.getAllTimeCardDetails(id);
      expect(shiftService.getAllTimeCardDetails).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Time Card Details'),
          data: {},
        }),
      );
    });

    it('should return time card details', async () => {
      const mockShift = new Shift();
      shiftService.getAllTimeCardDetails.mockResolvedValue(mockShift);

      const result = await controller.getAllTimeCardDetails(id);
      expect(shiftService.getAllTimeCardDetails).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Time Card Details'),
          data: mockShift,
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.getAllTimeCardDetails.mockRejectedValue(
        new Error(errorMessage),
      );
      const result = await controller.getAllTimeCardDetails(id);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('approveTimecard', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };
    const approveTimecardDto = new ApproveTimecardDto();
    approveTimecardDto.clock_out = '15:00:00';
    approveTimecardDto.clock_in = '12:00:00';
    approveTimecardDto.break_duration = 1000;
    approveTimecardDto.total_worked = 1000;
    it('should return bad request if shift not found', async () => {
      shiftService.findOneWhere.mockResolvedValue(null);

      const result = await controller.approveTimecard(
        id,
        req,
        approveTimecardDto,
      );
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          facility: true,
          floor: true,
          provider: true,
          time_card: true,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Timecard'),
          data: {},
        }),
      );
    });

    it('should return not found if shift not updated', async () => {
      const mockShift = new Shift();
      shiftService.findOneWhere.mockResolvedValue(mockShift);
      shiftService.updateWhere.mockResolvedValue({ affected: 0 });
      shiftService.approveTimecard.mockResolvedValue({ affected: 0 });

      const result = await controller.approveTimecard(
        id,
        req,
        approveTimecardDto,
      );
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          facility: true,
          floor: true,
          provider: true,
          time_card: true,
        },
      });

      expect(shiftService.approveTimecard).toHaveBeenCalledWith(
        mockShift,
        approveTimecardDto,
        req.user,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Timecard'),
          data: {},
        }),
      );
    });

    it('should return success response if shift updated', async () => {
      const mockShift = new Shift();
      shiftService.findOneWhere.mockResolvedValue(mockShift);
      shiftService.updateWhere.mockResolvedValue({ affected: 1 });
      shiftService.approveTimecard.mockResolvedValue({ affected: 1 });

      const result = await controller.approveTimecard(
        id,
        req,
        approveTimecardDto,
      );
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          facility: true,
          floor: true,
          provider: true,
          time_card: true,
        },
      });

      expect(shiftService.approveTimecard).toHaveBeenCalledWith(
        mockShift,
        approveTimecardDto,
        req.user,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Timecard Approved'),
          data: {},
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.findOneWhere.mockRejectedValue(new Error(errorMessage));
      const result = await controller.approveTimecard(
        id,
        req,
        approveTimecardDto,
      );
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('rejectTimecard', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };
    const rejectTimecardDto = new RejectTimecardDto();
    it('should return not found if shift not updated', async () => {
      shiftService.findOneWhere.mockResolvedValue(null);
      const result = await controller.rejectTimecard(
        id,
        req,
        rejectTimecardDto,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Timecard'),
          data: {},
        }),
      );
    });

    it('should return success response if shift updated', async () => {
      const mockShift = new Shift();
      mockShift.provider = new Provider();
      mockShift.facility = new Facility();
      const mockNotification = new Notification();
      const mockAdmin = new Admin();
      mockShift.time_card = new Timecard();
      mockShift.time_card.timecard_reject_reason = new TimecardRejectReason();
      mockShift.time_card.timecard_reject_reason.reason =
        'Inaccurate time entry';
      shiftService.findOneWhere.mockResolvedValue(mockShift);
      notificationService.createUserSpecificNotification.mockResolvedValue(
        mockNotification,
      );
      shiftService.getAllAdmins.mockResolvedValue([mockAdmin]);
      shiftService.rejectTimecard.mockResolvedValue({ affected: 1 });

      const result = await controller.rejectTimecard(
        id,
        req,
        rejectTimecardDto,
      );

      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          provider: true,
          facility: true,
          time_card: {
            timecard_reject_reason: true,
          },
        },
      });
      expect(
        notificationService.createUserSpecificNotification,
      ).toHaveBeenCalledWith({
        title: CONSTANT.NOTIFICATION.TIMECARD_REJECTION_TITLE,
        text: CONSTANT.NOTIFICATION.TIMECARD_REJECTION_TEXT,
        push_type: PushNotificationType.timecard_rejected,
      });
      expect(
        firebaseNotificationService.sendNotificationToOne,
      ).toHaveBeenCalledWith(
        mockNotification,
        'provider',
        mockShift.provider.id,
        {
          id: mockShift.id,
          notification_id: mockNotification.id,
          status: mockShift.status,
          start_date: mockShift.start_date,
          start_time: mockShift.start_time,
          end_date: mockShift.end_date,
          end_time: mockShift.end_time,
          facility: {
            id: mockShift.facility.id,
            name: mockShift.facility.name,
            street_address: mockShift.facility.street_address,
            house_no: mockShift.facility.house_no,
            zip_code: mockShift.facility.zip_code,
            latitude: mockShift.facility.latitude,
            longitude: mockShift.facility.longitude,
          },
          expire_in: 1,
          shift_status: SHIFT_STATUS.completed,
          is_timer: false,
          to: 'notification_data',
          created_at: expect.any(String),
          description: CONSTANT.NOTIFICATION.TIMECARD_REJECTION_DESCRIPTION,
        },
      );
      expect(shiftService.getAllAdmins).toHaveBeenCalledWith();
      expect(shiftNotificationService.sendNotification).toHaveBeenCalledWith({
        email: mockAdmin.email,
        emailType: EJS_FILES.timecard_rejected,
        role: TABLE.admin,
        userId: mockAdmin.id,
        shiftStatus: SHIFT_STATUS.completed,
        text: CONSTANT.NOTIFICATION.TIMECARD_REJECTION_ADMIN_NOTIFICATION(
          `${mockShift.provider.first_name} ${mockShift.provider.last_name}`,
          `${moment(mockShift.start_date).format('MM-DD-YYYY')} ${moment(mockShift.start_time, 'HH:mm:ss').format('hh:mm A')}`,
          mockShift.facility.name,
        ),
        push_type: PushNotificationType.timecard_rejected,
        title: CONSTANT.NOTIFICATION.TIMECARD_REJECTION_TITLE,
        subject: CONSTANT.EMAIL.TIMECARD_REJECTION,
        shiftData: {
          ...mockShift,
        },
      });

      expect(shiftService.rejectTimecard).toHaveBeenCalledWith(
        { shift: { id } },
        {
          ...rejectTimecardDto,
          rejected_by_id: req.user.id,
          rejected_by_type: req.user.role,
          status: TIMECARD_STATUS.disputed,
          rejected_date: expect.any(String),
        },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Dispute Raised'),
          data: {},
        }),
      );
    });

    it('should return failure response', async () => {
      const errorMessage = 'Database error';
      shiftService.findOneWhere.mockRejectedValue(new Error(errorMessage));
      const result = await controller.rejectTimecard(
        id,
        req,
        rejectTimecardDto,
      );
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('requestProviderForWork', () => {
    const id = '1';
    const req: any = { user: { id: '1', role: 'facility_user' } };
    const requestToWorkDto = new RequestToWorkDto();
    it('should return bad request if provider not found', async () => {
      providerService.findOneWhere.mockResolvedValue(null);
      const result = await controller.requestProviderForWork(
        id,
        req,
        requestToWorkDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('Should return success message with one invalid shift', async () => {
      requestToWorkDto.shift = ['1'];
      const mockProvider = new Provider();

      providerService.findOneWhere.mockResolvedValue(mockProvider);
      shiftService.findOneWhere.mockResolvedValue(null);
      const result = await controller.requestProviderForWork(
        id,
        req,
        requestToWorkDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true },
      });
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: '1',
          status: In([
            SHIFT_STATUS.auto_scheduling,
            SHIFT_STATUS.open,
            SHIFT_STATUS.invite_sent,
            SHIFT_STATUS.requested,
          ]),
        },
        relations: {
          facility: true,
        },
      });
      const invite = requestToWorkDto.shift.length > 1 ? 'Invites' : 'Invite';
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY(
            `${invite} Sent to ${mockProvider.first_name}`,
          ),
          data: {},
        }),
      );
    });

    it('Should return success message with valid shift array when invitation not exist', async () => {
      requestToWorkDto.shift = ['1'];
      const mockProvider = new Provider();
      const mockShift = new Shift();
      mockShift.start_date = '05-09-2025';
      mockShift.end_date = '05-09-2025';

      mockShift.certificate = new Certificate();
      mockShift.speciality = new Speciality();
      mockShift.facility = new Facility();
      mockShift.provider = mockProvider;
      const mockAutoSchedulingSetting = new AutoSchedulingSetting();
      mockAutoSchedulingSetting.running_late_request_expiry = 10;
      const mockNotification = new Notification();

      providerService.findOneWhere.mockResolvedValue(mockProvider);
      shiftService.findOneWhere.mockResolvedValue(mockShift);
      shiftService.updateWhere.mockResolvedValue({ affected: 1 });
      shiftInvitationService.findOneWhere.mockResolvedValue(null);
      shiftInvitationService.create.mockResolvedValue(new ShiftInvitation());
      notificationService.createUserSpecificNotification.mockResolvedValue(
        mockNotification,
      );
      const result = await controller.requestProviderForWork(
        id,
        req,
        requestToWorkDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true },
      });
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: '1',
          status: In([
            SHIFT_STATUS.auto_scheduling,
            SHIFT_STATUS.open,
            SHIFT_STATUS.invite_sent,
            SHIFT_STATUS.requested,
          ]),
        },
        relations: {
          facility: true,
        },
      });
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: mockShift.id },
        {
          status: SHIFT_STATUS.invite_sent,
          updated_by_id: req.user.id,
          updated_by_type: req.user.role,
          updated_at_ip: requestToWorkDto.created_at_ip,
        },
      );
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          provider: { id: mockProvider.id },
          shift: { id: mockShift.id },
        },
      });
      expect(shiftInvitationService.create).toHaveBeenCalledWith({
        provider: mockProvider.id,
        shift: mockShift.id,
        shift_status: SHIFT_STATUS.invite_sent,
        status: SHIFT_INVITATION_STATUS.invited,
      });
      expect(
        notificationService.createUserSpecificNotification,
      ).toHaveBeenCalledWith({
        title: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TITLE,
        text: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TEXT(
          mockShift.start_date,
          moment(mockShift.start_time, 'HH:mm:ss').format('hh:mm A'),
          moment(mockShift.end_time, 'HH:mm:ss').format('hh:mm A'),
          mockShift.facility.name,
        ),
        push_type: PushNotificationType.invited,
      });
      expect(
        firebaseNotificationService.sendNotificationToOne,
      ).toHaveBeenCalledWith(mockNotification, 'provider', mockProvider.id, {
        id: mockShift.id,
        notification_id: mockNotification.id,
        status: mockShift.status,
        start_date: mockShift.start_date,
        start_time: mockShift.start_time,
        end_date: mockShift.end_date,
        end_time: mockShift.end_time,
        facility: {
          id: mockShift.facility.id,
          name: mockShift.facility.name,
          street_address: mockShift.facility.street_address,
          house_no: mockShift.facility.house_no,
          zip_code: mockShift.facility.zip_code,
          latitude: mockShift.facility.latitude,
          longitude: mockShift.facility.longitude,
        },
        expire_in: 1,
        shift_status: SHIFT_STATUS.invite_sent,
        is_timer: false,
        to: 'notification_data',
        created_at: expect.any(String),
        description: CONSTANT.NOTIFICATION.SHIFT_INVITATION_DESCRIPTION,
      });
      const invite = requestToWorkDto.shift.length > 1 ? 'Invites' : 'Invite';
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY(
            `${invite} Sent to ${mockProvider.first_name}`,
          ),
          data: {},
        }),
      );
    });

    it('Should return success message with valid shift array when invitation already exist', async () => {
      requestToWorkDto.shift = ['1'];
      const mockProvider = new Provider();
      mockProvider.first_name = 'John';
      const mockShift = new Shift();
      mockShift.start_date = '05-09-2025';
      mockShift.end_date = '05-09-2025';

      mockShift.certificate = new Certificate();
      mockShift.speciality = new Speciality();
      mockShift.facility = new Facility();
      mockShift.provider = mockProvider;
      const mockNotification = new Notification();
      const mockShiftInvitation = new ShiftInvitation();

      providerService.findOneWhere.mockResolvedValue(mockProvider);
      shiftService.findOneWhere.mockResolvedValue(mockShift);
      shiftService.updateWhere.mockResolvedValue({ affected: 1 });
      shiftInvitationService.findOneWhere.mockResolvedValue(
        mockShiftInvitation,
      );
      shiftInvitationService.update.mockResolvedValue({ affected: 1 });
      notificationService.createUserSpecificNotification.mockResolvedValue(
        mockNotification,
      );
      const result = await controller.requestProviderForWork(
        id,
        req,
        requestToWorkDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true },
      });
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: '1',
          status: In([
            SHIFT_STATUS.auto_scheduling,
            SHIFT_STATUS.open,
            SHIFT_STATUS.invite_sent,
            SHIFT_STATUS.requested,
          ]),
        },
        relations: {
          facility: true,
        },
      });
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: mockShift.id },
        {
          status: SHIFT_STATUS.invite_sent,
          updated_by_id: req.user.id,
          updated_by_type: req.user.role,
          updated_at_ip: requestToWorkDto.created_at_ip,
        },
      );
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          provider: { id: mockProvider.id },
          shift: { id: mockShift.id },
        },
      });
      expect(shiftInvitationService.update).toHaveBeenCalledWith(
        { id: mockShiftInvitation.id },
        {
          shift_status: SHIFT_STATUS.invite_sent,
          status: SHIFT_INVITATION_STATUS.invited,
        },
      );
      expect(
        notificationService.createUserSpecificNotification,
      ).toHaveBeenCalledWith({
        title: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TITLE,
        text: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TEXT(
          mockShift.start_date,
          moment(mockShift.start_time, 'HH:mm:ss').format('hh:mm A'),
          moment(mockShift.end_time, 'HH:mm:ss').format('hh:mm A'),
          mockShift.facility.name,
        ),
        push_type: PushNotificationType.invited,
      });
      expect(
        firebaseNotificationService.sendNotificationToOne,
      ).toHaveBeenCalledWith(mockNotification, 'provider', mockProvider.id, {
        id: mockShift.id,
        notification_id: mockNotification.id,
        status: mockShift.status,
        start_date: mockShift.start_date,
        start_time: mockShift.start_time,
        end_date: mockShift.end_date,
        end_time: mockShift.end_time,
        facility: {
          id: mockShift.facility.id,
          name: mockShift.facility.name,
          street_address: mockShift.facility.street_address,
          house_no: mockShift.facility.house_no,
          zip_code: mockShift.facility.zip_code,
          latitude: mockShift.facility.latitude,
          longitude: mockShift.facility.longitude,
        },
        expire_in: 1,
        shift_status: SHIFT_STATUS.invite_sent,
        is_timer: false,
        to: 'notification_data',
        created_at: expect.any(String),
        description: CONSTANT.NOTIFICATION.SHIFT_INVITATION_DESCRIPTION,
      });
      const invite = requestToWorkDto.shift.length > 1 ? 'Invites' : 'Invite';
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY(
            `${invite} Sent to ${mockProvider.first_name}`,
          ),
          data: {},
        }),
      );
    });

    it('should handle failure case while process', async () => {
      const error = new Error('error');
      providerService.findOneWhere.mockRejectedValue(error);
      const result = await controller.requestProviderForWork(
        id,
        req,
        requestToWorkDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('runningLateShift', () => {
    const id = 'encrypted-id';
    const req = { user: { id: 1 } } as IRequest;
    it('should return bad request if shift not found', async () => {
      encryptDecryptService.decrypt.mockResolvedValue('1');
      shiftService.findOneWhere.mockResolvedValue(null);

      const result = await controller.runningLateShift(id, req, false);
      expect(encryptDecryptService.decrypt).toHaveBeenCalledWith(id);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: {
          provider: true,
          certificate: true,
          speciality: true,
          facility: true,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      encryptDecryptService.decrypt.mockRejectedValue(error);

      const result = await controller.runningLateShift(id, req, false);
      expect(encryptDecryptService.decrypt).toHaveBeenCalledWith(id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAllShiftsWithFilters', () => {
    let allShiftFilterDto: AllShiftFilterDto;

    beforeEach(() => {
      allShiftFilterDto = new AllShiftFilterDto();
      allShiftFilterDto.limit = '10';
      allShiftFilterDto.offset = '0';
      allShiftFilterDto.order = {};
      allShiftFilterDto.search = '';
      allShiftFilterDto.status = [];
      allShiftFilterDto.certificate = [];
      allShiftFilterDto.speciality = [];
      allShiftFilterDto.facility = [];
      allShiftFilterDto.from_date = '';
      allShiftFilterDto.to_date = '';
      allShiftFilterDto.shift_id_from = '';
      allShiftFilterDto.shift_id_to = '';
    });

    it('should return not found if shifts not found', async () => {
      shiftService.findAllShiftsWithFilters.mockResolvedValue([[], 0]);

      const result = await controller.findAllShifts(allShiftFilterDto);

      expect(shiftService.findAllShiftsWithFilters).toHaveBeenCalledWith(
        allShiftFilterDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
          total: 0,
          limit: +allShiftFilterDto.limit,
          offset: +allShiftFilterDto.offset,
          data: [],
        }),
      );
    });

    it('should return shift list when found', async () => {
      const mockShift = [new Shift()];
      const mockCount = mockShift.length;
      shiftService.findAllShiftsWithFilters.mockResolvedValue([
        mockShift,
        mockCount,
      ]);

      const result = await controller.findAllShifts(allShiftFilterDto);

      expect(shiftService.findAllShiftsWithFilters).toHaveBeenCalledWith(
        allShiftFilterDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
          total: mockCount,
          limit: +allShiftFilterDto.limit,
          offset: +allShiftFilterDto.offset,
          data: mockShift,
        }),
      );
    });

    it('should return failure response on error', async () => {
      const errorMessage = 'Database error';
      shiftService.findAllShiftsWithFilters.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await controller.findAllShifts(allShiftFilterDto);

      expect(shiftService.findAllShiftsWithFilters).toHaveBeenCalledWith(
        allShiftFilterDto,
      );
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});
