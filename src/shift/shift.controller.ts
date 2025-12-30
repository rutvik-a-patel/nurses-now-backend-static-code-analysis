import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import { PostShiftDto } from './dto/post-shift.dto';
import { FacilityShiftFilterDto } from './dto/facility-shift-filter.dto';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { DeleteDto } from '@/shared/dto/delete.dto';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  ADDRESS_TYPE,
  DEFAULT_STATUS,
  EJS_FILES,
  FACILITY_CONTACT_PERMISSIONS,
  ORIENTATION_STATUS,
  ORIENTATION_TYPE,
  PERMISSIONS,
  PushNotificationType,
  REPEAT_ON,
  SECTIONS,
  SHIFT_INVITATION_STATUS,
  SHIFT_STATUS,
  SUB_SECTION,
  TABLE,
  TIMECARD_STATUS,
  VALIDATE_UPON,
} from '@/shared/constants/enum';
import { ShiftInvitationService } from '@/shift-invitation/shift-invitation.service';
import { CancelShiftDto } from './dto/cancel-shift.dto';
import { IRequest, WarnStaffMessage } from '@/shared/constants/types';
import { ProviderShiftFilterDto } from './dto/provider-shift-filter.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { ProviderScheduledShiftFilterDto } from './dto/provider-scheduled-shift-filter.dto';
import { ShiftRequestService } from '@/shift-request/shift-request.service';
import { In, IsNull, Not, Repository } from 'typeorm';
import { SubmitReportDto } from './dto/submit-report.dto';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { AIService } from '@/shared/helpers/ai-service';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { RequestToWorkDto } from './dto/request-work.dto';
import { ProviderService } from '@/provider/provider.service';
import { TimeEntryApprovalService } from '@/time-entry-approval/time-entry-approval.service';
import {
  shift_updated,
  TimecardIncludedKeys,
  uploadSheets,
} from '@/shared/constants/constant';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { InitialShiftDto } from './dto/initial-shift.dto';
import { CalendarShiftDto } from './dto/calendar-shift.dto';
import { AllShiftFilterDto } from './dto/all-shift-filter.dto';
import { ActivityService } from '@/activity/activity.service';
import { Shift } from './entities/shift.entity';
import { CreateBatchShiftDto } from './dto/create-shift-batch.dto';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import * as moment from 'moment';
import { DeleteUnPostedDto } from './dto/delete-unposted.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FilterShiftDashboardDto } from './dto/filter-shift-dashboard.dto';
import { ApproveTimecardDto } from './dto/approve-timecard.dto';
import { RejectTimecardDto } from './dto/reject-timecard.dto';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import {
  FacilityContactPermission,
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';
import { ProviderOrientationService } from '@/provider-orientation/provider-orientation.service';

@Controller('shift')
export class ShiftController {
  constructor(
    private readonly shiftService: ShiftService,
    private readonly shiftRequest: ShiftRequestService,
    private readonly shiftInvitationService: ShiftInvitationService,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
    private readonly autoSchedulingService: AutoSchedulingService,
    private readonly shiftNotificationService: ShiftNotificationService,
    private readonly aiService: AIService,
    private readonly providerService: ProviderService,
    private readonly timeEntryApprovalService: TimeEntryApprovalService,
    private readonly encryptDecryptService: EncryptDecryptService,
    private readonly autoSchedulingSettingService: AutoSchedulingSettingService,
    private readonly activityService: ActivityService,
    @InjectQueue('auto-scheduling') private autoSchedulingQueue: Queue,
    @InjectRepository(ProviderOrientation)
    private readonly providerOrientationRepository: Repository<ProviderOrientation>,
    private readonly facilityProviderService: FacilityProviderService,
    private readonly providerOrientationService: ProviderOrientationService,
  ) {}

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(@Body() createShiftDto: CreateShiftDto, @Req() req: IRequest) {
    try {
      Object.assign(createShiftDto, {
        created_by_id: req.user.id,
        created_by_type: req.user.role,
        updated_by_id: req.user.id,
        updated_by_type: req.user.role,
      });
      let savedShift;
      if (
        !createShiftDto.is_repeat ||
        createShiftDto.repeat_on === REPEAT_ON.same_day
      ) {
        savedShift = await this.shiftService.createShift(createShiftDto);
      } else if (createShiftDto.repeat_on === REPEAT_ON.consecutive_days) {
        savedShift =
          await this.shiftService.createConsecutiveDaysShift(createShiftDto);
      } else if (
        createShiftDto.repeat_on === REPEAT_ON.consecutive_weeks &&
        createShiftDto.days &&
        createShiftDto.days.length
      ) {
        savedShift =
          await this.shiftService.createConsecutiveWeeksShift(createShiftDto);
      } else if (
        createShiftDto.repeat_on === REPEAT_ON.specific_dates &&
        createShiftDto.specific_dates &&
        createShiftDto.specific_dates.length
      ) {
        savedShift =
          await this.shiftService.createShiftForSpecificDates(createShiftDto);
      } else {
        return response.badRequest({
          message: CONSTANT.ERROR.BAD_SYNTAX,
          data: {},
        });
      }

      // create shift activity
      await this.activityService.shiftCreateActivity(
        { ...savedShift, invited_provider: createShiftDto.invited_provider },
        req,
        ACTION_TABLES.SHIFT,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Shift'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  // for creating batch entries of shift based on multiple selected dates
  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @FacilityContactPermission([FACILITY_CONTACT_PERMISSIONS.add_shift])
  @Post('batch')
  async shiftBatch(
    @Body() createShiftDto: CreateBatchShiftDto,
    @Req() req: IRequest,
  ) {
    try {
      const overdueInvoice = await this.shiftService.getOverdueInvoices(
        createShiftDto.facility,
      );

      if (overdueInvoice) {
        return response.badRequest({
          message: CONSTANT.ERROR.OVERDUE_INVOICE,
          data: {},
        });
      }

      Object.assign(createShiftDto, {
        created_by_id: req.user.id,
        created_by_type: req.user.role,
        updated_by_id: req.user.id,
        updated_by_type: req.user.role,
      });
      const {
        shifts: savedShift,
        preferencesNotMatched,
        failedProviders,
        haveShiftConflict,
        warnRefusedProviders,
      } = await this.shiftService.createMultiDateShifts(createShiftDto);

      if (preferencesNotMatched) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.STAFF_PREFERENCE_NOT_MATCH(
            failedProviders.map((f) => f.name).join(', '),
          ),
          data: {},
        });
      }
      if (haveShiftConflict) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.SHIFT_CONFLICT(
            failedProviders.map((f) => f.name).join(', '),
          ),
          data: {},
        });
      }

      // create shift activity
      await Promise.all(
        savedShift.map((shift) =>
          this.activityService.shiftCreateActivity(
            {
              ...shift,
              invited_provider:
                createShiftDto.invited_provider as unknown as ShiftInvitation[],
            },
            req,
            ACTION_TABLES.SHIFT,
          ),
        ),
      );
      await this.shiftService.calculateShiftCost(savedShift);
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Shifts'),
        data: {
          status: warnRefusedProviders.length
            ? warnRefusedProviders[0].status
            : null,
          reason: warnRefusedProviders.length
            ? CONSTANT.SUCCESS.STAFF_WARNING
            : null,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('post/:id')
  async getUnPublishedData(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const list = await this.shiftService.findAll(id);
      const data = {
        message: list.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        data: list.length ? list : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('clone/:id')
  async cloneShift(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const shift = await this.shiftService.findOneWhere({
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

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }

      const clonedShift = await this.shiftService.cloneShift({
        ...shift,
        created_by_id: req.user.id,
        created_by_type: req.user.role,
        updated_by_id: req.user.id,
        updated_by_type: req.user.role,
      });

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Shift Cloned'),
        data: clonedShift,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin', 'provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @FacilityContactPermission([FACILITY_CONTACT_PERMISSIONS.cancel_shift])
  @Patch('cancel/:id')
  async cancelShift(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() cancelShiftDto: CancelShiftDto,
    @Req() req: IRequest,
  ) {
    try {
      const where = {
        id,
        status: Not(SHIFT_STATUS.cancelled),
      };

      if (req.user.role === TABLE.provider) {
        Object.assign(where, { provider: { id: req.user.id } });
      }

      const shift = await this.shiftService.findOneWhere({
        where: where,
        relations: {
          follower: true,
          provider: true,
          facility: true,
          certificate: true,
          speciality: true,
        },
      });

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }

      const setting = await this.autoSchedulingSettingService.findOneWhere({
        select: {
          facility_cancel_time: true,
        },
        where: {},
      });

      const shiftStartTime = new Date(
        `${shift.start_date}T${shift.start_time}`,
      ).getTime();

      const currentTime = new Date().getTime();

      if (
        [TABLE.facility, TABLE.facility_user].includes(req.user.role) &&
        (shiftStartTime - currentTime) / (1000 * 60) <=
          setting.facility_cancel_time
      ) {
        return response.badRequest({
          message: CONSTANT.ERROR.FACILITY_CANCEL(
            setting.facility_cancel_time / 60,
          ),
          data: {},
        });
      }
      const updateShiftDto = {
        ...cancelShiftDto,
        status: SHIFT_STATUS.cancelled,
        cancelled_by_id: cancelShiftDto.cancelled_by_id
          ? cancelShiftDto.cancelled_by_id
          : req.user.id,
        cancelled_by_type: cancelShiftDto.cancelled_request_from
          ? cancelShiftDto.cancelled_request_from
          : req.user.role,
        cancelled_on: new Date().toISOString(),
      };

      if (
        [TABLE.provider].includes(req.user.role) ||
        cancelShiftDto.cancelled_request_from == TABLE.provider
      ) {
        Object.assign(updateShiftDto, { provider: null });
        await this.shiftService.cancelInvite(req.user.id, shift.id);
      }

      if ([TABLE.admin].includes(req.user.role)) {
        Object.assign(updateShiftDto, {
          cancelled_request_from: cancelShiftDto.cancelled_request_from,
        });
      }

      await this.shiftService.updateWhere({ id: id }, updateShiftDto);
      const canceledShift = {
        ...cancelShiftDto,
        id,
      } as unknown as Shift;

      await this.activityService.shiftCancelActivity(
        canceledShift,
        req,
        ACTION_TABLES.SHIFT,
      );

      if (
        req.user.role === TABLE.provider ||
        cancelShiftDto.cancelled_request_from == TABLE.provider
      ) {
        await this.shiftNotificationService.sendNotification({
          email: shift.follower.email,
          emailType: EJS_FILES.shift_canceled,
          role: TABLE.facility_user,
          userId: shift.follower.id,
          shiftStatus: SHIFT_STATUS.cancelled,
          text: CONSTANT.NOTIFICATION.CANCELLED_BY_ASSIGNEE_TEXT(
            shift.provider.first_name + ' ' + shift.provider.last_name,
            moment(shift.start_date).format('MM-DD-YYYY'),
            moment(shift.start_time, 'HH:mm:ss').format('hh:mm A'),
            shift.facility.name,
          ),
          title: CONSTANT.NOTIFICATION.CANCELLED_BY_ASSIGNEE_TITLE,
          subject: CONSTANT.EMAIL.SHIFT_CANCELLED,
          shiftData: { ...shift },
          push_type: PushNotificationType.cancelled_by_provider,
        });

        await this.shiftService.saveProviderCancelledShifts(shift);

        let providers = await this.aiService.getAIRecommendations(
          shift.facility.id,
          shift.speciality.id,
          shift.certificate.id,
        );

        if (providers.length) {
          // Need to update the shift_time by days,evenings,nights to D,E,N,A,P
          providers = providers.filter((p) => p !== req.user.id);
          // filtered based on time preferences
          providers =
            await this.autoSchedulingService.filterByPreferenceOfProvider(
              providers,
              shift,
            );

          providers = await this.autoSchedulingService.filterProviderList(
            providers,
            shift,
          );

          providers = await this.shiftService.filterProviderCancelled(
            providers,
            shift,
          );

          if (!shift.is_orientation) {
            await Promise.all(
              providers.map(async (provider) => {
                await this.shiftInvitationService.updateOrCreateInvitation({
                  providerId: provider,
                  shiftId: shift.id,
                  status: SHIFT_INVITATION_STATUS.invited,
                  shiftStatus: SHIFT_STATUS.auto_scheduling,
                });
              }),
            );
          }

          await this.activityService.logShiftActivity(
            canceledShift,
            req,
            ACTIVITY_TYPE.AUTO_SCHEDULING_PROVIDER_CANCELLED,
            {
              from_status: shift.status,
              to_status: SHIFT_STATUS.auto_scheduling,
              is_auto_scheduling: true,
            },
            ACTION_TABLES.SHIFT,
          );
        }

        const setting = await this.autoSchedulingSettingService.findOneWhere({
          where: {},
        });

        if (!shift.is_orientation) {
          await this.autoSchedulingService.runAutoScheduling(
            providers,
            shift,
            setting,
            0,
            SHIFT_STATUS.cancelled,
            req,
          );
        }
        if (shift.is_orientation) {
          await this.providerOrientationRepository.update(
            { shift: { id: shift.id } },
            { status: ORIENTATION_STATUS.orientation_cancelled },
          );
        }
      } else {
        // Need to uncomment this code when start reopen shift flow
        //await this.shiftService.removeShiftRequests(shift.id);

        if (shift.provider) {
          const notification =
            await this.notificationService.createUserSpecificNotification({
              title: CONSTANT.NOTIFICATION.CANCELLED_BY_CREATOR_TITLE,
              text: CONSTANT.NOTIFICATION.CANCELLED_BY_CREATOR_TEXT(
                moment(shift.start_date).format('MM-DD-YYYY'),
                shift.facility.name,
              ),
              push_type: PushNotificationType.shift_cancelled,
            });
          await this.firebaseNotificationService.sendNotificationToOne(
            notification,
            TABLE.provider,
            shift.provider.id,
            {
              id: shift.id,
              notification_id: notification.id,
              status: shift.status,
              start_date: shift.start_date,
              start_time: shift.start_time,
              end_date: shift.end_date,
              end_time: shift.end_time,
              facility: {
                id: shift.facility.id,
                name: shift.facility.name,
                street_address: shift.facility.street_address,
                house_no: shift.facility.house_no,
                zip_code: shift.facility.zip_code,
                latitude: shift.facility.latitude,
                longitude: shift.facility.longitude,
              },
              shift_status: SHIFT_STATUS.cancelled,
              to: 'notification_data',
              created_at: new Date().toISOString(),
              description:
                CONSTANT.NOTIFICATION.CANCELLED_BY_CREATOR_DESCRIPTION,
            },
          );
        }
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Shift Cancelled'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.shifts, SUB_SECTION.shift)
  @Roles('facility', 'facility_user', 'admin')
  @Permission(PERMISSIONS.repost)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('re-open/:id')
  async reOpenShift(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const shift = await this.shiftService.findOneWhere({
        where: { id, status: SHIFT_STATUS.cancelled },
      });

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }

      const result = await this.shiftService.update(id, {
        status: SHIFT_STATUS.open,
      });
      return response.successResponse({
        message:
          result.affected > 0
            ? CONSTANT.SUCCESS.RE_OPENED
            : CONSTANT.SUCCESS.PROCESS_FAILED('Re-open'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('post')
  async postShift(@Body() postShiftDto: PostShiftDto, @Req() req: IRequest) {
    try {
      const promises: Promise<any>[] = [];
      const { shift } = postShiftDto;

      const [[shifts], setting] = await Promise.all([
        this.shiftService.findAllWhere({
          where: { id: In(shift) },
          relations: {
            certificate: true,
            speciality: true,
            follower: true,
            facility: true,
            invited_provider: { provider: true },
          },
        }),
        this.autoSchedulingSettingService.findOneWhere({ where: {} }),
      ]);

      if (!shifts || !shifts.length) {
        return response.successResponse({
          message: 'No shifts found to post.',
          data: {},
        });
      }

      const recommendations =
        await this.shiftService.getAIRecommendationsForShift(shifts);

      // Check if any invited provider has expired credentials with refused compliance setting
      const providerIds = shifts.flatMap(
        (s) => s.invited_provider?.flatMap((p) => p.provider.id) ?? [],
      );
      const facilityId = shifts[0]?.facility?.id;

      if (providerIds.length && facilityId) {
        const { warnRefusedProviders } =
          await this.shiftService.checkWithComplianceSettings(
            providerIds,
            facilityId,
          );

        const refusedProviders = warnRefusedProviders.filter((item) =>
          item.status.includes(VALIDATE_UPON.refuse),
        );

        if (refusedProviders.length > 0) {
          return response.badRequest({
            message: CONSTANT.SUCCESS.SHIFT_REFUSED_BY_SYSTEM,
            data: {},
          });
        }
      }

      for (const shiftDetail of shifts) {
        const { invited_provider = [] } = shiftDetail;
        const dto = {
          is_publish: true,
          client_conf_at: new Date().toISOString(),
          ...(invited_provider.length && {
            status: shiftDetail.is_orientation
              ? SHIFT_STATUS.scheduled
              : SHIFT_STATUS.invite_sent,
            ...(shiftDetail.is_orientation && {
              provider: invited_provider[0].provider.id,
              temp_conf_at: new Date().toISOString(),
            }),
          }),
        };

        if (invited_provider.length) {
          await this.shiftService.validateInvitedProvidersAvailability(
            invited_provider,
            shiftDetail,
          );

          promises.push(
            ...(await this.shiftService.handleInvitedFlow(shiftDetail)),
          );
        } else {
          this.autoSchedulingService.runAutoScheduling(
            recommendations[shiftDetail.id] || [],
            shiftDetail,
            setting,
          );

          // const job = await this.autoSchedulingQueue.add(
          //   'run-auto-scheduling',
          //   {
          //     providers: recommendations[shiftDetail.id] || [],
          //     shift: shiftDetail,
          //     setting,
          //     count: 0,
          //     status: undefined,
          //     req: null,
          //   },
          //   {
          //     jobId: `auto-scheduling-${shiftDetail.id}-${Date.now()}`,
          //     attempts: 3,
          //     delay: 2000,
          //     // removeOnComplete: true,
          //   },
          // );

          // this.queueDebugService.trackJobAdded(job);

          promises.push(
            this.activityService.logShiftActivity(
              shiftDetail,
              req,
              ACTIVITY_TYPE.AUTO_SCHEDULING_NO_INVITES,
              {
                from_status: 'auto_scheduling',
                to_status: '',
                is_auto_scheduling: true,
              },
              ACTION_TABLES.SHIFT,
            ),
          );
        }

        promises.push(this.shiftService.update(shiftDetail.id, dto));
      }

      if (promises.length) await Promise.all(promises);

      return response.successResponse({
        message: shifts[0].is_orientation
          ? CONSTANT.SUCCESS.ORIENTATION_ASSIGNED(
              'shift',
              shifts[0].invited_provider[0].provider.first_name,
            )
          : CONSTANT.SUCCESS.SUCCESSFULLY('Shift Posted'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('all/:id')
  async findAll(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() filterShiftDto: FacilityShiftFilterDto,
  ) {
    try {
      const [list, count] = await this.shiftService.findAllShift(
        id,
        filterShiftDto,
      );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        total: count,
        limit: +filterShiftDto.limit,
        offset: +filterShiftDto.offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('detail/:id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const result = await this.shiftService.shiftDetail(id);

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('update/:id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateShiftDto: UpdateShiftDto,
    @Req() req: IRequest,
  ) {
    try {
      delete updateShiftDto.openings;
      const {
        invited_provider,
        certificate,
        speciality,
        start_date,
        start_time,
        end_time,
      } = updateShiftDto;

      const shift = await this.shiftService.findOneWhere({
        where: { id: id },
        relations: {
          certificate: true,
          speciality: true,
          facility: true,
          follower: true,
          provider: {
            certificate: true,
            speciality: true,
          },
          floor: true,
        },
      });
      let warnRefusedProviders: WarnStaffMessage[] = [];

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }

      if ((invited_provider && invited_provider.length > 0) || shift.provider) {
        // arranging the id if the payload does not contains them
        const provider_id = invited_provider
          ? invited_provider[0]
          : shift?.provider?.id;

        const certificate_id = certificate
          ? certificate
          : shift.provider.certificate.id;

        const speciality_id = speciality
          ? speciality
          : shift.provider.speciality.id;

        // for validating certificate and speciality
        const providerMatch =
          await this.shiftService.providerMatchByCertification(
            provider_id,
            certificate_id,
            speciality_id,
          );

        if (!providerMatch) {
          return response.badRequest({
            message: CONSTANT.VALIDATION.MISMATCH_CERT_SPEC,
            data: {},
          });
        }

        // check only if time is provided
        if (start_time && end_time) {
          // getting shift time
          const providerAvailability =
            await this.shiftService.getSingleProviderPreferenceAvailability(
              provider_id,
              shift.start_date,
              shift.facility.id,
              start_time,
              end_time,
            );

          if (
            providerAvailability.length &&
            (!providerAvailability[0].global_ok ||
              !providerAvailability[0].profile_ok)
          ) {
            return response.badRequest({
              message: CONSTANT.VALIDATION.SHIFT_TIME_PREFERENCE_MISMATCH(
                providerAvailability[0].name,
              ),
              data: {},
            });
          }

          // conflict of the shift of the user
          const conflict = await this.shiftService.overlappingShift(
            provider_id,
            shift.facility.id,
            start_date ? start_date : shift.start_date,
            start_time,
            end_time,
            shift.id,
          );

          if (conflict) {
            return response.badRequest({
              message: CONSTANT.VALIDATION.SHIFT_OVERLAP,
              data: {},
            });
          }
        }

        // Create a notification for the provider
        if (shift.status === SHIFT_STATUS.scheduled) {
          const notification =
            await this.notificationService.createUserSpecificNotification({
              title: CONSTANT.NOTIFICATION.SHIFT_UPDATED,
              text: CONSTANT.NOTIFICATION.SHIFT_UPDATED_TEXT(
                shift.facility.name,
              ),
              push_type: PushNotificationType.shift_updated,
            });

          // Send Firebase notification to the provider
          await this.firebaseNotificationService.sendNotificationToOne(
            notification,
            'provider',
            invited_provider ? invited_provider[0] : shift.provider.id,
            {
              id: shift.id,
              notification_id: notification.id,
              status: shift.status,
              start_date: shift.start_date,
              start_time: shift.start_time,
              end_date: shift.end_date,
              end_time: shift.end_time,
              facility: {
                id: shift.facility.id,
                name: shift.facility.name,
                street_address: shift.facility.street_address,
                house_no: shift.facility.house_no,
                zip_code: shift.facility.zip_code,
                latitude: shift.facility.latitude,
                longitude: shift.facility.longitude,
              },
              expire_in: 1,
              shift_status: shift_updated,
              is_timer: false,
              to: 'notification_data',
              created_at: new Date().toISOString(),
              description: CONSTANT.NOTIFICATION.SHIFT_UPDATE_DESCRIPTION,
            },
          );
        }

        // check if provider is refused for the shift
        ({ warnRefusedProviders } =
          await this.shiftService.checkWithComplianceSettings(
            invited_provider ? invited_provider : [shift.provider.id],
            shift.facility.id,
          ));
      }
      // Store old data for comparison
      const oldShiftData = { ...shift };

      const [list] = await this.shiftInvitationService.findAll({
        relations: {
          provider: true,
          shift: true,
        },
        where: {
          shift: { id: id },
        },
        select: {
          id: true,
          provider: {
            id: true,
          },
        },
      });

      const deleteIds = [];
      if (invited_provider) {
        if (invited_provider?.length) {
          const providerIds = list?.map((data) => data.provider.id);
          const invitationData = invited_provider.reduce((acc, provider) => {
            if (!providerIds.includes(provider)) {
              acc.push({
                provider,
                shift: shift.id,
              });
            }
            return acc;
          }, []);

          list.forEach((data) => {
            if (!invited_provider.includes(data.provider.id)) {
              deleteIds.push(data.id);
            }
          });

          if (deleteIds.length)
            await this.shiftInvitationService.remove({ id: In(deleteIds) });

          if (invitationData.length)
            await this.shiftInvitationService.create(invitationData);
        } else {
          const deleteIds = list?.map((data) => data.id);
          if (deleteIds.length)
            await this.shiftInvitationService.remove({ id: In(deleteIds) });
        }
      }

      delete updateShiftDto.invited_provider;
      const result = await this.shiftService.updateWhere(
        { id: id },
        {
          ...updateShiftDto,
          updated_by_id: req.user.id,
          updated_by_type: req.user.role,
          modified_at: new Date().toISOString(),
        },
      );

      // Track changes if update was successful
      if (result.affected) {
        const updatedShift = await this.shiftService.findOneWhere({
          where: { id: id },
          relations: {
            certificate: true,
            speciality: true,
            facility: true,
            follower: true,
            provider: true,
            floor: true,
          },
        });

        await this.shiftService.calculateShiftCost([updatedShift]);
        if (shift.is_publish) {
          await this.activityService.shiftUpdateActivity(
            shift,
            req,
            oldShiftData,
            { ...oldShiftData, ...updatedShift },
            ACTION_TABLES.SHIFT,
          );
        }
      }

      const warnedProvider = warnRefusedProviders[0];
      const hasWarnings = warnRefusedProviders.length > 0;

      let reason = null;
      if (hasWarnings) {
        if (warnedProvider.status.includes(VALIDATE_UPON.warn)) {
          reason = CONSTANT.SUCCESS.STAFF_WARNING;
        } else if (warnedProvider.status.includes(VALIDATE_UPON.refuse)) {
          reason = CONSTANT.SUCCESS.SHIFT_REFUSED_BY_SYSTEM;
        }
      }

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        data: {
          status: hasWarnings ? warnedProvider.status : null,
          reason,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete('un-posted/all')
  async deleteAllUnPostedShift(@Body() deleteUnPostedDto: DeleteUnPostedDto) {
    try {
      const where = { is_publish: false };
      if (deleteUnPostedDto?.id) {
        Object.assign(where, { facility: { id: deleteUnPostedDto.id } });
      }
      const result = await this.shiftService.remove(where, deleteUnPostedDto);

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete('un-posted/:id')
  async deleteShift(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const result = await this.shiftService.remove({ id }, deleteDto);

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('posted-shift')
  async getProviderShifts(
    @Query() providerShiftFilterDto: ProviderShiftFilterDto,
    @Req() req: IRequest,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
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

      if (!provider.certificate) {
        return response.badRequest({
          message: CONSTANT.ERROR.SHIFT_LIST_PROFILE_INCOMPLETE,
          data: {},
        });
      }

      const [list, count] = await this.shiftService.getProviderShifts(
        providerShiftFilterDto,
        provider,
      );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        total: count,
        limit: +providerShiftFilterDto.limit,
        offset: +providerShiftFilterDto.offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('shift-radius-facility-count')
  async getProviderShiftRadiusFacilityCount(@Req() req: IRequest) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: {
          id: req.user.id,
        },
        relations: { certificate: true, speciality: true, status: true },
      });

      const { shifts, facility } =
        await this.shiftService.getProviderShiftCountWithinRadius(provider);
      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Record Fetched'),
        data: {
          radius: provider.radius,
          facility,
          shifts,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('initial')
  async getInitialShifts(
    @Req() req: IRequest,
    @Query() initialShiftDto: InitialShiftDto,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: {
          id: req.user.id,
        },
        relations: {
          address: true,
          certificate: true,
          speciality: true,
        },
      });

      const latitude = initialShiftDto.latitude
        ? initialShiftDto.latitude
        : provider.address[0].latitude;
      const longitude = initialShiftDto.longitude
        ? initialShiftDto.longitude
        : provider.address[0].longitude;
      const radius = initialShiftDto.radius
        ? initialShiftDto.radius
        : provider.radius;

      const [list, count] =
        await this.shiftService.getProviderShiftsWithinRadius(
          provider,
          latitude,
          longitude,
          +radius,
        );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
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
  async getShiftDetailsForProvider(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const shift = await this.shiftService.findOneWhere({
        where: { id: id, is_publish: true },
      });

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }

      const provider = await this.providerService.findOneWhere({
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

      const data = await this.shiftService.getShiftDetailsForProvider(
        id,
        provider,
      );

      return response.successResponse({
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        data: data ? data : {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('facility-details/:id')
  async getFacilityDetailsForProvider(
    @Req() req: IRequest,
    @Param('id', UUIDValidationPipe) id: string,
  ) {
    try {
      const result = await this.shiftService.getFacilityDetailsForProvider(
        id,
        req.user.id,
      );

      return response.successResponse({
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facility')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
        data: result ? result : {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('facility-shifts/:id')
  async getFacilityShifts(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: QueryParamsDto,
    @Req() req: IRequest,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
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

      const [list, count] = await this.shiftService.getFacilityShifts(
        id,
        queryParamsDto,
        provider,
      );

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: count ? list : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('schedule-shift')
  async getProviderScheduledShifts(
    @Query() providerScheduledShiftFilterDto: ProviderScheduledShiftFilterDto,
    @Req() req: IRequest,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
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

      const [list, count] = await this.shiftService.getProviderScheduledShifts(
        providerScheduledShiftFilterDto,
        provider,
      );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        total: count,
        limit: +providerScheduledShiftFilterDto.limit,
        offset: +providerScheduledShiftFilterDto.offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete('withdrawn-request/:id')
  async withdrawnRequest(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
    @Req() req: IRequest,
  ) {
    try {
      const data = await this.shiftRequest.remove(
        { provider: { id: req?.user?.id }, shift: { id: id } },
        deleteDto,
      );

      const remainingRequest = await this.shiftRequest.findAll({
        where: { shift: { id: id } },
      });

      if (remainingRequest[1] === 0) {
        await this.shiftService.updateWhere(
          { id: id },
          {
            status: SHIFT_STATUS.open,
          },
        );
      }

      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY('Request Withdrawn')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Request'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('scheduled-details/:id')
  async getScheduledShiftDetailsForProvider(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const timezone = req.headers['timezone']
        ? `${req.headers['timezone']}`
        : '+0:00';
      const diff = this.shiftService.calculateTimestamp(timezone);

      const provider = await this.providerService.findOneWhere({
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

      const data = await this.shiftService.getScheduledShiftDetailsForProvider(
        id,
        provider,
        diff,
      );

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }

      const setting = await this.timeEntryApprovalService.findAll({
        where: { name: uploadSheets },
      });

      if (setting.length && data) {
        setting.forEach((item) => {
          if (item.key === uploadSheets) {
            Object.assign(data, {
              is_sheets_allowed:
                item.value === (DEFAULT_STATUS.active as string),
            });
          }
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('check-in/:id')
  async checkInOutShift(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateShiftDto: UpdateShiftDto,
    @Req() req: IRequest,
  ) {
    try {
      const timezone = req.headers['timezone']
        ? `${req.headers['timezone']}`
        : '+0:00';
      const shiftStatuses = [SHIFT_STATUS.ongoing];
      let message = CONSTANT.SUCCESS.RECORD_UPDATED('Shift');
      if (updateShiftDto.clock_in)
        shiftStatuses.push(SHIFT_STATUS.scheduled, SHIFT_STATUS.running_late);

      const shift = await this.shiftService.findOneWhere({
        relations: {
          facility: {
            time_entry_setting: true,
          },
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

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }

      const canUserClockInOrOut = await this.shiftService.canUserClockInOrOut(
        shift,
        updateShiftDto,
      );

      if (canUserClockInOrOut) {
        return response.badRequest({
          message: canUserClockInOrOut,
          data: {},
        });
      }

      const ongoingShift = await this.shiftService.findOneWhere({
        where: {
          provider: { id: req.user.id },
          status: SHIFT_STATUS.ongoing,
          id: Not(id),
          clock_in: Not(IsNull()),
          clock_out: IsNull(),
        },
      });

      if (updateShiftDto.clock_in && ongoingShift) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.ONGOING_SHIFT,
          data: {},
        });
      }

      const shiftDto =
        await this.shiftService.calculateClockOutAndBreakDuration(
          updateShiftDto,
          shift,
          req,
        );

      if (shiftDto?.responseBody) {
        return shiftDto.responseBody;
      }

      updateShiftDto = shiftDto.updateShiftDto;
      message = shiftDto.message;

      delete updateShiftDto.latitude;
      delete updateShiftDto.longitude;
      const result = await this.shiftService.updateWhere(
        { id: id },
        updateShiftDto,
      );

      await this.shiftService.saveFirstWorkedDate(shift.provider);

      await this.shiftService.createTimecard(id, req);

      // for attaching last work date when checkout made
      await this.providerService.update(req.user.id, {
        last_work_date: updateShiftDto.clock_out_date,
      });

      const provider = await this.providerService.findOneWhere({
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

      const timestamp = this.shiftService.calculateTimestamp(timezone);
      const shiftData =
        await this.shiftService.getScheduledShiftDetailsForProvider(
          id,
          provider,
          timestamp,
        );
      if (shiftData.status === SHIFT_STATUS.completed) {
        const findOrientationShift =
          await this.providerOrientationRepository.findOne({
            where: {
              provider: { id: req.user.id },
              shift: { id },
            },
          });
        if (findOrientationShift) {
          // update orientation status to completed
          await this.providerOrientationRepository.update(
            {
              provider: { id: req.user.id },
              shift: { id },
            },
            { status: ORIENTATION_STATUS.orientation_completed },
          );

          // add the provider to facility provider list if not exist
          const isExist = await this.facilityProviderService.findOneWhere({
            where: {
              provider: {
                id: shift.provider.id,
              },
              facility: {
                id: shift.facility.id,
              },
            },
          });

          if (!isExist) {
            await this.facilityProviderService.create({
              provider: shift.provider.id,
              facility: shift.facility.id,
            });
          }
          // Activity log for orientation approved
          await this.providerOrientationService.providerOrientationActivityLog(
            req,
            ACTIVITY_TYPE.ORIENTATION_COMPLETED,
            {
              provider:
                shift.provider.first_name + ' ' + shift.provider.last_name,
              from_status: ORIENTATION_STATUS.packet_sent,
              to_status: ORIENTATION_STATUS.orientation_completed,
              orientation_process: ORIENTATION_TYPE.orientation_shift,
            },
          );
        }
        const notification =
          await this.notificationService.createUserSpecificNotification({
            title: CONSTANT.NOTIFICATION.SHIFT_COMPLETED_TITLE,
            text: CONSTANT.NOTIFICATION.SHIFT_COMPLETED_TEXT(
              shift.facility.name,
            ),
            push_type: PushNotificationType.completed,
          });

        // Send Firebase notification to the provider
        await this.firebaseNotificationService.sendNotificationToOne(
          notification,
          'provider',
          req.user.id,
          {
            id: shift.id,
            notification_id: notification.id,
            status: shift.status,
            start_date: shift.start_date,
            start_time: shift.start_time,
            end_date: shift.end_date,
            end_time: shift.end_time,
            facility: {
              id: shift.facility.id,
              name: shift.facility.name,
              street_address: shift.facility.street_address,
              house_no: shift.facility.house_no,
              zip_code: shift.facility.zip_code,
              latitude: shift.facility.latitude,
              longitude: shift.facility.longitude,
            },
            expire_in: 1,
            shift_status: SHIFT_STATUS.completed,
            is_timer: false,
            to: 'notification_data',
            created_at: new Date().toISOString(),
            description: CONSTANT.NOTIFICATION.SHIFT_COMPLETED_DESCRIPTION,
          },
        );
      }

      return response.successResponse({
        message: result.affected
          ? message
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        data: result.affected ? shiftData : {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('submit-report/:id')
  async submitShiftReport(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() submitReportDto: SubmitReportDto,
  ) {
    try {
      const shift = await this.shiftService.findOneWhere({
        relations: { time_card: true },
        where: { id },
      });

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }

      await this.shiftService.saveTimeSheet(submitReportDto, shift);

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Report Submitted'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('calendar')
  async getShiftCalendarData(
    @Query('date') date: string,
    @Req() req: IRequest,
  ) {
    try {
      const result = await this.shiftService.getCurrentMonthSummaryByDate(
        date,
        req.user.id,
      );

      const data = {
        message: result.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Summary')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Summary'),
        data: result.length ? result : [],
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Section(SECTIONS.timecards, SUB_SECTION.timecards)
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('timecard-details/:id')
  async getAllTimeCardDetails(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const data = await this.shiftService.getAllTimeCardDetails(id);

      const result = {
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Time Card Details')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Time Card Details'),
        data: data ? data : {},
      };
      return response.successResponse(result);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Section(SECTIONS.timecards, SUB_SECTION.timecards)
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @FacilityContactPermission([FACILITY_CONTACT_PERMISSIONS.approve_time_card])
  @Patch('approve-timecard/:id')
  async approveTimecard(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
    @Body() approveTimecardDto: ApproveTimecardDto,
  ) {
    try {
      const shift = await this.shiftService.findOneWhere({
        where: {
          id,
        },
        relations: {
          time_card: true,
          facility: true,
          provider: true,
          floor: true,
        },
      });

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Timecard'),
          data: {},
        });
      }

      const result = await this.shiftService.approveTimecard(
        shift,
        approveTimecardDto,
        req.user,
      );

      const updateShift = await this.shiftService.findOneWhere({
        where: {
          id,
        },
        relations: {
          time_card: true,
          facility: true,
          provider: true,
          floor: true,
        },
      });

      // Activity log for timecard
      await this.activityService.commonUpdateActivity(
        shift,
        req,
        approveTimecardDto.status === TIMECARD_STATUS.approved
          ? ACTIVITY_TYPE.TIMECARD_DISPUTED_RESOLVED
          : ACTIVITY_TYPE.TIMECARD_EDITED,
        shift,
        updateShift,
        TimecardIncludedKeys,
        ACTION_TABLES.TIMECARDS,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY('Timecard Approved')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Timecard'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Section(SECTIONS.timecards, SUB_SECTION.timecards)
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('reject-timecard/:id')
  async rejectTimecard(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
    @Body() rejectTimecardDto: RejectTimecardDto,
  ) {
    try {
      const result = await this.shiftService.rejectTimecard(
        { shift: { id } },
        {
          ...rejectTimecardDto,
          rejected_by_id: req.user.id,
          rejected_by_type: req.user.role,
          status: TIMECARD_STATUS.disputed,
          rejected_date: new Date().toISOString(),
        },
      );

      const shift = await this.shiftService.findOneWhere({
        where: { id },
        relations: {
          provider: true,
          facility: true,
          time_card: {
            timecard_reject_reason: true,
          },
        },
      });

      if (!shift)
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Timecard'),
          data: {},
        });

      // Log replace running late
      await this.activityService.logShiftActivity(
        shift,
        req,
        ACTIVITY_TYPE.TIMECARD_DISPUTED,
        {
          from_status: TIMECARD_STATUS.approved,
          to_status: TIMECARD_STATUS.disputed,
          reason: shift.time_card.timecard_reject_reason.reason,
          provider: shift.provider.first_name + ' ' + shift.provider.last_name,
        },
        ACTION_TABLES.TIMECARDS,
      );

      const notification =
        await this.notificationService.createUserSpecificNotification({
          title: CONSTANT.NOTIFICATION.TIMECARD_REJECTION_TITLE,
          text: CONSTANT.NOTIFICATION.TIMECARD_REJECTION_TEXT,
          push_type: PushNotificationType.timecard_rejected,
        });

      await this.firebaseNotificationService.sendNotificationToOne(
        notification,
        'provider',
        shift.provider.id,
        {
          id: shift.id,
          notification_id: notification.id,
          status: shift.status,
          start_date: shift.start_date,
          start_time: shift.start_time,
          end_date: shift.end_date,
          end_time: shift.end_time,
          facility: {
            id: shift.facility.id,
            name: shift.facility.name,
            street_address: shift.facility.street_address,
            house_no: shift.facility.house_no,
            zip_code: shift.facility.zip_code,
            latitude: shift.facility.latitude,
            longitude: shift.facility.longitude,
          },
          expire_in: 1,
          shift_status: SHIFT_STATUS.completed,
          is_timer: false,
          to: 'notification_data',
          created_at: new Date().toISOString(),
          description: CONSTANT.NOTIFICATION.TIMECARD_REJECTION_DESCRIPTION,
        },
      );

      const admins = await this.shiftService.getAllAdmins();

      if (admins && admins.length) {
        for (const admin of admins) {
          await this.shiftNotificationService.sendNotification({
            email: admin.email,
            emailType: EJS_FILES.timecard_rejected,
            role: TABLE.admin,
            userId: admin.id,
            shiftStatus: SHIFT_STATUS.completed,
            text: CONSTANT.NOTIFICATION.TIMECARD_REJECTION_ADMIN_NOTIFICATION(
              `${shift.provider.first_name} ${shift.provider.last_name}`,
              `${moment(shift.start_date).format('MM-DD-YYYY')} ${moment(shift.start_time, 'HH:mm:ss').format('hh:mm A')}`,
              shift.facility.name,
            ),
            title: CONSTANT.NOTIFICATION.TIMECARD_REJECTION_TITLE,
            subject: CONSTANT.EMAIL.TIMECARD_REJECTION,
            shiftData: {
              ...shift,
            },
            push_type: PushNotificationType.timecard_rejected,
          });
        }
      }

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY('Dispute Raised')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Timecard'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('request-work/:id')
  async requestProviderForWork(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
    @Body() requestToWorkDto: RequestToWorkDto,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: { id },
        relations: { provider: true },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      for (const shiftId of requestToWorkDto.shift) {
        // Check if the shift exists in the database
        const shift = await this.shiftService.findOneWhere({
          where: {
            id: shiftId,
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

        if (!shift) {
          continue;
        }

        // Update the shift status to 'unconfirmed' and assign provider to the shift
        await this.shiftService.updateWhere(
          { id: shift.id },
          {
            status: SHIFT_STATUS.invite_sent,
            updated_by_id: req.user.id,
            updated_by_type: req.user.role,
          },
        );

        const invitation = await this.shiftInvitationService.findOneWhere({
          where: { provider: { id: provider.id }, shift: { id: shift.id } },
        });

        if (invitation) {
          await this.shiftInvitationService.update(
            { id: invitation.id },
            {
              shift_status: SHIFT_STATUS.invite_sent,
              status: SHIFT_INVITATION_STATUS.invited,
            },
          );
        } else {
          await this.shiftInvitationService.create({
            provider: provider.id,
            shift: shift.id,
            shift_status: SHIFT_STATUS.invite_sent,
            status: SHIFT_INVITATION_STATUS.invited,
          });
        }

        // Create a notification for the provider
        const notification =
          await this.notificationService.createUserSpecificNotification({
            title: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TITLE,
            text: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TEXT(
              moment(shift.start_date).format('MM-DD-YYYY'),
              moment(shift.start_time, 'HH:mm:ss').format('hh:mm A'),
              moment(shift.end_time, 'HH:mm:ss').format('hh:mm A'),
              shift.facility.name,
            ),
            push_type: PushNotificationType.invited,
          });

        // Send Firebase notification to the provider
        await this.firebaseNotificationService.sendNotificationToOne(
          notification,
          'provider',
          provider.id,
          {
            id: shift.id,
            notification_id: notification.id,
            status: shift.status,
            start_date: shift.start_date,
            start_time: shift.start_time,
            end_date: shift.end_date,
            end_time: shift.end_time,
            facility: {
              id: shift.facility.id,
              name: shift.facility.name,
              street_address: shift.facility.street_address,
              house_no: shift.facility.house_no,
              zip_code: shift.facility.zip_code,
              latitude: shift.facility.latitude,
              longitude: shift.facility.longitude,
            },
            expire_in: 1,
            shift_status: SHIFT_STATUS.invite_sent,
            is_timer: false,
            to: 'notification_data',
            created_at: new Date().toISOString(),
            description: CONSTANT.NOTIFICATION.SHIFT_INVITATION_DESCRIPTION,
          },
        );
      }
      const invite = requestToWorkDto.shift.length > 1 ? 'Invites' : 'Invite';
      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY(
          `${invite} Sent to ${provider.first_name}`,
        ),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('running-late/:id')
  async runningLateShift(
    @Param('id') id: string,
    @Req() req: IRequest,
    @Query('trigger_ai') trigger_ai: boolean,
  ) {
    try {
      const shiftId = await this.encryptDecryptService.decrypt(id);

      const shift = await this.shiftService.findOneWhere({
        where: { id: shiftId },
        relations: {
          provider: true,
          certificate: true,
          speciality: true,
          facility: true,
        },
      });

      if (!shift) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
          data: {},
        });
      }

      if (trigger_ai) {
        // for sending notification to the user who is late and removing that user from the shift
        if (shift.is_ai_triggered) {
          return response.badRequest({
            message: CONSTANT.VALIDATION.ALREADY_STARTED_AUTO_SCHEDULING,
            data: {},
          });
        }

        await this.shiftInvitationService.update(
          { shift: { id: shift.id }, provider: { id: shift.provider.id } },
          {
            status: SHIFT_INVITATION_STATUS.withdrawn,
          },
        );
        const notificationForLateShift =
          await this.notificationService.createUserSpecificNotification({
            title: CONSTANT.NOTIFICATION.FACILITY_FIND_REPLACEMENT,
            text: CONSTANT.NOTIFICATION.FACILITY_FIND_REPLACEMENT_TEXT,
            push_type: PushNotificationType.running_late,
          });

        await this.firebaseNotificationService.sendNotificationToOne(
          notificationForLateShift,
          'provider',
          shift.provider.id,
          {
            id: shift.id,
            notification_id: notificationForLateShift.id,
            status: shift.status,
            start_date: shift.start_date,
            start_time: shift.start_time,
            end_date: shift.end_date,
            end_time: shift.end_time,
            facility: {
              id: shift.facility.id,
              name: shift.facility.name,
              street_address: shift.facility.street_address,
              house_no: shift.facility.house_no,
              zip_code: shift.facility.zip_code,
              latitude: shift.facility.latitude,
              longitude: shift.facility.longitude,
            },
            expire_in: 0,
            is_timer: false,
            is_ai_triggered: true,
            shift_status: SHIFT_STATUS.running_late,
            to: 'notification_data',
            created_at: new Date().toISOString(),
            description:
              CONSTANT.NOTIFICATION.FACILITY_FIND_REPLACEMENT_DESCRIPTION,
          },
        );

        // provider who got replaced by AI
        await this.shiftService.providerRunningLateShift(
          shift.id,
          shift.provider.id,
        );

        let providers = await this.aiService.getAIRecommendations(
          shift.facility.id,
          shift.speciality.id,
          shift.certificate.id,
        );

        providers = providers.filter(
          (providerId: string) => providerId !== shift.provider.id,
        );

        // filtered based on time preferences
        const filteredProviders =
          await this.autoSchedulingService.filterByPreferenceOfProvider(
            providers,
            shift,
          );

        await Promise.all(
          filteredProviders &&
            filteredProviders.map(async (provider) => {
              await this.shiftInvitationService.updateOrCreateInvitation({
                providerId: provider,
                shiftId: shift.id,
                status: SHIFT_INVITATION_STATUS.invited,
                shiftStatus: SHIFT_STATUS.auto_scheduling,
              });
            }),
        );

        await this.shiftInvitationService.update(
          { provider: { id: In(providers) } },
          {
            shift_status: SHIFT_STATUS.auto_scheduling,
            status: SHIFT_INVITATION_STATUS.unseen,
            created_at: new Date().toISOString(),
          },
        );

        const setting = await this.autoSchedulingSettingService.find({
          select: {
            running_late_request_expiry: true,
          },
        });

        // send notification to other user for open / auto scheduling shift
        const notification =
          await this.notificationService.createUserSpecificNotification({
            title: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TITLE,
            text: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TEXT(
              moment(shift.start_date).format('MM-DD-YYYY'),
              moment(shift.start_time, 'HH:mm:ss').format('hh:mm A'),
              moment(shift.end_time, 'HH:mm:ss').format('hh:mm A'),
              shift.facility.name,
            ),
            push_type: PushNotificationType.auto_scheduling,
          });

        const createDto = [];
        for (const provider of filteredProviders) {
          if (provider !== shift.provider.id) {
            createDto.push({
              provider,
              shift: shift.id,
              shift_status: SHIFT_STATUS.auto_scheduling,
              status: SHIFT_INVITATION_STATUS.unseen,
              created_at: new Date().toISOString(),
            });

            await this.firebaseNotificationService.sendNotificationToOne(
              notification,
              'provider',
              provider,
              {
                id: shift.id,
                notification_id: notification.id,
                status: shift.status,
                start_date: shift.start_date,
                start_time: shift.start_time,
                end_date: shift.end_date,
                end_time: shift.end_time,
                facility: {
                  id: shift.facility.id,
                  name: shift.facility.name,
                  street_address: shift.facility.street_address,
                  house_no: shift.facility.house_no,
                  zip_code: shift.facility.zip_code,
                  latitude: shift.facility.latitude,
                  longitude: shift.facility.longitude,
                },
                expire_in: setting[0].running_late_request_expiry,
                is_timer: true,
                is_ai_triggered: true,
                shift_status: SHIFT_STATUS.auto_scheduling,
                to: 'notification_data',
                created_at: new Date().toISOString(),
                description: CONSTANT.NOTIFICATION.SHIFT_INVITATION_DESCRIPTION,
              },
            );
          }
        }

        // removing the provider who was scheduled and got late
        await this.shiftService.updateWhere(
          { id: shift.id },
          {
            provider: null,
            temp_conf_at: null,
            status: SHIFT_STATUS.open,
          },
        );

        // Log replace running late
        await this.activityService.logShiftActivity(
          shift,
          req,
          ACTIVITY_TYPE.REPLACE_RUNNING_LATE,
          {
            from_status: shift.status,
            to_status: SHIFT_STATUS.open,
            is_auto_scheduling: true,
          },
          ACTION_TABLES.SHIFT,
        );
        await this.shiftService.updateWhere(
          { id: shiftId },
          { is_ai_triggered: true },
        );
        return response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('AI Triggered'),
          data: {},
        });
      } else {
        // for sending notification to the user who is late and removing that user from the shift
        if (shift.is_ai_triggered) {
          return response.badRequest({
            message: CONSTANT.VALIDATION.ALREADY_AI_RUNNING,
            data: {},
          });
        }
        // checkpoint to send the send validation message if selected 'NO'
        await this.shiftService.updateWhere(
          { id: shiftId },
          { is_ai_triggered: false },
        );
        // Log no replace running late
        await this.activityService.logShiftActivity(
          shift,
          req,
          ACTIVITY_TYPE.NO_REPLACE_RUNNING_LATE,
          {
            from_status: shift.status,
            to_status: SHIFT_STATUS.running_late,
            is_auto_scheduling: true,
          },
          ACTION_TABLES.SHIFT,
        );
        return response.successResponse({
          message: CONSTANT.SUCCESS.WAITING_FOR_LATE_PROVIDER,
          data: {},
        });
      }
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.shifts, SUB_SECTION.shift)
  @Roles('facility', 'facility_user', 'admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('calendar-shifts/:id')
  async getCalendarShifts(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() calendarShiftDto: CalendarShiftDto,
  ) {
    try {
      const data = await this.shiftService.getCalendarShifts(
        id,
        calendarShiftDto,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.DEFAULT,
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.shifts, SUB_SECTION.shift)
  @Roles('facility', 'facility_user', 'admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('all')
  async findAllShifts(@Query() filterShiftDto: AllShiftFilterDto) {
    try {
      const [list, count] =
        await this.shiftService.findAllShiftsWithFilters(filterShiftDto);

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        total: count,
        limit: +filterShiftDto.limit,
        offset: +filterShiftDto.offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('un-posted-shift/count')
  async getUnPostedShiftCount() {
    try {
      const count = await this.shiftService.getUnPostedShiftCount();

      return response.successResponse({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        data: { count },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('shift-count')
  async getShiftCount(
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    try {
      const data = await this.shiftService.getShiftCount(start_date, end_date);

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Shift'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('shift-dashboard')
  async getShiftDashboard(@Query() filterDto: FilterShiftDashboardDto) {
    try {
      const [data, count] =
        await this.shiftService.getShiftDashboard(filterDto);

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift'),
        total: count,
        limit: +filterDto.limit,
        offset: +filterDto.offset,
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
