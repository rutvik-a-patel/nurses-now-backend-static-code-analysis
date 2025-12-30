import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  EJS_FILES,
  ORIENTATION_STATUS,
  PushNotificationType,
  SHIFT_INVITATION_STATUS,
  SHIFT_STATUS,
  TABLE,
} from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import { AIService } from '@/shared/helpers/ai-service';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import logger from '@/shared/helpers/logger';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { ShiftInvitationService } from '@/shift-invitation/shift-invitation.service';
import { Shift } from '@/shift/entities/shift.entity';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import * as moment from 'moment-timezone';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { DistanceMatrixService } from '@/shared/helpers/distance-matrix';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import {
  IRequest,
  FormattedMessage,
  IACTIVITY,
} from '@/shared/constants/types';
import { Activity } from '@/activity/entities/activity.entity';
import { plainToInstance } from 'class-transformer';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Admin } from '@/admin/entities/admin.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { ShiftNotificationLog } from '@/notification/entities/shift-notification-log.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { ShiftService } from '@/shift/shift.service';
import { FacilityNotificationLog } from '@/notification/entities/facility-notification-log.entity';
import { VoidShift } from '@/shift/entities/void-shift.entity';
import { active } from '@/shared/constants/constant';
import { InvoicesService } from '@/invoices/invoices.service';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly shiftService: ShiftService,
    private readonly shiftInvitationService: ShiftInvitationService,
    private readonly aiService: AIService,
    private readonly autoSchedulingSettingService: AutoSchedulingSettingService,
    private readonly autoSchedulingService: AutoSchedulingService,
    private readonly shiftNotificationService: ShiftNotificationService,
    private readonly distanceMatrixService: DistanceMatrixService,
    private readonly encryptDecryptService: EncryptDecryptService,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
    private readonly invoiceService: InvoicesService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(FacilityUser)
    private readonly facilityUserRepository: Repository<FacilityUser>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(ShiftNotificationLog)
    private readonly shiftNotificationLogRepository: Repository<ShiftNotificationLog>,
    @InjectRepository(FacilityNotificationLog)
    private readonly facilityNotificationLogRepository: Repository<FacilityNotificationLog>,
    @InjectRepository(VoidShift)
    private readonly voidShiftRepository: Repository<VoidShift>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(ProviderOrientation)
    private readonly providerOrientationRepository: Repository<ProviderOrientation>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES) // Adjust the frequency as needed
  async handleUnseenInvitations() {
    try {
      if (process.env.NODE_APP_INSTANCE === '0') {
        const setting = await this.autoSchedulingSettingService.find({
          select: {
            send_another_request: true,
            post_shift_to_open: true,
            check_distance_time: true,
            running_late_request_expiry: true,
            running_late_ai_time: true,
          },
        });

        // Fetch all facilities with their timezones
        const facilities = await this.facilityRepository.find({
          where: { timezone: Not(IsNull()) },
        });

        // Process facilities in parallel (limit concurrency if needed)
        await Promise.allSettled(
          facilities.map(async (facility) => {
            try {
              const facilityTimezone = facility.timezone || 'America/New_York';

              // Get current date and time for this facility's timezone
              const currentDate = moment()
                .tz(facilityTimezone)
                .format('YYYY-MM-DD');
              const currentTime = moment()
                .tz(facilityTimezone)
                .format('HH:mm:ss');
              const timePlusHours = moment()
                .tz(facilityTimezone)
                .add(setting[0].post_shift_to_open, 'minutes')
                .format('HH:mm:ss');
              const startRunningLateTime = moment()
                .tz(facilityTimezone)
                .add(setting[0].check_distance_time, 'minutes')
                .format('HH:mm:ss');

              await Promise.allSettled([
                this.setVoidShift(facility, currentDate, currentTime),

                this.setOpenShift(
                  facility,
                  currentDate,
                  currentTime,
                  timePlusHours,
                ),

                this.sendAiRecommendationForRunningLate(
                  facility,
                  currentDate,
                  currentTime,
                ),

                this.checkRunningLate(
                  facility,
                  currentDate,
                  currentTime,
                  startRunningLateTime,
                  setting[0].running_late_ai_time,
                ),
              ]);

              // Fetch the time frame from configuration
              const timeFrame = setting[0].send_another_request;

              const [list, count] = await this.shiftInvitationService.findAll({
                where: {
                  shift: {
                    facility: { id: facility.id },
                    is_orientation: false,
                  },
                  status: SHIFT_INVITATION_STATUS.invited,
                  updated_at: LessThan(
                    new Date(new Date().getTime() - timeFrame * 60 * 1000),
                  ),
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
              if (count) {
                await Promise.allSettled(
                  list.map((invitation) => {
                    if (invitation && invitation.shift) {
                      return this.applyAutoSchedulingLogic(invitation);
                    }
                    return null;
                  }),
                );
              }
            } catch (innerErr) {
              logger.error(
                `Facility ${facility.id} error: ${innerErr.message}`,
              );
            }
          }),
        );
      }
    } catch (error) {
      logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
    }
  }

  // for handling new notify orientation
  @Cron(CronExpression.EVERY_4_HOURS) // Adjust the frequency as needed
  async handleNewNotifyOrientation() {
    try {
      if (process.env.NODE_APP_INSTANCE === '0') {
        // Fetch all facilities with their timezones
        const facilities = await this.facilityRepository.find({
          where: {
            timezone: Not(IsNull()),
          },
          relations: {
            time_entry_setting: true,
            facility_portal_setting: true,
            shift_setting: true,
          },
        });

        // Notify me cron job to send notifications to providers
        await this.notifyMeCronJob();

        // Process each facility to notify providers
        await Promise.allSettled(
          facilities.map(
            async (facility) =>
              // for sending notification to the provider about the new facility
              await this.getProvidersWithinRadiusOfFacility(facility),
          ),
        );
      }
    } catch (error) {
      logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
    }
  }

  //generate invoice for the provider
  @Cron(CronExpression.EVERY_5_MINUTES) // Adjust the frequency as needed
  async generateInvoice() {
    try {
      if (process.env.NODE_APP_INSTANCE === '0') {
        const facilities = await this.facilityRepository.find({
          relations: { status: true, accounting_setting: true },
          where: {
            status: { name: active },
          },
          select: {
            id: true,
            active_date: true,
            last_billing_date: true,
            status: { id: true, name: true },
            accounting_setting: { id: true, billing_cycle: true },
          },
        });

        const currentDate = moment();

        if (facilities && facilities.length) {
          for (const facility of facilities) {
            const { accounting_setting } = facility;
            const { cycleStartDate, lastBillingDate } = this.getLastBillingDate(
              accounting_setting,
              facility,
            );

            if (currentDate.isAfter(lastBillingDate, 'day')) {
              await this.facilityRepository.update(facility.id, {
                last_billing_date: lastBillingDate,
              });
              facility.last_billing_date = lastBillingDate;

              await this.invoiceService.billGeneratedInvoices();
            }

            await this.invoiceService.generateInvoiceForFacility(
              facility,
              cycleStartDate,
              lastBillingDate,
            );
          }
        }
      }
    } catch (error) {
      logger.error(
        `Generate Invoice cron ${new Date().toLocaleString('es-CL')} ${error.message}`,
      );
    }
  }

  async applyAutoSchedulingLogic(invitation: ShiftInvitation) {
    if (invitation) {
      await this.shiftInvitationService.update(
        { id: invitation.id },
        {
          status: SHIFT_INVITATION_STATUS.unseen,
        },
      );
      const activity = await this.activityRepository.findOne({
        where: {
          shift: { id: invitation.shift.id },
          activity_type: ACTIVITY_TYPE.AUTO_SCHEDULING_NO_RESPONSE,
        },
      });

      if (!activity) {
        await this.logShiftActivity(
          invitation.shift,
          null,
          ACTIVITY_TYPE.AUTO_SCHEDULING_NO_RESPONSE,
          {
            from_status: SHIFT_STATUS.invite_sent,
            to_status: SHIFT_STATUS.auto_scheduling,
            is_auto_scheduling: true,
          },
        );
      }
    }

    let providers = await this.aiService.getAIRecommendations(
      invitation.shift.facility.id,
      invitation.shift.speciality.id,
      invitation.shift.certificate.id,
    );

    providers = await this.autoSchedulingService.filterProviderList(
      providers,
      invitation.shift,
    );

    if (
      invitation.shift.status === SHIFT_STATUS.auto_scheduling ||
      invitation.shift.status === SHIFT_STATUS.invite_sent
    ) {
      if (invitation.shift.status === SHIFT_STATUS.invite_sent) {
        await sendEmailHelper({
          email: invitation.shift.follower.email,
          email_type: EJS_FILES.ai_recommendation,
          subject: CONSTANT.EMAIL.AI_LOOKING_FOR_RECOMMENDATIONS,
          shiftData: {
            ...invitation.shift,
            provider: { ...invitation.shift.provider },
          },
        });
      }

      const setting = await this.autoSchedulingSettingService.findOneWhere({
        where: {},
      });

      await this.autoSchedulingService.runAutoScheduling(
        providers,
        invitation.shift,
        setting,
        0,
      );
    }
  }

  async setVoidShift(
    facility: Facility,
    currentDate: string,
    currentTime: string,
  ) {
    try {
      const voidShifts = await this.shiftRepository.find({
        where: {
          facility: { id: facility.id },
          end_date: LessThanOrEqual(currentDate),
          end_time: LessThanOrEqual(currentTime),
          status: Not(
            In([
              SHIFT_STATUS.cancelled,
              SHIFT_STATUS.completed,
              SHIFT_STATUS.un_submitted,
              SHIFT_STATUS.ongoing,
              SHIFT_STATUS.void,
            ]),
          ),
        },
        relations: {
          follower: true,
          facility: true,
          provider: true,
        },
      });

      if (voidShifts && voidShifts.length) {
        const voidShiftsData = [];
        const shiftIds = voidShifts.map((shift) => shift.id);

        await this.shiftRepository.update(
          { id: In(shiftIds) },
          { status: SHIFT_STATUS.void, temp_conf_at: null, provider: null },
        );

        await this.providerOrientationRepository.update(
          { shift: { id: In(shiftIds) } },
          { status: ORIENTATION_STATUS.void },
        );

        const activityLogs = voidShifts.map((shift) => {
          if (shift?.provider?.id) {
            voidShiftsData.push(
              this.voidShiftRepository.save({
                shift: { id: shift.id },
                provider: { id: shift.provider.id },
              }),
            );
          }

          return this.logShiftActivity(
            shift,
            null,
            ACTIVITY_TYPE.SHIFT_VOIDED,
            {
              from_status: SHIFT_STATUS.void,
              is_auto_scheduling: true,
            },
          );
        });

        await Promise.all([...activityLogs, ...voidShiftsData]);
      }
    } catch (error) {
      logger.error(`Error in setVoidShift: ${error.message}`);
    }
  }

  async sendAiRecommendationForRunningLate(
    facility: Facility,
    currentDate: string,
    currentTime: string,
  ) {
    const runningLateShifts = await this.shiftRepository.find({
      where: {
        facility: { id: facility.id },
        start_date: LessThanOrEqual(currentDate),
        start_time: LessThanOrEqual(currentTime),
        status: SHIFT_STATUS.scheduled,
        clock_in: IsNull(),
      },
      relations: {
        provider: true,
        follower: true,
        facility: true,
      },
    });

    if (runningLateShifts.length) {
      for (const shift of runningLateShifts) {
        if (!shift.is_ai_triggered) {
          await this.shiftRepository.update(shift.id, {
            status: SHIFT_STATUS.running_late,
          });

          if (!shift.is_orientation) {
            // For sending email based on the creator role
            const createdByDetails =
              await this.sendRunningLateEmailBySchedularDetails(
                shift.created_by_id,
                shift.created_by_type,
              );
            const shiftId = await this.encryptDecryptService.encrypt(shift.id);
            // sending notification to the facility/facility user
            await this.shiftNotificationService.sendNotification({
              email: shift.follower.email,
              cc_mail:
                shift.follower.email === createdByDetails?.email
                  ? null
                  : createdByDetails?.email,
              emailType: EJS_FILES.running_late,
              role: TABLE.facility_user,
              userId: shift.follower.id,
              shiftStatus: SHIFT_STATUS.running_late,
              text: CONSTANT.NOTIFICATION.RUNNING_LATE_TEXT(
                `${shift.provider.first_name} ${shift.provider.last_name}`,
                moment(shift.start_date).format('MM-DD-YYYY'),
                moment(shift.start_time, 'HH:mm:ss').format('hh:mm A'),
                shift.facility.name,
              ),
              title: CONSTANT.NOTIFICATION.PROVIDER_RUNNING_LATE_TITLE,
              subject: CONSTANT.EMAIL.RUNNING_LATE(shift.shift_id),
              shiftData: { ...shift, provider: { ...shift.provider } },
              redirectUrl: `${process.env.FACILITY_URL}confirmation?shift_id=${shiftId}&provider=${shift.provider.first_name + ' ' + shift.provider.last_name}`,
              push_type: PushNotificationType.running_late,
            });
          }
          // sending notification to the provider informing that provider is late
          const notification =
            await this.notificationService.createUserSpecificNotification({
              title: CONSTANT.NOTIFICATION.YOU_ARE_LATE,
              text: CONSTANT.NOTIFICATION.YOU_ARE_LATE_TEXT(
                moment(shift.start_date).format('MM-DD-YYYY'),
                moment(shift.start_time, 'HH:mm:ss').format('hh:mm A'),
                shift.facility.name,
              ),
              push_type: PushNotificationType.running_late,
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
              is_timer: false,
              shift_status: SHIFT_STATUS.running_late,
              to: 'notification_data',
              created_at: new Date().toISOString(),
              description: CONSTANT.NOTIFICATION.YOU_ARE_LATE_DESCRIPTION,
            },
          );
          await Promise.all([
            runningLateShifts.map((shift) => {
              return this.logShiftActivity(
                shift,
                null,
                ACTIVITY_TYPE.MARKED_RUNNING_LATE,
                {
                  from_status: shift.status,
                  to_status: SHIFT_STATUS.running_late,
                  is_auto_scheduling: true,
                },
              );
            }),
          ]);
        }
      }
    }
  }

  async setOpenShift(
    facility: Facility,
    currentDate: string,
    currentTime: string,
    timePlusHours: string,
  ) {
    const shifts = await this.shiftRepository.find({
      where: {
        facility: { id: facility.id },
        status: In([
          SHIFT_STATUS.requested,
          SHIFT_STATUS.auto_scheduling,
          SHIFT_STATUS.invite_sent,
        ]),
        start_date: currentDate,
        start_time: Between(currentTime, timePlusHours),
        is_orientation: false,
      },
      relations: { provider: true, follower: true, facility: true },
    });

    if (shifts.length) {
      for (const shift of shifts) {
        await this.shiftRepository.update(
          { id: shift.id },
          { status: SHIFT_STATUS.open },
        );
      }
    }
    await Promise.all(
      shifts.map((shift) => {
        return this.logShiftActivity(shift, null, ACTIVITY_TYPE.OPEN_ORDER, {
          from_status: shift.status,
          to_status: SHIFT_STATUS.open,
          is_auto_scheduling: true,
        });
      }),
    );
  }

  async checkRunningLate(
    facility: Facility,
    currentDate: string,
    currentTime: string,
    startRunningLateTime: string,
    runningLateTime: number,
  ) {
    const shifts = await this.shiftRepository.find({
      where: {
        facility: { id: facility.id },
        status: In([SHIFT_STATUS.scheduled]),
        start_date: currentDate,
        start_time: Between(currentTime, startRunningLateTime),
      },
      relations: { provider: true, follower: true, facility: true },
    });

    if (shifts.length) {
      for (const shift of shifts) {
        const checkDistance =
          await this.distanceMatrixService.getDistanceAndETA(
            shift.provider.latitude,
            shift.provider.longitude,
            shift.facility.latitude,
            shift.facility.longitude,
            runningLateTime,
          );

        if (checkDistance) {
          if (!shift.is_ai_triggered) {
            await this.shiftRepository.update(shift.id, {
              status: SHIFT_STATUS.running_late,
            });

            // For sending email based on the creator role
            const createdByDetails =
              await this.sendRunningLateEmailBySchedularDetails(
                shift.created_by_id,
                shift.created_by_type,
              );
            await this.logShiftActivity(
              shift,
              null,
              ACTIVITY_TYPE.DISTANCE_RUNNING_LATE,
              {
                from_status: shift.status,
                to_status: SHIFT_STATUS.running_late,
                is_auto_scheduling: true,
              },
            );

            // sending notification to the provider
            const notificationData =
              await this.notificationService.createUserSpecificNotification({
                text: CONSTANT.NOTIFICATION.PROVIDER_RUNNING_LATE(
                  moment(shift.start_time, 'HH:mm:ss').format('hh:mm A'),
                  shift.facility.name,
                ),
                title: CONSTANT.NOTIFICATION.RUNNING_LATE_TITLE,
                push_type: PushNotificationType.running_late,
              });
            logger.info(
              `Notification Data runninglate: ${JSON.stringify(notificationData)}`,
            );
            await this.firebaseNotificationService.sendNotificationToOne(
              notificationData,
              'provider',
              shift.provider.id,
              {
                id: shift.id,
                notification_id: notificationData.id,
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

                shift_status: SHIFT_STATUS.running_late,
                to: 'notification_data',
                created_at: new Date().toISOString(),
                description:
                  CONSTANT.NOTIFICATION.PROVIDER_RUNNING_LATE_DESCRIPTION,
              },
            );
            if (!shift.is_orientation) {
              // sending notification to the follower
              const shiftId = await this.encryptDecryptService.encrypt(
                shift.id,
              );
              await this.shiftNotificationService.sendNotification({
                email: shift.follower.email,
                cc_mail:
                  shift.follower.email === createdByDetails?.email
                    ? null
                    : createdByDetails?.email,
                emailType: EJS_FILES.running_late,
                role: TABLE.facility_user,
                userId: shift.follower.id,
                shiftStatus: SHIFT_STATUS.running_late,
                text: CONSTANT.NOTIFICATION.RUNNING_LATE_TEXT(
                  `${shift.provider.first_name} ${shift.provider.last_name}`,
                  moment(shift.start_date).format('MM-DD-YYYY'),
                  moment(shift.start_time, 'HH:mm:ss').format('hh:mm A'),
                  shift.facility.name,
                ),
                title: CONSTANT.NOTIFICATION.PROVIDER_RUNNING_LATE_TITLE,
                subject: CONSTANT.EMAIL.RUNNING_LATE(shift.shift_id),
                shiftData: { ...shift, provider: { ...shift.provider } },
                redirectUrl: `${process.env.FACILITY_URL}confirmation?shift_id=${shiftId}&provider=${shift.provider.first_name + ' ' + shift.provider.last_name}`,
                push_type: PushNotificationType.running_late,
              });
            }
          }
        }
      }
    }
  }

  async logShiftActivity(
    shift: Shift,
    req: IRequest,
    activityType: ACTIVITY_TYPE,
    additionalData: Record<string, any> = {},
    action_for: ACTION_TABLES = ACTION_TABLES.SHIFT,
  ) {
    const formattedMessage: FormattedMessage = {
      ...additionalData,
    };

    // For including the shift details to those activity which is mentioned in this array
    // Add shift date and time details only for specific activity types
    const requiresShiftDetails = [
      ACTIVITY_TYPE.SHIFT_CREATED,
      ACTIVITY_TYPE.SHIFT_INVITED,
      ACTIVITY_TYPE.ACCEPTED_SHIFT_INVITATION,
      ACTIVITY_TYPE.REJECTED_SHIFT_INVITATION,
      ACTIVITY_TYPE.REQUEST_WITHDRAWN,
      ACTIVITY_TYPE.INVITE_AGAIN,
      ACTIVITY_TYPE.PROVIDER_REQUEST_SHIFT,
      ACTIVITY_TYPE.FACILITY_REJECT_REQUEST,
      ACTIVITY_TYPE.FACILITY_ACCEPT_REQUEST,
    ];

    // Add shift details if required
    if (requiresShiftDetails.includes(activityType)) {
      formattedMessage.shift_date = shift.start_date;
      formattedMessage.shift_time = `${shift.start_time} - ${shift.end_time}`;
      formattedMessage.facility = shift.facility.name;
    }

    return this.activityLog({
      activity_type: activityType,
      entity_id: shift.id,
      message: formattedMessage,
      shift,
      action_for,
    });
  }

  // register activity log
  async activityLog(params: Partial<IACTIVITY>): Promise<Activity> {
    const activity = await this.activityRepository.save(params);
    return plainToInstance(Activity, activity);
  }

  async sendRunningLateEmailBySchedularDetails(
    createdById: string,
    createdByType: string,
  ) {
    const authServices = {
      admin: this.adminRepository,
      facility_user: this.facilityUserRepository,
      facility: this.facilityRepository,
    };
    const authTableService = authServices[createdByType];
    const createdByDetails = await authTableService.findOne({
      where: { id: createdById },
      select: ['id', 'email'],
    });
    return createdByDetails;
  }

  async notifyMeCronJob() {
    const providers = await this.providerRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.certificate', 'certificate')
      .leftJoinAndSelect('provider.speciality', 'speciality')
      .leftJoinAndSelect('provider.address', 'address')
      .where(
        `provider.notify_me = true AND provider.deleted_at IS NULL AND provider.profile_status != 'deleted'`,
      )
      .andWhere('provider.is_active = true')
      .andWhere(
        '(provider.is_email_verified = true OR provider.is_mobile_verified = true)',
      )

      .andWhere('provider.radius IS NOT NULL')
      .andWhere('certificate.id IS NOT NULL')
      .andWhere('speciality.id IS NOT NULL')
      .andWhere(
        'NOT EXISTS (SELECT 1 FROM shift_notification_log snl WHERE snl.provider_id = provider.id)',
      )
      .orderBy('provider.first_name', 'ASC')
      .getMany();

    for (const provider of providers) {
      const latitude = (provider.latitude ||
        provider.address[0]?.latitude) as string;
      const longitude = (provider.longitude ||
        provider.address[0]?.longitude) as string;
      const radius = provider.radius;

      // Skip if location is still not resolvable
      if (!latitude || !longitude || !radius) continue;
      // Fetch nearby shifts
      const [allNearbyShifts, count] =
        await this.shiftService.getProviderShiftsWithinRadius(
          provider,
          latitude,
          longitude,
          radius,
        );

      // Filter out shifts already notified
      const newShifts = [];
      for (const shift of allNearbyShifts) {
        const alreadyNotified =
          await this.shiftNotificationLogRepository.findOne({
            where: {
              provider: { id: provider.id },
            },
          });

        if (!alreadyNotified) {
          newShifts.push(shift);
          // Log notification intent (avoid race condition on repeated calls)
          await this.shiftNotificationLogRepository.save({
            provider: { id: provider.id },
            shift: { id: shift.id },
            notified_at: new Date(),
          });
        }
      }

      // Skip if no new shifts to notify
      if (count === 0) continue;

      // Create notification entity (can also be pre-created/reused)
      const notification =
        await this.notificationService.createUserSpecificNotification({
          title: CONSTANT.NOTIFICATION.NEARBY_SHIFT,
          text: CONSTANT.NOTIFICATION.NEARBY_SHIFT_TEXT,
          push_type: PushNotificationType.nearby_notify,
        });

      // Send notification to provider
      await this.firebaseNotificationService.sendNotificationToOne(
        notification,
        TABLE.provider,
        provider.id,
        {
          expire_in: 0,
          is_timer: false,
          status: PushNotificationType.auto_scheduling,

          // Use first shift from newShifts array for notification details
          start_date: moment().format('YYYY-MM-DD'),
          end_date: moment().format('YYYY-MM-DD'),
          start_time: moment().format('HH:mm:ss'),
          end_time: moment().format('HH:mm:ss'),
          to: 'notification_data',
          created_at: new Date().toISOString(),
          description: CONSTANT.NOTIFICATION.NEARBY_SHIFT_TEXT,
        },
      );
    }
  }

  async getProvidersWithinRadiusOfFacility(facility: Facility): Promise<void> {
    const {
      latitude,
      longitude,
      id: facilityId,
      time_entry_setting,
      facility_portal_setting,
      shift_setting,
    } = facility;

    if (
      !latitude ||
      !longitude ||
      !(
        time_entry_setting ||
        facility_portal_setting ||
        (shift_setting?.length ?? 0) > 0
      )
    ) {
      return; // Skip if facility location is not set / not eligible
    }

    // Haversine (miles). Fallback to 250 if provider.radius is NULL
    const haversine = `
      (3958.8 * acos(
        cos(radians(:facilityLat)) * cos(radians(provider.latitude)) *
        cos(radians(provider.longitude) - radians(:facilityLong)) +
        sin(radians(:facilityLat)) * sin(radians(provider.latitude))
      ))
  `;

    const queryBuilder = this.providerRepository
      .createQueryBuilder('provider')
      .innerJoin('facility', 'f', 'f.id = :facilityId AND f.deleted_at IS NULL')
      .select([
        'provider.id AS id',
        'provider.first_name AS first_name',
        'provider.last_name AS last_name',
        'provider.latitude AS latitude',
        'provider.longitude AS longitude',
        'provider.radius AS radius',
        'provider.verification_status AS verification_status',
        'provider.email AS email',
        'provider.mobile_no AS mobile_no',
        'provider.gender AS gender',
        'provider.shift_time AS shift_time',
        'provider.notify_me AS notify_me',
        'provider.is_email_verified AS is_email_verified',
        'provider.is_mobile_verified AS is_mobile_verified',
      ])
      .where('provider.is_active = true')
      .andWhere(
        '(provider.is_email_verified = true OR provider.is_mobile_verified = true)',
      )
      .andWhere(
        'provider.latitude IS NOT NULL AND provider.longitude IS NOT NULL',
      )
      .andWhere(`${haversine} <= COALESCE(provider.radius, 250)`)
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM facility_notification_log fnl
          WHERE fnl.provider_id = provider.id AND fnl.facility_id = :facilityId
        )`,
      )
      .andWhere(
        `(
        (provider.certificate_id IS NOT NULL AND f.certificate IS NOT NULL AND provider.certificate_id = ANY(f.certificate))
        OR
        (provider.speciality_id IS NOT NULL AND f.speciality IS NOT NULL AND provider.speciality_id = ANY(f.speciality))
        OR
        (provider.additional_certification IS NOT NULL AND f.certificate IS NOT NULL AND provider.additional_certification && f.certificate)
        OR
        (provider.additional_speciality IS NOT NULL AND f.speciality IS NOT NULL AND provider.additional_speciality && f.speciality)
      )`,
      )
      .andWhere(
        `provider.deleted_at IS NULL AND provider.profile_status != 'deleted'`,
      )
      .setParameters({
        facilityLat: latitude,
        facilityLong: longitude,
        facilityId,
      });

    const candidates = await queryBuilder.getRawMany();

    // Process each provider. Use "insert-first (orIgnore) → send" to be idempotent.
    await Promise.allSettled(
      candidates.map(async (provider) => {
        const insertNotificationLog =
          await this.facilityNotificationLogRepository
            .createQueryBuilder()
            .insert()
            .into(this.facilityNotificationLogRepository.target) // FacilityNotificationLog
            .values({
              provider: { id: provider.id },
              facility: { id: facilityId },
              notified_at: new Date(),
            })
            .orIgnore() // ON CONFLICT DO NOTHING (Postgres)
            .returning(['id']) // will be empty if ignored
            .execute();

        if (!insertNotificationLog.identifiers?.length) {
          return;
        }

        // 2) Create the notification record
        const notification =
          await this.notificationService.createUserSpecificNotification({
            title: CONSTANT.NOTIFICATION.NEW_FACILITY,
            text: CONSTANT.NOTIFICATION.NEW_FACILITY_TEXT(facility.name),
            push_type: PushNotificationType.new_facility,
          });

        // 2. Send push notification to that provider
        await this.firebaseNotificationService.sendNotificationToOne(
          notification,
          TABLE.provider,
          provider.id,
          {
            expire_in: 0,
            is_timer: false,
            status: PushNotificationType.new_facility,
            shift_status: PushNotificationType.new_facility,
            start_date: moment().format('YYYY-MM-DD'),
            end_date: moment().format('YYYY-MM-DD'),
            start_time: moment().format('HH:mm:ss'),
            end_time: moment().format('HH:mm:ss'),
            facility: {
              id: facility.id,
              name: facility.name,
              street_address: facility.street_address,
              house_no: facility.house_no,
              zip_code: facility.zip_code,
              latitude: facility.latitude,
              longitude: facility.longitude,
              place_id: facility.place_id,
              timezone: facility.timezone,
              base_url: facility.base_url,
              image: facility.image,
            },
            to: 'notification_data',
            created_at: new Date().toISOString(),
            description: CONSTANT.NOTIFICATION.NEW_FACILITY_TEXT_DESCRIPTION,
          },
        );
      }),
    );
  }

  getLastBillingDate(
    accountingSettings: AccountingSetting,
    facility: Facility,
  ) {
    const billing_cycle = accountingSettings?.billing_cycle || 15;
    const cycleStartDate = facility.last_billing_date
      ? moment(facility.last_billing_date).add(1, 'days')
      : moment(facility.active_date);

    const lastBillingDate = moment(cycleStartDate).add(billing_cycle, 'days');

    return {
      cycleStartDate: cycleStartDate.toDate(),
      lastBillingDate: lastBillingDate.toDate(),
    };
  }
}
