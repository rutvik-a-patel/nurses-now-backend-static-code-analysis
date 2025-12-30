import { Injectable } from '@nestjs/common';
import logger from './logger';
import { ShiftInvitationService } from '@/shift-invitation/shift-invitation.service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from './firebase-notification';
import { ShiftService } from '@/shift/shift.service';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  EJS_FILES,
  PushNotificationType,
  SHIFT_INVITATION_STATUS,
  SHIFT_STATUS,
  USER_STATUS,
} from '../constants/enum';
import { CONSTANT } from '../constants/message';
import { Shift } from '@/shift/entities/shift.entity';
import { In, Not, Repository } from 'typeorm';
import sendEmailHelper from './send-email-helper';
import { ActivityService } from '@/activity/activity.service';
import * as moment from 'moment';
import { IRequest, ProfileRow } from '../constants/types';
import { Provider } from '@/provider/entities/provider.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AutoSchedulingSetting } from '@/auto-scheduling-setting/entities/auto-scheduling-setting.entity';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';

@Injectable()
export class AutoSchedulingService {
  constructor(
    private readonly shiftInvitationService: ShiftInvitationService,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
    private readonly shiftService: ShiftService,
    private readonly activityService: ActivityService,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly providerCredentialsService: ProviderCredentialsService,
  ) {}

  async runAutoScheduling(
    providers: string[],
    shift: Shift,
    setting: AutoSchedulingSetting,
    count = 0,
    status?: SHIFT_STATUS,
    req: IRequest = null,
  ) {
    try {
      const isTimer = [
        SHIFT_STATUS.cancelled,
        SHIFT_STATUS.running_late,
      ].includes(status);

      const statusExpiryMapping = {
        [SHIFT_STATUS.cancelled]: setting.cancel_request_expiry,
        [SHIFT_STATUS.running_late]: setting.running_late_request_expiry,
      };

      const expireIn = statusExpiryMapping[status] || 10;

      if (providers.length) {
        const currDate = new Date();
        currDate.setDate(currDate.getDate() + setting.bulk_scheduling_duration);
        let shiftStatus = SHIFT_STATUS.auto_scheduling;
        if (
          new Date(shift.start_date).getTime() < currDate.getTime() ||
          isTimer
        ) {
          shiftStatus = SHIFT_STATUS.open;

          let matchingProviders = await this.filterByPreferenceOfProvider(
            providers,
            shift,
          );

          if (!matchingProviders.length) return;

          const checked = await Promise.all(
            matchingProviders.map(async (providerId) => {
              const { expired, notApproved, rejected } =
                await this.providerCredentialsService.checkIfExpiredLatestCredentialsByProvider(
                  providerId,
                  shift.facility.timezone,
                  'invitation',
                );
              return expired || notApproved || rejected ? null : providerId;
            }),
          );
          matchingProviders = checked.filter((id): id is string => id !== null);

          const promises = matchingProviders.flatMap((provider) => {
            const invitation =
              this.shiftInvitationService.updateOrCreateInvitation({
                providerId: provider,
                shiftId: shift.id,
                status: SHIFT_INVITATION_STATUS.invited,
                shiftStatus: SHIFT_STATUS.auto_scheduling,
              });

            const notificationData = {
              title: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TITLE,
              text: CONSTANT.NOTIFICATION.SHIFT_INVITATION_TEXT(
                moment(shift.start_date).format('MM-DD-YYYY'),
                moment(shift.start_time, 'HH:mm:ss').format('hh:mm A'),
                moment(shift.end_time, 'HH:mm:ss').format('hh:mm A'),
                shift.facility.name,
              ),
              push_type: PushNotificationType.auto_scheduling,
            };

            return [
              invitation,
              this.notificationService
                .createUserSpecificNotification(notificationData)
                .then((notification) =>
                  this.firebaseNotificationService.sendNotificationToOne(
                    notification,
                    'provider',
                    provider,
                    this.buildNotificationPayload(
                      shift,
                      notification.id,
                      expireIn,
                      isTimer,
                    ),
                  ),
                ),
            ];
          });

          await Promise.all(promises);
        } else {
          await this.shiftInvitationService.updateOrCreateInvitation({
            providerId: providers[0],
            shiftId: shift.id,
            status: SHIFT_INVITATION_STATUS.invited,
            shiftStatus: SHIFT_STATUS.auto_scheduling,
          });

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

          await this.firebaseNotificationService.sendNotificationToOne(
            notification,
            'provider',
            providers[0],
            this.buildNotificationPayload(
              shift,
              notification.id,
              expireIn,
              isTimer,
            ),
          );
        }

        await this.shiftService.updateWhere(
          { id: shift.id },
          { status: shiftStatus },
        );
        return;
      }

      if (!count) {
        await this.shiftService.updateWhere(
          { id: shift.id },
          { status: SHIFT_STATUS.open },
        );

        await this.activityService.logShiftActivity(
          shift,
          req,
          ACTIVITY_TYPE.OPEN_ORDER,
          {
            from_status: 'open_order',
            to_status: '',
            is_auto_scheduling: true,
          },
          ACTION_TABLES.SHIFT,
        );

        await sendEmailHelper({
          email: shift.follower.email,
          email_type: EJS_FILES.shift_open,
          subject: CONSTANT.EMAIL.AI_OPEN_STATUS_NOTIFICATION,
          shiftData: { ...shift, provider: { ...shift.provider } },
        });
      }
    } catch (error) {
      logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
    }
  }

