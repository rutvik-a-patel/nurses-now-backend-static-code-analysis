import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { FacilityShiftFilterDto } from './dto/facility-shift-filter.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  ADJUSTMENT_STATUS,
  CALENDAR_SHIFT_STATUS,
  DAY,
  DAY_TYPE,
  DEFAULT_STATUS,
  FACILITY_PROVIDER_FLAGS,
  FILTER_SHIFT_TYPE,
  INVOICE_STATE,
  ORIENTATION_STATUS,
  PushNotificationType,
  SHIFT,
  SHIFT_INVITATION_STATUS,
  SHIFT_REQUEST_STATUS,
  SHIFT_STATUS,
  SHIFT_TYPE,
  TABLE,
  TIMECARD_STATUS,
  VALIDATE_UPON,
} from '@/shared/constants/enum';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { Facility } from '@/facility/entities/facility.entity';
import { ProviderShiftFilterDto } from './dto/provider-shift-filter.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { ProviderScheduledShiftFilterDto } from './dto/provider-scheduled-shift-filter.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { Provider } from '@/provider/entities/provider.entity';
import { ApproveTimecardDto } from './dto/approve-timecard.dto';
import { RejectTimecardDto } from './dto/reject-timecard.dto';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { CONSTANT } from '@/shared/constants/message';
import * as moment from 'moment';
import response from '@/shared/response';
import {
  accountingRole,
  show_cancellation_notes,
  totalBreaks,
} from '@/shared/constants/constant';
import { TimeEntryApproval } from '@/time-entry-approval/entities/time-entry-approval.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { ScheduleRequestSetting } from '@/schedule-request-settings/entities/schedule-request-setting.entity';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';
import { CalendarShiftDto } from './dto/calendar-shift.dto';
import { AllShiftFilterDto } from './dto/all-shift-filter.dto';
import { CreateBatchShiftDto } from './dto/create-shift-batch.dto';
import { ActivityService } from '@/activity/activity.service';
import {
  IRequest,
  ProfileRow,
  WarnStaffMessage,
} from '@/shared/constants/types';
import { ProviderCancelledShift } from './entities/provider-cancelled-shift.entity';
import { getTimeCode } from '@/shared/helpers/time-code';
import { DashboardService } from '@/dashboard/dashboard.service';
import { FilterShiftDashboardDto } from './dto/filter-shift-dashboard.dto';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { ProviderLateShift } from './entities/provider-late-shift.entity';
import logger from '@/shared/helpers/logger';
import { AIService } from '@/shared/helpers/ai-service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { RateGroup } from '@/rate-groups/entities/rate-group.entity';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { Disbursement } from '@/disbursement/entities/disbursement.entity';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import { Notification } from '@/notification/entities/notification.entity';

