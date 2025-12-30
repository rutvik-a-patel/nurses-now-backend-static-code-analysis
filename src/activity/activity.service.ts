import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { plainToInstance } from 'class-transformer';
import {
  FormattedMessage,
  IACTIVITY,
  IRequest,
} from '@/shared/constants/types';
import {
  TABLE,
  ACTIVITY_TYPE,
  SHIFT_STATUS,
  ACTION_TABLES,
} from '@/shared/constants/enum';
import { Shift } from '@/shift/entities/shift.entity';
import { CertificateService } from '@/certificate/certificate.service';
import { SpecialityService } from '@/speciality/speciality.service';
import { ProviderService } from '@/provider/provider.service';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { ShiftCancelReasonService } from '@/shift-cancel-reason/shift-cancel-reason.service';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';
import { ActivityQuery } from './dto/activity-query.dto';
import { ShiftEditIncludeKeys } from '@/shared/constants/constant';
import * as moment from 'moment';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    private readonly certificateService: CertificateService,
    private readonly specialityService: SpecialityService,
    private readonly providerService: ProviderService,
    private readonly shiftCancelReasonService: ShiftCancelReasonService,
  ) {}

  // common payload of activity log
  private createBaseActivityData(shift: Shift, req: IRequest) {
    return req && req.user
      ? {
          action_by_type: TABLE[req.user.role],
          [req.user.role]: req.user.id,
          shift,
          message: {
            [req.user.role]: `${req.user.first_name} ${req.user.last_name}`,
            image:
              req.user?.base_url +
              (req.user.role === TABLE.provider
                ? req.user?.profile_image
                : req.user?.image),
          },
        }
      : {};
  }

  // register activity log
  async activityLog(params: IACTIVITY | object): Promise<Activity> {
    const activity = await this.activityRepo.save(params);
    return plainToInstance(Activity, activity);
  }

  async logShiftActivity(
    shift: Shift,
    req: IRequest,
    activityType: ACTIVITY_TYPE,
    additionalData: Record<string, any> = {},
    action_for: ACTION_TABLES,
    entity_id?: string,
  ) {
    const baseActivityData = this.createBaseActivityData(shift, req);
    const formattedMessage: FormattedMessage = {
      ...baseActivityData.message,
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
      ACTIVITY_TYPE.FACILITY_REJECT_REQUEST,
      ACTIVITY_TYPE.FACILITY_ACCEPT_REQUEST,
      ACTIVITY_TYPE.TIMECARD_GENERATED,
      ACTIVITY_TYPE.TIMECARD_FLAGGED,
      ACTIVITY_TYPE.TIMECARD_DISPUTED,
      ACTIVITY_TYPE.TIMECARD_EDITED,
    ];

    // Add shift details if required
    if (requiresShiftDetails.includes(activityType)) {
      formattedMessage.shift_date = shift.start_date;
      formattedMessage.shift_time = `${moment(shift.start_time, 'HH:mm:ss').format('hh:mm A')} - ${moment(shift.end_time, 'HH:mm:ss').format('hh:mm A')}`;
      formattedMessage.facility = shift.facility.name;
      formattedMessage.provider = `${shift?.provider?.first_name} ${shift?.provider?.last_name}`;
    }

    return this.activityLog({
      ...baseActivityData,
      entity_id: entity_id ? entity_id : shift.id,
      activity_type: activityType,
      message: formattedMessage,
      action_for,
    });
  }

  async logProviderActivity(
    shiftInvitation: ShiftInvitation,
    req: IRequest,
    activityType: ACTIVITY_TYPE,
    additionalData: Record<string, any> = {},
    action_for: ACTION_TABLES,
  ) {
    return this.logShiftActivity(
      shiftInvitation.shift,
      req,
      activityType,
      {
        provider: `${shiftInvitation.provider.first_name} ${shiftInvitation.provider.last_name}`,
        facility: shiftInvitation.shift.facility.name,
        ...additionalData,
      },
      action_for,
    );
  }

  // shift create and invite activity
  async shiftCreateActivity(
    shift: Shift,
    req: IRequest,
    action_for: ACTION_TABLES,
  ) {
    const speciality = await this.specialityService.findOneWhere({
      where: { id: shift.speciality as unknown as string },
    });

    await this.logShiftActivity(
      shift,
      req,
      ACTIVITY_TYPE.SHIFT_CREATED,
      {
        certificate: shift.certificate?.name,
        speciality: speciality?.name,
      },
      action_for,
    );

    if (shift.invited_provider?.length) {
      const invitedProviders = await Promise.all(
        shift.invited_provider.map(async (provider) => {
          const details = await this.providerService.findOneWhere({
            where: { id: provider as unknown as string },
          });
          return { name: `${details.first_name} ${details.last_name}` };
        }),
      );
      await this.logShiftActivity(
        shift,
        req,
        ACTIVITY_TYPE.SHIFT_INVITED,
        {
          certificate: shift.certificate?.name,
          speciality: speciality?.name,
          provider: invitedProviders,
          from_status: SHIFT_STATUS.invite_sent,
          to_status: '',
        },
        action_for,
      );
    }
  }

  // shift cancel activity
  async shiftCancelActivity(
    shift: Shift,
    req: IRequest,
    action_for: ACTION_TABLES,
  ) {
    const cancelReason = await this.shiftCancelReasonService.findOneWhere({
      where: { id: shift.cancel_reason as unknown as string },
    });
    await this.logShiftActivity(
      shift,
      req,
      ACTIVITY_TYPE.SHIFT_CANCELLED,
      {
        cancel_title: cancelReason.reason,
        from_status: SHIFT_STATUS.scheduled,
        to_status: SHIFT_STATUS.cancelled,
      },
      action_for,
    );
  }

  // shift update activity
  async shiftUpdateActivity(
    shift: Shift,
    req: IRequest,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    action_for: ACTION_TABLES,
  ) {
    const changes = getUpdatedFields(
      oldData,
      newData,
      ShiftEditIncludeKeys,
      true,
    ) as string[];

    if (changes.length > 0) {
      await this.logShiftActivity(
        shift,
        req,
        ACTIVITY_TYPE.SHIFT_UPDATED,
        {
          changes,
        },
        action_for,
      );
    }
  }

  // update activity
  async commonUpdateActivity(
    shift: Shift,
    req: IRequest,
    activity_type: ACTIVITY_TYPE,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    includeKeys: string[],
    action_for: ACTION_TABLES,
  ) {
    const changes = getUpdatedFields(
      oldData,
      newData,
      includeKeys,
      true,
    ) as string[];

    if (changes.length > 0) {
      await this.logShiftActivity(
        shift,
        req,
        activity_type,
        {
          changes,
        },
        action_for,
      );
    }
  }

  async findAllWithFilters(
    query: ActivityQuery,
  ): Promise<[Activity[], number]> {
    const {
      id,
      search,
      start_date,
      end_date,
      order,
      limit = 10,
      offset = 0,
      action_for = [],
      entity_id = [],
    } = query;

    const qb = this.activityRepo
      .createQueryBuilder('ac')
      .leftJoinAndSelect('ac.shift', 'shift')
      .leftJoinAndSelect('shift.facility', 'facility');

    if (start_date && end_date) {
      qb.andWhere(
        "DATE(ac.created_at AT TIME ZONE 'UTC') BETWEEN :start AND :end",
        {
          start: start_date,
          end: end_date,
        },
      );
    }

    if (id) {
      qb.andWhere('ac.shift_id = :id', { id });
    }

    // filter by action_for name
    if (action_for.length) {
      qb.andWhere('ac.action_for IN (:...action_for)', { action_for });
    }

    if (search) {
      // search filter
      const parseSearchKeyword = `%${search.toLowerCase()}%`;

      qb.andWhere(
        `(
        LOWER(ac.activity_type::text) ILIKE :search OR
        LOWER(ac.action_by_type::text) ILIKE :search OR
        LOWER(ac.message::text) ILIKE :search
      )`,
        { search: parseSearchKeyword },
      );
    }
    if (entity_id.length) {
      qb.andWhere('ac.entity_id IN (:...entity_id)', { entity_id });
    }

    qb.leftJoinAndSelect('ac.admin', 'admin');
    qb.leftJoinAndSelect('ac.provider', 'provider');
    qb.leftJoinAndSelect('ac.facility_user', 'facility_user');

    qb.addSelect(
      `
      CASE ac.action_by_type
        WHEN '${TABLE.admin}' THEN
          jsonb_build_object(
            'id', admin.id,
            'name', admin.first_name || ' ' || admin.last_name,
            'image', admin.image,
            'base_url', admin.base_url,
            'user_type', '${TABLE.admin}'
          )
        WHEN '${TABLE.provider}' THEN
          jsonb_build_object(
            'id', provider.id,
            'name', provider.first_name || ' ' || provider.last_name,
            'image', provider.profile_image,
            'base_url', provider.base_url,
            'user_type', '${TABLE.provider}'
          )
        WHEN '${TABLE.facility_user}' THEN
          jsonb_build_object(
            'id', facility_user.id,
            'name', facility_user.first_name || ' ' || facility_user.last_name,
            'image', facility_user.image,
            'base_url', facility_user.base_url,
            'user_type', '${TABLE.facility_user}'
          )
        ELSE NULL
      END
    `,
      'action_by_user',
    );

    if (order && typeof order === 'object') {
      Object.entries(order).forEach(([field, direction]) => {
        qb.addOrderBy(`ac.${field}`, direction.toUpperCase() as 'ASC' | 'DESC');
      });
    } else {
      qb.addOrderBy('ac.created_at', 'DESC');
    }

    const { entities, raw } = await qb
      .take(+limit)
      .skip(+offset)
      .getRawAndEntities();

    const result = entities.map((activity, i) => {
      const actionUser = raw[i]?.action_by_user ?? null;
      return {
        ...activity,
        action_by_user: actionUser,
        shift: activity.shift
          ? {
              id: activity.shift.id,
              start_date: activity.shift.start_date,
              end_date: activity.shift.end_date,
              start_time: activity.shift.start_time,
              end_time: activity.shift.end_time,
              shift_type: activity.shift.shift_type,
              status: activity.shift.status,
            }
          : null,
        facility: activity.shift?.facility
          ? {
              id: activity.shift.facility.id,
              name: activity.shift.facility.name,
              base_url: activity.shift.facility.base_url,
              image: activity.shift.facility.image,
              city: activity.shift.facility.city,
              state: activity.shift.facility.state,
            }
          : null,
      };
    });

    const total = await qb.getCount();

    return [plainToInstance(Activity, result), total];
  }

  // find all service
  async findAll(
    options: FindManyOptions<Activity>,
  ): Promise<[Activity[], number]> {
    const [list, count] = await this.activityRepo.findAndCount(options);
    return [plainToInstance(Activity, list), count];
  }

  // find by different fields service
  async findOneWhere(options: FindManyOptions<Activity>): Promise<Activity> {
    const result = await this.activityRepo.findOne(options);
    return plainToInstance(Activity, result);
  }

  // find by id
  async findByShiftId(shiftId: string): Promise<Activity[]> {
    return this.activityRepo.find({
      where: { shift: { id: shiftId } },
      order: { created_at: 'DESC' },
    });
  }
}
