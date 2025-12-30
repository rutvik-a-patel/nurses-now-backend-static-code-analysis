import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShiftInvitationService } from './shift-invitation.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import { NotificationService } from '@/notification/notification.service';
import { CONSTANT } from '@/shared/constants/message';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  EJS_FILES,
  PushNotificationType,
  SHIFT_INVITATION_STATUS,
  SHIFT_STATUS,
  TABLE,
  USER_STATUS,
  VERIFICATION_STATUS,
} from '@/shared/constants/enum';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IRequest } from '@/shared/constants/types';
import { ShiftService } from '@/shift/shift.service';
import {
  Not,
  In,
  MoreThanOrEqual,
  LessThanOrEqual,
  LessThan,
  Equal,
  MoreThan,
} from 'typeorm';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { AIService } from '@/shared/helpers/ai-service';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { ActivityService } from '@/activity/activity.service';
import * as moment from 'moment-timezone';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { FilterShiftInvitation } from './dto/filter-shift-invitation.dto';
import { active } from '@/shared/constants/constant';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';

@Controller('shift-invitation')
export class ShiftInvitationController {
  constructor(
    private readonly shiftInvitationService: ShiftInvitationService,
    private readonly shiftService: ShiftService,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
    private readonly autoSchedulingService: AutoSchedulingService,
    private readonly shiftNotificationService: ShiftNotificationService,
    private readonly aiService: AIService,
    private readonly activityService: ActivityService,
    private readonly autoSchedulingSettingService: AutoSchedulingSettingService,
    private readonly providerCredentialService: ProviderCredentialsService,
  ) {}

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('all/:id')
  async findAll(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: QueryParamsDto,
  ) {
    try {
      const [list, count] = await this.shiftInvitationService.findAll({
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

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Invitations')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Invitations'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('auto/:id')
  async getAllAutoSchedulingInvitation(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: QueryParamsDto,
  ) {
    try {
      const [list, count] = await this.shiftInvitationService.findAll({
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

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Invitations')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Invitations'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('v2/all/:id')
  async getAllShiftInvitations(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: FilterShiftInvitation,
  ) {
    try {
      const [list, count] =
        await this.shiftInvitationService.getAllShiftInvitations(
          id,
          queryParamsDto,
        );

      const result = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Invitations')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Invitations'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: list,
      };

      return response.successResponseWithPagination(result);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('provider')
  async findAllInvitations(@Req() req: IRequest) {
    try {
      const [list, count] = await this.shiftInvitationService.findAll({
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

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Invitations')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Invitations'),
        data: list,
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('details/:id')
  async getInvitationDetails(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const [list, count] = await this.shiftInvitationService.findAll({
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

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Invitations')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Invitations'),
        data: list,
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('again/:id')
  async inviteAgain(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const shift = await this.shiftInvitationService.findOneWhere({
        where: { id: id },
        relations: {
          provider: true,
          shift: {
            facility: true,
          },
        },
      });

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }
      if (shift?.provider.profile_status === USER_STATUS.deleted) {
        return response.badRequest({
          message: CONSTANT.ERROR.ACCOUNT_DISABLED('Staff'),
          data: {},
        });
      }

      await this.shiftInvitationService.update(
        { id },
        {
          status: SHIFT_INVITATION_STATUS.invited,
          invited_on: new Date().toISOString(),
        },
      );
      const notification =
        await this.notificationService.createUserSpecificNotification({
          title: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TITLE,
          text: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TEXT(
            moment(shift.shift.start_date).format('MMMM D YYYY'),
            moment(shift.shift.start_time, 'HH:mm:ss').format('hh:mm A'),
            moment(shift.shift.end_time, 'HH:mm:ss').format('hh:mm A'),
            shift.shift.facility.name,
          ),
          push_type: PushNotificationType.invited,
        });
      await this.firebaseNotificationService.sendNotificationToOne(
        notification,
        'provider',
        shift.provider.id,
        {
          id: shift.shift.id,
          notification_id: notification.id,
          status: shift.shift.status,
          start_date: shift.shift.start_date,
          start_time: shift.shift.start_time,
          end_date: shift.shift.end_date,
          end_time: shift.shift.end_time,
          facility: {
            id: shift.shift.facility.id,
            name: shift.shift.facility.name,
            street_address: shift.shift.facility.street_address,
            house_no: shift.shift.facility.house_no,
            zip_code: shift.shift.facility.zip_code,
            latitude: shift.shift.facility.latitude,
            longitude: shift.shift.facility.longitude,
          },
          expire_in: 10,
          shift_status: SHIFT_STATUS.invite_sent,
          is_timer: false,
          to: 'notification_data',
          created_at: new Date().toISOString(),
          description: CONSTANT.NOTIFICATION.SHIFT_INVITATION_DESCRIPTION,
        },
      );

      // activity log
      await this.activityService.logProviderActivity(
        shift,
        req,
        ACTIVITY_TYPE.INVITE_AGAIN,
        {},
        ACTION_TABLES.SHIFT_INVITATION,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Invitation sent'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('withdrawn/:id')
  async withdrawn(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const shift = await this.shiftInvitationService.findOneWhere({
        where: { id: id },
        relations: {
          provider: true,
          shift: { facility: true },
        },
      });

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      await this.shiftInvitationService.update(
        { id },
        {
          status: SHIFT_INVITATION_STATUS.withdrawn,
        },
      );

      // Log provider shift creation
      // activity log
      await this.activityService.logProviderActivity(
        shift,
        req,
        ACTIVITY_TYPE.REQUEST_WITHDRAWN,
        {},
        ACTION_TABLES.SHIFT_INVITATION,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Withdrawn'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('accept/:id')
  async acceptInvitation(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const shiftInvitation = await this.shiftInvitationService.findOneWhere({
        where: {
          shift: { id },
          provider: { id: req.user.id },
        },
        relations: {
          provider: { status: true },
          shift: { follower: true, facility: true },
        },
      });

      if (!shiftInvitation) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      if (
        shiftInvitation?.provider.profile_progress < 100 ||
        shiftInvitation?.provider.status.name !== active
      ) {
        return response.badRequest({
          message: CONSTANT.ERROR.PROFILE_NOT_VERIFIED_TO_ACCEPT_INVITATION,
          data: {},
        });
      }

      // check provider has valid credentials
      // check for expired credentials
      const { expired, notApproved, rejected } =
        await this.providerCredentialService.checkIfExpiredLatestCredentialsByProvider(
          req.user.id,
          shiftInvitation.shift.facility.timezone,
          'invitation',
        );
      if (expired || notApproved || rejected) {
        return response.badRequest({
          message: expired
            ? CONSTANT.ERROR.CREDENTIALS_EXPIRED
            : notApproved
              ? CONSTANT.ERROR.CREDENTIALS_NOT_APPROVED
              : CONSTANT.ERROR.CREDENTIALS_REJECTED,
          data: {},
        });
      }

      if (
        [
          SHIFT_INVITATION_STATUS.accepted,
          SHIFT_INVITATION_STATUS.rejected,
          SHIFT_INVITATION_STATUS.withdrawn,
          SHIFT_INVITATION_STATUS.cancelled,
        ].includes(shiftInvitation.status)
      ) {
        const errorMessages = {
          [SHIFT_INVITATION_STATUS.accepted]:
            CONSTANT.ERROR.INVITATION_ALREADY_ACCEPTED,
          [SHIFT_INVITATION_STATUS.rejected]:
            CONSTANT.ERROR.INVITATION_ALREADY_REJECTED,
          [SHIFT_INVITATION_STATUS.withdrawn]:
            CONSTANT.ERROR.INVITATION_WITHDRAWN,
          [SHIFT_INVITATION_STATUS.cancelled]:
            CONSTANT.ERROR.INVITATION_ALREADY_ACCEPTED,
        };

        return response.badRequest({
          message: errorMessages[shiftInvitation.status],
          data: {},
        });
      }

      const currentDate = moment()
        .tz(shiftInvitation.shift.facility?.timezone || 'America/New_York')
        .valueOf();

      const shiftDate = moment(
        `${shiftInvitation.shift.end_date}T${shiftInvitation.shift.end_time}`,
      )
        .tz(
          shiftInvitation.shift.facility?.timezone || 'America/New_York',
          true,
        )
        .valueOf();

      if (shiftDate < currentDate) {
        return response.badRequest({
          message: CONSTANT.ERROR.TASK_ASSIGNMENT_CLOSED,
          data: {},
        });
      }

      if (shiftInvitation.shift.status === SHIFT_STATUS.cancelled) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANCELLED_BY_FACILITY,
          data: {},
        });
      }

      const isAssigned = await this.shiftService.findOneWhere({
        where: {
          id: shiftInvitation.shift.id,
          status: SHIFT_STATUS.scheduled,
        },
      });

      if (isAssigned) {
        return response.badRequest({
          message: CONSTANT.ERROR.SHIFT_ALREADY_ASSIGNED,
          data: {},
        });
      }

      // overlapping shift
      const overlapping = await this.shiftService.overlappingShift(
        req.user.id,
        shiftInvitation.shift.facility.id,
        shiftInvitation.shift.start_date,
        shiftInvitation.shift.start_time,
        shiftInvitation.shift.end_time,
        shiftInvitation.shift.id,
      );
      if (overlapping) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.ALREADY_HAVE_SHIFT_SLOT,
          data: {},
        });
      }

      const assignedShift = await this.shiftService.findOneWhere({
        where: [
          {
            // Case 1: Existing shift fully contains the new shift (even across midnight)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: LessThanOrEqual(shiftInvitation.shift.start_date),
            end_date: MoreThanOrEqual(shiftInvitation.shift.end_date),
            start_time: LessThanOrEqual(shiftInvitation.shift.start_time),
            end_time: MoreThanOrEqual(shiftInvitation.shift.end_time),
          },
          {
            // Case 2: New shift fully contains the existing shift (even across midnight)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: MoreThanOrEqual(shiftInvitation.shift.start_date),
            end_date: LessThanOrEqual(shiftInvitation.shift.end_date),
            start_time: MoreThanOrEqual(shiftInvitation.shift.start_time),
            end_time: LessThanOrEqual(shiftInvitation.shift.end_time),
          },
          {
            // Case 3: Overlapping start times (existing shift starts before the new shift ends but after the new shift starts)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: Equal(shiftInvitation.shift.start_date),
            start_time: LessThan(shiftInvitation.shift.end_time),
            end_time: MoreThan(shiftInvitation.shift.start_time),
          },
          {
            // Case 4: Overlapping end times (existing shift ends after the new shift starts but before the new shift ends)
            provider: { id: req.user.id },
            status: In([SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing]),
            start_date: Equal(shiftInvitation.shift.start_date),
            end_time: MoreThan(shiftInvitation.shift.start_time),
            start_time: LessThan(shiftInvitation.shift.end_time),
          },
        ],
      });

      if (assignedShift) {
        return response.badRequest({
          message: CONSTANT.ERROR.SHIFT_SLOT_NOT_AVAILABLE,
          data: {},
        });
      }

      await this.shiftInvitationService.update(
        { shift: { id }, provider: { id: req.user.id } },
        {
          status: SHIFT_INVITATION_STATUS.accepted,
        },
      );

      await this.shiftService.updateWhere(
        { id: shiftInvitation.shift.id },
        {
          provider: req.user.id,
          temp_conf_at: new Date().toISOString(),
          status: SHIFT_STATUS.scheduled,
        },
      );

      if (shiftInvitation.shift.is_orientation) {
        await this.shiftInvitationService.updateProviderOrientation(
          shiftInvitation,
        );
      }

      await this.shiftNotificationService.sendNotification({
        email: shiftInvitation.shift.follower.email,
        emailType: EJS_FILES.shift_scheduled,
        role: TABLE.facility_user,
        userId: shiftInvitation.shift.follower.id,
        shiftStatus: SHIFT_STATUS.scheduled,
        text: CONSTANT.NOTIFICATION.SHIFT_SCHEDULED_TEXT(
          `${shiftInvitation.shift.start_date}`,
          shiftInvitation.shift.facility.name,
        ),
        title: CONSTANT.NOTIFICATION.SHIFT_SCHEDULED_TITLE,
        subject: CONSTANT.EMAIL.SHIFT_SCHEDULED,
        shiftData: {
          ...shiftInvitation.shift,
          provider: { ...shiftInvitation.provider },
        },
        redirectUrl: process.env.FACILITY_URL,
        push_type: PushNotificationType.scheduled,
      });

      // Log provider shift creation
      await this.activityService.logProviderActivity(
        shiftInvitation,
        req,
        ACTIVITY_TYPE.ACCEPTED_SHIFT_INVITATION,
        {
          from_status: SHIFT_STATUS.invite_sent,
          to_status: SHIFT_STATUS.scheduled,
        },
        ACTION_TABLES.SHIFT_INVITATION,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Invitation Accepted'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('reject/:id')
  async rejectInvitation(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const shift = await this.shiftInvitationService.findOneWhere({
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

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }
      if (
        shift?.provider.profile_progress < 100 ||
        shift?.provider.verification_status !== VERIFICATION_STATUS.verified
      ) {
        return response.badRequest({
          message: CONSTANT.ERROR.PROFILE_NOT_VERIFIED_TO_ACCEPT_INVITATION,
          data: {},
        });
      }

      if (shift.status === SHIFT_INVITATION_STATUS.accepted) {
        return response.badRequest({
          message: CONSTANT.ERROR.INVITATION_ALREADY_ACCEPTED,
          data: {},
        });
      }

      if (shift.status === SHIFT_INVITATION_STATUS.rejected) {
        return response.badRequest({
          message: CONSTANT.ERROR.INVITATION_ALREADY_REJECTED,
          data: {},
        });
      }

      const isAssigned = await this.shiftService.findOneWhere({
        where: {
          id: shift.shift.id,
          status: SHIFT_STATUS.scheduled,
        },
      });

      if (isAssigned) {
        return response.badRequest({
          message: CONSTANT.ERROR.SHIFT_ALREADY_ASSIGNED,
          data: {},
        });
      }

      const currentDate = moment()
        .tz(shift.shift.facility?.timezone || 'America/New_York')
        .valueOf();
      const shiftDate = moment(
        `${shift.shift.end_date}T${shift.shift.end_time}`,
      )
        .tz(shift.shift.facility?.timezone || 'America/New_York', true)
        .valueOf();

      if (shiftDate < currentDate) {
        return response.badRequest({
          message: CONSTANT.ERROR.TASK_ASSIGNMENT_CLOSED,
          data: {},
        });
      }

      if (shift.shift.status === SHIFT_STATUS.cancelled) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANCELLED_BY_FACILITY,
          data: {},
        });
      }

      await this.shiftInvitationService.update(
        { id: shift.id },
        {
          status: SHIFT_INVITATION_STATUS.rejected,
        },
      );

      const [, count] = await this.shiftInvitationService.findAll({
        where: {
          shift: { id: shift.shift.id },
          status: Not(
            In([
              SHIFT_INVITATION_STATUS.rejected,
              SHIFT_INVITATION_STATUS.unseen,
            ]),
          ),
        },
        relations: { provider: true },
      });

      let providers = await this.aiService.getAIRecommendations(
        shift.shift.facility.id,
        shift.shift.speciality.id,
        shift.shift.certificate.id,
      );

      if (providers) {
        providers = await this.autoSchedulingService.filterProviderList(
          providers,
          shift.shift,
        );

        if (
          shift.shift.status === SHIFT_STATUS.auto_scheduling ||
          (count === 0 && shift.shift.status === SHIFT_STATUS.invite_sent)
        ) {
          if (shift.shift.status === SHIFT_STATUS.invite_sent) {
            await this.shiftNotificationService.sendNotification({
              email: shift.shift.follower.email,
              emailType: EJS_FILES.ai_recommendation,
              role: TABLE.facility_user,
              userId: shift.shift.follower.id,
              shiftStatus: SHIFT_STATUS.auto_scheduling,
              text: CONSTANT.NOTIFICATION.AI_LOOKING_FOR_RECOMMENDATIONS_TEXT,
              title: CONSTANT.NOTIFICATION.AI_LOOKING_FOR_RECOMMENDATIONS_TITLE,
              subject: CONSTANT.EMAIL.AI_LOOKING_FOR_RECOMMENDATIONS,
              shiftData: { ...shift.shift },
              push_type: PushNotificationType.auto_scheduling,
            });
          }

          const setting = await this.autoSchedulingSettingService.findOneWhere({
            where: {},
          });

          await this.autoSchedulingService.runAutoScheduling(
            providers,
            shift.shift,
            setting,
            count,
          );
        }
      }
      await this.shiftNotificationService.sendNotification({
        email: shift.shift.follower.email,
        emailType: EJS_FILES.shift_invite_rejected,
        role: TABLE.facility_user,
        userId: shift.shift.follower.id,
        shiftStatus: SHIFT_STATUS.invite_sent,
        text: CONSTANT.NOTIFICATION.SHIFT_INVITATION_REJECTED_TEXT(
          `${shift.shift.start_date}`,
          shift.shift.facility.name,
        ),
        title: CONSTANT.NOTIFICATION.SHIFT_INVITATION_REJECTED,
        subject: CONSTANT.EMAIL.SHIFT_INVITE_REJECTED,
        shiftData: {
          ...shift.shift,
          provider: { ...shift.provider },
        },
        redirectUrl: process.env.FACILITY_URL,
        push_type: PushNotificationType.invitation_rejected,
      });

      // Log provider shift creation
      await this.activityService.logProviderActivity(
        shift,
        req,
        ACTIVITY_TYPE.REJECTED_SHIFT_INVITATION,
        {},
        ACTION_TABLES.SHIFT_INVITATION,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Invitation Rejected'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