@Injectable()
export class ShiftService {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly activityService: ActivityService,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(ShiftInvitation)
    private readonly shiftInvitationRepository: Repository<ShiftInvitation>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(TimeEntryApproval)
    private readonly timeEntryApprovalRepository: Repository<TimeEntryApproval>,
    @InjectRepository(ScheduleRequestSetting)
    private readonly scheduleRequestSettingRepository: Repository<ScheduleRequestSetting>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(ShiftRequest)
    private readonly shiftRequestRepository: Repository<ShiftRequest>,
    @InjectRepository(ProviderCancelledShift)
    private readonly providerCancelledShiftRepository: Repository<ProviderCancelledShift>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Timecard)
    private readonly timeCardRepository: Repository<Timecard>,
    @InjectRepository(ProviderLateShift)
    private readonly providerLateShiftRepository: Repository<ProviderLateShift>,
    @InjectRepository(ProviderOrientation)
    private readonly providerOrientationRepository: Repository<ProviderOrientation>,
    @InjectRepository(RateGroup)
    private readonly rateGroupRepository: Repository<RateGroup>,
    @InjectRepository(FacilityHoliday)
    private readonly facilityHolidayRepository: Repository<FacilityHoliday>,
    @InjectRepository(Disbursement)
    private readonly disbursementRepository: Repository<Disbursement>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(AccountingSetting)
    private readonly accountingSettingRepository: Repository<AccountingSetting>,
    private readonly aIService: AIService,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
    private readonly branchappService: BranchAppService,
  ) {}

  getDatesForWeekdaysInRange(
    startDateStr: string,
    endDateStr: string,
    weekdays: number[],
  ): string[] {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const result: string[] = [];

    const normalizedWeekdays = weekdays.map((day) => (day + 7) % 7);

    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      if (normalizedWeekdays.includes(currentDate.getDay())) {
        result.push(currentDate.toISOString().split('T')[0]);
      }
    }

    return result;
  }

  incrementDate(dateStr: string, days: number) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  async createConsecutiveDaysShift(createShiftDto: CreateShiftDto) {
    const { openings, start_date, end_date } = createShiftDto;
    let consecutiveDay;
    for (let i = 0; i < openings; i++) {
      Object.assign(createShiftDto, {
        openings: 1,
        start_date: this.incrementDate(start_date, i),
        end_date: this.incrementDate(end_date, i),
      });

      consecutiveDay = await this.createShift(createShiftDto);
    }
    return consecutiveDay;
  }

  async createConsecutiveWeeksShift(createShiftDto: CreateShiftDto) {
    const openings = createShiftDto.openings;
    const currentStartDate = createShiftDto.start_date;
    const endDate = this.incrementDate(createShiftDto.start_date, 7 * openings);

    const dateList = this.getDatesForWeekdaysInRange(
      currentStartDate,
      endDate,
      createShiftDto.days,
    );
    let weekShift;
    for (const date of dateList) {
      Object.assign(createShiftDto, {
        openings: 1,
        start_date: date,
        end_date: date,
      });

      weekShift = await this.createShift(createShiftDto);
    }
    return weekShift;
  }

  async createShiftForSpecificDates(createShiftDto: CreateShiftDto) {
    for (const shift of createShiftDto.specific_dates) {
      Object.assign(createShiftDto, {
        openings: shift.openings,
        start_date: shift.date,
        end_date: shift.date,
      });

      return await this.createShift(createShiftDto);
    }
  }

  async createShift(createShiftDto: CreateShiftDto) {
    const invitationData = [];
    let shift;
    for (let i = 0; i < createShiftDto.openings; i++) {
      shift = await this.create(createShiftDto);

      if (
        createShiftDto.invited_provider &&
        createShiftDto.invited_provider.length
      ) {
        for (const provider of createShiftDto.invited_provider) {
          invitationData.push({
            provider,
            shift: shift.id,
          });
        }

        if (invitationData.length)
          await this.shiftInvitationRepository.save(invitationData);
      }
    }
    return shift;
  }

  async create(createShiftDto: CreateShiftDto) {
    const data = plainToInstance(Shift, createShiftDto);
    if (
      createShiftDto.invited_provider &&
      createShiftDto.invited_provider.length
    ) {
      data.status = SHIFT_STATUS.invite_sent;
      delete data.invited_provider;
    }
    const result = await this.shiftRepository.save(data);
    const shift = await this.findOneWhere({
      relations: { facility: true, certificate: true },
      where: { id: result?.id },
    });
    return plainToInstance(Shift, shift);
  }

  async cloneShift(shift: Shift) {
    delete shift.id;
    const result = await this.shiftRepository.save(shift);
    return plainToInstance(Shift, result);
  }

  async saveProviderCancelledShifts(shift: Shift): Promise<void> {
    await this.providerCancelledShiftRepository.save({
      shift: { id: shift.id },
      provider: { id: shift.provider.id },
    });
  }

  async findAll(id: string): Promise<Shift[]> {
    const queryBuilder = this.shiftRepository.createQueryBuilder('s');
    queryBuilder
      .leftJoin('s.facility', 'f')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .leftJoin('s.follower', 'fo')
      .leftJoin('s.floor', 'fl')
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.shift_type AS shift_type',
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `s.description AS description`,
        `s.time_adjustment AS adjustment`,
        `s.pay_rate AS pay_rate`,
        `s.bill_rate AS bill_rate`,
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
        `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
        's.created_at AS created_at',
        's.premium_rate AS premium_rate',
        `jsonb_build_object(
          'id', fl.id,
          'name', fl.name
        ) AS floor`,
        `get_shift_time_code(s.start_time, s.end_time, s.facility_id) AS shift_time_code`,
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'latitude', f.latitude,
          'longitude', f.longitude,
          'timezone', f.timezone
        ) AS facility`,
        `jsonb_build_object(
          'id', fo.id,
          'first_name', fo.first_name,
          'last_name', fo.last_name,
          'base_url', fo.base_url,
          'image', fo.image
        ) AS follower`,
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation,
          'text_color', c.text_color, 
          'background_color', c.background_color
        ) AS certificate`,
        `jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'abbreviation', sp.abbreviation,
          'text_color', sp.text_color, 
          'background_color', sp.background_color
        ) AS speciality`,
        `COALESCE(
          (
            SELECT jsonb_agg(jsonb_build_object(
              'id', p.id,
              'first_name', p.first_name,
              'nick_name', p.nick_name,
              'middle_name', p.middle_name,
              'last_name', p.last_name,
              'base_url', p.base_url,
              'profile_image', p.profile_image
            ))
            FROM shift_invitation si
            LEFT JOIN provider p ON p.id = si.provider_id
            WHERE si.shift_id = s.id AND si.deleted_at IS NULL
          ), '[]'::jsonb
        ) AS invited_provider`,
      ])
      .groupBy('s.id, f.id, c.id, sp.id, fo.id , fl.id')
      .where(`s.is_publish = false AND f.id = '${id}'`)
      .addOrderBy(`s.created_at`, 'DESC');

    const list = await queryBuilder.getRawMany();
    return plainToInstance(Shift, list);
  }

  async findAllWhere(
    options: FindManyOptions<Shift>,
  ): Promise<[Shift[], number]> {
    const [list, count] = await this.shiftRepository.findAndCount(options);
    return [plainToInstance(Shift, list), count];
  }

  async findAllShift(
    id: string,
    filterShiftDto: FacilityShiftFilterDto,
  ): Promise<[Shift[], number]> {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.facility', 'f')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .leftJoin('s.provider_requests', 'sr')
      .leftJoin('s.invited_provider', 'si')
      .leftJoin('sr.provider', 'p')
      .leftJoin('s.provider', 'provider')
      .leftJoin('admin', 'a', 's.created_by_id = a.id')
      .leftJoin('facility_user', 'fu', 's.created_by_id = fu.id')
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `s.created_at AS created_at`,
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
        `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
        's.shift_type AS shift_type',
        's.status AS status',
        's.created_by_type as created_by_type',
        `s.time_adjustment AS adjustment`,
        `s.pay_rate AS pay_rate`,
        `s.bill_rate AS bill_rate`,
        's.cancelled_request_from as cancelled_request_from',
        `jsonb_build_object(
          'id', provider.id,
          'first_name', provider.first_name,
          'last_name', provider.last_name
        ) AS provider`,
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'latitude', f.latitude,
          'longitude', f.longitude,
          'timezone', f.timezone
        ) AS facility`,
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation,
          'text_color', c.text_color, 
          'background_color', c.background_color
        ) AS certificate`,
        `jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'abbreviation', sp.abbreviation,
          'text_color', sp.text_color, 
          'background_color', sp.background_color
        ) AS speciality`,
        `COALESCE((
          SELECT COUNT(*) 
          FROM shift_invitation si 
          WHERE si.shift_id = s.id AND deleted_at IS NULL
        ), 0)::INTEGER AS total_invites`,
        `COALESCE((
          SELECT COUNT(*) 
          FROM shift_request sr 
          WHERE sr.shift_id = s.id AND deleted_at IS NULL
        ), 0)::INTEGER AS total_requests`,
        `CASE 
          WHEN s.created_by_type = '${TABLE.admin}' THEN jsonb_build_object(
            'id', a.id,
            'first_name', a.first_name,
            'last_name', a.last_name,
            'type', '${TABLE.admin}'
          )
          WHEN s.created_by_type = '${TABLE.facility_user}' THEN jsonb_build_object(
            'id', fu.id,
            'first_name', fu.first_name,
            'last_name', fu.last_name,
            'type', '${TABLE.facility_user}'
          )
          ELSE NULL
        END AS ordered_by`,
      ])
      .where(`s.is_publish = true AND f.id = '${id}' AND s.deleted_at IS NULL`)
      .groupBy('s.id, f.id, c.id, sp.id, a.id,  fu.id, provider.id');

    if (filterShiftDto?.search) {
      queryBuilder.andWhere(`s.shift_id ILIKE :search`, {
        search: `%${parseSearchKeyword(filterShiftDto.search)}%`,
      });
    }

    if (filterShiftDto.from_date && filterShiftDto.to_date) {
      queryBuilder.andWhere('s.start_date BETWEEN :from_date AND :to_date', {
        from_date: filterShiftDto.from_date,
        to_date: filterShiftDto.to_date,
      });
    }

    if (filterShiftDto.certificate && filterShiftDto.certificate.length) {
      queryBuilder.andWhere('c.id IN (:...certificateIds)', {
        certificateIds: filterShiftDto.certificate,
      });
    }

    if (filterShiftDto.speciality && filterShiftDto.speciality.length) {
      queryBuilder.andWhere('sp.id IN (:...specialityIds)', {
        specialityIds: filterShiftDto.speciality,
      });
    }

    if (filterShiftDto.status && filterShiftDto.status.length) {
      queryBuilder.andWhere('s.status IN (:...status)', {
        status: filterShiftDto.status,
      });
    }

    if (filterShiftDto.type) {
      queryBuilder.andWhere(`s.shift_type = '${filterShiftDto.type}'`);
    }

    if (filterShiftDto.shift_id_from && filterShiftDto.shift_id_to) {
      queryBuilder.andWhere('s.shift_id BETWEEN :from_id AND :to_id', {
        from_id: filterShiftDto.shift_id_from,
        to_id: filterShiftDto.shift_id_to,
      });
    }

    Object.keys(filterShiftDto.order).forEach((key) => {
      queryBuilder.addOrderBy(`${key}`, filterShiftDto.order[key]);
    });

    queryBuilder.limit(+filterShiftDto.limit).offset(+filterShiftDto.offset);
    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async findOneWhere(options: FindOneOptions<Shift>) {
    const result = await this.shiftRepository.findOne(options);
    return plainToInstance(Shift, result);
  }

  async shiftDetail(id: string): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({ where: { id: id } });

    if (!shift) return null;

    const select = [
      's.id AS id',
      's.shift_id AS shift_id',
      `s.shift_type AS shift_type`,
      's.updated_at AS updated_at',
      `s.start_time AS start_time`,
      `s.end_time AS end_time`,
      `s.status AS status`,
      `TO_CHAR(s.clock_in_date, 'YYYY-MM-DD') AS clock_in_date`,
      `s.clock_in AS clock_in`,
      `TO_CHAR(s.clock_out_date, 'YYYY-MM-DD') AS clock_out_date`,
      `s.time_adjustment AS adjustment`,
      `s.pay_rate AS pay_rate`,
      `s.bill_rate AS bill_rate`,
      `s.clock_out AS clock_out`,
      `s.total_break AS total_break`,
      `s.total_worked::INTEGER AS total_worked`,
      `s.description AS description`,
      's.premium_rate AS premium_rate',
      's.cancelled_request_from AS cancelled_request_from',
      `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
      `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
      's.created_at AS created_at',
      's.temp_conf_at AS temp_conf_at',
      's.modified_at AS modified_at',
      's.client_conf_at AS client_conf_at',
      's.is_orientation AS is_orientation',
      `CASE
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'D' THEN 'day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'E' THEN 'evening'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'N' THEN 'night'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'A' THEN 'long_day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'P' THEN 'long_night'
          ELSE 'flexible'
        END AS period`,
      `jsonb_build_object(
          'id', fo.id,
          'first_name', fo.first_name,
          'last_name', fo.last_name,
          'base_url', fo.base_url,
          'image', fo.image
        ) AS follower`,
      `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'latitude', f.latitude,
          'longitude', f.longitude,
          'city', f.city,
          'state', f.state,
          'house_no',f.house_no,
          'street_address',f.street_address,
          'zip_code',f.zip_code,
          'country', f.country,
          'timezone', f.timezone
        ) AS facility`,
      `CASE
          WHEN p.id IS NULL THEN '{}'::jsonb
          ELSE jsonb_build_object(
            'id', p.id,
            'first_name', p.first_name,
            'last_name', p.last_name,
            'nick_name', p.nick_name,
            'middle_name', p.middle_name,
            'base_url', p.base_url,
            'profile_image', p.profile_image,
            'latitude', p.latitude,
            'longitude', p.longitude,
            'country_code', p.country_code,
            'mobile_no', p.mobile_no,
            'email', p.email,
            'first_work_date', (
            SELECT TO_CHAR(MIN(s2.start_date), 'MM-DD-YYYY')
            FROM shift s2
            WHERE s2.provider_id = p.id AND s2.facility_id = f.id AND s2.status IN ('completed')
            ),
            'last_work_date', (
              SELECT TO_CHAR(MAX(s3.start_date), 'MM-DD-YYYY')
              FROM shift s3
              WHERE s3.provider_id = p.id AND s3.facility_id = f.id AND s3.status IN ('completed')
            ),
            'notes',sn.notes
          )
          END AS provider`,
      `CASE
          WHEN fl.id IS NULL THEN '{}'::jsonb
          ELSE jsonb_build_object(
            'id', fl.id,
            'name', fl.name
          )
        END AS floor`,
      `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation,
          'text_color', c.text_color,
          'background_color', c.background_color
        ) AS certificate`,
      `jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'abbreviation', sp.abbreviation,
          'text_color', sp.text_color,
          'background_color', sp.background_color
        ) AS speciality`,
      `COALESCE((
          SELECT COUNT(*)
          FROM shift_invitation si
          WHERE si.shift_id = :id AND deleted_at IS NULL
        ), 0)::INTEGER AS total_invites`,
      `COALESCE((
          SELECT COUNT(*)
          FROM shift_request sr
          WHERE sr.shift_id = :id AND deleted_at IS NULL
        ), 0)::INTEGER AS total_requests`,
    ];

    const queryBuilder = this.shiftRepository.createQueryBuilder('s');
    queryBuilder
      .leftJoin('s.facility', 'f')
      .leftJoin('f.time_entry_setting', 't')
      .leftJoin('s.follower', 'fo')
      .leftJoin('s.provider', 'p')
      .leftJoin('s.floor', 'fl')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .leftJoin('s.notes', 'sn');

    if (shift?.created_by_type) {
      const jsonData =
        shift.created_by_type == TABLE.facility
          ? `jsonb_build_object('id', created_by.id, 'name', created_by.name, 'base_url', created_by.base_url, 'image', created_by.image) AS created_by`
          : `jsonb_build_object('id', created_by.id, 'name', created_by.first_name || ' ' || created_by.last_name, 'base_url', created_by.base_url, 'image', created_by.image) AS created_by`;

      select.push(jsonData);
      queryBuilder.leftJoin(
        `${shift.created_by_type}`,
        `created_by`,
        `s.created_by_id = created_by.id`,
      );
    }

    if (shift?.updated_by_type) {
      const updatedByJson = `
        jsonb_build_object(
          'id', updated_by.id,
          'name', ${
            shift.updated_by_type === TABLE.facility
              ? 'updated_by.name'
              : `updated_by.first_name || ' ' || updated_by.last_name`
          },
          'base_url', updated_by.base_url,
          'image', ${
            shift.updated_by_type === TABLE.provider
              ? 'updated_by.profile_image'
              : 'updated_by.image'
          }
        ) AS updated_by
      `;

      select.push(updatedByJson);

      queryBuilder.leftJoin(
        shift.updated_by_type,
        'updated_by',
        's.updated_by_id = updated_by.id',
      );
    }

    if (shift?.cancelled_by_type) {
      const cancelledByJson = `
        jsonb_build_object(
          'id', cancelled_by.id,
          'name', ${
            shift.cancelled_by_type === TABLE.facility
              ? 'cancelled_by.name'
              : `cancelled_by.first_name || ' ' || cancelled_by.last_name`
          },
          'base_url', cancelled_by.base_url,
          'image', ${
            (shift.cancelled_request_from || shift.cancelled_by_type) ===
            TABLE.provider
              ? 'cancelled_by.profile_image'
              : 'cancelled_by.image'
          },
          'cancelled_by_type', s.cancelled_by_type
        ) AS cancelled_by,
        scr.reason AS cancel_reason,
        s.cancel_reason_description,
        s.cancelled_on
      `;

      select.push(cancelledByJson);

      queryBuilder
        .leftJoin(
          shift.cancelled_request_from
            ? shift.cancelled_request_from
            : shift.cancelled_by_type,
          'cancelled_by',
          's.cancelled_by_id = cancelled_by.id',
        )
        .leftJoin(
          'shift_cancel_reason',
          'scr',
          's.shift_cancel_reason_id = scr.id',
        );
    }

    queryBuilder.select(select);

    queryBuilder.andWhere('s.id = :id', { id });
    const result = await queryBuilder.getRawOne();
    return plainToInstance(Shift, result);
  }

  async updateWhere(
    where: FindOptionsWhere<Shift>,
    updateShiftDto: UpdateShiftDto | SubmitReportDto,
  ) {
    const data = plainToInstance(Shift, updateShiftDto);
    const record = await this.shiftRepository.update(where, data);
    return record;
  }

  async approveTimecard(
    shift: Shift,
    approveTimecardDto: ApproveTimecardDto,
    user: any,
  ) {
    const {
      additional_details,
      break_duration,
      clock_in,
      clock_out,
      floor,
      total_worked,
    } = approveTimecardDto;

    if (clock_out && clock_in) {
      const newTotalWorked = total_worked;
      const oldShiftDuration = Number(shift.total_worked);

      const startTime = new Date(`${shift.start_date}T${shift.start_time}`);
      const endTime = new Date(`${shift.end_date}T${shift.end_time}`);
      const shiftDuration = (endTime.getTime() - startTime.getTime()) / 1000;

      let adjustment = 0;
      let billableAdjustment = 0;
      const workedDifference = newTotalWorked - oldShiftDuration;
      const workedPayableDifference = newTotalWorked - shiftDuration;
      if (workedPayableDifference !== 0 && newTotalWorked <= shiftDuration) {
        const workedDifferenceHours =
          Math.round((workedPayableDifference / 3600) * 100) / 100;
        if (newTotalWorked == shiftDuration) {
          const newTotalPayable =
            Math.round(newTotalWorked / 3600) * shift.pay_rate;
          adjustment = newTotalPayable - Number(shift.total_payable_amount);
          const newTotalBillable =
            Math.round(newTotalWorked / 3600) * shift.bill_rate;
          billableAdjustment =
            newTotalBillable - Number(shift.total_billable_amount);
        } else {
          adjustment = workedDifferenceHours * shift.pay_rate;
          billableAdjustment = workedDifferenceHours * shift.bill_rate;
        }
      }

      const invoice = await this.invoiceRepository.findOne({
        relations: { invoice_timecards: { timecard: true } },
        where: {
          invoice_timecards: { timecard: { id: shift.time_card.id } },
        },
      });

      const shiftData = {
        break_duration,
        clock_in,
        clock_out,
        floor,
        total_worked,
        time_adjustment: workedDifference,
        adjustment,
        total_adjustment: adjustment,
        billable_adjustment: billableAdjustment,
        total_billable_adjustment: billableAdjustment,
        adjustment_status:
          adjustment != 0 ? ADJUSTMENT_STATUS.pending : undefined,
      };

      if ((invoice && invoice.status == INVOICE_STATE.generated) || !invoice) {
        Object.assign(shiftData, {
          total_billable_amount:
            Number(shift.total_billable_amount) + Number(billableAdjustment),
        });
      }

      const disbursement = await this.disbursementRepository.findOne({
        where: { shift: { id: shift.id } },
      });

      if (!disbursement) {
        Object.assign(shiftData, {
          total_payable_amount:
            Number(shift.total_payable_amount) + Number(adjustment),
        });
      }

      await this.updateWhere({ id: shift.id }, shiftData);

      let billAdjustmentStatus = ADJUSTMENT_STATUS.pending;
      if (invoice && invoice.status == INVOICE_STATE.generated) {
        billAdjustmentStatus = ADJUSTMENT_STATUS.settled;
        await this.invoiceRepository.update(invoice.id, {
          total: Number(invoice.total) + Number(billableAdjustment),
          outstanding: Number(invoice.outstanding) + Number(billableAdjustment),
        });
      }

      await this.updateWhere(
        { id: shift.id },
        {
          bill_adjustment_status: !invoice
            ? ADJUSTMENT_STATUS.settled
            : billAdjustmentStatus,
          billable_adjustment:
            !invoice || billAdjustmentStatus === ADJUSTMENT_STATUS.settled
              ? 0
              : billableAdjustment,
        },
      );
    }

    const record = await this.timeCardRepository.update(
      { shift: { id: shift.id } },
      plainToInstance(Timecard, {
        additional_details,
        status:
          shift.time_card.status === TIMECARD_STATUS.invoiced
            ? shift.time_card.status
            : TIMECARD_STATUS.approved,
        approved_by_id: user.id,
        approved_by_type: user.role,
        approved_date: new Date().toISOString(),
      }),
    );

    return record;
  }

  async rejectTimecard(
    where: FindOptionsWhere<Timecard>,
    rejectTimecardDto: RejectTimecardDto,
  ) {
    const record = await this.timeCardRepository.update(
      where,
      plainToInstance(Timecard, rejectTimecardDto),
    );
    return record;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto) {
    const data = plainToInstance(Shift, updateShiftDto);
    const record = await this.shiftRepository.update(id, {
      ...data,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(where: FindOptionsWhere<Shift>, deleteDto: DeleteDto) {
    const record = await this.shiftRepository.update(
      { ...where, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async getProviderShifts(
    providerShiftFilterDto: ProviderShiftFilterDto,
    provider: Provider,
  ): Promise<[Shift[], number]> {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.facility', 'f')
      .leftJoin('s.provider_requests', 'pr')
      .leftJoin('pr.provider', 'p')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.shift_type AS shift_type',
        's.status AS status',
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `s.bill_rate AS bill_rate`,
        `s.pay_rate AS pay_rate`,
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
        `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
        `CASE
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'D' THEN 'day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'E' THEN 'evening'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'N' THEN 'night'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'A' THEN 'long_day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'P' THEN 'long_night'
          ELSE 'flexible'
        END AS period`,
        `TRIM(TO_CHAR(s.start_date, 'Day')) AS day_of_week`,
        's.created_at AS created_at',
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'latitude', f.latitude,
          'longitude', f.longitude,
          'city', f.city,
          'state', f.state
        ) AS facility`,
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation
        ) AS certificate`,
        `jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'abbreviation', sp.abbreviation
        ) AS speciality`,
        `CONCAT(
          ROUND(
            (
              ST_DistanceSphere(
                ST_MakePoint(f.longitude, f.latitude),
                ST_MakePoint(${provider.address[0].longitude}, ${provider.address[0].latitude})
              ) * 0.000621371
            )::NUMERIC, 2
          ), ' mi'
        ) AS distance_in_miles`,
        `50::CHARACTER VARYING AS earnings`,
      ])
      .where(
        `(s.status IN ('${SHIFT_STATUS.open}', '${SHIFT_STATUS.requested}'))`,
      )
      .andWhere(`s.is_publish = true`)
      .andWhere(`c.id = '${provider.certificate.id}'`)
      // .andWhere(`f.state IN (:...preferred_state)`, {
      //   preferred_state: provider.preferred_state,
      // })
      .andWhere(`s.start_date >= :start_date`, {
        start_date: moment().format('YYYY-MM-DD'),
      })
      .andWhere(
        `(s.id NOT IN (
          SELECT sr.shift_id FROM shift_request sr
          WHERE sr.provider_id = :provider_id
        ))`,
        { provider_id: provider.id },
      )
      .andWhere(
        `(
        ST_DistanceSphere(
          ST_MakePoint(f.longitude, f.latitude),
          ST_MakePoint(:lon, :lat)
        ) * 0.000621371
      ) <= :radius`,
        {
          lon: provider.longitude,
          lat: provider.latitude,
          radius: provider.radius,
        },
      )
      .andWhere(
        `NOT EXISTS (
        SELECT 1 FROM provider_cancelled_shift pcs
        WHERE pcs.shift_id = s.id AND pcs.provider_id = :providerId
      )`,
        { providerId: provider.id },
      )
      .andWhere(
        `NOT EXISTS (
          SELECT 1
          FROM facility_provider fp
          WHERE fp.facility_id = f.id
            AND fp.provider_id = :providerId
            AND (fp.dnr_at IS NOT NULL OR fp.self_dnr_at IS NOT NULL)
            AND fp.deleted_at IS NULL
        )`,
        {
          providerId: provider.id,
        },
      )

      .groupBy('s.id, f.id, c.id, sp.id, p.id')
      .orderBy('s.created_at', 'DESC');

    if (providerShiftFilterDto?.search) {
      queryBuilder.andWhere(`(f.name ILIKE :search OR f.city ILIKE :search)`, {
        search: `%${parseSearchKeyword(providerShiftFilterDto.search)}%`,
      });
    }

    if (providerShiftFilterDto?.shift_type) {
      queryBuilder.andWhere(`s.shift_type IN (:...shift_type)`, {
        shift_type: providerShiftFilterDto.shift_type,
      });
    }

    if (providerShiftFilterDto?.shift) {
      if (providerShiftFilterDto.shift === SHIFT.day) {
        queryBuilder.andWhere(
          `s.start_time >= '06:00:00' AND s.start_time < '12:00:00'`,
        );
      }

      if (providerShiftFilterDto.shift === SHIFT.evening) {
        queryBuilder.andWhere(
          `s.start_time >= '12:00:00' AND s.start_time < '18:00:00'`,
        );
      }

      if (providerShiftFilterDto.shift === SHIFT.night) {
        queryBuilder.andWhere(
          `((s.start_time >= '18:00:00' AND s.start_time < '23:59:59') OR (s.start_time >= '00:00:00' AND s.start_time < '06:00:00'))`,
        );
      }
    }

    if (providerShiftFilterDto?.day) {
      if (providerShiftFilterDto.day == DAY.weekend) {
        queryBuilder.andWhere(`EXTRACT(ISODOW FROM s.start_date) IN (6, 7)`);
      }

      if (providerShiftFilterDto.day == DAY.weekday) {
        queryBuilder.andWhere(
          `EXTRACT(ISODOW FROM s.start_date) NOT IN (6, 7)`,
        );
      }
    }

    queryBuilder
      .limit(+providerShiftFilterDto.limit)
      .offset(+providerShiftFilterDto.offset)
      .distinct(true);

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async getProviderShiftCountWithinRadius(provider: Provider): Promise<{
    facility: number;
    shifts: number;
  }> {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.facility', 'f')
      .where(`(s.status IN (:...statuses))`, {
        statuses: [SHIFT_STATUS.open, SHIFT_STATUS.requested],
      })
      .andWhere(`s.is_publish = true`)
      .andWhere('s.start_date >= CURRENT_DATE')
      .andWhere('s.certificate_id = :certificate_id', {
        certificate_id: provider.certificate.id,
      })
      .andWhere('s.speciality_id = :speciality_id', {
        speciality_id: provider.speciality.id,
      })
      .andWhere(
        `s.id NOT IN (
        SELECT sr.shift_id FROM shift_request sr
        WHERE sr.provider_id = :provider_id
      )`,
        { provider_id: provider.id },
      )
      .andWhere(
        `(ST_DistanceSphere(
            ST_MakePoint(f.longitude, f.latitude),
            ST_MakePoint(:lon, :lat)
          ) * 0.000621371) <= :radius`,
        {
          lon: provider.longitude,
          lat: provider.latitude,
          radius: +provider.radius,
        },
      )
      .andWhere(
        `NOT EXISTS (
        SELECT 1 FROM provider_cancelled_shift pcs
        WHERE pcs.shift_id = s.id AND pcs.provider_id = :providerId
      )`,
        { providerId: provider.id },
      )
      .andWhere(
        `NOT EXISTS (
          SELECT 1
          FROM facility_provider fp
          WHERE fp.facility_id = f.id
            AND fp.provider_id = :providerId
            AND fp.flag IN (:...excludedFlags)
            AND fp.deleted_at IS NULL
        )`,
        {
          providerId: provider.id,
          excludedFlags: [
            FACILITY_PROVIDER_FLAGS.self,
            FACILITY_PROVIDER_FLAGS.dnr,
          ],
        },
      )
      .andWhere('s.deleted_at IS NULL');

    // Total shift count
    const totalShifts = await queryBuilder.getCount();

    // Facility count
    const facilityCountResult = await queryBuilder
      .clone()
      .select('COUNT(DISTINCT f.id)', 'facilityCount')
      .getRawOne<{ facilityCount: number }>();

    return {
      facility: +facilityCountResult.facilityCount || 0,
      shifts: totalShifts,
    };
  }

  async getProviderShiftsWithinRadius(
    provider: Provider,
    latitude: string,
    longitude: string,
    radius: number,
  ): Promise<[Shift[], number]> {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.facility', 'f')
      .leftJoin('s.provider_requests', 'pr')
      .leftJoin('pr.provider', 'p')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.shift_type AS shift_type',
        's.status AS status',
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `s.bill_rate AS bill_rate`,
        `s.pay_rate AS pay_rate`,
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
        `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
        `get_shift_time_code(s.start_time, s.end_time, s.facility_id) AS shift_time_code`,
        `CASE
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'D' THEN 'day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'E' THEN 'evening'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'N' THEN 'night'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'A' THEN 'long_day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'P' THEN 'long_night'
          ELSE 'flexible'
        END AS period`,
        `TRIM(TO_CHAR(s.start_date, 'Day')) AS day_of_week`,
        's.created_at AS created_at',
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'latitude', f.latitude,
          'longitude', f.longitude,
          'city', f.city,
          'state', f.state
        ) AS facility`,
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation
        ) AS certificate`,
        `jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'abbreviation', sp.abbreviation
        ) AS speciality`,
        `CONCAT(ROUND(CAST(3958.8 * acos(cos(radians(${latitude}))
        * cos(radians(f.latitude))
        * cos(radians(f.longitude) - radians(${longitude}))
        + sin(radians(${latitude})) * sin(radians(f.latitude))) AS numeric), 2), ' mi') AS distance_in_miles`,
      ])
      .where(
        `(s.status IN ('${SHIFT_STATUS.open}', '${SHIFT_STATUS.requested}'))`,
      )
      .andWhere('s.is_publish = true')
      .andWhere(`s.start_date >= :start_date`, {
        start_date: moment().format('YYYY-MM-DD'),
      })
      .andWhere(`s.certificate_id = :certificate_id`, {
        certificate_id: provider.certificate.id,
      })
      .andWhere(`s.speciality_id = :speciality_id`, {
        speciality_id: provider.speciality.id,
      })
      .andWhere(
        `(s.id NOT IN (
          SELECT sr.shift_id FROM shift_request sr
          WHERE sr.provider_id = :provider_id
        ))`,
        { provider_id: provider.id },
      )
      .andWhere(
        `(3958.8 * acos(cos(radians(${latitude}))
        * cos(radians(f.latitude))
        * cos(radians(f.longitude) - radians(${longitude}))
        + sin(radians(${latitude})) * sin(radians(f.latitude)))) <= :radius`,
        { radius },
      )
      .orderBy('s.created_at', 'DESC');

    queryBuilder.distinct(true);

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async getShiftDetailsForProvider(
    id: string,
    provider: Provider,
  ): Promise<Shift> {
    const data = await this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.facility', 'f')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .leftJoin('s.time_card', 'tc')
      .leftJoin('tc.time_sheets', 'ts')
      .leftJoin('f.time_entry_setting', 'set')
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.shift_type AS shift_type',
        's.description AS description',
        's.base_url AS base_url',
        's.bill_rate AS bill_rate',
        's.pay_rate AS pay_rate',
        's.total_payable_amount AS total_payable_amount',
        `case when set.id is not null then set.geo_fence_radius else 50 end as geo_fence_radius`,
        's.is_orientation AS is_orientation',
        'tc.authority_signature AS authority_signature',
        'tc.provider_signature AS provider_signature',
        `COALESCE(jsonb_agg(ts.image) FILTER (WHERE ts.image IS NOT NULL), '[]'::jsonb) AS time_sheets`,
        's.status AS status',
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `s.is_ai_triggered AS is_ai_triggered`,
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
        `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
        `CASE
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'D' THEN 'day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'E' THEN 'evening'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'N' THEN 'night'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'A' THEN 'long_day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'P' THEN 'long_night'
          ELSE 'flexible'
        END AS period`,
        `TO_CHAR(s.start_date, 'Day') AS day_of_week`,
        's.created_at AS created_at',
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'base_url', f.base_url,
          'image', f.image,
          'street_address', f.street_address,
          'house_no', f.house_no,
          'zip_code', f.zip_code,
          'latitude', f.latitude,
          'longitude', f.longitude,
          'city', f.city,
          'state', f.state,
          'timezone', f.timezone
        ) AS facility`,
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation
        ) AS certificate`,
        `jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'abbreviation', sp.abbreviation
        ) AS speciality`,
        `CASE
          WHEN COALESCE(f.orientation_enabled, false) = true THEN
            CASE
              WHEN NOT EXISTS (
                SELECT 1
                FROM facility_provider fp
                WHERE fp.facility_id = f.id
                  AND fp.provider_id = :provider_id
                  AND fp.deleted_at IS NULL
              )
              AND NOT EXISTS (
                SELECT 1
                FROM shift_request sr
                WHERE sr.shift_id = s.id
                  AND sr.provider_id = :provider_id
                  AND sr.deleted_at IS NULL
              )
              THEN TRUE
              ELSE FALSE
            END
          ELSE FALSE
        END AS is_orientation_required
        `,
        `(SELECT
          (
            CASE
              WHEN COUNT(*) FILTER (
                WHERE
                  s2.status IN ('scheduled', 'cancelled')
              ) = 0 THEN 0
              ELSE (
                COUNT(*) FILTER (
                  WHERE
                    s2.status = 'cancelled'
                    AND s2.temp_conf_at IS NOT NULL
                )::NUMERIC / NULLIF(
                  COUNT(*) FILTER (
                    WHERE
                      s2.status IN ('cancelled', 'scheduled', 'completed')
                      AND s2.temp_conf_at IS NOT NULL
                  ),
                  0
                )
              ) * 100
            END
          )::INTEGER AS cancellation_rate
        FROM
          shift s2
        WHERE
          s2.facility_id = f.id
          AND s2.deleted_at IS NULL) AS cancellation_rate`,
        `CASE
          WHEN EXISTS (
            SELECT 1
            FROM facility_provider fp2
            WHERE fp2.facility_id = f.id
              AND fp2.provider_id = :provider_id
              AND fp2.self_dnr_at IS NOT NULL
              AND fp2.deleted_at IS NULL
          ) THEN TRUE
          ELSE FALSE
        END AS is_self_dnr`,
        `CONCAT(ROUND(CAST(3958.8 * acos(cos(radians(${provider.address[0].latitude}))
        * cos(radians(f.latitude))
        * cos(radians(f.longitude) - radians(${provider.address[0].longitude}))
        + sin(radians(${provider.address[0].latitude})) * sin(radians(f.latitude))) AS numeric), 2), ' mi from your home') AS distance_in_miles`,
      ])
      .where(`s.id = :id`)
      .setParameters({ id, provider_id: provider.id })
      .groupBy('s.id, tc.id, f.id, c.id, sp.id, set.id')
      .getRawOne();

    const applicationProgress =
      await this.dashboardService.getApplicationProgress(provider);

    return { ...data, overall_progress: applicationProgress.overall_progress };
  }

  async getFacilityDetailsForProvider(
    id: string,
    userId: string,
  ): Promise<Facility> {
    const data = await this.facilityRepository
      .createQueryBuilder('f')
      .leftJoin(
        'provider_orientation',
        'po',
        'po.facility_id = f.id AND po.provider_id = :userId',
      )
      .leftJoin('f.facility_type', 'ft')
      .leftJoin('f.time_entry_setting', 'set')
      .select([
        'f.id AS id',
        'f.name AS name',
        'f.total_beds AS total_beds',
        'ft.name AS facility_type',
        'f.base_url AS base_url',
        'f.image AS image',
        `case when set.id is not null then set.geo_fence_radius else 50 end as geo_fence_radius`,
        `(SELECT COUNT(s.id)::INTEGER FROM shift s
            WHERE s.facility_id = f.id AND s.deleted_at IS NULL
            AND (s.status = '${SHIFT_STATUS.open}'
            OR s.status = '${SHIFT_STATUS.requested}'))`,
        `CASE
          WHEN EXISTS (
            SELECT 1
              FROM provider_saved_facility psf
              WHERE psf.facility_id = f.id
                AND psf.provider_id = :userId
                AND psf.deleted_at IS NULL
          ) THEN true
          ELSE false
        END AS is_saved`,
        `CASE
          WHEN EXISTS (
            SELECT 1
            FROM facility_provider fp2
            WHERE fp2.facility_id = f.id
              AND fp2.provider_id = :userId
              AND fp2.self_dnr_at IS NOT NULL
              AND fp2.deleted_at IS NULL
          ) THEN TRUE
          ELSE FALSE
        END AS is_self_dnr`,
        'f.street_address AS street_address',
        'f.house_no AS house_no',
        'f.zip_code AS zip_code',
        'f.latitude::DOUBLE PRECISION AS latitude',
        'f.longitude::DOUBLE PRECISION AS longitude',
        'f.first_shift AS first_shift',
        'f.orientation AS orientation',
        'f.shift_description AS shift_description',
        'f.breaks_instruction AS breaks_instruction',
        'f.dress_code AS dress_code',
        'f.parking_instruction AS parking_instruction',
        'f.doors_locks AS doors_locks',
        'f.timekeeping AS timekeeping',
        'f.website AS website',
        `(
          SELECT COALESCE(
          NULLIF(
            jsonb_agg(
              jsonb_build_object(
                'id', fss.id,
                'name', fss.name,
                'start_time', fss.start_time,
                'end_time', fss.end_time,
                'status', fss.status
              )
            ) FILTER (WHERE fss.id IS NOT NULL),
            '[]'::jsonb
          ),
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', dfss.id,
                'name', dfss.name,
                'start_time', dfss.start_time,
                'end_time', dfss.end_time,
                'status', dfss.status
              )
            )
            FROM facility_shift_setting dfss
            WHERE dfss.status = 'active'
              AND dfss.is_default = true
              AND dfss.deleted_at IS NULL
          )
          )
          FROM facility_shift_setting fss
          WHERE fss.status = 'active'
            AND fss.facility_id = f.id
            AND fss.deleted_at IS NULL
        ) AS shift_timing`,
      ])
      .where(`f.id = :id`, {
        id: id,
      })
      .setParameter('userId', userId)
      .getRawOne();

    return data;
  }

  async getFacilityShifts(
    id: string,
    queryParamsDto: QueryParamsDto,
    provider: Provider,
  ): Promise<[Shift[], number]> {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.provider_requests', 'pr')
      .leftJoin('pr.provider', 'p')
      .leftJoin('s.facility', 'f')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.shift_type AS shift_type',
        's.status AS status',
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `s.bill_rate AS bill_rate`,
        `s.pay_rate AS pay_rate`,
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
        `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
        `CASE
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'D' THEN 'day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'E' THEN 'evening'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'N' THEN 'night'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'A' THEN 'long_day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'P' THEN 'long_night'
          ELSE 'flexible'
        END AS period`,
        `TRIM(TO_CHAR(s.start_date, 'Day')) AS day_of_week`,
        's.created_at AS created_at',
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'latitude', f.latitude,
          'longitude', f.longitude,
          'city', f.city,
          'state', f.state,
          'base_url', f.base_url,
          'image', f.image
        ) AS facility`,
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation
        ) AS certificate`,
        `jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'abbreviation', sp.abbreviation
        ) AS speciality`,
        `CONCAT(ROUND(CAST(3958.8 * acos(cos(radians(${provider.address[0].latitude}))
        * cos(radians(f.latitude))
        * cos(radians(f.longitude) - radians(${provider.address[0].longitude}))
        + sin(radians(${provider.address[0].latitude})) * sin(radians(f.latitude))) AS numeric), 2), ' mi') AS distance_in_miles`,
      ])
      .where(
        `(s.status = '${SHIFT_STATUS.open}' OR (s.status = '${SHIFT_STATUS.requested}' AND p.id != '${provider.id}'))`,
      )
      .andWhere(`s.facility_id = :facility_id`, {
        facility_id: id,
      })
      .andWhere(
        `NOT EXISTS (
        SELECT 1 FROM provider_cancelled_shift pcs
        WHERE pcs.shift_id = s.id AND pcs.provider_id = :providerId
      )`,
        { providerId: provider.id },
      );

    queryBuilder.limit(+queryParamsDto.limit).offset(+queryParamsDto.offset);
    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async getProviderScheduledShifts(
    providerScheduledShiftFilterDto: ProviderScheduledShiftFilterDto,
    provider: Provider,
  ): Promise<[Shift[], number]> {
    const {
      search = undefined,
      status = undefined,
      date = undefined,
      limit = '10',
      offset = '0',
      order,
    } = providerScheduledShiftFilterDto;

    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.facility', 'f')
      .leftJoin('s.provider', 'p')
      .leftJoin(
        's.provider_requests',
        'pr',
        `s.status = '${SHIFT_STATUS.requested}' AND pr.provider.id = '${provider.id}'`,
      )
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .leftJoin(
        'provider_cancelled_shift',
        'pcs',
        'pcs.shift_id = s.id AND pcs.provider_id = :providerId',
        { providerId: provider.id },
      )
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.shift_type AS shift_type',
        's.bill_rate AS bill_rate',
        's.pay_rate AS pay_rate',
        's.total_payable_amount AS total_payable_amount',
        `CASE
          WHEN s.provider_id = '${provider.id}' THEN s.status
          WHEN pcs.id IS NOT NULL AND pcs.provider_id = '${provider.id}' THEN 'cancelled'
          ELSE s.status
         END as status`,
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
        `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
        `CASE
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'D' THEN 'day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'E' THEN 'evening'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'N' THEN 'night'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'A' THEN 'long_day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'P' THEN 'long_night'
          ELSE 'flexible'
        END AS period`,
        `TRIM(TO_CHAR(s.start_date, 'Day')) AS day_of_week`,
        's.created_at AS created_at',
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'latitude', f.latitude,
          'longitude', f.longitude,
          'city', f.city,
          'state', f.state
        ) AS facility`,
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation
        ) AS certificate`,
        `jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'abbreviation', sp.abbreviation
        ) AS speciality`,
        `CONCAT(ROUND(CAST(3958.8 * acos(cos(radians(${provider.address[0].latitude}))
        * cos(radians(f.latitude))
        * cos(radians(f.longitude) - radians(${provider.address[0].longitude}))
        + sin(radians(${provider.address[0].latitude})) * sin(radians(f.latitude))) AS numeric), 2), ' mi') AS distance_in_miles`,
      ]);

    if (search) {
      queryBuilder.andWhere(`(f.name ILIKE :search OR f.city ILIKE :search)`, {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }

    if (status) {
      if (status == SHIFT_STATUS.requested) {
        queryBuilder.andWhere(`s.status = :status AND pr.provider.id = :id`, {
          status: status,
          id: provider.id,
        });
      } else if (status == SHIFT_STATUS.cancelled) {
        queryBuilder.andWhere(
          `((s.status = :status AND p.id = :id) OR (pcs.id IS NOT NULL AND pcs.provider_id = :id)) `,
          {
            status: status,
            id: provider.id,
          },
        );
      } else {
        queryBuilder.andWhere(`s.status = :status AND p.id = :id`, {
          status: status,
          id: provider.id,
        });
      }
    } else {
      const shiftStatuses = [
        SHIFT_STATUS.completed,
        SHIFT_STATUS.ongoing,
        SHIFT_STATUS.un_submitted,
        SHIFT_STATUS.running_late,
      ];
      if (date) {
        shiftStatuses.push(SHIFT_STATUS.scheduled);
      }
      queryBuilder.andWhere(
        `((s.status IN (:...statuses) AND p.id = :provider_id)
          OR ((pcs.id IS NOT NULL AND pcs.provider_id = :provider_id)
          OR (s.status = 'cancelled' AND pcs.provider_id = :provider_id)))`,
        {
          statuses: shiftStatuses,
          provider_id: provider.id,
        },
      );
    }
    if (date) {
      queryBuilder.andWhere(`TO_CHAR(s.start_date, 'YYYY-MM-DD') = :date`, {
        date: date,
      });
    }

    if (order) {
      Object.keys(order).forEach((key) => {
        queryBuilder.addOrderBy(`s.${key}`, order[key]);
      });
    }

    queryBuilder.limit(+limit).offset(+offset);

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async getScheduledShiftDetailsForProvider(
    id: string,
    provider: Provider,
    timezone: number,
  ): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({ where: { id: id } });

    if (!shift) return null;

    const setting = await this.scheduleRequestSettingRepository.findOne({
      where: { setting: show_cancellation_notes, value: 'active' },
    });

    const showCancellation = !!setting;

    const select = [
      's.id AS id',
      's.shift_id AS shift_id',
      's.shift_type AS shift_type',
      `CASE
          WHEN s.provider_id = '${provider.id}' THEN s.status
          WHEN pcs.id IS NOT NULL AND pcs.provider_id = '${provider.id}' THEN 'cancelled'
          ELSE s.status
       END as status`,
      `s.clock_in AS clock_in`,
      `s.clock_out AS clock_out`,
      `TO_CHAR(s.break_start_date, 'YYYY-MM-DD') AS break_start_date`,
      `s.break_start_time AS break_start_time`,
      `s.break_end_time AS break_end_time`,
      `s.start_time AS start_time`,
      `s.end_time AS end_time`,
      `s.total_worked::INTEGER AS total_worked`,
      `s.break_duration::INTEGER AS break_duration`,
      `s.bill_rate AS bill_rate`,
      `s.pay_rate AS pay_rate`,
      `s.total_payable_amount AS total_payable_amount`,
      `case when set.id is not null then set.geo_fence_radius else 50 end as geo_fence_radius`,
      's.base_url AS base_url',
      's.is_orientation AS is_orientation',
      'tc.authority_signature AS authority_signature',
      'tc.provider_signature AS provider_signature',
      `COALESCE(jsonb_agg(ts.image) FILTER (WHERE ts.image IS NOT NULL), '[]'::jsonb) AS time_sheets`,
      `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
      `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
      `TO_CHAR(s.clock_in_date, 'YYYY-MM-DD') AS clock_in_date`,
      `TO_CHAR(s.clock_out_date, 'YYYY-MM-DD') AS clock_out_date`,
      `CASE
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'D' THEN 'day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'E' THEN 'evening'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'N' THEN 'night'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'A' THEN 'long_day'
          WHEN get_shift_time_code(s.start_time, s.end_time, s.facility_id) = 'P' THEN 'long_night'
          ELSE 'flexible'
      END AS period`,
      `TRIM(TO_CHAR(s.start_date, 'Day')) AS day_of_week`,
      's.created_at AS created_at',
      `jsonb_build_object(
        'id', f.id,
        'name', f.name,
        'street_address', f.street_address,
        'house_no', f.house_no,
        'zip_code', f.zip_code,
        'total_beds', f.total_beds,
        'latitude', f.latitude,
        'longitude', f.longitude,
        'city', f.city,
        'state', f.state,
        'facility_type', ft.name,
        'first_shift', f.first_shift,
        'orientation', f.orientation,
        'shift_description', f.shift_description,
        'breaks_instruction', f.breaks_instruction,
        'dress_code', f.dress_code,
        'parking_instruction', f.parking_instruction,
        'doors_locks', f.doors_locks,
        'timekeeping', f.timekeeping,
        'website', f.website,
        'timezone', f.timezone
      ) AS facility_data`,
      //  duplicating the object as facility as per requested from mobile side changes for multiple compatibility of screens
      `jsonb_build_object(
        'id', f.id,
        'name', f.name,
        'street_address', f.street_address,
        'house_no', f.house_no,
        'zip_code', f.zip_code,
        'total_beds', f.total_beds,
        'latitude', f.latitude,
        'longitude', f.longitude,
        'city', f.city,
        'state', f.state,
        'facility_type', ft.name,
        'first_shift', f.first_shift,
        'orientation', f.orientation,
        'shift_description', f.shift_description,
        'breaks_instruction', f.breaks_instruction,
        'dress_code', f.dress_code,
        'parking_instruction', f.parking_instruction,
        'doors_locks', f.doors_locks,
        'timekeeping', f.timekeeping,
        'website', f.website,
        'timezone', f.timezone
      ) AS facility`,
      `jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'abbreviation', c.abbreviation
      ) AS certificate`,
      `jsonb_build_object(
        'id', sp.id,
        'name', sp.name,
        'abbreviation', sp.abbreviation
      ) AS speciality`,
      `CASE
        WHEN s.status = '${SHIFT_STATUS.scheduled}' THEN jsonb_build_object(
          'id', follower.id,
          'first_name', 'Scheduling Department'
        )
        ELSE NULL
      END AS follower`,
      `CASE
        WHEN s.status = '${SHIFT_STATUS.scheduled}' AND (
            (
              (s.start_date || ' ' || s.start_time)::timestamp >= to_timestamp(${timezone}/1000) AT TIME ZONE 'UTC' + INTERVAL '4 hours'
              AND s.start_date = CURRENT_DATE
            ) OR (
              s.start_date > CURRENT_DATE
            )
          )
        THEN true
        ELSE false
      END AS can_cancel`,
      `CONCAT(
        ROUND(
          CAST(
            3958.8 * 
            acos(
              cos(radians(${provider.address[0].latitude})) * 
              cos(radians(f.latitude)) * 
              cos(radians(f.longitude) - radians(${provider.address[0].longitude})) + 
              sin(radians(${provider.address[0].latitude})) * 
              sin(radians(f.latitude))
            ) AS numeric
          ), 
          2
        ), 
        ' mi',
        CASE 
          WHEN s.status = '${SHIFT_STATUS.un_submitted}' THEN ''
          ELSE CONCAT(' from ', ${provider.address[0].street ? `'${provider.address[0].street}'` : "'your home address'"})
        END
      ) AS distance_in_miles`,
    ];

    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.follower', 'follower')
      .leftJoin('s.facility', 'f')
      .leftJoin('f.facility_type', 'ft')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .leftJoin('s.cancel_reason', 'cr')
      .leftJoin(
        's.provider_requests',
        'pr',
        `s.status = '${SHIFT_STATUS.requested}' AND pr.provider.id = '${provider.id}'`,
      )
      .leftJoin('s.time_card', 'tc')
      .leftJoin('tc.time_sheets', 'ts')
      .leftJoin('s.provider', 'p', `p.id = '${provider.id}'`)
      .leftJoin('f.time_entry_setting', 'set')
      .leftJoin(
        'provider_cancelled_shift',
        'pcs',
        'pcs.shift_id = s.id AND pcs.provider_id = :providerId',
        { providerId: provider.id },
      );

    if (shift?.cancelled_by_type) {
      select.push(
        `CASE
          WHEN pcs.id IS NOT NULL THEN jsonb_build_object('id', pcs.provider_id, 'cancelled_by', 'ME', 'cancelled_on', s.cancelled_on, 'reason', cr.reason, 'show_cancellation', ${showCancellation ? 'true' : 'false'})
          WHEN s.cancelled_by_type = 'admin' THEN jsonb_build_object('id', cancelled_by.id, 'cancelled_by', 'Scheduler', 'cancelled_on', s.cancelled_on, 'reason', cr.reason, 'show_cancellation', ${showCancellation ? 'true' : 'false'})
          WHEN s.cancelled_by_type = 'facility' THEN jsonb_build_object('id', cancelled_by.id, 'cancelled_by', 'Scheduler', 'cancelled_on', s.cancelled_on, 'reason', cr.reason, 'show_cancellation', ${showCancellation ? 'true' : 'false'})
          WHEN s.cancelled_by_type = 'facility_user' THEN jsonb_build_object('id', cancelled_by.id, 'cancelled_by', 'Scheduler', 'cancelled_on', s.cancelled_on, 'reason', cr.reason, 'show_cancellation', ${showCancellation ? 'true' : 'false'})
          ELSE NULL
        END AS cancelled_by`,
      );
      queryBuilder.leftJoin(
        `${shift.cancelled_by_type}`,
        'cancelled_by',
        's.cancelled_by_id = cancelled_by.id',
      );
    }

    queryBuilder.select(select).where(`s.id = :id`, {
      id: id,
    });

    if (shift?.status === SHIFT_STATUS.requested) {
      queryBuilder.andWhere(`pr.provider.id = :user_id`, {
        user_id: provider.id,
      });
    } else {
      queryBuilder.andWhere(
        `(s.provider_id = :providerId OR pcs.provider_id = :providerId)`,
        { providerId: provider.id },
      );
    }

    queryBuilder.groupBy(
      `s.id, tc.id, f.id, ft.id, follower.id, c.id, sp.id, pcs.id, set.id, cr.id ${shift?.cancelled_by_type ? ', cancelled_by.id' : ''}`,
    );
    const result = await queryBuilder.getRawOne();
    return result;
  }

  async getCurrentMonthSummaryByDate(date: string, provider_id: string) {
    const statuses = [
      `'${SHIFT_STATUS.scheduled}'`,
      `'${SHIFT_STATUS.completed}'`,
      `'${SHIFT_STATUS.un_submitted}'`,
      `'${SHIFT_STATUS.ongoing}'`,
    ];

    const sql = `
      WITH bounds AS (
        SELECT
          date_trunc('month', $1::date) - interval '6 days' AS dmin,
          date_trunc('month', $1::date) + interval '1 month' + interval '5 days' AS dmax
      ),
      date_series AS (
        SELECT generate_series(
          (SELECT dmin FROM bounds),
          (SELECT dmax FROM bounds),
          '1 day'
        )::date AS date
      ),
      filtered_shifts AS (
        SELECT
          s.id,
          s.start_date::date AS date,
          get_shift_time_code(s.start_time, s.end_time, s.facility_id) AS code
        FROM shift s
        WHERE s.provider_id = $2
          AND s.status IN (${statuses.join(', ')})
          AND s.deleted_at IS NULL
          AND s.start_date::date BETWEEN (SELECT dmin FROM bounds) AND (SELECT dmax FROM bounds)
      )
      SELECT
        ds.date::character varying AS "date",
        COALESCE(COUNT(*) FILTER (WHERE fs.code = 'D'), 0)::integer AS "day",
        COALESCE(COUNT(*) FILTER (WHERE fs.code = 'E'), 0)::integer AS "evening",
        COALESCE(COUNT(*) FILTER (WHERE fs.code = 'N'), 0)::integer AS "night",
        COALESCE(COUNT(*) FILTER (WHERE fs.code = 'A'), 0)::integer AS "long_day",
        COALESCE(COUNT(*) FILTER (WHERE fs.code = 'P'), 0)::integer AS "long_night"
      FROM date_series ds
      LEFT JOIN filtered_shifts fs ON fs.date = ds.date
      GROUP BY ds.date
      ORDER BY ds.date;
    `;

    const result = await this.shiftRepository.query(sql, [date, provider_id]);

    return result;
  }

  async getAllTimeCardDetails(id: string): Promise<any> {
    const result = await this.shiftRepository.query(
      `SELECT * FROM timecard_details WHERE ID = $1`,
      [id],
    );

    return result[0] || null;
  }

  async calculateClockOutAndBreakDuration(
    updateShiftDto: UpdateShiftDto,
    shift: Shift,
    req: IRequest,
  ): Promise<{
    updateShiftDto: UpdateShiftDto;
    message: string;
    responseBody: object | null;
  }> {
    let message;
    let responseBody: object | null = null;

    const assignToUpdateDto = (fields: Partial<UpdateShiftDto>) => {
      Object.assign(updateShiftDto, fields);
    };

    // Handle clock-in
    if (updateShiftDto.clock_in) {
      message = CONSTANT.SUCCESS.CLOCK_IN;

      // Create notification if not reached facility
      const notification = {
        title: CONSTANT.NOTIFICATION.CLOCK_IN_OR_BREAK,
        text: CONSTANT.NOTIFICATION.CLOCK_IN_TEXT(moment().format('hh:mm A')),
        push_type: PushNotificationType.clock_in,
      } as Notification;
      // Send push notification
      await this.firebaseNotificationService.sendNotificationToOne(
        notification,
        TABLE.provider,
        shift.provider.id,
        {
          expire_in: 0,
          is_timer: false,
          status: PushNotificationType.clock_in,
          shift_status: SHIFT_STATUS.ongoing,
          shift_id: shift.id,
          // clock in
          shift_clock_in: shift.clock_in,
          shift_clock_in_date: shift.clock_in_date,
          // clock out
          shift_clock_out: updateShiftDto.clock_out,
          shift_clock_out_date: updateShiftDto.clock_out_date,
          // break
          break_duration: shift.break_duration,
          break_start_time: shift.break_start_time,
          break_end_time: shift.break_end_time,
          // shift start and end
          start_date: shift.start_date,
          end_date: shift.end_date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          // live action buttons
          buttons: JSON.stringify([
            { key: 'TAKE_BREAK', label: 'Take Break' },
            { key: 'CLOCK_OUT', label: 'Clock-Out' },
          ]),
          // IOS live activity
          live_activity: JSON.stringify([
            {
              action: 'TAKE_BREAK',
              isActionEnabled: true,
            },
            {
              action: 'CLOCK_OUT',
              isActionEnabled: true,
            },
          ]),
          facility: {
            id: shift.facility.id,
            name: shift.facility.name,
            street_address: shift.facility.street_address,
            house_no: shift.facility.house_no,
            zip_code: shift.facility.zip_code,
            latitude: shift.facility.latitude,
            longitude: shift.facility.longitude,
            place_id: shift.facility.place_id,
            timezone: shift.facility.timezone,
            base_url: shift.facility.base_url,
            image: shift.facility.image,
          },
          to: 'notification_data',
          created_at: new Date().toISOString(),
          description: CONSTANT.NOTIFICATION.CLOCK_IN_DESCRIPTION,
        },
      );

      await this.activityService.logShiftActivity(
        shift,
        req,
        ACTIVITY_TYPE.SHIFT_STARTED,
        {
          from_status: SHIFT_STATUS.scheduled,
          to_status: SHIFT_STATUS.ongoing,
        },
        ACTION_TABLES.SHIFT,
      );

      await this.activityService.logShiftActivity(
        shift,
        req,
        ACTIVITY_TYPE.CLOCK_IN,
        {
          from_status: SHIFT_STATUS.scheduled,
          to_status: SHIFT_STATUS.ongoing,
          clock_in_date: updateShiftDto.clock_in_date,
          clock_in_time: updateShiftDto.clock_in,
          location: shift.facility.name,
        },
        ACTION_TABLES.SHIFT,
      );

      assignToUpdateDto({ status: SHIFT_STATUS.ongoing });
    }

    // Handle break start
    else if (updateShiftDto.break_start_time) {
      const setting = await this.timeEntryApprovalRepository.findOne({
        where: { name: totalBreaks },
      });

      if (shift.total_break >= parseInt(setting.value)) {
        responseBody = response.badRequest({
          message: CONSTANT.ERROR.BREAK_LIMIT_REACHED,
          data: {},
        });
      }
      // Create notification if not reached facility
      const notification = {
        title: CONSTANT.NOTIFICATION.CLOCK_IN_OR_BREAK,
        text: CONSTANT.NOTIFICATION.ON_BREAK,
        push_type: PushNotificationType.on_break,
      } as Notification;
      // Send push notification
      await this.firebaseNotificationService.sendNotificationToOne(
        notification,
        TABLE.provider,
        shift.provider.id,
        {
          expire_in: 0,
          is_timer: false,
          status: PushNotificationType.on_break,
          shift_status: shift.status,
          shift_id: shift.id,
          // clock in
          shift_clock_in: shift.clock_in,
          shift_clock_in_date: shift.clock_in_date,
          // clock out
          shift_clock_out: updateShiftDto.clock_out,
          shift_clock_out_date: updateShiftDto.clock_out_date,
          // break
          break_duration: shift.break_duration,
          break_start_time: shift.break_start_time,
          break_end_time: shift.break_end_time,
          // shift start and end
          start_date: shift.start_date,
          end_date: shift.end_date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          // action buttons
          buttons: JSON.stringify([{ key: 'END_BREAK', label: 'End Break' }]),
          // IOS live activity
          live_activity: JSON.stringify([
            {
              action: 'END_BREAK',
              isActionEnabled: true,
            },
          ]),
          facility: {
            id: shift.facility.id,
            name: shift.facility.name,
            street_address: shift.facility.street_address,
            house_no: shift.facility.house_no,
            zip_code: shift.facility.zip_code,
            latitude: shift.facility.latitude,
            longitude: shift.facility.longitude,
            place_id: shift.facility.place_id,
            timezone: shift.facility.timezone,
            base_url: shift.facility.base_url,
            image: shift.facility.image,
          },
          to: 'notification_data',
          created_at: new Date().toISOString(),
          description: CONSTANT.NOTIFICATION.BREAK_STARTED_DESCRIPTION,
        },
      );

      message = CONSTANT.SUCCESS.BREAK_STARTED;
      assignToUpdateDto({
        total_break: shift.total_break + 1,
      });
    }

    // Handle clock-out
    if (updateShiftDto.clock_out) {
      message = CONSTANT.SUCCESS.CLOCK_OUT;

      const startTime = new Date(`${shift.clock_in_date}T${shift.clock_in}`);
      const endTime = new Date(
        `${updateShiftDto.clock_out_date}T${updateShiftDto.clock_out}`,
      );
      const totalWorkedInSec = (endTime.getTime() - startTime.getTime()) / 1000;

      assignToUpdateDto({
        status: SHIFT_STATUS.completed,
        total_worked: Math.round(totalWorkedInSec - shift.break_duration),
        clock_out_date: updateShiftDto.clock_out_date,
      });

      await this.activityService.logShiftActivity(
        shift,
        req,
        ACTIVITY_TYPE.SHIFT_COMPLETED,
        {
          to_status: SHIFT_STATUS.ongoing,
          from_status: SHIFT_STATUS.completed,
        },
        ACTION_TABLES.SHIFT,
      );

      await this.activityService.logShiftActivity(
        shift,
        req,
        ACTIVITY_TYPE.CLOCK_OUT,
        {
          to_status: SHIFT_STATUS.ongoing,
          from_status: SHIFT_STATUS.completed,
          clock_out_date: updateShiftDto.clock_out_date,
          clock_out_time: updateShiftDto.clock_out,
          location: shift.facility.name,
        },
        ACTION_TABLES.SHIFT,
      );
    }

    // Handle break end
    if (updateShiftDto.break_end_time && shift.break_start_time) {
      // Create notification if not reached facility
      const notification = {
        title: CONSTANT.NOTIFICATION.CLOCK_IN_OR_BREAK,
        text: CONSTANT.NOTIFICATION.CLOCK_IN_TEXT(
          moment(shift.clock_in, 'HH:mm:ss').format('hh:mm A'),
        ),
        push_type: PushNotificationType.end_break,
      } as Notification;
      // Send push notification
      await this.firebaseNotificationService.sendNotificationToOne(
        notification,
        TABLE.provider,
        shift.provider.id,
        {
          expire_in: 0,
          is_timer: false,
          status: PushNotificationType.end_break,
          shift_status: shift.status,
          shift_id: shift.id,
          // clock in
          shift_clock_in: shift.clock_in,
          shift_clock_in_date: shift.clock_in_date,
          // clock out
          shift_clock_out: updateShiftDto.clock_out,
          shift_clock_out_date: updateShiftDto.clock_out_date,
          // break
          break_duration: shift.break_duration,
          break_start_time: shift.break_start_time,
          break_end_time: shift.break_end_time,
          // shift start and end
          start_date: shift.start_date,
          end_date: shift.end_date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          // action buttons
          buttons: JSON.stringify([
            { key: 'TAKE_BREAK', label: 'Take Break' },
            { key: 'CLOCK_OUT', label: 'Clock-Out' },
          ]),
          // IOS live activity
          live_activity: JSON.stringify([
            {
              action: 'TAKE_BREAK',
              isActionEnabled: true,
            },
            {
              action: 'CLOCK_OUT',
              isActionEnabled: true,
            },
          ]),
          facility: {
            id: shift.facility.id,
            name: shift.facility.name,
            street_address: shift.facility.street_address,
            house_no: shift.facility.house_no,
            zip_code: shift.facility.zip_code,
            latitude: shift.facility.latitude,
            longitude: shift.facility.longitude,
            place_id: shift.facility.place_id,
            timezone: shift.facility.timezone,
            base_url: shift.facility.base_url,
            image: shift.facility.image,
          },
          to: 'notification_data',
          created_at: new Date().toISOString(),
          description: CONSTANT.NOTIFICATION.BREAK_ENDED_DESCRIPTION,
        },
      );
      message = CONSTANT.SUCCESS.BREAK_ENDED;

      const breakStart = new Date(
        `${shift.break_start_date}T${shift.break_start_time}`,
      );
      const breakEnd = new Date(
        `${updateShiftDto.break_end_date}T${updateShiftDto.break_end_time}`,
      );
      const breakDuration = (breakEnd.getTime() - breakStart.getTime()) / 1000;

      assignToUpdateDto({
        break_start_date: null,
        break_end_date: null,
        break_start_time: null,
        break_end_time: null,
        break_duration:
          Math.round(breakDuration) + Number(shift.break_duration),
      });
    }

    // If no clock-out yet, mark status as ongoing
    if (!updateShiftDto.clock_out) {
      assignToUpdateDto({ status: SHIFT_STATUS.ongoing });
    }

    return { updateShiftDto, message, responseBody };
  }

  calculateTimestamp(timezone: string): number {
    const [hoursString, minutesString] = timezone.split(':');
    const offsetHours = parseInt(hoursString, 10);
    const offsetMinutes = parseInt(minutesString, 10);
    const date = new Date(new Date().toUTCString()).getTime();
    const offset = (offsetHours * 60 + offsetMinutes) * 60000; // Calculate offset in milliseconds

    return date + offset;
  }

  async getAdminWhere(email: string) {
    const result = await this.adminRepository.findOne({ where: { email } });
    return plainToInstance(Admin, result);
  }

  async getAllAdmins() {
    const list = await this.adminRepository.find({
      where: {
        role: {
          role_section_permission: {
            section: { name: accountingRole, status: DEFAULT_STATUS.active },
          },
        },
      },
    });

    return list;
  }

  async checkIsProviderAvailable(shift: ShiftRequest) {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('shift')
      .where('shift.provider_id = :providerId', {
        providerId: shift.provider.id,
      })
      .andWhere('shift.status IN (:...statuses)', {
        statuses: [SHIFT_STATUS.scheduled, SHIFT_STATUS.ongoing],
      })
      .andWhere(
        `
        (
          -- Case 1: New shift starts within the existing shift
          (shift.start_date <= :startDate AND shift.end_date >= :startDate AND 
            (
              (shift.start_time <= :startTime AND (shift.end_time - INTERVAL '1 second') > :startTime) OR
              (shift.start_time > shift.end_time AND 
                (:startTime >= shift.start_time OR :startTime < (shift.end_time - INTERVAL '1 second'))
              )
            )
          )
          OR
          -- Case 2: New shift ends within the existing shift
          (shift.start_date <= :endDate AND shift.end_date >= :endDate AND 
            (
              (shift.start_time < :endTime AND (shift.end_time - INTERVAL '1 second') >= :endTime) OR
              (shift.start_time > shift.end_time AND 
                (:endTime > shift.start_time OR :endTime <= (shift.end_time - INTERVAL '1 second'))
              )
            )
          )
          OR
          -- Case 3: Existing shift starts within the new shift
          (shift.start_date >= :startDate AND shift.end_date <= :endDate AND 
            (
              (shift.start_time >= :startTime AND (shift.end_time - INTERVAL '1 second') < :endTime) OR
              (shift.start_time > shift.end_time AND 
                (:startTime <= (shift.end_time - INTERVAL '1 second') OR :endTime >= shift.start_time)
              )
            )
          )
          OR
          -- Case 4: Full containment (new shift fully contains existing or vice versa)
          (shift.start_date BETWEEN :startDate AND :endDate AND shift.end_date BETWEEN :startDate AND :endDate AND 
            (
              (shift.start_time BETWEEN :startTime AND :endTime OR (shift.end_time - INTERVAL '1 second') BETWEEN :startTime AND :endTime) OR
              (shift.start_time > shift.end_time AND 
                (:startTime <= (shift.end_time - INTERVAL '1 second') OR :endTime >= shift.start_time)
              )
            )
          )
        )
      `,
        {
          startDate: shift.shift.start_date,
          endDate: shift.shift.end_date,
          startTime: shift.shift.start_time,
          endTime: shift.shift.end_time,
        },
      );

    const result = await queryBuilder.getOne();

    return result;
  }

  async getCalendarShifts(id: string, calendarShiftDto: CalendarShiftDto) {
    const {
      search = '',
      start_date,
      end_date,
      from_shift_id,
      to_shift_id,
      certificate_id = [],
      speciality_id = [],
      status = [],
      filter_by = 'date',
    } = calendarShiftDto;

    const parsedSearch = search ? `%${parseSearchKeyword(search)}%` : '';

    const dateQuery = `
    WITH date_series AS (
      SELECT generate_series(
        DATE('${start_date}'),
        DATE('${end_date}'),
        '1 day'
      )::DATE AS "date"
    )
  `;

    let query = `
    ${dateQuery}
    SELECT
      (ds.date)::CHARACTER VARYING,
      JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', s.id,
        'shift_id', s.shift_id,
        'start_time', s.start_time,
        'end_time', s.end_time,
        'is_orientation', s.is_orientation,
        'premium_rate', s.premium_rate,
        'shift_status',
        CASE
          WHEN s.status::character varying IN ('requested', 'auto_scheduling', 'invite_sent', 'open', 'cancelled') THEN 'open'
          WHEN s.status::character varying IN ('completed', 'scheduled', 'ongoing', 'un_submitted', 'running_late') THEN 'filled'::character varying
          WHEN s.status::character varying = 'void' THEN 'void'
          ELSE s.status::character varying
        END,
        'provider_id', p.id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'base_url', p.base_url,
        'profile_image', p.profile_image,
        'certificate_id', c.id,
        'certificate_name', c.name,
        'certificate_abbreviation', c.abbreviation,
        'speciality_id', sp.id,
        'speciality_name', sp.name,
        'speciality_abbreviation', sp.abbreviation,
        'request_count', (
        SELECT count(id) FROM shift_request sr
        WHERE sr.shift_id = s.id
          AND sr.status NOT IN ('rejected', 'assigned')
          AND sr.deleted_at IS NULL
        ),
        'invite_count', (
        SELECT count(id) FROM shift_invitation si
        WHERE si.shift_id = s.id
          AND si.status NOT IN ('rejected', 'withdrawn', 'accepted')
          AND si.deleted_at IS NULL
        )
      )
      ) FILTER (WHERE s.id IS NOT NULL) AS shift_data
    FROM date_series ds
    LEFT JOIN shift s ON date(s.start_date) = ds.date
      AND s.facility_id = '${id}'
      AND s.deleted_at IS NULL
    LEFT JOIN provider p ON p.id = s.provider_id
    LEFT JOIN certificate c ON c.id = s.certificate_id AND c.deleted_at IS NULL
    LEFT JOIN speciality sp ON sp.id = s.speciality_id AND sp.deleted_at IS NULL
    WHERE s.facility_id = '${id}'
    `;

    if (certificate_id.length > 0) {
      query += ` AND c.id IN (${certificate_id.map((cid) => `'${cid}'`).join(',')})`;
    }

    if (speciality_id.length > 0) {
      query += ` AND sp.id IN (${speciality_id.map((sid) => `'${sid}'`).join(',')})`;
    }
    const statusMap: Record<CALENDAR_SHIFT_STATUS, SHIFT_STATUS[]> = {
      [CALENDAR_SHIFT_STATUS.open]: [
        SHIFT_STATUS.requested,
        SHIFT_STATUS.auto_scheduling,
        SHIFT_STATUS.invite_sent,
        SHIFT_STATUS.open,
        SHIFT_STATUS.cancelled,
      ],
      [CALENDAR_SHIFT_STATUS.filled]: [
        SHIFT_STATUS.completed,
        SHIFT_STATUS.scheduled,
        SHIFT_STATUS.ongoing,
        SHIFT_STATUS.running_late,
      ],
      [CALENDAR_SHIFT_STATUS.void]: [SHIFT_STATUS.void],
    };

    // Normalize and expand the status filter
    if (status.length > 0) {
      const expandedStatuses = status.flatMap(
        (st) =>
          statusMap[st as CALENDAR_SHIFT_STATUS] ?? [
            st as unknown as SHIFT_STATUS,
          ],
      );

      query += ` AND s.status IN (${expandedStatuses.map((s) => `'${s}'`).join(',')})`;
    }

    if (from_shift_id) {
      query += ` AND s.shift_id >= '${from_shift_id}'`;
    }

    if (to_shift_id) {
      query += ` AND s.shift_id <= '${to_shift_id}'`;
    }

    if (parsedSearch) {
      query += ` AND (s.shift_id ILIKE '${parsedSearch}' OR CONCAT(p.first_name, ' ', p.last_name) ILIKE '${parsedSearch}')`;
    }

    query += `
    GROUP BY ds.date
    ORDER BY ds.date ASC;
  `;
    let data;
    if (filter_by === 'shift') {
      data = await this.getShiftFilterByTimings(id, calendarShiftDto);
    } else {
      data = await this.shiftRequestRepository.query(query);
    }
    return data;
  }

  async getShiftFilterByTimings(
    id: string,
    calendarShiftDto: CalendarShiftDto,
  ) {
    const {
      search = '',
      start_date,
      end_date,
      certificate_id = [],
      speciality_id = [],
      status = [],
    } = calendarShiftDto;
    const statusMap: Record<CALENDAR_SHIFT_STATUS, SHIFT_STATUS[]> = {
      [CALENDAR_SHIFT_STATUS.open]: [
        SHIFT_STATUS.requested,
        SHIFT_STATUS.auto_scheduling,
        SHIFT_STATUS.invite_sent,
        SHIFT_STATUS.open,
      ],
      [CALENDAR_SHIFT_STATUS.filled]: [
        SHIFT_STATUS.completed,
        SHIFT_STATUS.scheduled,
        SHIFT_STATUS.ongoing,
        SHIFT_STATUS.running_late,
      ],
      [CALENDAR_SHIFT_STATUS.void]: [SHIFT_STATUS.void],
    };

    let expandedStatuses: string[] = [];
    if (status.length > 0) {
      expandedStatuses = status.flatMap(
        (st) =>
          statusMap[st as CALENDAR_SHIFT_STATUS] ?? [
            st as unknown as SHIFT_STATUS,
          ],
      );
    }

    // Now just call the SQL function via TypeORM’s query method
    const result = await this.shiftRepository.query(
      `SELECT public.get_shifts_calendar($1, $2, $3, $4, $5, $6, $7) as data`,
      [
        id, // facility_id
        start_date,
        end_date,
        search || null,
        certificate_id.length > 0 ? certificate_id : null,
        speciality_id.length > 0 ? speciality_id : null,
        expandedStatuses.length > 0 ? expandedStatuses : null,
      ],
    );

    // result will be [{ data: <json> }]
    return result[0]?.data ?? [];
  }

  async findAllShiftsWithFilters(
    filterDto: AllShiftFilterDto,
  ): Promise<[Shift[], number]> {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.facility', 'f')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .leftJoin('s.provider_requests', 'sr')
      .leftJoin('s.invited_provider', 'si')
      .leftJoin('sr.provider', 'p')
      .leftJoin('s.provider', 'provider')
      .leftJoin('admin', 'a', 's.created_by_id = a.id')
      .leftJoin('facility_user', 'fu', 's.follower = fu.id')
      .leftJoin('s.floor', 'fl')
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `s.created_at AS created_at`,
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
        `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
        's.shift_type AS shift_type',
        's.cancelled_request_from AS cancelled_request_from',
        's.cancelled_by_type AS cancelled_by_type',
        's.status AS status',
        's.is_orientation AS is_orientation',
        `s.adjustment AS adjustment`,
        `s.pay_rate AS pay_rate`,
        `s.bill_rate AS bill_rate`,
        `CASE
          WHEN s.status IN ('scheduled', 'completed', 'ongoing', 'running_late') THEN provider.first_name
          ELSE NULL
        END AS provider_first_name`,
        `CASE
            WHEN s.created_by_type = '${TABLE.admin}' THEN a.first_name
            WHEN s.created_by_type = '${TABLE.facility_user}' THEN fu.first_name
            WHEN s.created_by_type = '${TABLE.facility}' THEN f.name
            ELSE NULL
          END AS created_by_name`,
        `CASE
          WHEN fl.id IS NULL THEN '{}'::jsonb
          ELSE jsonb_build_object(
            'id', fl.id,
            'name', fl.name
          )
        END AS floor`,
        `CASE 
          WHEN s.created_by_type::text IN ('facility', 'facility_user') THEN 'Facility Portal'
          WHEN s.created_by_type::text = 'admin' THEN 'Master Admin'
          ELSE s.created_by_type::text
        END AS created_by_type
        `,
        `get_shift_time_code(s.start_time, s.end_time,s.facility_id) AS shift_time_code`,
        `CASE
          WHEN s.status IN ('scheduled', 'completed', 'ongoing', 'running_late') THEN
            jsonb_build_object(
              'id', provider.id,
              'base_url', provider.base_url,
              'profile_image', provider.profile_image,
              'first_name', provider.first_name,
              'last_name', provider.last_name
            )
          ELSE NULL
        END AS provider`,
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'latitude', f.latitude,
          'longitude', f.longitude,
          'timezone', f.timezone
        ) AS facility`,
        `jsonb_build_object(
          'id', fu.id,
          'first_name', fu.first_name,
          'last_name', fu.last_name,
          'base_url', fu.base_url,
          'image', fu.image
        ) AS follower`,
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation,
          'text_color', c.text_color, 
          'background_color', c.background_color
        ) AS certificate`,
        `jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'abbreviation', sp.abbreviation,
          'text_color', sp.text_color, 
          'background_color', sp.background_color
        ) AS speciality`,
        `COALESCE((
          SELECT COUNT(*) 
          FROM shift_request sr 
          WHERE sr.shift_id = s.id AND deleted_at IS NULL
        ), 0)::INTEGER AS total_requests`,
        `COALESCE((
          SELECT COUNT(*) 
          FROM shift_invitation si 
          WHERE si.shift_id = s.id AND deleted_at IS NULL
        ), 0)::INTEGER AS total_invites`,
        `(
          COALESCE(
            (
              SELECT
                COUNT(*)
              FROM
                shift_request sr
              WHERE
                sr.shift_id = s.id
                AND sr.deleted_at IS NULL
            ),
            0
          ) + COALESCE(
            (
              SELECT
                COUNT(*)
              FROM
                shift_invitation si
              WHERE
                si.shift_id = s.id
                AND si.deleted_at IS NULL
            ),
            0
          )
        )::INTEGER AS invite_requests_count`,
        `CASE 
          WHEN s.created_by_type = '${TABLE.admin}' THEN jsonb_build_object(
            'id', a.id,
            'first_name', a.first_name,
            'last_name', a.last_name,
            'base_url', a.base_url,
            'image', a.image,
            'type', '${TABLE.admin}'
          )
          WHEN s.created_by_type = '${TABLE.facility_user}' THEN jsonb_build_object(
            'id', fu.id,
            'base_url', fu.base_url,
            'image', fu.image,
            'first_name', fu.first_name,
            'last_name', fu.last_name,
            'type', '${TABLE.facility_user}'
          )
          ELSE NULL
        END AS ordered_by`,
      ])
      .where(`s.is_publish = true AND s.deleted_at IS NULL`)
      .groupBy('s.id, f.id, c.id, sp.id, a.id, fu.id, provider.id, fl.id');

    if (filterDto?.search) {
      queryBuilder.andWhere(
        `(
          s.shift_id ILIKE :search OR 
          f.name ILIKE :search OR 
          provider.first_name ILIKE :search OR 
          provider.last_name ILIKE :search OR 
          CONCAT(provider.first_name, ' ', provider.last_name) ILIKE :search OR 
          a.first_name ILIKE :search OR 
          a.last_name ILIKE :search OR 
          CONCAT(a.first_name, ' ', a.last_name) ILIKE :search OR 
          fu.first_name ILIKE :search OR 
          fu.last_name ILIKE :search OR 
          CONCAT(fu.first_name, ' ', fu.last_name) ILIKE :search OR 
          s.created_by_type::text ILIKE :search OR 
          s.status::text ILIKE :search OR 
          sp.name ILIKE :search OR 
          sp.abbreviation ILIKE :search OR 
          c.name ILIKE :search OR 
          c.abbreviation ILIKE :search
        )`,
        {
          search: `%${parseSearchKeyword(filterDto.search)}%`,
        },
      );
    }

    if (
      filterDto.provider_name &&
      parseSearchKeyword(filterDto.provider_name)
    ) {
      queryBuilder.andWhere(
        `CONCAT(provider.first_name, ' ', provider.last_name) ILIKE :provider_name`,
        {
          provider_name: `%${parseSearchKeyword(filterDto.provider_name)}%`,
        },
      );
    }

    if (filterDto.provider_id) {
      queryBuilder.andWhere('provider.id IN (:...provider_id)', {
        provider_id: filterDto.provider_id,
      });
    }

    if (filterDto.from_date) {
      queryBuilder.andWhere('s.start_date >= :from_date', {
        from_date: filterDto.from_date,
      });
    }

    if (filterDto.to_date) {
      queryBuilder.andWhere('s.start_date <= :to_date', {
        to_date: filterDto.to_date,
      });
    }

    const arrayFilters = [
      { key: 'certificate', column: 'c.id', param: 'certificateIds' },
      { key: 'speciality', column: 'sp.id', param: 'specialityIds' },
      { key: 'facility', column: 'f.id', param: 'facilityIds' },
      { key: 'status', column: 's.status', param: 'status' },
    ];

    for (const { key, column, param } of arrayFilters) {
      const value = filterDto[key];
      if (Array.isArray(value) && value.length) {
        queryBuilder.andWhere(`${column} IN (:...${param})`, {
          [param]: value,
        });
      }
    }

    if (filterDto.shift_type) {
      queryBuilder.andWhere('s.shift_type = :shift_type', {
        shift_type: filterDto.shift_type,
      });
    }

    if (filterDto.shift_id) {
      queryBuilder.andWhere('s.shift_id ILIKE :shift_id', {
        shift_id: `%${filterDto.shift_id}%`,
      });
    }

    if (filterDto.created_by) {
      queryBuilder.andWhere('s.created_by_id = :created_by', {
        created_by: filterDto.created_by,
      });
    }

    if (filterDto.shift_id_from && filterDto.shift_id_to) {
      queryBuilder.andWhere('s.shift_id BETWEEN :from_id AND :to_id', {
        from_id: filterDto.shift_id_from,
        to_id: filterDto.shift_id_to,
      });
    }

    Object.keys(filterDto.order).forEach((key) => {
      const sort = filterDto.order[key];
      if (key == 's.status') {
        key += '::character varying';
        filterDto.order[key] = sort;
      }
      if (key == 'total_invites') {
        key = 'invite_requests_count';
        filterDto.order[key] = sort;
      }

      if (key == 'provider.first_name') {
        key = 'provider_first_name';
        filterDto.order[key] = sort;
      }

      if (key == 'fu.first_name') {
        key = `
          CASE
            WHEN s.created_by_type = '${TABLE.admin}' THEN a.first_name
            WHEN s.created_by_type = '${TABLE.facility_user}' THEN fu.first_name
            ELSE NULL
          END
        `;
        filterDto.order[key] = sort;
      }

      if (key == 's.created_by_type') {
        key = `CASE
            WHEN s.created_by_type::text IN ('facility', 'facility_user') THEN 'Facility Portal'
            WHEN s.created_by_type::text = 'admin' THEN 'Master Admin'
            ELSE s.created_by_type::text
          END
        `;
        filterDto.order[key] = sort;
      }
      queryBuilder.addOrderBy(`${key}`, filterDto.order[key], 'NULLS LAST');
    });

    queryBuilder.limit(+filterDto.limit).offset(+filterDto.offset);
    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async createMultiDateShifts(
    createBatchShiftDto: CreateBatchShiftDto,
  ): Promise<{
    shifts: Shift[];
    preferencesNotMatched: boolean;
    failedProviders?: { id: string; name: string }[];
    haveShiftConflict?: boolean;
    warnRefusedProviders?: WarnStaffMessage[];
  }> {
    const createdShifts: Shift[] = [];
    const allInvitations: { provider: string; shift: string }[] = [];
    let preferencesNotMatched = false;
    let haveShiftConflict = false;
    const failedProviders: { id: string; name: string }[] = [];
    let warnRefusedProviders: WarnStaffMessage[] = [];

    for (const schedule of createBatchShiftDto.schedules) {
      const {
        start_date: shift_start_date,
        end_date: shift_end_date,
        openings,
      } = schedule;

      for (let i = 0; i < openings; i++) {
        // 🔹 Check provider availability first (before creating shift)
        if (
          Array.isArray(createBatchShiftDto.invited_provider) &&
          createBatchShiftDto.invited_provider.length
        ) {
          const availability: ProfileRow[] = await this.shiftRepository.query(
            `
            SELECT name,
                  provider_id,
                  to_char(d, 'YYYY-MM-DD') AS d,
                  time_code,
                  global_ok,
                  profile_ok,
                  profile_source,
                  profile_reason
            FROM FN_AVAILABILITY_OF_STAFF_WITH_TEMP_PERM_MESSAGE(
              $1::uuid[], $2::date[], $3::uuid, $4::time, $5::time
            )
          `,
            [
              createBatchShiftDto.invited_provider,
              [shift_start_date],
              createBatchShiftDto.facility,
              createBatchShiftDto.start_time,
              createBatchShiftDto.end_time,
            ],
          );

          // Index results by provider_id for quick lookup
          const availabilityMap = new Map(
            availability.map((a) => [a.provider_id, a]),
          );

          let allProvidersAvailable = true;

          for (const providerId of createBatchShiftDto.invited_provider) {
            const providerAvailable = availabilityMap.get(providerId);

            if (
              !providerAvailable ||
              !providerAvailable.global_ok ||
              !providerAvailable.profile_ok
            ) {
              allProvidersAvailable = false;
              preferencesNotMatched = true;
              failedProviders.push({
                id: providerId,
                name: providerAvailable?.name ?? 'Staff',
              });
            }

            if (
              await this.overlappingShift(
                providerId,
                createBatchShiftDto.facility,
                shift_start_date,
                createBatchShiftDto.start_time,
                createBatchShiftDto.end_time,
              )
            ) {
              haveShiftConflict = true;
              failedProviders.push({
                id: providerId,
                name: providerAvailable?.name ?? 'Staff',
              });
            }
          }

          if (!allProvidersAvailable) {
            continue;
          }

          ({ warnRefusedProviders } = await this.checkWithComplianceSettings(
            createBatchShiftDto.invited_provider,
            createBatchShiftDto.facility,
          ));
        }

        if (!haveShiftConflict) {
          const shiftPayload: any = {
            ...createBatchShiftDto,
            start_date: shift_start_date,
            end_date: shift_end_date,
            shift_type: SHIFT_TYPE.per_diem_shifts,
            openings: 1,
            is_repeat: false,
          };

          const createdShift = await this.create(shiftPayload);
          createdShifts.push(createdShift);

          // Save invitations only if shift was created
          if (
            Array.isArray(createBatchShiftDto.invited_provider) &&
            createBatchShiftDto.invited_provider.length
          ) {
            for (const providerId of createBatchShiftDto.invited_provider) {
              await this.shiftInvitationRepository.save({
                provider: { id: providerId },
                shift: { id: createdShift.id },
              });

              allInvitations.push({
                provider: providerId,
                shift: createdShift.id,
              });
            }
          }
        }
      }
    }

    return {
      shifts: createdShifts,
      preferencesNotMatched,
      failedProviders,
      haveShiftConflict,
      warnRefusedProviders,
    };
  }

  async checkWithComplianceSettings(
    provider_id: string[],
    facility_id: string,
  ): Promise<{
    warnRefusedProviders?: WarnStaffMessage[];
  }> {
    const warnRefusedProviders: WarnStaffMessage[] = [];
    const credentialStatus = await this.providerRepository.query(
      `SELECT status, staff, credential FROM fn_check_provider_credentials($1, $2)`,
      [provider_id, facility_id],
    );

    for (const row of credentialStatus) {
      if (row.status === VALIDATE_UPON.refuse) {
        warnRefusedProviders.push({
          status: row.status,
          staff: row.staff,
          credential: row.credential,
        });
        continue;
      }

      if (row.status === VALIDATE_UPON.warn) {
        warnRefusedProviders.push({
          status: row.status,
          staff: row.staff,
          credential: row.credential,
        });
      }
    }

    return { warnRefusedProviders };
  }

  async overlappingShift(
    provider_id: string,
    facility_id: string,
    start_date: string,
    start_time: string,
    end_time: string,
    shift_id?: string,
  ): Promise<boolean> {
    const overlapShift = await this.shiftRepository.query(
      `
    SELECT *
    FROM fn_conflicting_shifts_bulk(
      $1::uuid[],  -- provider array
      $2::uuid,    -- facility
      $3::date[],  -- dates array
      $4::time,    -- start time
      $5::time,    -- end time
      $6::uuid     -- exclude shift id (optional)
    )
    `,
      [
        [provider_id],
        facility_id,
        [start_date],
        start_time,
        end_time,
        shift_id || null,
      ],
    );

    // Return true if any rows exist
    return overlapShift.length > 0;
  }

  async removeShiftRequests(id: string) {
    await this.shiftInvitationRepository.update(
      { shift: { id } },
      { deleted_at: new Date().toISOString() },
    );

    await this.shiftRequestRepository.update(
      { shift: { id } },
      { deleted_at: new Date().toISOString() },
    );
  }

  async getUnPostedShiftCount(): Promise<number> {
    const count = await this.shiftRepository.count({
      where: { is_publish: false },
    });

    return count;
  }

  async providerMatchByCertification(
    provider_id: string,
    certificate_id: string,
    speciality_id: string,
  ) {
    const providerMatch = await this.providerRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.certificate', 'certificate')
      .leftJoinAndSelect('provider.speciality', 'speciality')
      .where('provider.id = :provider_id', { provider_id })
      .andWhere(
        '(certificate.id = :certificate_id OR :certificate_id = ANY(provider.additional_certification))',
        { certificate_id },
      )
      .andWhere(
        '(speciality.id = :speciality_id OR :speciality_id = ANY(provider.additional_speciality))',
        { speciality_id },
      )
      .getOne();

    return plainToInstance(Provider, providerMatch);
  }

  async getShiftTimeCode(
    start_time: string,
    end_time: string,
    facility_id: string,
  ): Promise<string> {
    const timeCode = await getTimeCode(
      start_time,
      end_time,
      facility_id,
      this.shiftRepository,
    );
    return timeCode;
  }

  async getSingleProviderPreferenceAvailability(
    provider_id: string,
    date: string,
    facility_id: string,
    start_time: string,
    end_time: string,
  ) {
    // Single DB call for all invited providers
    const availability: ProfileRow[] = await this.shiftRepository.query(
      `
          SELECT name,
                 provider_id,
                 to_char(d, 'YYYY-MM-DD') AS d,
                 time_code,
                 global_ok,
                 profile_ok,
                 profile_source,
                 profile_reason
          FROM FN_AVAILABILITY_OF_STAFF_WITH_TEMP_PERM_MESSAGE(
            $1::uuid[], $2::date[], $3::uuid, $4::time, $5::time
          )
          `,
      [[provider_id], [date], facility_id, start_time, end_time],
    );
    return availability;
  }

  async isProviderAssociatedWithAnyShift(providerId: string) {
    const data = await this.shiftRepository.find({
      where: {
        provider: { id: providerId },
        status: In([
          SHIFT_STATUS.scheduled,
          SHIFT_STATUS.invite_sent,
          SHIFT_STATUS.running_late,
        ]),
      },

      relations: {
        provider: true,
        facility: true,
        follower: true,
        certificate: true,
        speciality: true,
      },
    });
    return data;
  }

  async getShiftDashboard(
    filterDto: FilterShiftDashboardDto,
  ): Promise<[Shift[], number]> {
    const and: string[] = [];
    const orderArr: string[] = [];
    const {
      from_date,
      to_date,
      type,
      limit,
      offset,
      order,
      search,
      shift_id,
      created_by = [],
      certificate = [],
      speciality = [],
      facility = [],
      provider = [],
      status = [],
    } = filterDto;
    let query = `SELECT * FROM shift_dashboard_view`;
    let countQuery = `SELECT COUNT(*)::INTEGER FROM shift_dashboard_view`;

    if (type === FILTER_SHIFT_TYPE.open) {
      query = `SELECT *,
          CASE
            WHEN status::text IN ('open', 'auto_scheduling', 'invite_sent') THEN 'open'
            ELSE status
          END AS status
        FROM shift_dashboard_view`;
    }
    // Filter by shift type
    if (type) {
      switch (type) {
        case FILTER_SHIFT_TYPE.running_late:
          and.push(`status = '${SHIFT_STATUS.running_late}'`);
          break;
        case FILTER_SHIFT_TYPE.open:
          and.push(
            `status IN ('${SHIFT_STATUS.open}', '${SHIFT_STATUS.auto_scheduling}', '${SHIFT_STATUS.invite_sent}')`,
          );
          break;
        case FILTER_SHIFT_TYPE.urgent:
          and.push(`status IN (
            '${SHIFT_STATUS.open}',
            '${SHIFT_STATUS.auto_scheduling}',
            '${SHIFT_STATUS.invite_sent}'
          )`);
          and.push(
            `(start_date || ' ' || start_time)::timestamp BETWEEN NOW() AND (NOW() + INTERVAL '24 hours')`,
          );
          break;
        case FILTER_SHIFT_TYPE.cancelled:
          and.push(`(status = '${SHIFT_STATUS.cancelled}')`);
          break;
      }
    }

    if (search) {
      const parsedSearch = `%${parseSearchKeyword(search)}%`;
      and.push(`(
        shift_id ILIKE '${parsedSearch}' OR 
        (facility->>'name') ILIKE '${parsedSearch}' OR 
        (provider->>'first_name') ILIKE '${parsedSearch}' OR 
        (provider->>'last_name') ILIKE '${parsedSearch}' OR 
        (provider->>'last_name') || ' ' || (provider->>'first_name') ILIKE '${parsedSearch}' OR 
        staff_name ILIKE '${parsedSearch}' OR 
        created_by_name ILIKE '${parsedSearch}' OR 
        created_by_type ILIKE '${parsedSearch}' OR 
        status::text ILIKE '${parsedSearch}' OR 
        (speciality->>'name') ILIKE '${parsedSearch}' OR 
        (speciality->>'abbreviation') ILIKE '${parsedSearch}' OR 
        (certificate->>'name') ILIKE '${parsedSearch}' OR 
        (certificate->>'abbreviation') ILIKE '${parsedSearch}'
      )`);
    }
    if (from_date) and.push(`start_date::date >= '${from_date}'`);
    if (to_date) and.push(`start_date::date <= '${to_date}'`);

    if (shift_id) {
      and.push(`shift_id ILIKE '%${shift_id}%'`);
    }

    const arrayFilters = [
      { arr: certificate, col: 'certificate_id' },
      { arr: speciality, col: 'speciality_id' },
      { arr: facility, col: 'facility_id' },
      { arr: provider, col: 'provider_id' },
      { arr: status, col: 'status' },
      { arr: created_by, col: `ordered_by->>'id'` },
    ];
    arrayFilters.forEach(({ arr, col }) => {
      if (arr.length)
        and.push(`${col} IN (${arr.map((v) => `'${v}'`).join(',')})`);
    });

    if (and.length) {
      query += ` WHERE ${and.join(' AND ')}`;
      countQuery += ` WHERE ${and.join(' AND ')}`;
    }

    Object.keys(order).forEach((key) => {
      const sort = order[key];
      if (key.startsWith('s.')) {
        key = key.replace('s.', '');
        if (key == 'status') {
          key += '::character varying';
        }
        order[key] = sort;
      }
      if (key == 'total_invites') {
        key = 'invite_requests_count';
        order[key] = sort;
      }
      if (key.startsWith('sp.')) {
        key = `speciality->>'${key.replace('sp.', '')}'`;
        order[key] = sort;
      }
      if (key == 'provider.first_name') {
        key = 'provider_first_name';
        order[key] = sort;
      }
      if (key.startsWith('c.')) {
        key = `certificate->>'${key.replace('c.', '')}'`;
        order[key] = sort;
      }
      if (key == 'fu.first_name') {
        key = `created_by_name`;
        order[key] = sort;
      }
      if (key == 'f.name') {
        key = `facility->>'name'`;
        order[key] = sort;
      }

      if (order[key]) {
        orderArr.push(`${key} ${order[key]}`);
      }
    });

    if (orderArr.length) {
      query += ` ORDER BY ${orderArr.join(', ')}`;
    }

    query += ` LIMIT ${+limit} OFFSET ${+offset}`;

    const data = await this.shiftRepository.query(query);
    const countData = await this.shiftRepository.query(countQuery);
    const count = countData[0]?.count || 0;

    return [data, count];
  }

  async getShiftCount(start_date: string, end_date: string) {
    // Helper function to build base query
    const buildBaseQuery = () => {
      const query = this.shiftRepository.createQueryBuilder('s');
      if (start_date) {
        query.andWhere('s.start_date >= :start_date', { start_date });
      }
      if (end_date) {
        query.andWhere('s.start_date <= :end_date', { end_date });
      }
      return query;
    };

    const openShiftCount = await buildBaseQuery()
      .andWhere('s.status IN (:...status)', {
        status: [
          SHIFT_STATUS.open,
          SHIFT_STATUS.auto_scheduling,
          SHIFT_STATUS.invite_sent,
        ],
      })
      .getCount();

    const urgentShiftCount = await buildBaseQuery()
      .andWhere(
        `(s.start_date || ' ' || s.start_time)::timestamp BETWEEN NOW() AND (NOW() + INTERVAL '24 hours')`,
      )
      .andWhere('s.status IN (:...status)', {
        status: [
          SHIFT_STATUS.open,
          SHIFT_STATUS.auto_scheduling,
          SHIFT_STATUS.invite_sent,
        ],
      })
      .getCount();

    const runningLateShiftCount = await buildBaseQuery()
      .andWhere(`s.status = :status`, {
        status: SHIFT_STATUS.running_late,
      })
      .getCount();

    const cancelledShiftCount = await buildBaseQuery()
      .andWhere('(s.status = :status)', {
        status: SHIFT_STATUS.cancelled,
      })
      .getCount();

    return {
      urgent: urgentShiftCount,
      open: openShiftCount,
      running_late: runningLateShiftCount,
      cancelled: cancelledShiftCount,
    };
  }

  async createTimecard(id: string, req: IRequest) {
    const shift = await this.findOneWhere({
      where: { id },
      relations: { provider: true, facility: true, certificate: true },
    });

    if (!shift.clock_out) {
      return;
    }

    const startTime = new Date(`${shift.start_date}T${shift.start_time}`);
    const endTime = new Date(`${shift.end_date}T${shift.end_time}`);
    const shiftDuration = (endTime.getTime() - startTime.getTime()) / 1000;
    let status = TIMECARD_STATUS.approved;

    if (
      shiftDuration - shift.total_worked > 300 ||
      shiftDuration - shift.total_worked < -900
    ) {
      status = TIMECARD_STATUS.flagged;
    }

    const timecard = await this.timeCardRepository.save(
      plainToInstance(Timecard, {
        base_url: process.env.AWS_ASSETS_PATH,
        status,
        shift: { id: shift.id },
      }),
    );

    const adjustmentPendingShifts = await this.getAdjustmentPendingShifts(
      shift.provider,
    );

    let payableDuration = shift.total_worked;
    if (shift.total_worked > shiftDuration) {
      payableDuration = shiftDuration;
    }

    let disbursementAmount = 0;
    let billableAmount = 0;
    const overtimePayable = await this.getOvertimePayable(shift);

    if (overtimePayable) {
      disbursementAmount += overtimePayable.overtime_payable_amount;
      billableAmount += overtimePayable.overtime_billable_amount;
      payableDuration = Math.max(0, payableDuration - overtimePayable.overtime);
    }

    if (shift.holiday_bill_multiplier > 0 && shift.holiday_pay_multiplier > 0) {
      const holidayOverlapDuration =
        await this.getOverlappingHolidayHours(shift);

      payableDuration -= holidayOverlapDuration;
      disbursementAmount +=
        shift.pay_rate *
        shift.holiday_pay_multiplier *
        (holidayOverlapDuration / 3600);
      billableAmount =
        shift.bill_rate *
        shift.holiday_bill_multiplier *
        (holidayOverlapDuration / 3600);
    } else if (shift.weekend_bill_rate > 0 && shift.weekend_pay_rate > 0) {
      const weekendOverlapDuration =
        await this.getWeekendOverlappingHours(shift);

      payableDuration -= weekendOverlapDuration.pay_hours;

      disbursementAmount +=
        shift.weekend_pay_rate * (weekendOverlapDuration.pay_hours / 3600);
      billableAmount +=
        shift.weekend_bill_rate * (weekendOverlapDuration.bill_hours / 3600);
    }

    disbursementAmount += shift.pay_rate * (payableDuration / 3600);
    billableAmount += shift.bill_rate * (payableDuration / 3600);
    let settledShifts = [];

    if (adjustmentPendingShifts.length) {
      settledShifts = adjustmentPendingShifts.map((s) => {
        if (disbursementAmount >= Math.abs(s.adjustment)) {
          disbursementAmount =
            Number(disbursementAmount) + Number(s.adjustment);
          billableAmount =
            Number(billableAmount) + Number(s.billable_adjustment || 0);

          return {
            adjustment: 0,
            billable_adjustment: 0,
            total_payable_amount: disbursementAmount,
            total_billable_amount: billableAmount,
            adjustment_status: ADJUSTMENT_STATUS.settled,
            id: s.id,
          };
        } else {
          const adjustment = Number(s.adjustment) + Number(disbursementAmount);
          const billableAdjustment =
            Number(s.billable_adjustment) + Number(billableAmount);

          disbursementAmount = Number(s.adjustment) > 0 ? adjustment : 0;
          billableAmount =
            Number(s.billable_adjustment) > 0 ? billableAdjustment : 0;

          return {
            adjustment: adjustment,
            billable_adjustment: billableAdjustment,
            total_payable_amount: disbursementAmount,
            total_billable_amount: billableAmount,
            adjustment_status:
              adjustment > 0
                ? ADJUSTMENT_STATUS.settled
                : ADJUSTMENT_STATUS.pending,
            id: s.id,
          };
        }
      });
    }

    await this.shiftRepository.save(settledShifts);

    // Timecard activity logging
    if (status === TIMECARD_STATUS.approved) {
      await this.activityService.logShiftActivity(
        shift,
        req,
        ACTIVITY_TYPE.TIMECARD_GENERATED,
        {
          from_status: SHIFT_STATUS.ongoing,
          to_status: SHIFT_STATUS.completed,
          provider: shift.provider.first_name + ' ' + shift.provider.last_name,
          start_date: shift.start_date,
          start_time: shift.start_time,
        },
        ACTION_TABLES.TIMECARDS,
        timecard.id,
      );
    } else if (status === TIMECARD_STATUS.flagged) {
      await this.activityService.logShiftActivity(
        shift,
        req,
        ACTIVITY_TYPE.TIMECARD_FLAGGED,
        {
          from_status: SHIFT_STATUS.ongoing,
          to_status: SHIFT_STATUS.completed,
          provider: shift.provider.first_name + ' ' + shift.provider.last_name,
        },
        ACTION_TABLES.TIMECARDS,
        timecard.id,
      );
    }

    await this.shiftRepository.update(shift.id, {
      total_payable_amount: Number(disbursementAmount),
      total_billable_amount: Number(billableAmount),
      overtime: overtimePayable ? overtimePayable.overtime : 0,
      overtime_payable_amount: overtimePayable
        ? overtimePayable.overtime_payable_amount
        : 0,
      overtime_billable_amount: overtimePayable
        ? overtimePayable.overtime_billable_amount
        : 0,
    });

    if (disbursementAmount == 0 || status === TIMECARD_STATUS.flagged) return;

    const disbursement = await this.disbursementRepository.save({
      amount: disbursementAmount,
      description: `Paycheck for shift ${shift.shift_id}`,
      shift: { id: shift.id },
      provider: { id: shift.provider.id },
      retry: true,
    });

    await this.branchappService.createDisburement(shift.provider.id, {
      type: 'PAYCHECK',
      retry: true,
      amount: disbursementAmount,
      description: `Paycheck for shift ${shift.shift_id}`,
      external_id: disbursement.id,
    });
  }

  async getOvertimePayable(shift: Shift) {
    let rateGroup = await this.rateGroupRepository.findOne({
      where: { facility: { id: shift.facility.id } },
    });

    if (!rateGroup) {
      rateGroup = await this.rateGroupRepository.findOne({
        where: { facility: IsNull() },
      });
    }

    const data = await this.shiftRepository
      .createQueryBuilder('s')
      .select([
        'SUM(total_worked) AS total_worked',
        'SUM(overtime) AS overtime',
      ])
      .where('s.provider_id = :provider_id', {
        provider_id: shift.provider.id,
      })
      .andWhere('s.status = :status', { status: SHIFT_STATUS.completed })
      .andWhere(`s.facility_id = :facility_id`, {
        facility_id: shift.facility.id,
      })
      .andWhere(
        `s.start_date BETWEEN
          (current_date - EXTRACT(DOW FROM current_date)::int)::date
          AND
          ((current_date - EXTRACT(DOW FROM current_date)::int) + 6)::date`,
      )
      .getRawOne();

    if (!data) return null;

    const totalWorkedSeconds = Number(data.total_worked || 0);
    const overtimeThresholdSeconds = rateGroup.overtime_bill_after_hours * 3600;
    let overtimeWorkedInSeconds = Math.max(
      0,
      totalWorkedSeconds - overtimeThresholdSeconds,
    );

    overtimeWorkedInSeconds =
      overtimeWorkedInSeconds - Number(data.overtime || 0);

    return {
      overtime: overtimeWorkedInSeconds,
      overtime_payable_amount: overtimeWorkedInSeconds
        ? Number((overtimeWorkedInSeconds / 3600.0).toFixed(2)) *
          shift.overtime_pay_rate
        : 0,
      overtime_billable_amount: overtimeWorkedInSeconds
        ? Number((overtimeWorkedInSeconds / 3600.0).toFixed(2)) *
          shift.overtime_bill_rate
        : 0,
    };
  }

  async getAdjustmentPendingShifts(provider: Provider): Promise<Shift[]> {
    const shifts = await this.shiftRepository.find({
      where: {
        adjustment_status: ADJUSTMENT_STATUS.pending,
        adjustment: Not(0),
        provider: { id: provider.id },
      },
      select: {
        id: true,
        adjustment: true,
        adjustment_status: true,
        bill_adjustment_status: true,
        billable_adjustment: true,
      },
    });

    return shifts;
  }

  async saveTimeSheet(submitReportDto: SubmitReportDto, shift: Shift) {
    const { time_sheets } = submitReportDto;
    submitReportDto.time_sheets = !time_sheets
      ? []
      : time_sheets.map((timeSheet) => {
          return {
            base_url: process.env.AWS_ASSETS_PATH,
            image: timeSheet,
            provider_signature: submitReportDto?.provider_signature,
          };
        });

    await this.timeCardRepository.save(
      plainToInstance(Timecard, {
        ...submitReportDto,
        id: shift.time_card.id,
        shift: { id: shift.id },
      }),
    );

    const data = await this.getTimeCardData(shift.id);
    return data;
  }

  async getTimeCardData(shiftId: string) {
    const data = await this.timeCardRepository
      .createQueryBuilder('t')
      .select([
        't.shift_id AS id',
        's.status AS status',
        't.authority_signature AS authority_signature',
        't.provider_signature AS provider_signature',
        'ts.base_url AS base_url',
        `json_agg(ts.image) AS time_sheets`,
      ])
      .leftJoin('t.shift', 's')
      .leftJoin('t.time_sheets', 'ts')
      .where('s.id = :shiftId', { shiftId })
      .groupBy('t.id, s.id, ts.base_url')
      .getRawOne();

    if (!data) {
      throw new Error('Time card not found');
    }

    return data;
  }

  async filterProviderCancelled(providers: string[], shift: Shift) {
    if (!providers?.length || !shift?.id) return [];

    // Fetch all provider IDs who have cancelled for this shift
    const cancelledShifts: any = await this.providerCancelledShiftRepository
      .createQueryBuilder('pcs')
      .select(['pcs.provider_id'])
      .where('pcs.shift_id = :shiftId', { shiftId: shift.id })
      .andWhere('pcs.provider_id IN (:...providerIds)', {
        providerIds: providers,
      })
      .getRawMany();

    const providerIds = cancelledShifts.map((pcs) => pcs.provider_id);
    // Remove provider IDs present in cancelledShifts from providers array
    const filteredProviders = providers.filter(
      (id) => !providerIds.includes(id),
    );

    return filteredProviders;
  }

  async providerRunningLateShift(
    shift_id: string,
    provider_id: string,
  ): Promise<void> {
    // Check if already marked late (to avoid duplicates)
    const existing = await this.providerLateShiftRepository.findOne({
      where: {
        shift: { id: shift_id },
        provider: { id: provider_id },
      },
    });

    if (existing) {
      return;
    }

    const lateShift = await this.providerLateShiftRepository.save({
      shift: { id: shift_id },
      provider: { id: provider_id },
    });

    logger.error(`late shift: ${JSON.stringify(lateShift)}`);
  }

  async canUserClockInOrOut(shift: Shift, updateShiftDto: UpdateShiftDto) {
    const { clock_in, clock_out, latitude, longitude } = updateShiftDto;
    const minDistance =
      shift.facility.time_entry_setting.geo_fence_radius || 50;

    if (!shift.facility.time_entry_setting.enforce_geo_fence) return '';

    // Location radius validation
    if (latitude && longitude) {
      const query = `
        SELECT (
          ST_DistanceSphere(
          ST_MakePoint($1, $2),
          ST_MakePoint($3, $4)
          ) * 1.09361
        ) AS distance_meters
        LIMIT 1;
        `;
      const [result] = await this.shiftRepository.query(query, [
        longitude,
        latitude,
        shift.facility.longitude,
        shift.facility.latitude,
      ]);
      const distance = result?.distance_meters;
      if (distance >= minDistance) {
        if (clock_in) return CONSTANT.VALIDATION.CLOCKIN_RADIUS;
        if (clock_out) return CONSTANT.VALIDATION.CLOCKOUT_RADIUS;
      }
    }

    return '';
  }

  async saveFirstWorkedDate(provider: Provider) {
    if (provider.first_work_date) return;

    const date = await this.shiftRepository
      .createQueryBuilder('s')
      .select(`TO_CHAR(MIN(s.start_date), 'YYYY-MM-DD')`, 'first_work_date')
      .where('s.provider_id = :providerId', { providerId: provider.id })
      .andWhere('s.status = :status', {
        status: SHIFT_STATUS.completed,
      })
      .getRawOne();

    if (!date) return;

    await this.providerRepository.update(provider.id, {
      first_work_date: date.first_work_date,
      updated_at: new Date().toISOString(),
    });
  }

  async cancelInvite(providerId: string, shiftId: string) {
    const invitation = await this.shiftInvitationRepository.findOne({
      where: {
        provider: { id: providerId },
        shift: { id: shiftId },
        status: SHIFT_INVITATION_STATUS.accepted,
      },
    });

    if (invitation) {
      await this.shiftInvitationRepository.update(invitation.id, {
        status: SHIFT_INVITATION_STATUS.cancelled,
        updated_at: new Date().toISOString(),
      });
      return;
    }

    const request = await this.shiftRequestRepository.findOne({
      where: {
        provider: { id: providerId },
        shift: { id: shiftId },
        status: SHIFT_REQUEST_STATUS.assigned,
      },
    });

    if (request) {
      await this.shiftRequestRepository.update(request.id, {
        status: SHIFT_REQUEST_STATUS.cancelled,
        updated_at: new Date().toISOString(),
      });
      return;
    }
    return;
  }

  async getAIRecommendationsForShift(shifts: Shift[]) {
    const recommendations: Record<string, any[]> = {};
    const tasks = shifts.map((s) =>
      this.aIService
        .getAIRecommendations(s.facility.id, s.speciality.id, s.certificate.id)
        .then((providers) => {
          recommendations[s.id] = providers;
        }),
    );
    await Promise.all(tasks);
    return recommendations;
  }

  async validateInvitedProvidersAvailability(
    invitedProviders: any[],
    shiftDetail: any,
  ): Promise<void> {
    for (const { provider } of invitedProviders) {
      const availability = await this.getSingleProviderPreferenceAvailability(
        provider.id,
        shiftDetail.start_date,
        shiftDetail.facility.id,
        shiftDetail.start_time,
        shiftDetail.end_time,
      );

      const providerAvailable = availability?.[0];
      if (
        !providerAvailable ||
        !providerAvailable.global_ok ||
        !providerAvailable.profile_ok
      ) {
        throw new BadRequestException(
          CONSTANT.VALIDATION.PREFERENCE_NOT_MATCH(
            providerAvailable?.name,
            shiftDetail.start_date,
          ),
        );
      }
    }
  }

  async handleInvitedFlow(shiftDetail: any): Promise<Promise<any>[]> {
    const promises: Promise<any>[] = [];
    const {
      is_orientation,
      facility,
      start_date,
      start_time,
      end_time,
      invited_provider = [],
    } = shiftDetail;

    const notification =
      await this.notificationService.createUserSpecificNotification({
        title: is_orientation
          ? CONSTANT.NOTIFICATION.ORIENTATION_SHIFT
          : CONSTANT.NOTIFICATION.SHIFT_INVITATION_TITLE,
        text: is_orientation
          ? CONSTANT.NOTIFICATION.ORIENTATION_SHIFT_TEXT(facility.name)
          : CONSTANT.NOTIFICATION.SHIFT_INVITATION_TEXT(
              moment(start_date).format('MM-DD-YYYY'),
              moment(start_time, 'HH:mm:ss').format('hh:mm A'),
              moment(end_time, 'HH:mm:ss').format('hh:mm A'),
              facility.name,
            ),
        push_type: is_orientation
          ? PushNotificationType.scheduled
          : PushNotificationType.invited,
      });

    const payload = {
      id: shiftDetail.id,
      notification_id: notification.id,
      status: PushNotificationType.scheduled,
      start_date: shiftDetail.start_date,
      start_time: shiftDetail.start_time,
      end_date: shiftDetail.end_date,
      end_time: shiftDetail.end_time,
      facility: {
        id: shiftDetail.facility.id,
        name: shiftDetail.facility.name,
        street_address: shiftDetail.facility.street_address,
        house_no: shiftDetail.facility.house_no,
        zip_code: shiftDetail.facility.zip_code,
        latitude: shiftDetail.facility.latitude,
        longitude: shiftDetail.facility.longitude,
      },
      expire_in: 1,
      shift_status: is_orientation
        ? SHIFT_STATUS.scheduled
        : SHIFT_STATUS.invite_sent,
      is_timer: false,
      to: 'notification_data',
      created_at: new Date().toISOString(),
      description: CONSTANT.NOTIFICATION.SHIFT_INVITATION_DESCRIPTION,
    };

    // Batch update invitations
    const invitationIds = invited_provider.map(({ id }) => id);

    if (is_orientation) {
      // Update Orientation status
      await this.providerOrientationRepository.update(
        {
          facility: { id: shiftDetail.facility.id },
          provider: { id: invited_provider[0].provider.id },
        },
        {
          status: ORIENTATION_STATUS.orientation_scheduled,
          shift: { id: shiftDetail.id },
        },
      );
    }

    if (invitationIds.length) {
      promises.push(
        this.shiftInvitationRepository.update(
          { id: In(invitationIds) },
          {
            status: is_orientation
              ? SHIFT_INVITATION_STATUS.accepted
              : SHIFT_INVITATION_STATUS.invited,
          },
        ),
      );
    }

    const sendPromises = invited_provider
      .map(({ provider }) =>
        this.firebaseNotificationService.sendNotificationToOne(
          notification,
          'provider',
          provider.id,
          payload,
        ),
      )
      .filter(Boolean) as Promise<any>[];

    if (sendPromises.length) {
      promises.push(Promise.all(sendPromises));
    }

    return promises;
  }

  async getRateGroup(options: FindOneOptions<RateGroup>) {
    const rateGroup = await this.rateGroupRepository.findOne(options);
    return plainToInstance(RateGroup, rateGroup);
  }

  async calculateShiftCost(shifts: Shift[]): Promise<void> {
    const updatedShifts = [];
    const facilityId: any = shifts[0].facility.id;
    const certificateId: any = shifts[0].certificate.id;
    const shiftIds = shifts.map((s) => s.id);

    let rateGroup = await this.getRateGroup({
      relations: { rate_sheets: { certificate: true } },
      where: {
        facility: { id: facilityId },
        rate_sheets: { certificate: { id: certificateId } },
      },
    });

    if (!rateGroup) {
      rateGroup = await this.getRateGroup({
        relations: { rate_sheets: { certificate: true } },
        where: {
          facility: IsNull(),
          rate_sheets: { certificate: { id: certificateId } },
        },
      });
    }

    if (!rateGroup) {
      await this.shiftRepository.update(
        { id: In(shiftIds) },
        { deleted_at: new Date().toISOString() },
      );
      throw new NotFoundException(`Rate group not found for license`);
    }

    for (const shift of shifts) {
      const shiftTimeCode = await this.getShiftTimeCode(
        shift.start_time,
        shift.end_time,
        facilityId,
      );

      const shiftWeekday = this.getShiftDayTypeByRateGroup(
        shift.start_date,
        shift.start_time,
        rateGroup,
      );

      let weekendRateGroup = null;
      const hasWeekendOverlap = this.isShiftOverlappingWeekend(
        shift,
        rateGroup,
      );

      if (hasWeekendOverlap) {
        let dayType = DAY_TYPE.weekend;
        if (shiftWeekday === DAY_TYPE.weekend) {
          dayType = DAY_TYPE.weekday;
        }
        weekendRateGroup = rateGroup.rate_sheets.find(
          (rs) => rs.shift_time === shiftTimeCode && rs.day_type === dayType,
        );
      }

      let rateSheet = rateGroup.rate_sheets.find(
        (rs) => rs.shift_time === shiftTimeCode && rs.day_type === shiftWeekday,
      );

      if (hasWeekendOverlap && shiftWeekday === DAY_TYPE.weekend) {
        const newRate = { ...weekendRateGroup };
        weekendRateGroup = rateSheet;
        rateSheet = newRate;
      }

      const isHolidayShift = await this.isHolidayShift(shift, facilityId);

      let payRate = shift.premium_rate
        ? rateSheet.premium_pay
        : rateSheet.reg_pay;
      let billRate = shift.premium_rate
        ? rateSheet.premium_bill
        : rateSheet.reg_bill;

      if (isHolidayShift === 'holiday') {
        payRate *= rateGroup.holiday_pay;
        billRate *= rateGroup.holiday_bill;
      }

      updatedShifts.push(
        this.shiftRepository.update(shift.id, {
          pay_rate: Number(Number(payRate).toFixed(2)),
          bill_rate: Number(Number(billRate).toFixed(2)),
          overtime_bill_rate: Number(Number(rateSheet.ot_bill).toFixed(2)),
          overtime_pay_rate: Number(Number(rateSheet.ot_pay).toFixed(2)),
          holiday_bill_multiplier:
            isHolidayShift === 'overlap' ? rateGroup.holiday_bill : 0,
          holiday_pay_multiplier:
            isHolidayShift === 'overlap' ? rateGroup.holiday_pay : 0,
          weekend_bill_rate: weekendRateGroup
            ? Number(Number(weekendRateGroup.reg_bill).toFixed(2))
            : 0,
          weekend_pay_rate: weekendRateGroup
            ? Number(Number(weekendRateGroup.reg_pay).toFixed(2))
            : 0,
        }),
      );
    }

    if (updatedShifts.length) await Promise.all(updatedShifts);
  }

  /**
   * Checks if a shift overlaps with a weekend window.
   * Returns true if any part of the shift falls inside the weekend window.
   */
  isShiftOverlappingWeekend(shift: Shift, rateGroup: RateGroup): boolean {
    const shiftStart = moment(`${shift.start_date}T${shift.start_time}`);
    const shiftEnd = moment(`${shift.end_date}T${shift.end_time}`);
    const {
      weekend_pay_start_day,
      weekend_pay_start_time,
      weekend_pay_end_day,
      weekend_pay_end_time,
    } = rateGroup;

    // Normalize day input to ISO weekday number (1 = Monday, ... 7 = Sunday)
    const normalizeDay = (d: string | number): number => {
      if (typeof d === 'number') return d;
      const map: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 7,
      };
      const ds = d.toString().trim().toLowerCase();
      return map[ds] || parseInt(ds, 10);
    };

    // Weekend window start and end
    const weekendStart = moment(shift.start_date)
      .isoWeekday(normalizeDay(weekend_pay_start_day))
      .set({
        hour: parseInt(weekend_pay_start_time.split(':')[0], 10),
        minute: parseInt(weekend_pay_start_time.split(':')[1], 10),
        second: parseInt(weekend_pay_start_time.split(':')[2] || '0', 10),
      });
    const weekendEnd = moment(shift.start_date)
      .isoWeekday(normalizeDay(weekend_pay_end_day))
      .set({
        hour: parseInt(weekend_pay_end_time.split(':')[0], 10),
        minute: parseInt(weekend_pay_end_time.split(':')[1], 10),
        second: parseInt(weekend_pay_end_time.split(':')[2] || '0', 10),
      });
    if (weekendEnd.isBefore(weekendStart)) weekendEnd.add(1, 'week');

    // Check overlap with weekend
    return (
      (shiftStart.isBefore(weekendEnd) &&
        shiftEnd.isBetween(weekendStart, weekendEnd)) ||
      (shiftStart.isBetween(weekendStart, weekendEnd) &&
        shiftEnd.isAfter(weekendEnd))
    );
  }

  async isHolidayShift(
    shift: Shift, // 'HH:mm:ss'
    facilityId: string,
  ) {
    const holiday: FacilityHoliday =
      await this.facilityHolidayRepository.findOne({
        where: [
          {
            facility: { id: facilityId },
            start_date: LessThanOrEqual(shift.start_date),
            end_date: MoreThanOrEqual(shift.start_date),
            status: DEFAULT_STATUS.active,
          },
          {
            facility: { id: facilityId },
            start_date: LessThanOrEqual(shift.end_date),
            end_date: MoreThanOrEqual(shift.end_date),
            status: DEFAULT_STATUS.active,
          },
        ],
      });

    if (!holiday) return false;

    // If holiday has time boundaries, ensure shift time falls within
    const shiftMoment = moment(`${shift.start_date}T${shift.start_time}`);
    const shiftEndMoment = moment(`${shift.end_date}T${shift.end_time}`);
    const holidayStartMoment = moment(
      `${holiday.start_date}T${holiday.start_time}`,
    );
    const holidayEndMoment = moment(`${holiday.end_date}T${holiday.end_time}`);

    // Handle case where holiday end time is past midnight
    if (holidayEndMoment.isBefore(holidayStartMoment)) {
      holidayEndMoment.add(1, 'day');
    }

    if (
      shiftMoment.isBetween(holidayStartMoment, holidayEndMoment) &&
      shiftEndMoment.isBetween(holidayStartMoment, holidayEndMoment)
    ) {
      return 'holiday';
    }

    // Check if either shift start or shift end falls within the holiday window
    if (
      (shiftMoment.isSameOrAfter(holidayStartMoment) &&
        shiftMoment.isSameOrBefore(holidayEndMoment)) ||
      (shiftEndMoment.isSameOrAfter(holidayStartMoment) &&
        shiftEndMoment.isSameOrBefore(holidayEndMoment))
    ) {
      return 'overlap';
    }
  }

  async getOverlappingHolidayHours(
    shift: Shift, // 'HH:mm:ss'
  ) {
    const holiday: FacilityHoliday =
      await this.facilityHolidayRepository.findOne({
        where: [
          {
            facility: { id: shift.facility.id },
            start_date: LessThanOrEqual(shift.start_date),
            end_date: MoreThanOrEqual(shift.start_date),
            status: DEFAULT_STATUS.active,
          },
          {
            facility: { id: shift.facility.id },
            start_date: LessThanOrEqual(shift.end_date),
            end_date: MoreThanOrEqual(shift.end_date),
            status: DEFAULT_STATUS.active,
          },
        ],
      });

    if (!holiday) return 0;

    const shiftStart = moment(`${shift.start_date}T${shift.start_time}`);
    const shiftEnd = moment(`${shift.end_date}T${shift.end_time}`);
    const holidayStart = moment(`${holiday.start_date}T${holiday.start_time}`);
    const holidayEnd = moment(`${holiday.end_date}T${holiday.end_time}`);

    // Handle case where holiday end time is past midnight
    if (holidayEnd.isBefore(holidayStart)) {
      holidayEnd.add(1, 'day');
    }

    // Find the overlap interval
    const overlapStart = moment.max(shiftStart, holidayStart);
    const overlapEnd = moment.min(shiftEnd, holidayEnd);

    if (overlapEnd.isAfter(overlapStart)) {
      // Duration in seconds (rounded to nearest integer)
      return Math.round(overlapEnd.diff(overlapStart, 'seconds', true));
    }

    return 0;
  }

  async getWeekendOverlappingHours(shift: Shift) {
    let rateGroup = await this.getRateGroup({
      relations: { rate_sheets: { certificate: true } },
      where: {
        facility: { id: shift.facility.id },
        rate_sheets: { certificate: { id: shift.certificate.id } },
      },
    });

    if (!rateGroup) {
      rateGroup = await this.getRateGroup({
        relations: { rate_sheets: { certificate: true } },
        where: {
          facility: IsNull(),
          rate_sheets: { certificate: { id: shift.certificate.id } },
        },
      });
    }

    if (!rateGroup) return null;

    const {
      weekend_bill_start_day,
      weekend_bill_start_time,
      weekend_bill_end_day,
      weekend_bill_end_time,
      weekend_pay_start_day,
      weekend_pay_start_time,
      weekend_pay_end_day,
      weekend_pay_end_time,
    } = rateGroup;

    const { start_date, start_time, end_date, end_time } = shift;

    const weekendOverlapDuration = { pay_hours: 0, bill_hours: 0 };

    const normalizeDay = (d: string | number): number => {
      if (typeof d === 'number') return d;
      const map: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 7,
      };
      const ds = d?.toString().trim().toLowerCase();
      return map[ds] || parseInt(ds, 10);
    };

    const shiftStart = moment(`${start_date}T${start_time}`);
    const shiftEnd = moment(`${end_date}T${end_time}`);

    const startDay = normalizeDay(weekend_bill_start_day);
    const endDay = normalizeDay(weekend_bill_end_day);

    const payStartDay = normalizeDay(weekend_pay_start_day);
    const payEndDay = normalizeDay(weekend_pay_end_day);

    if (!startDay || !endDay) return weekendOverlapDuration;

    // Weekend window start and end (may span week boundary) for billing
    const weekendStart = moment(start_date)
      .isoWeekday(startDay)
      .set({
        hour: parseInt(
          (weekend_bill_start_time || '00:00:00').split(':')[0],
          10,
        ),
        minute: parseInt(
          (weekend_bill_start_time || '00:00:00').split(':')[1],
          10,
        ),
        second: parseInt(
          (weekend_bill_start_time || '00:00:00').split(':')[2] || '0',
          10,
        ),
      });
    const weekendEnd = moment(start_date)
      .isoWeekday(endDay)
      .set({
        hour: parseInt((weekend_bill_end_time || '23:59:59').split(':')[0], 10),
        minute: parseInt(
          (weekend_bill_end_time || '23:59:59').split(':')[1],
          10,
        ),
        second: parseInt(
          (weekend_bill_end_time || '23:59:59').split(':')[2] || '0',
          10,
        ),
      });
    if (weekendEnd.isBefore(weekendStart)) weekendEnd.add(1, 'week');

    // Find overlap
    const overlapStart = moment.max(shiftStart, weekendStart);
    const overlapEnd = moment.min(shiftEnd, weekendEnd);

    if (overlapEnd.isAfter(overlapStart)) {
      weekendOverlapDuration.bill_hours = Math.round(
        overlapEnd.diff(overlapStart, 'seconds', true),
      );
    }

    if (!payStartDay || !payEndDay) return weekendOverlapDuration;

    // Weekend window start and end (may span week boundary) for payment
    const weekendPayStart = moment(start_date)
      .isoWeekday(payStartDay)
      .set({
        hour: parseInt(
          (weekend_pay_start_time || '00:00:00').split(':')[0],
          10,
        ),
        minute: parseInt(
          (weekend_pay_start_time || '00:00:00').split(':')[1],
          10,
        ),
        second: parseInt(
          (weekend_pay_start_time || '00:00:00').split(':')[2] || '0',
          10,
        ),
      });
    const weekendPayEnd = moment(start_date)
      .isoWeekday(payEndDay)
      .set({
        hour: parseInt((weekend_pay_end_time || '23:59:59').split(':')[0], 10),
        minute: parseInt(
          (weekend_pay_end_time || '23:59:59').split(':')[1],
          10,
        ),
        second: parseInt(
          (weekend_pay_end_time || '23:59:59').split(':')[2] || '0',
          10,
        ),
      });
    if (weekendPayEnd.isBefore(weekendPayStart)) weekendPayEnd.add(1, 'week');
    // Find overlap
    const overlapPayStart = moment.max(shiftStart, weekendPayStart);
    const overlapPayEnd = moment.min(shiftEnd, weekendPayEnd);

    if (overlapPayEnd.isAfter(overlapPayStart)) {
      weekendOverlapDuration.pay_hours = Math.round(
        overlapPayEnd.diff(overlapPayStart, 'seconds', true),
      );
    }

    return weekendOverlapDuration;
  }

  /**
   * Determine if a shift falls into the RateGroup's "weekend" window.
   * - Accepts RateGroup fields week_start_day, week_end_day which can be number (1-7 ISO) or day name (e.g. "Monday").
   * - Optionally respects week_start_time / week_end_time to limit start/end boundaries on edge days.
   *
   * Returns true when the shift datetime lies inside the weekend window, otherwise false.
   */
  isShiftWeekendByRateGroup(
    shiftStartDate: string, // 'YYYY-MM-DD'
    shiftStartTime: string, // 'HH:mm:ss'
    rateGroup: RateGroup,
  ): boolean {
    if (!shiftStartDate || !shiftStartTime || !rateGroup) return false;

    // Normalize day input to ISO weekday number (1 = Monday, ... 7 = Sunday)
    const normalizeDay = (d: string | number): number => {
      if (typeof d === 'number') {
        const n = Math.floor(d);
        if (n >= 1 && n <= 7) return n;
      }
      if (!d || typeof d !== 'string') return NaN;
      const ds = d.trim().toLowerCase();
      const map: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 7,
      };
      if (map[ds]) return map[ds];
      // attempt parse numeric string
      const num = parseInt(ds, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= 7) return num;
      return NaN;
    };

    const startDay = normalizeDay((rateGroup as any).weekend_bill_start_day);
    const endDay = normalizeDay((rateGroup as any).weekend_bill_end_day);

    if (!startDay || !endDay) {
      // fallback: treat Sat/Sun as weekend if rateGroup doesn't specify
      const isoDay = moment(shiftStartDate).isoWeekday();
      return isoDay === 6 || isoDay === 7;
    }

    // Build set of ISO weekdays considered "weekend" according to rateGroup
    const weekendDays = new Set<number>();
    if (startDay <= endDay) {
      for (let d = startDay; d <= endDay; d++) weekendDays.add(d);
    } else {
      // wrap-around (e.g., start = 6 (Sat), end = 2 (Tue) => 6,7,1,2)
      for (let d = startDay; d <= 7; d++) weekendDays.add(d);
      for (let d = 1; d <= endDay; d++) weekendDays.add(d);
    }

    // shift iso day and shift time in seconds since midnight
    const shiftMoment = moment(`${shiftStartDate}T${shiftStartTime}`);
    const shiftIsoDay = shiftMoment.isoWeekday();
    const shiftSeconds =
      shiftMoment.hours() * 3600 +
      shiftMoment.minutes() * 60 +
      shiftMoment.seconds();

    // If day is strictly inside weekendDays (not an edge), it's weekend
    if (weekendDays.has(shiftIsoDay)) {
      const isStartEdge = shiftIsoDay === startDay;
      const isEndEdge = shiftIsoDay === endDay;

      const parseTimeToSeconds = (t?: string) => {
        if (!t) return null;
        const [hh = '0', mm = '0', ss = '0'] = t.split(':');
        return (
          parseInt(hh, 10) * 3600 + parseInt(mm, 10) * 60 + parseInt(ss, 10)
        );
      };

      const startSeconds = parseTimeToSeconds(
        (rateGroup as any).weekend_bill_start_time,
      );
      const endSeconds = parseTimeToSeconds(
        (rateGroup as any).weekend_bill_end_time,
      );

      // If no edge times provided, membership in weekendDays is enough
      if (
        (startSeconds == null && endSeconds == null) ||
        (!isStartEdge && !isEndEdge)
      ) {
        return true;
      }

      // If both start and end are on the same day (startDay === endDay) treat window by times
      if (startDay === endDay && startSeconds != null && endSeconds != null) {
        // may wrap midnight
        if (startSeconds <= endSeconds) {
          return shiftSeconds >= startSeconds && shiftSeconds <= endSeconds;
        } else {
          // wraps midnight: valid if >= start or <= end
          return shiftSeconds >= startSeconds || shiftSeconds <= endSeconds;
        }
      }

      // If we are on the start edge, ensure shift time is >= startSeconds (if provided)
      if (isStartEdge && startSeconds != null) {
        // If startSeconds <= end of that day then check lower bound only
        if (shiftSeconds < startSeconds) return false;
        // otherwise it's OK (no upper bound on start day)
      }

      // If we are on the end edge, ensure shift time is <= endSeconds (if provided)
      if (isEndEdge && endSeconds != null) {
        if (shiftSeconds > endSeconds) return false;
      }

      return true;
    }

    return false;
  }

  /**
   * Convenience function returning 'weekend' | 'weekday'
   */
  getShiftDayTypeByRateGroup(
    shiftStartDate: string,
    shiftStartTime: string,
    rateGroup: RateGroup,
  ): 'weekend' | 'weekday' {
    const isShiftWeekend = this.isShiftWeekendByRateGroup(
      shiftStartDate,
      shiftStartTime,
      rateGroup,
    );

    return isShiftWeekend ? 'weekend' : 'weekday';
  }

  async getOverdueInvoices(facilityId: string) {
    let setting = await this.accountingSettingRepository.findOne({
      where: { facility: { id: facilityId } },
    });

    if (!setting) {
      setting = await this.accountingSettingRepository.findOne({
        where: { facility: IsNull() },
      });
    }

    const count = await this.invoiceRepository
      .createQueryBuilder('i')
      .select('i.id')
      .where('i.facility_id = :facilityId', { facilityId })
      .andWhere('i.status = :status', { status: INVOICE_STATE.billed })
      .andWhere(`current_date - i.billed_date::date > :dueDays`, {
        dueDays: setting ? setting.invoice_due : 15,
      })
      .getOne();

    return count;
  }
}
