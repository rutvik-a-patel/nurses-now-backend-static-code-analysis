import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShiftRequestService } from './shift-request.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  EJS_FILES,
  FACILITY_CONTACT_PERMISSIONS,
  ORIENTATION_STATUS,
  PushNotificationType,
  SHIFT_REQUEST_STATUS,
  SHIFT_STATUS,
  TABLE,
  USER_STATUS,
  VERIFICATION_STATUS,
} from '@/shared/constants/enum';
import { IRequest } from '@/shared/constants/types';
import { ShiftService } from '@/shift/shift.service';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { Not, Repository } from 'typeorm';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { ActivityService } from '@/activity/activity.service';
import * as moment from 'moment-timezone';
import { active } from '@/shared/constants/constant';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilityContactPermission } from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Controller('shift-request')
export class ShiftRequestController {
  constructor(
    private readonly shiftRequestService: ShiftRequestService,
    private readonly shiftService: ShiftService,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
    private readonly shiftNotificationService: ShiftNotificationService,
    private readonly facilityProviderService: FacilityProviderService,
    private readonly activityService: ActivityService,
    private readonly providerCredentialService: ProviderCredentialsService,
    @InjectRepository(ProviderOrientation)
    private readonly providerOrientationRepository: Repository<ProviderOrientation>,
  ) {}

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('all/:id')
  async findAll(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: QueryParamsDto,
  ) {
    try {
      const [list, count] = await this.shiftRequestService.findAll({
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

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift Requests')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Requests'),
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
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @FacilityContactPermission([
    FACILITY_CONTACT_PERMISSIONS.approve_reject_shift,
  ])
  @Patch('assign/:id')
  async assignShift(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const shift = await this.shiftRequestService.findOneWhere({
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
      const currentDate = moment.tz(shift.shift.facility.timezone).valueOf();
      const shiftDate = moment
        .tz(
          `${shift.shift.start_date}T${shift.shift.start_time}`,
          shift.shift.facility.timezone,
        )
        .valueOf();

      if (shiftDate < currentDate) {
        return response.badRequest({
          message: CONSTANT.ERROR.TASK_ASSIGNMENT_CLOSED,
          data: {},
        });
      }

      const scheduledShift =
        await this.shiftService.checkIsProviderAvailable(shift);

      if (scheduledShift) {
        return response.badRequest({
          message: CONSTANT.ERROR.PROVIDER_ALREADY_SCHEDULED,
          data: {},
        });
      }

      if (shift.shift.provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.SHIFT_ALREADY_ASSIGNED,
          data: {},
        });
      }

      await this.shiftRequestService.update(
        { id },
        {
          status: SHIFT_REQUEST_STATUS.assigned,
        },
      );

      await this.shiftService.updateWhere(
        { id: shift.shift.id },
        {
          status: SHIFT_STATUS.scheduled,
          provider: shift.provider.id,
          temp_conf_at: new Date().toISOString(),
          client_conf_at: new Date().toISOString(),
          updated_by_id: req.user.id,
          updated_by_type: req.user.role,
        },
      );

      await this.shiftRequestService.updateOrientation(
        shift.shift.id,
        ORIENTATION_STATUS.orientation_scheduled,
      );
      await this.shiftNotificationService.sendNotification({
        email: shift.shift.follower.email,
        emailType: EJS_FILES.shift_scheduled,
        role: TABLE.facility_user,
        userId: shift.shift.follower.id,
        shiftStatus: SHIFT_STATUS.scheduled,
        text: CONSTANT.NOTIFICATION.SHIFT_SCHEDULED_TEXT(
          `${shift.shift.start_date}`,
          shift.shift.facility.name,
        ),
        title: CONSTANT.NOTIFICATION.SHIFT_SCHEDULED_TITLE,
        subject: CONSTANT.EMAIL.SHIFT_SCHEDULED,
        shiftData: { ...shift.shift, provider: { ...shift.provider } },
        push_type: PushNotificationType.scheduled,
      });

      const notification =
        await this.notificationService.createUserSpecificNotification({
          title: CONSTANT.NOTIFICATION.ASSIGN_SHIFT_TITLE,
          text: CONSTANT.NOTIFICATION.ASSIGN_SHIFT_TEXT(
            moment(shift.shift.start_date).format('MM-DD-YYYY'),
            moment(shift.shift.start_time, 'HH:mm:ss').format('hh:mm A'),
            moment(shift.shift.end_time, 'HH:mm:ss').format('hh:mm A'),
            shift.shift.facility.name,
          ),
          push_type: PushNotificationType.scheduled,
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
          shift_status: SHIFT_STATUS.scheduled,
          to: 'notification_data',
          created_at: new Date().toISOString(),
          description: CONSTANT.NOTIFICATION.ASSIGN_SHIFT_DESCRIPTION,
        },
      );

      const [otherProviderRequested, count] =
        await this.shiftRequestService.findAll({
          where: {
            status: SHIFT_REQUEST_STATUS.unassigned,
            shift: { id: shift.shift.id },
          },
          relations: { provider: true },
        });

      // check point if no other request found
      if (count > 0) {
        const notificationData =
          await this.notificationService.createUserSpecificNotification({
            text: CONSTANT.NOTIFICATION.SHIFT_REQUEST_UPDATE_TEXT(
              moment(shift.shift.start_date).format('MM-DD-YYYY'),
              moment(shift.shift.start_time, 'HH:mm:ss').format('hh:mm A'),
              shift.shift.facility.name,
            ),
            title: CONSTANT.NOTIFICATION.SHIFT_REQUEST_UPDATE_TITLE,
            push_type: PushNotificationType.shift_requested,
          });
        otherProviderRequested.map(async (request) => {
          if (!request.provider) return;
          await this.firebaseNotificationService.sendNotificationToOne(
            notificationData,
            'provider',
            request.provider.id,
            {
              id: shift.shift.id,
              notification_id: notificationData.id,
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

              shift_status: SHIFT_STATUS.requested,
              to: 'notification_data',
              created_at: new Date().toISOString(),
              description:
                CONSTANT.NOTIFICATION.SHIFT_REQUEST_UPDATE_DESCRIPTION,
            },
          );
        });
      }

      await this.activityService.logShiftActivity(
        shift.shift,
        req,
        ACTIVITY_TYPE.FACILITY_ACCEPT_REQUEST,
        {
          provider: `${shift.provider.first_name} ${shift.provider.last_name}`,
        },
        ACTION_TABLES.SHIFT_REQUEST,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Shift Assigned'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @FacilityContactPermission([
    FACILITY_CONTACT_PERMISSIONS.approve_reject_shift,
  ])
  @Delete('reject/:id')
  async rejectRequest(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
    @Req() req: IRequest,
  ) {
    try {
      const shift = await this.shiftRequestService.findOneWhere({
        where: { id: id, status: Not(SHIFT_REQUEST_STATUS.assigned) },
        relations: {
          provider: true,
          shift: { facility: true, follower: true },
        },
      });

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      const currentDate = moment
        .tz(shift.shift.facility?.timezone || 'America/New_York')
        .valueOf();
      const shiftDate = moment
        .tz(
          `${shift.shift.start_date}T${shift.shift.start_time}`,
          shift.shift.facility.timezone || 'America/New_York',
        )
        .valueOf();

      if (shiftDate < currentDate) {
        return response.badRequest({
          message: CONSTANT.ERROR.TASK_ASSIGNMENT_CLOSED,
          data: {},
        });
      }

      const result = await this.shiftRequestService.remove({ id }, deleteDto);

      const remainingRequest = await this.shiftRequestService.findAll({
        where: { shift: { id: shift.shift.id } },
      });

      if (remainingRequest[1] === 0) {
        await this.shiftService.updateWhere(
          { id: shift.shift.id },
          {
            status: SHIFT_STATUS.open,
            updated_by_id: req.user.id,
            updated_by_type: req.user.role,
          },
        );
      }

      await this.shiftRequestService.updateOrientation(
        shift.shift.id,
        ORIENTATION_STATUS.orientation_rejected,
      );

      await this.shiftNotificationService.sendNotification({
        email: shift.shift.follower.email,
        emailType: EJS_FILES.shift_request_rejected,
        role: TABLE.facility_user,
        userId: shift.shift.follower.id,
        shiftStatus: SHIFT_STATUS.requested,
        text: CONSTANT.NOTIFICATION.SHIFT_REQUEST_ACTION_TEXT(
          `Rejected`,
          `${shift.shift.start_date}`,
          shift.shift.facility.name,
        ),
        title: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_TITLE,
        subject: CONSTANT.EMAIL.SHIFT_REQUEST_REJECTED,
        shiftData: { ...shift.shift },
        push_type: PushNotificationType.request_rejected,
      });

      const notification =
        await this.notificationService.createUserSpecificNotification({
          title: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_TITLE,
          text: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_TEXT,
          push_type: PushNotificationType.request_rejected,
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
          shift_status: SHIFT_STATUS.requested,
          to: 'notification_data',
          created_at: new Date().toISOString(),
          description: CONSTANT.NOTIFICATION.SHIFT_REQUEST_REJECTED_DESCRIPTION,
        },
      );

      // activity
      await this.activityService.logShiftActivity(
        shift.shift,
        req,
        ACTIVITY_TYPE.FACILITY_REJECT_REQUEST,
        {
          provider: `${shift.provider.first_name} ${shift.provider.last_name}`,
        },
        ACTION_TABLES.SHIFT_REQUEST,
      );

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.SHIFT_REQUEST_REJECTED
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('request/:id')
  async requestShift(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      if (req.user.verification_status === VERIFICATION_STATUS.rejected) {
        return response.badRequest({
          message: CONSTANT.ERROR.PROFILE_REJECTED,
          data: {},
        });
      }
      if (req.user.profile_progress < 100 || req.user.status.name !== active) {
        return response.badRequest({
          message: CONSTANT.ERROR.STAFF_PROFILE_UNVERIFIED,
          data: {},
        });
      }
      const mainShift = await this.shiftService.findOneWhere({
        where: { id, status: Not(SHIFT_STATUS.cancelled) },
        relations: { follower: true, facility: true },
      });

      if (!mainShift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }
      // check for expired credentials
      const { expired, notApproved, rejected } =
        await this.providerCredentialService.checkIfExpiredLatestCredentialsByProvider(
          req.user.id,
          mainShift.facility.timezone,
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

      const requiredFields = [
        'first_name',
        'last_name',
        'gender',
        'birth_date',
        'certificate',
        'address',
        'speciality',
      ];

      const isProfileIncomplete = requiredFields.some(
        (field) =>
          !req.user[field] ||
          (field === 'address' &&
            (!req.user.address.length || !req.user.address)),
      );

      if (isProfileIncomplete) {
        return response.badRequest({
          message: CONSTANT.ERROR.PROFILE_INCOMPLETE,
          data: {},
        });
      }

      const shiftRequest = await this.shiftRequestService.findOneWhere({
        where: { shift: { id: id }, provider: { id: req.user.id } },
        relations: {
          provider: true,
          shift: { follower: true, facility: true },
        },
      });

      if (
        shiftRequest &&
        ![SHIFT_STATUS.open, SHIFT_STATUS.requested].includes(
          shiftRequest.shift.status,
        ) &&
        shiftRequest.status == SHIFT_REQUEST_STATUS.assigned
      ) {
        return response.badRequest({
          message: CONSTANT.ERROR.SHIFT_ALREADY_ASSIGNED,
          data: {},
        });
      }

      if (shiftRequest) {
        return response.badRequest({
          message: CONSTANT.ERROR.RESPONSE_ALREADY_SUBMITTED('Request'),
          data: {},
        });
      }

      const shiftPreferenceCode = await this.shiftService.getShiftTimeCode(
        mainShift.start_time,
        mainShift.end_time,
        mainShift.facility.id,
      );
      const userPreference = req.user.shift_time || {};
      const isMatching = userPreference[shiftPreferenceCode] === true;

      if (!isMatching) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.UPDATE_PREFERENCE,
          data: {},
        });
      }

      // overlapping shift
      const overlapping = await this.shiftService.overlappingShift(
        req.user.id,
        mainShift.facility.id,
        mainShift.start_date,
        mainShift.start_time,
        mainShift.end_time,
        mainShift.id,
      );
      if (overlapping) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.ALREADY_HAVE_SHIFT_SLOT,
          data: {},
        });
      }

      const isStaffExist = await this.facilityProviderService.findOneWhere({
        where: {
          facility: { id: mainShift.facility.id },
          provider: { id: req.user.id },
        },
      });

      // only add orientation if not enabled for facility
      if (!mainShift.facility.orientation_enabled && !isStaffExist) {
        // add records to provider orientation
        const existingOrientation =
          await this.providerOrientationRepository.findOne({
            where: {
              facility: { id: mainShift.facility.id },
              provider: { id: req.user.id },
              status: Not(ORIENTATION_STATUS.orientation_scheduled),
            },
            relations: { facility: true },
          });

        if (!existingOrientation) {
          await this.providerOrientationRepository.save({
            facility: { id: mainShift.facility.id },
            shift: { id: mainShift.id },
            provider: { id: req.user.id },
            status: ORIENTATION_STATUS.orientation_requested,
            created_by_id: req.user.id,
            created_by_type: req.user.role,
          });
        }

        if (existingOrientation) {
          const { status } = existingOrientation;
          let message;

          switch (status) {
            case ORIENTATION_STATUS.orientation_requested:
              message = CONSTANT.VALIDATION.ALREADY_REQUESTED;
              break;
            case ORIENTATION_STATUS.orientation_rejected:
              message = CONSTANT.VALIDATION.REJECTED;
              break;
            case ORIENTATION_STATUS.not_interested:
              message = CONSTANT.VALIDATION.ALREADY_RESPONDED;
              break;
            default:
              message = 'Response sent for the orientation.';
          }

          return response.badRequest({
            message,
            data: {
              orientation_enabled:
                existingOrientation.facility.orientation_enabled,
            },
          });
        }

        return response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Shift Requested'),
          data: {},
        });
      }
      const result = await this.shiftRequestService.create({
        provider: req.user.id,
        shift: id,
      });

      // assigning the value to the object
      mainShift.provider = req.user;

      if (mainShift && mainShift.status === SHIFT_STATUS.open) {
        await this.shiftNotificationService.sendNotification({
          email: mainShift.follower.email,
          emailType: EJS_FILES.shift_requested,
          role: TABLE.facility_user,
          userId: mainShift.follower.id,
          shiftStatus: SHIFT_STATUS.requested,
          text: CONSTANT.NOTIFICATION.SHIFT_REQUEST_TEXT(
            `${req.user.first_name} ${req.user.last_name}`,
            mainShift.start_date,
            moment(mainShift.start_time, 'HH:mm:ss').format('hh:mm A'),
            mainShift.facility.name,
          ),
          title: CONSTANT.NOTIFICATION.SHIFT_REQUEST_TITLE,
          subject: CONSTANT.EMAIL.SHIFT_REQUESTED,
          shiftData: { ...mainShift },
          push_type: PushNotificationType.shift_requested,
        });
      }

      await this.shiftService.updateWhere(
        { id: id },
        {
          status: SHIFT_STATUS.requested,
        },
      );

      // activity
      await this.activityService.logShiftActivity(
        mainShift,
        req,
        ACTIVITY_TYPE.PROVIDER_REQUEST_SHIFT,
        {
          from_status: SHIFT_STATUS.requested,
          to_status: '',
        },
        ACTION_TABLES.SHIFT_REQUEST,
      );
      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Shift Requested'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
