import { Test, TestingModule } from '@nestjs/testing';
import { ShiftRequestController } from './shift-request.controller';
import { ShiftRequestService } from './shift-request.service';
import { ShiftService } from '@/shift/shift.service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import { Notification } from '@/notification/entities/notification.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { ShiftRequest } from './entities/shift-request.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  EJS_FILES,
  ORIENTATION_STATUS,
  PushNotificationType,
  SHIFT_REQUEST_STATUS,
  SHIFT_STATUS,
  TABLE,
  VERIFICATION_STATUS,
} from '@/shared/constants/enum';
import { active } from '@/shared/constants/constant';
import { Shift } from '@/shift/entities/shift.entity';
import { Not } from 'typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { ProviderAddress } from '@/provider-address/entities/provider-address.entity';
import { ActivityService } from '@/activity/activity.service';
import * as moment from 'moment';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ShiftRequestController', () => {
  let controller: ShiftRequestController;
  let shiftRequestService: any;
  let shiftService: any;
  let notificationService: any;
  let firebaseNotificationService: any;
  let shiftNotificationService: any;
  let facilityProviderService: any;
  let activityService: any;
  let providerCredentialsService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftRequestController],
      providers: [
        {
          provide: ShiftRequestService,
          useValue: {
            findAll: jest.fn(),
            findOneWhere: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            updateOrientation: jest.fn(),
          },
        },
        {
          provide: ShiftService,
          useValue: {
            findOneWhere: jest.fn(),
            checkIsProviderAvailable: jest.fn(),
            updateWhere: jest.fn(),
            overlappingShift: jest.fn(),
            getShiftTimeCode: jest.fn(),
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
          provide: ShiftNotificationService,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: ProviderCredentialsService,
          useValue: {
            checkIfExpiredLatestCredentialsByProvider: jest.fn(),
          },
        },
        {
          provide: FacilityProviderService,
          useValue: {
            create: jest.fn(),
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
          },
        },
        {
          provide: getRepositoryToken(ProviderOrientation),
          useValue: {},
        },
        {
          provide: AccessControlGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<ShiftRequestController>(ShiftRequestController);
    shiftRequestService = module.get<ShiftRequestService>(ShiftRequestService);
    shiftService = module.get<ShiftService>(ShiftService);
    notificationService = module.get<NotificationService>(NotificationService);
    firebaseNotificationService = module.get<FirebaseNotificationService>(
      FirebaseNotificationService,
    );
    shiftNotificationService = module.get<ShiftNotificationService>(
      ShiftNotificationService,
    );
    facilityProviderService = module.get<FacilityProviderService>(
      FacilityProviderService,
    );

    shiftRequestService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof shiftRequestService.findOneWhere
    >;
    shiftRequestService.create = jest
      .fn()
      .mockResolvedValue(new ShiftRequest()) as jest.MockedFunction<
      typeof shiftRequestService.create
    >;
    shiftRequestService.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof shiftRequestService.update
    >;
    shiftRequestService.remove = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof shiftRequestService.remove
    >;
    shiftRequestService.findAll = jest
      .fn()
      .mockResolvedValue([[new ShiftRequest()], 1]) as jest.MockedFunction<
      typeof shiftRequestService.findAll
    >;

    shiftService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof shiftService.findOneWhere
    >;
    shiftService.updateWhere = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof shiftService.updateWhere
    >;

    notificationService.createUserSpecificNotification = jest
      .fn()
      .mockResolvedValue(new Notification()) as jest.MockedFunction<
      typeof notificationService.createUserSpecificNotification
    >;

    firebaseNotificationService.sendNotificationToOne = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof firebaseNotificationService.sendNotificationToOne
    >;

    shiftNotificationService.sendNotification = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof shiftNotificationService.sendNotification
    >;

    facilityProviderService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof facilityProviderService.findOneWhere
    >;
    facilityProviderService.create = jest
      .fn()
      .mockResolvedValue(new FacilityProvider()) as jest.MockedFunction<
      typeof facilityProviderService.create
    >;
    activityService = module.get<ActivityService>(ActivityService);
    providerCredentialsService = module.get<ProviderCredentialsService>(
      ProviderCredentialsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const id = '1';
    const queryParamsDto = new QueryParamsDto();
    it('should successfully retrieve Requested', async () => {
      const mockRequested = Array(10).fill(new ShiftRequest());
      const mockCount = 10;

      shiftRequestService.findAll.mockResolvedValue([mockRequested, mockCount]); // Mock service response

      const result = await controller.findAll(id, queryParamsDto);

      expect(shiftRequestService.findAll).toHaveBeenCalledWith({
        where: { shift: { id: id } },
        relations: {
          provider: true,
          shift: {
            facility: true,
            certificate: true,
          },
        },
        select: {
          id: true,
          status: true,
          created_at: true,
          provider: {
            id: true,
            first_name: true,
            last_name: true,
            middle_name: true,
            nick_name: true,
            base_url: true,
            profile_image: true,
          },
          shift: {
            id: true,
            shift_id: true,
            start_date: true,
            end_date: true,
            start_time: true,
            end_time: true,
            facility: {
              id: true,
              name: true,
              base_url: true,
              image: true,
            },
            certificate: {
              id: true,
              name: true,
              abbreviation: true,
              background_color: true,
              text_color: true,
            },
          },
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Requests'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockRequested,
        }),
      );
    });

    it('should return no records found when there are no Requested', async () => {
      shiftRequestService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(id, queryParamsDto);
      expect(shiftRequestService.findAll).toHaveBeenCalledWith({
        where: { shift: { id: id } },
        relations: {
          provider: true,
          shift: {
            facility: true,
            certificate: true,
          },
        },
        select: {
          id: true,
          status: true,
          created_at: true,
          provider: {
            id: true,
            first_name: true,
            last_name: true,
            middle_name: true,
            nick_name: true,
            base_url: true,
            profile_image: true,
          },
          shift: {
            id: true,
            shift_id: true,
            start_date: true,
            end_date: true,
            start_time: true,
            end_time: true,
            facility: {
              id: true,
              name: true,
              base_url: true,
              image: true,
            },
            certificate: {
              id: true,
              name: true,
              abbreviation: true,
              background_color: true,
              text_color: true,
            },
          },
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Requests'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      shiftRequestService.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findAll(id, queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('assignShift', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };
    it('should return bad request if request not found', async () => {
      shiftRequestService.findOneWhere.mockResolvedValue(null);

      const result = await controller.assignShift(id, req);
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          provider: true,
          shift: {
            follower: true,
            facility: true,
            provider: true,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return bad request if provider is already assigned with another shift', async () => {
      const mockRequest = new ShiftRequest();
      const mockShift = new Shift();
      const mockFacility = new Facility();
      mockFacility.id = 'facility-1';
      mockFacility.timezone = 'America/New_York';
      mockShift.facility = mockFacility;
      mockRequest.shift = mockShift;
      mockRequest.provider = new Provider();
      shiftRequestService.findOneWhere.mockResolvedValue(mockRequest);
      shiftService.checkIsProviderAvailable.mockResolvedValue(mockShift);

      const result = await controller.assignShift(id, req);
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          provider: true,
          shift: {
            follower: true,
            facility: true,
            provider: true,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.PROVIDER_ALREADY_SCHEDULED,
          data: {},
        }),
      );
    });

    it('should return bad request if provider is already assigned with another shift', async () => {
      const mockRequest = new ShiftRequest();
      const mockShift = new Shift();
      mockShift.start_date = '2020-09-01';
      mockShift.start_time = '08:00:00';
      const mockFacility = new Facility();
      mockFacility.id = 'facility-1';
      mockFacility.timezone = 'America/New_York';
      mockShift.facility = mockFacility;
      mockRequest.shift = mockShift;
      mockRequest.provider = new Provider();
      mockRequest.provider = new Provider();
      mockRequest.provider = new Provider();
      shiftRequestService.findOneWhere.mockResolvedValue(mockRequest);

      const result = await controller.assignShift(id, req);
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          provider: true,
          shift: {
            follower: true,
            facility: true,
            provider: true,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.TASK_ASSIGNMENT_CLOSED,
          data: {},
        }),
      );
    });

    it('should return bad request if shift is assigned to someone else', async () => {
      const mockShift = new Shift();
      mockShift.id = '1'; // Add ID
      mockShift.facility = new Facility();
      mockShift.follower = new FacilityUser();
      const mockRequest = new ShiftRequest();
      mockRequest.shift = mockShift;
      mockRequest.shift.provider = new Provider();
      mockRequest.provider = new Provider();

      const assignedRequest = new ShiftRequest();
      assignedRequest.status = SHIFT_REQUEST_STATUS.assigned;

      shiftRequestService.findOneWhere.mockResolvedValueOnce(mockRequest);
      shiftService.checkIsProviderAvailable.mockResolvedValue(null);

      const result = await controller.assignShift(id, req);

      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          provider: true,
          shift: {
            provider: true,
            follower: true,
            facility: true,
          },
        },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SHIFT_ALREADY_ASSIGNED,
          data: {},
        }),
      );
    });

    it('should return bad request if shift is assigned to someone else', async () => {
      const mockShift = new Shift();
      mockShift.id = 'shift-1'; // Add shift ID
      mockShift.facility = new Facility();
      mockShift.follower = new FacilityUser();
      mockShift.start_date = '2028-02-01';
      mockShift.start_time = '09:00:00';
      mockShift.end_time = '17:00:00';
      const mockRequest = new ShiftRequest();
      mockRequest.shift = mockShift;
      mockRequest.provider = new Provider();
      const mockNotification = new Notification();
      shiftRequestService.findOneWhere
        .mockResolvedValueOnce(mockRequest)
        .mockResolvedValueOnce(null);
      shiftService.checkIsProviderAvailable.mockResolvedValue(null);
      shiftRequestService.update.mockResolvedValue({ affected: 1 });
      shiftService.updateWhere.mockResolvedValue({ affected: 1 });
      facilityProviderService.findOneWhere.mockResolvedValue(null);
      notificationService.createUserSpecificNotification.mockResolvedValue(
        mockNotification,
      );
      const result = await controller.assignShift(id, req);
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          provider: true,
          shift: {
            follower: true,
            facility: true,
            provider: true,
          },
        },
      });
      expect(shiftRequestService.update).toHaveBeenCalledWith(
        { id },
        {
          status: SHIFT_REQUEST_STATUS.assigned,
        },
      );
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: mockRequest.shift.id },
        {
          status: SHIFT_STATUS.scheduled,
          provider: mockRequest.provider.id,
          temp_conf_at: expect.any(String),
          client_conf_at: expect.any(String),
          updated_by_id: req.user.id,
          updated_by_type: req.user.role,
        },
      );

      expect(shiftRequestService.updateOrientation).toHaveBeenCalledWith(
        mockRequest.shift.id,
        ORIENTATION_STATUS.orientation_scheduled,
      );

      expect(shiftNotificationService.sendNotification).toHaveBeenCalledWith({
        email: mockRequest.shift.follower.email,
        emailType: EJS_FILES.shift_scheduled,
        role: TABLE.facility_user,
        userId: mockRequest.shift.follower.id,
        shiftStatus: SHIFT_STATUS.scheduled,
        text: CONSTANT.NOTIFICATION.SHIFT_SCHEDULED_TEXT(
          `${mockRequest.shift.start_date}`,
          mockRequest.shift.facility.name,
        ),
        push_type: PushNotificationType.scheduled,
        title: CONSTANT.NOTIFICATION.SHIFT_SCHEDULED_TITLE,
        subject: CONSTANT.EMAIL.SHIFT_SCHEDULED,
        shiftData: {
          ...mockRequest.shift,
          provider: { ...mockRequest.provider },
        },
      });
      expect(
        notificationService.createUserSpecificNotification,
      ).toHaveBeenCalledWith({
        title: CONSTANT.NOTIFICATION.ASSIGN_SHIFT_TITLE,
        text: expect.any(String),
        push_type: PushNotificationType.scheduled,
      });
      expect(
        firebaseNotificationService.sendNotificationToOne,
      ).toHaveBeenCalledWith(
        mockNotification,
        'provider',
        mockRequest.provider.id,
        {
          id: mockRequest.shift.id,
          notification_id: mockNotification.id,
          status: mockRequest.shift.status,
          start_date: mockRequest.shift.start_date,
          start_time: mockRequest.shift.start_time,
          end_date: mockRequest.shift.end_date,
          end_time: mockRequest.shift.end_time,
          facility: {
            id: mockRequest.shift.facility.id,
            name: mockRequest.shift.facility.name,
            street_address: mockRequest.shift.facility.street_address,
            house_no: mockRequest.shift.facility.house_no,
            zip_code: mockRequest.shift.facility.zip_code,
            latitude: mockRequest.shift.facility.latitude,
            longitude: mockRequest.shift.facility.longitude,
          },
          shift_status: SHIFT_STATUS.scheduled,
          to: 'notification_data',
          created_at: expect.any(String),
          description: CONSTANT.NOTIFICATION.ASSIGN_SHIFT_DESCRIPTION,
        },
      );
      shiftRequestService.findAll.mockResolvedValue([
        [
          {
            provider: { id: '123' },
          },
        ],
        1,
      ]);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Shift Assigned'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database error');
      shiftRequestService.findOneWhere.mockRejectedValue(error);
      const result = await controller.assignShift(id, req);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('rejectRequest', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    const req: any = { user: { id: '1', role: 'provider' } };
    it('should return bad request if request not found', async () => {
      shiftRequestService.findOneWhere.mockResolvedValue(null);

      const result = await controller.rejectRequest(id, deleteDto, req);
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id, status: Not(SHIFT_REQUEST_STATUS.assigned) },
        relations: {
          provider: true,
          shift: { facility: true, follower: true },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return not found if no data rejected', async () => {
      const mockShift = new Shift();
      mockShift.facility = new Facility();
      mockShift.follower = new FacilityUser();
      const mockRequest = new ShiftRequest();
      mockRequest.shift = mockShift;
      mockRequest.provider = new Provider();
      const mockRequests = [[], 0];
      const mockNotification = new Notification();
      shiftRequestService.findOneWhere.mockResolvedValue(mockRequest);
      shiftRequestService.remove.mockResolvedValue({ affected: 0 });
      shiftRequestService.findAll.mockResolvedValue(mockRequests);
      notificationService.createUserSpecificNotification.mockResolvedValue(
        mockNotification,
      );

      const result = await controller.rejectRequest(id, deleteDto, req);
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id, status: Not(SHIFT_REQUEST_STATUS.assigned) },
        relations: {
          provider: true,
          shift: { facility: true, follower: true },
        },
      });
      expect(shiftRequestService.remove).toHaveBeenCalledWith(
        { id },
        deleteDto,
      );
      expect(shiftRequestService.findAll).toHaveBeenCalledWith({
        where: { shift: { id: mockRequest.shift.id } },
      });
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: mockRequest.shift.id },
        {
          status: SHIFT_STATUS.open,
          updated_by_id: req.user.id,
          updated_by_type: req.user.role,
        },
      );

      expect(shiftRequestService.updateOrientation).toHaveBeenCalledWith(
        mockRequest.shift.id,
        ORIENTATION_STATUS.orientation_rejected,
      );

      expect(shiftNotificationService.sendNotification).toHaveBeenCalledWith({
        email: mockRequest.shift.follower.email,
        emailType: EJS_FILES.shift_request_rejected,
        role: TABLE.facility_user,
        userId: mockRequest.shift.follower.id,
        shiftStatus: SHIFT_STATUS.requested,
        text: CONSTANT.NOTIFICATION.SHIFT_REQUEST_ACTION_TEXT(
          `Rejected`,
          `${mockRequest.shift.start_date}`,
          mockRequest.shift.facility.name,
        ),
        push_type: PushNotificationType.request_rejected,
        title: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_TITLE,
        subject: CONSTANT.EMAIL.SHIFT_REQUEST_REJECTED,
        shiftData: { ...mockRequest.shift },
      });
      expect(
        notificationService.createUserSpecificNotification,
      ).toHaveBeenCalledWith({
        title: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_TITLE,
        text: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_TEXT,
        push_type: PushNotificationType.request_rejected,
      });
      expect(
        firebaseNotificationService.sendNotificationToOne,
      ).toHaveBeenCalledWith(
        mockNotification,
        'provider',
        mockRequest.provider.id,
        {
          id: mockRequest.shift.id,
          notification_id: mockNotification.id,
          status: mockRequest.shift.status,
          start_date: mockRequest.shift.start_date,
          start_time: mockRequest.shift.start_time,
          end_date: mockRequest.shift.end_date,
          end_time: mockRequest.shift.end_time,
          facility: {
            id: mockRequest.shift.facility.id,
            name: mockRequest.shift.facility.name,
            street_address: mockRequest.shift.facility.street_address,
            house_no: mockRequest.shift.facility.house_no,
            zip_code: mockRequest.shift.facility.zip_code,
            latitude: mockRequest.shift.facility.latitude,
            longitude: mockRequest.shift.facility.longitude,
          },
          shift_status: SHIFT_STATUS.requested,
          to: 'notification_data',
          created_at: expect.any(String),
          description: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_DESCRIPTION,
        },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return not found if no data rejected', async () => {
      const mockShift = new Shift();
      mockShift.facility = new Facility();
      mockShift.follower = new FacilityUser();
      mockShift.start_date = '2020-09-01';
      mockShift.start_time = '08:00:00';
      const mockRequest = new ShiftRequest();
      mockRequest.shift = mockShift;
      mockRequest.provider = new Provider();
      shiftRequestService.findOneWhere.mockResolvedValue(mockRequest);

      const result = await controller.rejectRequest(id, deleteDto, req);
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id, status: Not(SHIFT_REQUEST_STATUS.assigned) },
        relations: {
          provider: true,
          shift: { facility: true, follower: true },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.TASK_ASSIGNMENT_CLOSED,
          data: {},
        }),
      );
    });

    it('should reject shift request', async () => {
      const mockShift = new Shift();
      mockShift.facility = new Facility();
      mockShift.follower = new FacilityUser();
      const mockRequest = new ShiftRequest();
      mockRequest.shift = mockShift;
      mockRequest.provider = new Provider();
      // mockRequest.provider.profile_progress = 100;
      // mockRequest.provider.verification_status = VERIFICATION_STATUS.verified;
      const mockRequests = [[], 0];
      const mockNotification = new Notification();
      shiftRequestService.findOneWhere.mockResolvedValue(mockRequest);
      shiftRequestService.remove.mockResolvedValue({ affected: 1 });
      shiftRequestService.findAll.mockResolvedValue(mockRequests);
      notificationService.createUserSpecificNotification.mockResolvedValue(
        mockNotification,
      );

      const result = await controller.rejectRequest(id, deleteDto, req);
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id, status: Not(SHIFT_REQUEST_STATUS.assigned) },
        relations: {
          provider: true,
          shift: { facility: true, follower: true },
        },
      });
      expect(shiftRequestService.remove).toHaveBeenCalledWith(
        { id },
        deleteDto,
      );
      expect(shiftRequestService.findAll).toHaveBeenCalledWith({
        where: { shift: { id: mockRequest.shift.id } },
      });
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: mockRequest.shift.id },
        {
          status: SHIFT_STATUS.open,
          updated_by_id: req.user.id,
          updated_by_type: req.user.role,
        },
      );
      expect(shiftNotificationService.sendNotification).toHaveBeenCalledWith({
        email: mockRequest.shift.follower.email,
        emailType: EJS_FILES.shift_request_rejected,
        role: TABLE.facility_user,
        userId: mockRequest.shift.follower.id,
        shiftStatus: SHIFT_STATUS.requested,
        text: CONSTANT.NOTIFICATION.SHIFT_REQUEST_ACTION_TEXT(
          `Rejected`,
          `${mockRequest.shift.start_date}`,
          mockRequest.shift.facility.name,
        ),
        push_type: PushNotificationType.request_rejected,
        title: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_TITLE,
        subject: CONSTANT.EMAIL.SHIFT_REQUEST_REJECTED,
        shiftData: { ...mockRequest.shift },
      });
      expect(
        notificationService.createUserSpecificNotification,
      ).toHaveBeenCalledWith({
        title: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_TITLE,
        text: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_TEXT,
        push_type: PushNotificationType.request_rejected,
      });
      expect(
        firebaseNotificationService.sendNotificationToOne,
      ).toHaveBeenCalledWith(
        mockNotification,
        'provider',
        mockRequest.provider.id,
        {
          id: mockRequest.shift.id,
          notification_id: mockNotification.id,
          status: mockRequest.shift.status,
          start_date: mockRequest.shift.start_date,
          start_time: mockRequest.shift.start_time,
          end_date: mockRequest.shift.end_date,
          end_time: mockRequest.shift.end_time,
          facility: {
            id: mockRequest.shift.facility.id,
            name: mockRequest.shift.facility.name,
            street_address: mockRequest.shift.facility.street_address,
            house_no: mockRequest.shift.facility.house_no,
            zip_code: mockRequest.shift.facility.zip_code,
            latitude: mockRequest.shift.facility.latitude,
            longitude: mockRequest.shift.facility.longitude,
          },
          shift_status: SHIFT_STATUS.requested,
          to: 'notification_data',
          created_at: expect.any(String),
          description: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_DESCRIPTION,
        },
      );

      expect(activityService.logShiftActivity).toHaveBeenCalledWith(
        mockRequest.shift,
        req,
        ACTIVITY_TYPE.FACILITY_REJECT_REQUEST,
        {
          provider: `${mockRequest.provider.first_name} ${mockRequest.provider.last_name}`,
        },
        ACTION_TABLES.SHIFT_REQUEST,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SHIFT_REQUEST_REJECTED,
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database error');
      shiftRequestService.findOneWhere.mockRejectedValue(error);
      const result = await controller.rejectRequest(id, deleteDto, req);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('requestShift', () => {
    const id = '1';
    const req: any = {
      user: {
        id: '1',
        profile_progress: 100,
        status: { name: active },
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      // Re-setup mocks after clearing
      providerCredentialsService.checkProviderCredentials = jest
        .fn()
        .mockResolvedValue(false) as jest.MockedFunction<
        typeof providerCredentialsService.checkProviderCredentials
      >;
      shiftService.findOneWhere = jest
        .fn()
        .mockResolvedValue(null) as jest.MockedFunction<
        typeof shiftService.findOneWhere
      >;
    });

    it('should return bad request if shift not found', async () => {
      providerCredentialsService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        { expired: false, notApproved: false, rejected: false },
      );
      shiftService.findOneWhere.mockResolvedValueOnce(null);

      const result = await controller.requestShift(id, req);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id, status: Not(SHIFT_STATUS.cancelled) },
        relations: { follower: true, facility: true },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        }),
      );
    });

    it('should return bad request if profile not completed', async () => {
      req.user = {
        id: '1',
        first_name: null,
        last_name: null,
        email: null,
        mobile_no: null,
        gender: 'male',
        birth_date: '2024/01/01',
        certificate: new Certificate(),
        speciality: new Speciality(),
        address: [new ProviderAddress()],
        profile_progress: 100,
        status: { name: active },
        verification_status: VERIFICATION_STATUS.verified,
      };
      const mockShift = new Shift();
      const facility = new Facility();
      facility.id = 'facility-1';
      facility.timezone = 'America/New_York';
      mockShift.facility = facility;

      shiftService.findOneWhere.mockResolvedValueOnce(mockShift);
      providerCredentialsService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        { expired: false, notApproved: false, rejected: false },
      );

      const result = await controller.requestShift(id, req);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id, status: Not(SHIFT_STATUS.cancelled) },
        relations: { follower: true, facility: true },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.PROFILE_INCOMPLETE,
          data: {},
        }),
      );
    });

    it('should return bad request if already requested', async () => {
      req.user = {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        email: 'email',
        mobile_no: 'mobile',
        gender: 'male',
        birth_date: '2024/01/01',
        certificate: new Certificate(),
        speciality: new Speciality(),
        address: [new ProviderAddress()],
        shift_time: ['Days'],
        profile_progress: 100,
        status: { name: active },
        verification_status: VERIFICATION_STATUS.verified,
      };
      const mockShift = new Shift();
      mockShift.status = SHIFT_STATUS.requested;
      mockShift.start_time = '09:00:00';
      mockShift.end_time = '17:00:00';
      const mockFacility = new Facility();
      mockShift.facility = mockFacility;
      const mockRequest = new ShiftRequest();
      mockRequest.shift = mockShift;
      mockRequest.status = SHIFT_REQUEST_STATUS.unassigned;

      providerCredentialsService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        { expired: false, notApproved: false, rejected: false },
      );
      shiftService.findOneWhere.mockResolvedValueOnce(mockShift);
      shiftRequestService.findOneWhere.mockResolvedValue(mockRequest);

      const result = await controller.requestShift(id, req);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id, status: Not(SHIFT_STATUS.cancelled) },
        relations: { follower: true, facility: true },
      });
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { shift: { id: id }, provider: { id: req.user.id } },
        relations: {
          provider: true,
          shift: { follower: true, facility: true },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RESPONSE_ALREADY_SUBMITTED('Request'),
          data: {},
        }),
      );
    });

    it('should return bad request if shift already assigned', async () => {
      req.user = {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        email: 'email',
        mobile_no: 'mobile',
        gender: 'male',
        birth_date: '2024/01/01',
        certificate: new Certificate(),
        speciality: new Speciality(),
        address: [new ProviderAddress()],
        shift_time: ['Days', 'Evenings'],
        profile_progress: 100,
        status: { name: active },
        verification_status: VERIFICATION_STATUS.verified,
      };
      const mockShift = new Shift();
      mockShift.status = SHIFT_STATUS.scheduled;
      mockShift.start_time = '09:00:00';
      mockShift.end_time = '17:00:00';
      mockShift.facility = new Facility();
      mockShift.follower = new FacilityUser();
      const shiftRequest = new ShiftRequest();
      shiftRequest.shift = mockShift;
      shiftRequest.provider = req.user;
      shiftRequest.status = SHIFT_REQUEST_STATUS.assigned;

      providerCredentialsService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        { expired: false, notApproved: false, rejected: false },
      );
      shiftService.findOneWhere.mockResolvedValueOnce(mockShift);
      shiftRequestService.findOneWhere.mockResolvedValueOnce(shiftRequest);

      const result = await controller.requestShift(id, req);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id, status: Not(SHIFT_STATUS.cancelled) },
        relations: { follower: true, facility: true },
      });
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { shift: { id: id }, provider: { id: req.user.id } },
        relations: {
          provider: true,
          shift: { follower: true, facility: true },
        },
      });
      expect(shiftRequestService.findOneWhere).toHaveBeenLastCalledWith({
        where: {
          shift: { id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: true,
          shift: { follower: true, facility: true },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SHIFT_ALREADY_ASSIGNED,
          data: {},
        }),
      );
    });

    it('should submit request successfully', async () => {
      req.user = {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        email: 'email',
        mobile_no: 'mobile',
        gender: 'male',
        birth_date: '2024/01/01',
        certificate: new Certificate(),
        speciality: new Speciality(),
        address: [new ProviderAddress()],
        shift_time: {
          D: true, // 8 Hours Days
          E: true, // 8 Hours Evenings
          N: false, // 8 Hours Nights
          A: false, // 12 Hours Day
          P: false, // 12 Hours Night
        },
        profile_progress: 100,
        status: { name: active },
        verification_status: VERIFICATION_STATUS.verified,
      };
      const mockFacilityProvider = new FacilityProvider();
      const mockShift = new Shift();
      const mockProvider = new Provider();
      mockProvider.first_name = 'JK';
      mockProvider.last_name = 'JK';
      mockShift.provider = mockProvider;
      mockShift.facility = new Facility();
      mockShift.facility.id = 'facility-1';
      mockShift.follower = new FacilityUser();
      mockShift.status = SHIFT_STATUS.open;
      mockShift.start_time = '09:00:00';
      mockShift.end_time = '17:00:00';
      const mockRequest = new ShiftRequest();

      providerCredentialsService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        { expired: false, notApproved: false, rejected: false },
      );
      shiftService.findOneWhere.mockResolvedValueOnce(mockShift);
      shiftRequestService.findOneWhere
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      facilityProviderService.findOneWhere.mockResolvedValue(
        mockFacilityProvider,
      );
      shiftService.getShiftTimeCode.mockResolvedValue('D'); // Mock shift preference code
      shiftService.overlappingShift.mockResolvedValue(null); // No overlapping shifts
      shiftRequestService.create.mockResolvedValue(mockRequest);

      const result = await controller.requestShift(id, req);
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id, status: Not(SHIFT_STATUS.cancelled) },
        relations: { follower: true, facility: true },
      });
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { shift: { id: id }, provider: { id: req.user.id } },
        relations: {
          provider: true,
          shift: { follower: true, facility: true },
        },
      });

      expect(shiftRequestService.create).toHaveBeenCalledWith({
        provider: req.user.id,
        shift: id,
      });
      expect(shiftNotificationService.sendNotification).toHaveBeenCalledWith({
        email: mockShift.follower.email,
        emailType: EJS_FILES.shift_requested,
        role: TABLE.facility_user,
        userId: mockShift.follower.id,
        shiftStatus: SHIFT_STATUS.requested,
        text: CONSTANT.NOTIFICATION.SHIFT_REQUEST_TEXT(
          `${mockShift.provider.first_name} ${mockShift.provider.last_name}`,
          `${mockShift.start_date}`,
          moment(mockShift.start_time, 'HH:mm:ss').format('hh:mm A'),
          mockShift.facility.name,
        ),
        push_type: PushNotificationType.shift_requested,
        title: CONSTANT.NOTIFICATION.SHIFT_REQUEST_TITLE,
        subject: CONSTANT.EMAIL.SHIFT_REQUESTED,
        shiftData: { ...mockShift },
      });
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: id },
        {
          status: SHIFT_STATUS.requested,
        },
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Shift Requested'),
          data: mockRequest,
        }),
      );
    });

    // it('should return bad request if orientation is pending', async () => {
    //   req.user = {
    //     id: '1',
    //     first_name: 'first',
    //     last_name: 'last',
    //     email: 'email',
    //     mobile_no: 'mobile',
    //     gender: 'male',
    //     birth_date: '2024/01/01',
    //     certificate: new Certificate(),
    //     speciality: new Speciality(),
    //     address: [new ProviderAddress()],
    //     shift_time: ['Days', 'Evenings'],
    //   };
    //   const mockShift = new Shift();
    //   mockShift.facility = new Facility();
    //   mockShift.facility.id = 'facility-1';
    //   mockShift.status = SHIFT_STATUS.open;
    //   mockShift.start_time = '09:00:00';
    //   mockShift.end_time = '17:00:00';

    //   shiftService.findOneWhere.mockResolvedValue(mockShift);
    //   shiftRequestService.findOneWhere.mockResolvedValue(null);
    //   facilityProviderService.findOneWhere.mockResolvedValue(null);

    //   const result = await controller.requestShift(id, req);

    //   expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
    //     where: {
    //       facility: { id: mockShift.facility.id },
    //       provider: { id: req.user.id },
    //     },
    //   });
    // });

    it('should handle errors during the process', async () => {
      const error = new Error('Database error');
      shiftService.findOneWhere.mockRejectedValue(error);
      const result = await controller.requestShift(id, req);

      expect(result).toEqual(response.failureResponse(error));
    });

    it('should return bad request when shift is already assigned', async () => {
      req.user = {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        email: 'email',
        mobile_no: 'mobile',
        gender: 'male',
        birth_date: '2024/01/01',
        certificate: new Certificate(),
        speciality: new Speciality(),
        address: [new ProviderAddress()],
        shift_time: ['Days'],
        profile_progress: 100,
        status: { name: active },
        verification_status: VERIFICATION_STATUS.verified,
      };

      const mockShift = new Shift();
      mockShift.start_time = '09:00:00'; // Add required time properties
      mockShift.end_time = '17:00:00';
      mockShift.status = SHIFT_STATUS.scheduled;
      mockShift.provider = new Provider();
      const facility = new Facility();
      facility.id = 'facility-1';
      facility.timezone = 'America/New_York';
      mockShift.facility = facility;

      const mockAssignedRequest = new ShiftRequest();
      mockAssignedRequest.status = SHIFT_REQUEST_STATUS.assigned;
      mockAssignedRequest.shift = mockShift;

      shiftService.findOneWhere.mockResolvedValueOnce(mockShift);
      providerCredentialsService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        { expired: false, notApproved: false, rejected: false },
      );
      shiftRequestService.findOneWhere.mockResolvedValueOnce(
        mockAssignedRequest,
      ); // Second call for checking assigned status

      const result = await controller.requestShift(id, req);

      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: { id, status: Not(SHIFT_STATUS.cancelled) },
        relations: { follower: true, facility: true },
      });
      expect(shiftRequestService.findOneWhere).toHaveBeenCalledWith({
        where: { shift: { id: id }, provider: { id: req.user.id } },
        relations: {
          provider: true,
          shift: { follower: true, facility: true },
        },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SHIFT_ALREADY_ASSIGNED,
          data: {},
        }),
      );
    });
  });
});
