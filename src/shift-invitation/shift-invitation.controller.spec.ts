import { Test, TestingModule } from '@nestjs/testing';
import { ShiftInvitationController } from './shift-invitation.controller';
import { ShiftInvitationService } from './shift-invitation.service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { AIService } from '@/shared/helpers/ai-service';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { ShiftService } from '@/shift/shift.service';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import {
  SHIFT_STATUS,
  SHIFT_INVITATION_STATUS,
  EJS_FILES,
  TABLE,
  ACTIVITY_TYPE,
  PushNotificationType,
  VERIFICATION_STATUS,
  ACTION_TABLES,
} from '@/shared/constants/enum';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Notification } from '@/notification/entities/notification.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import {
  In,
  MoreThanOrEqual,
  LessThanOrEqual,
  Not,
  LessThan,
  MoreThan,
  Equal,
} from 'typeorm';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { ActivityService } from '@/activity/activity.service';
import * as moment from 'moment-timezone';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';

describe('ShiftInvitationController', () => {
  let controller: ShiftInvitationController;
  let shiftInvitationService: any;
  let shiftService: any;
  let notificationService: any;
  let firebaseNotificationService: any;
  let autoSchedulingService: any;
  let aiService: any;
  let shiftNotificationService: any;
  let activityService: any;
  let providerCredentialService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftInvitationController],
      providers: [
        {
          provide: ShiftInvitationService,
          useValue: {
            findAll: jest.fn(),
            findOneWhere: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            updateOrCreateInvitation: jest.fn(),
          },
        },
        {
          provide: ShiftService,
          useValue: {
            findOneWhere: jest.fn(),
            updateWhere: jest.fn(),
            overlappingShift: jest.fn(),
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
          provide: AIService,
          useValue: {
            getAIRecommendations: jest.fn(),
          },
        },
        {
          provide: ShiftNotificationService,
          useValue: {
            sendNotification: jest.fn(),
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
          provide: AutoSchedulingSettingService,
          useValue: { findOneWhere: jest.fn() },
        },
        {
          provide: ProviderCredentialsService,
          useValue: {
            checkIfExpiredLatestCredentialsByProvider: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShiftInvitationController>(
      ShiftInvitationController,
    );
    shiftInvitationService = module.get<ShiftInvitationService>(
      ShiftInvitationService,
    );
    shiftService = module.get<ShiftService>(ShiftService);
    notificationService = module.get<NotificationService>(NotificationService);
    firebaseNotificationService = module.get<FirebaseNotificationService>(
      FirebaseNotificationService,
    );
    autoSchedulingService = module.get<AutoSchedulingService>(
      AutoSchedulingService,
    );
    aiService = module.get<AIService>(AIService);
    shiftNotificationService = module.get<ShiftNotificationService>(
      ShiftNotificationService,
    );
    activityService = module.get<ActivityService>(ActivityService);
    providerCredentialService = module.get<ProviderCredentialsService>(
      ProviderCredentialsService,
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const id = '1';
    const queryParamsDto = new QueryParamsDto();
    it('should successfully retrieve Invitations', async () => {
      const mockInvitations = Array(10).fill(new ShiftInvitation());
      const mockCount = 10;

      shiftInvitationService.findAll.mockResolvedValue([
        mockInvitations,
        mockCount,
      ]); // Mock service response

      const result = await controller.findAll(id, queryParamsDto);

      expect(shiftInvitationService.findAll).toHaveBeenCalledWith({
        where: { shift: { id: id }, shift_status: SHIFT_STATUS.invite_sent },
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
          message: CONSTANT.SUCCESS.RECORD_FOUND('Invitations'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockInvitations,
        }),
      );
    });

    it('should return no records found when there are no Invitations', async () => {
      shiftInvitationService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(id, queryParamsDto);
      expect(shiftInvitationService.findAll).toHaveBeenCalledWith({
        where: { shift: { id: id }, shift_status: SHIFT_STATUS.invite_sent },
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
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Invitations'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      shiftInvitationService.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findAll(id, queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getAllAutoSchedulingInvitation', () => {
    const id = '1';
    const queryParamsDto = new QueryParamsDto();
    it('should successfully retrieve Invitations', async () => {
      const mockInvitations = Array(10).fill(new ShiftInvitation());
      const mockCount = 10;

      shiftInvitationService.findAll.mockResolvedValue([
        mockInvitations,
        mockCount,
      ]); // Mock service response

      const result = await controller.getAllAutoSchedulingInvitation(
        id,
        queryParamsDto,
      );

      expect(shiftInvitationService.findAll).toHaveBeenCalledWith({
        where: { shift: { id }, shift_status: SHIFT_STATUS.auto_scheduling },
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
            middle_name: true,
            last_name: true,
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
          message: CONSTANT.SUCCESS.RECORD_FOUND('Invitations'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockInvitations,
        }),
      );
    });

    it('should return no records found when there are no Invitations', async () => {
      shiftInvitationService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.getAllAutoSchedulingInvitation(
        id,
        queryParamsDto,
      );
      expect(shiftInvitationService.findAll).toHaveBeenCalledWith({
        where: { shift: { id }, shift_status: SHIFT_STATUS.auto_scheduling },
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
            middle_name: true,
            last_name: true,
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
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Invitations'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      shiftInvitationService.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.getAllAutoSchedulingInvitation(
        id,
        queryParamsDto,
      );

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findAllInvitations', () => {
    const req: any = { user: { id: '1' } };
    it('should successfully retrieve Invitations', async () => {
      const mockInvitations = Array(10).fill(new ShiftInvitation());
      const mockCount = 10;

      shiftInvitationService.findAll.mockResolvedValue([
        mockInvitations,
        mockCount,
      ]); // Mock service response

      const result = await controller.findAllInvitations(req);

      expect(shiftInvitationService.findAll).toHaveBeenCalledWith({
        where: {
          provider: { id: req.user.id },
          status: SHIFT_INVITATION_STATUS.invited,
        },
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
            },
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Invitations'),
          data: mockInvitations,
        }),
      );
    });

    it('should return no records found when there are no Invitations', async () => {
      shiftInvitationService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAllInvitations(req);
      expect(shiftInvitationService.findAll).toHaveBeenCalledWith({
        where: {
          provider: { id: req.user.id },
          status: SHIFT_INVITATION_STATUS.invited,
        },
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
            },
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Invitations'),
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      shiftInvitationService.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findAllInvitations(req);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getInvitationDetails', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };
    it('should successfully retrieve Invitations', async () => {
      const mockInvitations = Array(10).fill(new ShiftInvitation());
      const mockCount = 10;

      shiftInvitationService.findAll.mockResolvedValue([
        mockInvitations,
        mockCount,
      ]); // Mock service response

      const result = await controller.getInvitationDetails(id, req);

      expect(shiftInvitationService.findAll).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: { id: req.user.id },
          status: SHIFT_INVITATION_STATUS.invited,
        },
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
            },
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Invitations'),
          data: mockInvitations,
        }),
      );
    });

    it('should return no records found when there are no Invitations', async () => {
      shiftInvitationService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.getInvitationDetails(id, req);
      expect(shiftInvitationService.findAll).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: { id: req.user.id },
          status: SHIFT_INVITATION_STATUS.invited,
        },
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
            },
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Invitations'),
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      shiftInvitationService.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.getInvitationDetails(id, req);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('inviteAgain', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };

    it('should return bad request if not invitation found', async () => {
      shiftInvitationService.findOneWhere.mockResolvedValue(null);

      const result = await controller.inviteAgain(id, req);

      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          provider: true,
          shift: {
            facility: true,
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

    it('should sent invitation again', async () => {
      const mockShift = new Shift();
      mockShift.facility = new Facility();
      const mockInvitation = new ShiftInvitation();
      mockInvitation.shift = mockShift;
      mockInvitation.provider = new Provider();
      const mockNotification = new Notification();
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);
      shiftInvitationService.update.mockResolvedValue({ affected: 1 });
      notificationService.createUserSpecificNotification.mockResolvedValue(
        mockNotification,
      );

      const result = await controller.inviteAgain(id, req);

      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          provider: true,
          shift: {
            facility: true,
          },
        },
      });
      expect(
        notificationService.createUserSpecificNotification,
      ).toHaveBeenCalledWith({
        title: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TITLE,
        text: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TEXT(
          moment(mockShift.start_date).format('MMMM D YYYY'),
          moment(mockShift.start_time, 'HH:mm:ss').format('hh:mm A'),
          moment(mockShift.end_time, 'HH:mm:ss').format('hh:mm A'),
          mockShift.facility.name,
        ),
        push_type: PushNotificationType.invited,
      });
      expect(
        firebaseNotificationService.sendNotificationToOne,
      ).toHaveBeenCalledWith(
        mockNotification,
        'provider',
        mockInvitation.provider.id,
        {
          id: mockInvitation.shift.id,
          notification_id: mockNotification.id,
          status: mockInvitation.shift.status,
          start_date: mockInvitation.shift.start_date,
          start_time: mockInvitation.shift.start_time,
          end_date: mockInvitation.shift.end_date,
          end_time: mockInvitation.shift.end_time,
          facility: {
            id: mockInvitation.shift.facility.id,
            name: mockInvitation.shift.facility.name,
            street_address: mockInvitation.shift.facility.street_address,
            house_no: mockInvitation.shift.facility.house_no,
            zip_code: mockInvitation.shift.facility.zip_code,
            latitude: mockInvitation.shift.facility.latitude,
            longitude: mockInvitation.shift.facility.longitude,
          },
          expire_in: 10,
          shift_status: SHIFT_STATUS.invite_sent,
          is_timer: false,
          to: 'notification_data',
          created_at: expect.any(String),
          description: CONSTANT.NOTIFICATION.SHIFT_INVITATION_DESCRIPTION,
        },
      );
      expect(shiftInvitationService.update).toHaveBeenCalledWith(
        { id },
        {
          status: SHIFT_INVITATION_STATUS.invited,
          invited_on: expect.any(String),
        },
      );
      expect(activityService.logProviderActivity).toHaveBeenCalledWith(
        mockInvitation,
        req,
        ACTIVITY_TYPE.INVITE_AGAIN,
        {},
        ACTION_TABLES.SHIFT_INVITATION,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Invitation sent'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database error');
      shiftInvitationService.findOneWhere.mockRejectedValue(error);
      const result = await controller.inviteAgain(id, req);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('withdrawn', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };

    it('should return bad request if not invitation found', async () => {
      shiftInvitationService.findOneWhere.mockResolvedValue(null);

      const result = await controller.withdrawn(id, req);

      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          provider: true,
          shift: { facility: true },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should withdrawn invitation successfully', async () => {
      const mockInvitation = new ShiftInvitation();
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);
      shiftInvitationService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.withdrawn(id, req);

      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: {
          provider: true,
          shift: { facility: true },
        },
      });
      expect(shiftInvitationService.update).toHaveBeenCalledWith(
        { id },
        {
          status: SHIFT_INVITATION_STATUS.withdrawn,
        },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Withdrawn'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database error');
      shiftInvitationService.findOneWhere.mockRejectedValue(error);
      const result = await controller.withdrawn(id, req);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('acceptInvitation', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };
    it('should return bad request if no invitation found', async () => {
      shiftInvitationService.findOneWhere.mockResolvedValue(null);

      const result = await controller.acceptInvitation(id, req);
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: { status: true },
          shift: { follower: true, facility: true },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return bad request if no invitation found', async () => {
      const mockShift = new Shift();
      mockShift.id = '1';
      mockShift.status = SHIFT_STATUS.cancelled;
      mockShift.facility = new Facility();
      mockShift.facility.timezone = 'America/New_York';
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;
      const mockStatus = new StatusSetting();
      mockStatus.name = 'Active';
      mockProvider.status = mockStatus;
      const mockInvitation = new ShiftInvitation();
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);

      providerCredentialService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        { expired: false, notApproved: false, rejected: false },
      );
      const result = await controller.acceptInvitation(id, req);
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: { status: true },
          shift: { follower: true, facility: true },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.CANCELLED_BY_FACILITY,
          data: {},
        }),
      );
    });

    it('should return bad request if no invitation found', async () => {
      const mockShift = new Shift();
      mockShift.status = SHIFT_STATUS.cancelled;
      const facility = new Facility();
      facility.timezone = 'America/New_York';
      mockShift.facility = facility;
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;
      const mockStatus = new StatusSetting();
      mockStatus.name = 'Active';
      mockProvider.status = mockStatus;
      const mockInvitation = new ShiftInvitation();
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      mockInvitation.status = SHIFT_INVITATION_STATUS.accepted;
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);

      providerCredentialService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        { expired: false, notApproved: false, rejected: false },
      );
      const result = await controller.acceptInvitation(id, req);
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: { status: true },
          shift: { follower: true, facility: true },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVITATION_ALREADY_ACCEPTED,
          data: {},
        }),
      );
    });

    it('should return bad request if no invitation found', async () => {
      const mockShift = new Shift();
      mockShift.status = SHIFT_STATUS.cancelled;
      mockShift.start_date = '2024-01-01';
      mockShift.start_time = '08:00:00';
      mockShift.end_date = '2024-01-01';
      mockShift.end_time = '16:00:00';
      mockShift.facility = new Facility();
      mockShift.facility.timezone = 'America/New_York';
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;
      const mockStatus = new StatusSetting();
      mockStatus.name = 'Active';
      mockProvider.status = mockStatus;
      const mockInvitation = new ShiftInvitation();
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      mockInvitation.status = SHIFT_INVITATION_STATUS.rejected;
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);

      providerCredentialService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        { expired: false, notApproved: false, rejected: false },
      );
      const result = await controller.acceptInvitation(id, req);
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: { status: true },
          shift: { follower: true, facility: true },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVITATION_ALREADY_REJECTED,
          data: {},
        }),
      );
    });

    it('should return bad request if no invitation found', async () => {
      const mockShift = new Shift();
      mockShift.id = '1';
      mockShift.status = SHIFT_STATUS.scheduled;
      mockShift.start_date = '2020-09-01';
      mockShift.start_time = '08:00:00';
      mockShift.end_date = '2020-09-01';
      mockShift.end_time = '10:00:00';
      mockShift.facility = new Facility();
      mockShift.facility.timezone = 'America/New_York';
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;
      const mockStatus = new StatusSetting();
      mockStatus.name = 'Active';
      mockProvider.status = mockStatus;
      const mockInvitation = new ShiftInvitation();
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      mockInvitation.status = SHIFT_INVITATION_STATUS.invited;

      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);
      providerCredentialService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        { expired: false, notApproved: false, rejected: false },
      );
      const result = await controller.acceptInvitation(id, req);
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: { status: true },
          shift: { follower: true, facility: true },
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
      const mockInvitation = new ShiftInvitation();
      const mockShift = new Shift();
      mockShift.id = '1';
      mockShift.facility = new Facility();
      mockShift.facility.timezone = 'America/New_York';
      const mockProvider = new Provider();
      const mockStatus = new StatusSetting();
      mockStatus.name = 'Active';
      mockProvider.status = mockStatus;
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);
      providerCredentialService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        false,
      );
      shiftService.findOneWhere.mockResolvedValue(mockShift);

      const result = await controller.acceptInvitation(id, req);
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: { status: true },
          shift: { follower: true, facility: true },
        },
      });
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: mockInvitation.shift.id,
          status: SHIFT_STATUS.scheduled,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SHIFT_ALREADY_ASSIGNED,
          data: {},
        }),
      );
    });

    it('should return bad request if provider is not available', async () => {
      const mockInvitation = new ShiftInvitation();
      const mockShift = new Shift();
      mockShift.id = '1';
      mockShift.facility = new Facility();
      mockShift.facility.timezone = 'America/New_York';
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      const mockStatus = new StatusSetting();
      mockStatus.name = 'Active';
      mockInvitation.provider.status = mockStatus;
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);
      providerCredentialService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        false,
      );
      shiftService.findOneWhere
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockShift);

      const result = await controller.acceptInvitation(id, req);
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: { status: true },
          shift: { follower: true, facility: true },
        },
      });
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: mockInvitation.shift.id,
          status: SHIFT_STATUS.scheduled,
        },
      });
      expect(shiftService.findOneWhere).toHaveBeenNthCalledWith(2, {
        where: [
          {
            // Case 1: Existing shift fully contains the new shift (even across midnight)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: LessThanOrEqual(mockInvitation.shift.start_date),
            end_date: MoreThanOrEqual(mockInvitation.shift.end_date),
            start_time: LessThanOrEqual(mockInvitation.shift.start_time),
            end_time: MoreThanOrEqual(mockInvitation.shift.end_time),
          },
          {
            // Case 2: New shift fully contains the existing shift (even across midnight)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: MoreThanOrEqual(mockInvitation.shift.start_date),
            end_date: LessThanOrEqual(mockInvitation.shift.end_date),
            start_time: MoreThanOrEqual(mockInvitation.shift.start_time),
            end_time: LessThanOrEqual(mockInvitation.shift.end_time),
          },
          {
            // Case 3: Overlapping start times (existing shift starts before the new shift ends but after the new shift starts)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: Equal(mockInvitation.shift.start_date),
            start_time: LessThan(mockInvitation.shift.end_time),
            end_time: MoreThan(mockInvitation.shift.start_time),
          },
          {
            // Case 4: Overlapping end times (existing shift ends after the new shift starts but before the new shift ends)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: Equal(mockInvitation.shift.start_date),
            end_time: MoreThan(mockInvitation.shift.start_time),
            start_time: LessThan(mockInvitation.shift.end_time),
          },
        ],
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SHIFT_SLOT_NOT_AVAILABLE,
          data: {},
        }),
      );
    });

    it('should scheduled the request for that provider', async () => {
      const mockShift = new Shift();
      mockShift.id = '1';
      mockShift.facility = new Facility();
      mockShift.follower = new FacilityUser();
      const mockInvitation = new ShiftInvitation();
      mockShift.facility.timezone = 'America/New_York';
      mockInvitation.shift = mockShift;
      mockInvitation.provider = new Provider();
      mockInvitation.provider.id = '1';
      mockInvitation.provider.profile_progress = 100;
      mockInvitation.provider.verification_status =
        VERIFICATION_STATUS.verified;
      const mockStatus = new StatusSetting();
      mockStatus.name = 'Active';
      mockInvitation.provider.status = mockStatus;
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);
      providerCredentialService.checkIfExpiredLatestCredentialsByProvider.mockResolvedValue(
        false,
      );
      shiftService.findOneWhere
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      shiftInvitationService.update.mockResolvedValue({ affected: 1 });
      shiftService.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.acceptInvitation(id, req);
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: { status: true },
          shift: { follower: true, facility: true },
        },
      });
      expect(shiftService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: mockInvitation.shift.id,
          status: SHIFT_STATUS.scheduled,
        },
      });
      expect(shiftService.findOneWhere).toHaveBeenNthCalledWith(2, {
        where: [
          {
            // Case 1: Existing shift fully contains the new shift (even across midnight)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: LessThanOrEqual(mockInvitation.shift.start_date),
            end_date: MoreThanOrEqual(mockInvitation.shift.end_date),
            start_time: LessThanOrEqual(mockInvitation.shift.start_time),
            end_time: MoreThanOrEqual(mockInvitation.shift.end_time),
          },
          {
            // Case 2: New shift fully contains the existing shift (even across midnight)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: MoreThanOrEqual(mockInvitation.shift.start_date),
            end_date: LessThanOrEqual(mockInvitation.shift.end_date),
            start_time: MoreThanOrEqual(mockInvitation.shift.start_time),
            end_time: LessThanOrEqual(mockInvitation.shift.end_time),
          },
          {
            // Case 3: Overlapping start times (existing shift starts before the new shift ends but after the new shift starts)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: Equal(mockInvitation.shift.start_date),
            start_time: LessThan(mockInvitation.shift.end_time),
            end_time: MoreThan(mockInvitation.shift.start_time),
          },
          {
            // Case 4: Overlapping end times (existing shift ends after the new shift starts but before the new shift ends)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: Equal(mockInvitation.shift.start_date),
            end_time: MoreThan(mockInvitation.shift.start_time),
            start_time: LessThan(mockInvitation.shift.end_time),
          },
        ],
      });
      expect(shiftInvitationService.update).toHaveBeenCalledWith(
        { shift: { id }, provider: { id: req.user.id } },
        {
          status: SHIFT_INVITATION_STATUS.accepted,
        },
      );
      expect(shiftService.updateWhere).toHaveBeenCalledWith(
        { id: mockInvitation.shift.id },
        {
          provider: req.user.id,
          temp_conf_at: expect.any(String),
          status: SHIFT_STATUS.scheduled,
        },
      );
      expect(shiftNotificationService.sendNotification).toHaveBeenCalledWith({
        email: mockInvitation.shift.follower.email,
        emailType: EJS_FILES.shift_scheduled,
        role: TABLE.facility_user,
        userId: mockInvitation.shift.follower.id,
        shiftStatus: SHIFT_STATUS.scheduled,
        text: CONSTANT.NOTIFICATION.SHIFT_SCHEDULED_TEXT(
          `${mockInvitation.shift.start_date}`,
          mockInvitation.shift.facility.name,
        ),
        push_type: PushNotificationType.scheduled,
        title: CONSTANT.NOTIFICATION.SHIFT_SCHEDULED_TITLE,
        subject: CONSTANT.EMAIL.SHIFT_SCHEDULED,
        shiftData: {
          ...mockInvitation.shift,
          provider: { ...mockInvitation.provider },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Invitation Accepted'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database error');
      shiftInvitationService.findOneWhere.mockRejectedValue(error);
      const result = await controller.acceptInvitation(id, req);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('rejectInvitation', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };
    it('should return bad request if no invitation found', async () => {
      shiftInvitationService.findOneWhere.mockResolvedValue(null);

      const result = await controller.rejectInvitation(id, req);

      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id: id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: true,
          shift: {
            certificate: true,
            follower: true,
            speciality: true,
            facility: true,
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

    it('should return bad request if no invitation found', async () => {
      const mockShift = new Shift();
      mockShift.status = SHIFT_STATUS.cancelled;
      mockShift.start_date = '2024-01-01';
      mockShift.start_time = '08:00:00';
      mockShift.end_date = '2024-01-01';
      mockShift.end_time = '16:00:00';
      mockShift.facility = new Facility();
      mockShift.facility.timezone = 'America/New_York';
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;
      const mockInvitation = new ShiftInvitation();
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      mockInvitation.status = SHIFT_INVITATION_STATUS.rejected;
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);

      const result = await controller.rejectInvitation(id, req);

      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id: id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: true,
          shift: {
            certificate: true,
            follower: true,
            speciality: true,
            facility: true,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVITATION_ALREADY_REJECTED,
          data: {},
        }),
      );
    });

    it('should return bad request if no invitation found', async () => {
      const mockShift = new Shift();
      mockShift.status = SHIFT_STATUS.cancelled;
      mockShift.start_date = '2024-01-01';
      mockShift.start_time = '08:00:00';
      mockShift.end_date = '2024-01-01';
      mockShift.end_time = '16:00:00';
      mockShift.facility = new Facility();
      mockShift.facility.timezone = 'America/New_York';
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;
      const mockInvitation = new ShiftInvitation();
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      mockInvitation.status = SHIFT_INVITATION_STATUS.accepted;
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);

      const result = await controller.rejectInvitation(id, req);

      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id: id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: true,
          shift: {
            certificate: true,
            follower: true,
            speciality: true,
            facility: true,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVITATION_ALREADY_ACCEPTED,
          data: {},
        }),
      );
    });

    it('should return bad request if no invitation found', async () => {
      const mockShift = new Shift();
      mockShift.id = '1';
      mockShift.facility = new Facility();
      mockShift.facility.timezone = 'America/New_York';
      mockShift.status = SHIFT_STATUS.cancelled;
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;
      const mockInvitation = new ShiftInvitation();
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      mockInvitation.status = SHIFT_INVITATION_STATUS.invited;
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);

      const result = await controller.rejectInvitation(id, req);

      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id: id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: true,
          shift: {
            certificate: true,
            follower: true,
            speciality: true,
            facility: true,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.CANCELLED_BY_FACILITY,
          data: {},
        }),
      );
    });

    it('should return bad request if the shift date has passed', async () => {
      const mockFacility = new Facility();
      mockFacility.id = '1';

      const mockShift = new Shift();
      mockShift.id = '1';
      mockShift.start_date = '2020-09-01'; // Past date
      mockShift.start_time = '08:00:00'; // Past time
      mockShift.end_date = '2020-09-01'; // Past date
      mockShift.end_time = '09:00:00'; // Past time
      mockShift.status = SHIFT_STATUS.invite_sent;
      mockShift.facility = mockFacility;
      mockShift.facility.timezone = 'America/New_York';
      mockShift.follower = new FacilityUser();
      mockShift.certificate = new Certificate();
      mockShift.speciality = new Speciality();

      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;

      const mockInvitation = new ShiftInvitation();
      mockInvitation.id = '1';
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      mockInvitation.status = SHIFT_INVITATION_STATUS.invited;

      // Mocking the shiftInvitationService response
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);

      const result = await controller.rejectInvitation(id, req);

      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id: id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: true,
          shift: {
            certificate: true,
            follower: true,
            speciality: true,
            facility: true,
          },
        },
      });

      // Expect the response to return a bad request due to past shift date
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.TASK_ASSIGNMENT_CLOSED,
          data: {},
        }),
      );
    });

    it('should run auto scheduling', async () => {
      const mockFacility = new Facility();
      const mockShift = new Shift();
      mockShift.id = '1';
      mockShift.start_time = '09:00';
      mockShift.end_time = '10:00';
      mockShift.status = SHIFT_STATUS.invite_sent;
      mockShift.facility = mockFacility;
      mockShift.facility.timezone = 'America/New_York';
      mockShift.follower = new FacilityUser();
      mockShift.certificate = new Certificate();
      mockShift.speciality = new Speciality();
      const mockProvider = new Provider();
      mockProvider.id = '1';
      mockProvider.profile_progress = 100;
      mockProvider.verification_status = VERIFICATION_STATUS.verified;
      const mockInvitation = new ShiftInvitation();
      mockInvitation.id = '1';
      mockInvitation.shift = mockShift;
      mockInvitation.provider = mockProvider;
      const mockCount = 0;
      const mockAllProviders = [];
      shiftInvitationService.findOneWhere.mockResolvedValue(mockInvitation);
      shiftInvitationService.findAll.mockResolvedValue([, mockCount]);
      aiService.getAIRecommendations.mockResolvedValue(mockAllProviders);
      autoSchedulingService.filterByPreferenceOfProvider.mockResolvedValue([]);
      autoSchedulingService.filterProviderList.mockResolvedValue(
        mockAllProviders,
      );

      const result = await controller.rejectInvitation(id, req);
      expect(shiftInvitationService.findOneWhere).toHaveBeenCalledWith({
        where: {
          shift: { id: id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: true,
          shift: {
            certificate: true,
            follower: true,
            speciality: true,
            facility: true,
          },
        },
      });
      expect(shiftInvitationService.update).toHaveBeenCalledWith(
        { id: mockInvitation.id },
        {
          status: SHIFT_INVITATION_STATUS.rejected,
        },
      );
      expect(shiftInvitationService.findAll).toHaveBeenCalledWith({
        where: {
          shift: { id: mockInvitation.shift.id },
          status: Not(
            In([
              SHIFT_INVITATION_STATUS.rejected,
              SHIFT_INVITATION_STATUS.unseen,
            ]),
          ),
        },
        relations: { provider: true },
      });
      expect(aiService.getAIRecommendations).toHaveBeenCalledWith(
        mockInvitation.shift.facility.id,
        mockInvitation.shift.speciality.id,
        mockInvitation.shift.certificate.id,
      );
      expect(autoSchedulingService.filterProviderList).toHaveBeenCalledWith(
        mockAllProviders,
        mockInvitation.shift,
      );
      expect(shiftNotificationService.sendNotification).toHaveBeenCalledWith({
        email: mockInvitation.shift.follower.email,
        emailType: EJS_FILES.ai_recommendation,
        role: TABLE.facility_user,
        userId: mockInvitation.shift.follower.id,
        shiftStatus: SHIFT_STATUS.auto_scheduling,
        text: CONSTANT.NOTIFICATION.AI_LOOKING_FOR_RECOMMENDATIONS_TEXT,
        title: CONSTANT.NOTIFICATION.AI_LOOKING_FOR_RECOMMENDATIONS_TITLE,
        subject: CONSTANT.EMAIL.AI_LOOKING_FOR_RECOMMENDATIONS,
        shiftData: { ...mockInvitation.shift },
        push_type: PushNotificationType.auto_scheduling,
      });

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Invitation Rejected'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database error');
      shiftInvitationService.findOneWhere.mockRejectedValue(error);
      const result = await controller.rejectInvitation(id, req);

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