  private buildNotificationPayload(
    shift: Shift,
    notificationId: string,
    expireIn: number,
    isTimer: boolean,
    description = CONSTANT.NOTIFICATION.SHIFT_INVITATION_DESCRIPTION,
  ) {
    return {
      id: shift.id,
      notification_id: notificationId,
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
      expire_in: expireIn,
      is_timer: isTimer,
      shift_status: SHIFT_STATUS.auto_scheduling,
      to: 'notification_data',
      created_at: new Date().toISOString(),
      description,
    };
  }

  async filterProviderList(
    providers: string[],
    shift: Shift,
  ): Promise<string[]> {
    // Return early if providers array is empty
    if (!providers?.length || !shift?.id) return [];

    try {
      // Fetch unseen and rejected invitations in parallel
      const [[unseenInvitations], [rejectedInvitations]] = await Promise.all([
        this.shiftInvitationService.findAll({
          where: [
            {
              shift: { id: shift.id },
              status: In([
                SHIFT_INVITATION_STATUS.unseen,
                SHIFT_INVITATION_STATUS.invited,
              ]),
              provider: { profile_status: Not(USER_STATUS.deleted) },
            },
          ],
          relations: { provider: true },
        }),
        this.shiftInvitationService.findAll({
          where: {
            shift: { id: shift.id },
            status: SHIFT_INVITATION_STATUS.rejected,
            provider: { profile_status: Not(USER_STATUS.deleted) },
          },
          relations: { provider: true },
        }),
      ]);

      // Remove providers with unseen invitations
      const unseenProviderIds =
        unseenInvitations?.map((inv) => inv.provider.id) ?? [];
      let filteredProviders = providers.filter(
        (id) => !unseenProviderIds.includes(id),
      );

      // Remove providers with rejected invitations
      const rejectedProviderIds =
        rejectedInvitations?.map((inv) => inv.provider.id) ?? [];
      filteredProviders = filteredProviders.filter(
        (id) => !rejectedProviderIds.includes(id),
      );

      // Filter by provider preferences
      filteredProviders = await this.filterByPreferenceOfProvider(
        filteredProviders,
        shift,
      );

      // If no providers left, fallback to unseen invitations
      if (!filteredProviders.length) {
        const [unseenFallback] = await this.shiftInvitationService.findAll({
          where: {
            shift: { id: shift.id },
            status: In([
              SHIFT_INVITATION_STATUS.unseen,
              SHIFT_INVITATION_STATUS.invited,
            ]),
            provider: { profile_status: Not(USER_STATUS.deleted) },
          },
          relations: { provider: true },
        });
        if (!unseenFallback?.length) return [];
        return unseenFallback.map((inv) => inv.provider.id);
      }

      return filteredProviders;
    } catch (error) {
      logger.error(
        `${new Date().toLocaleString('es-CL')} ${error?.message ?? error}`,
      );
      return [];
    }
  }

  // ✅ Shift time preference filtering
  async filterByPreferenceOfProvider(providers: string[], shift: Shift) {
    if (!providers?.length || !shift?.id) return [];
    const providerAvailable: ProfileRow[] = await this.providerRepository.query(
      `
              SELECT provider_id,
                     to_char(d, 'YYYY-MM-DD') AS d,
                     time_code,
                     global_ok,
                     profile_ok,
                     profile_source,
                     profile_reason,
                     orientation_ok,
                     orientation_status
              FROM fn_availability_of_staff_with_temp_perm_message($1::uuid[], $2::date[], $3::uuid, $4::time, $5::time)
              `,
      [
        providers,
        [shift.start_date],
        shift.facility.id,
        shift.start_time,
        shift.end_time,
      ],
    );
    const filteredProviders = providerAvailable
      .filter((provider) => {
        if (!provider.global_ok) return false;
        if (
          !provider.orientation_ok ||
          provider.orientation_status !== 'completed'
        )
          return false;
        const preferences =
          provider.global_ok === true && provider.profile_ok === true;
        return preferences;
      })
      .map((provider) => provider.provider_id);
    return filteredProviders;
  }
}
