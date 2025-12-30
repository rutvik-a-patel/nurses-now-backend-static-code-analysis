import { Injectable } from '@nestjs/common';
import {
  ArrayContains,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  In,
  LessThan,
  Repository,
} from 'typeorm';
import { Facility } from './entities/facility.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { FacilityUserPermission } from '@/facility-user/entities/facility-user-permission.entity';
import { CreateFacilityUserPermissionDto } from '@/facility-user/dto/create-facility-user-permission.dto';
import { TimeEntrySetting } from './entities/time-entry-setting.entity';
import { FacilityPortalSetting } from './entities/facility-portal-setting.entity';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  EJS_FILES,
  ENTITY_STATUS,
  INVITE_STATUS,
  LINK_TYPE,
  SHIFT_STATUS,
  TABLE,
  USER_TYPE,
} from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Invite } from '@/invite/entities/invite.entity';
import {
  TimeEntrySettingDto,
  FacilityPortalSettingDto,
  FloorDetailDto,
  SetupFacility,
  ShiftSettingDto,
  AccountingSettingDto,
} from './dto/setup-facility.dto';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { active, prospect } from '@/shared/constants/constant';
import { CreateFacilityUserDto } from '@/facility-user/dto/create-facility-user.dto';
import { FacilityUserService } from '@/facility-user/facility-user.service';
import { FacilityShiftSetting } from '@/facility-shift-setting/entities/facility-shift-setting.entity';
import { AccountingSetting } from './entities/accounting-setting.entity';
import { FilterFacilityDto } from './dto/filter-facility.dto';
import { Shift } from '@/shift/entities/shift.entity';
import { Token } from '@/token/entities/token.entity';
import { getDeepUpdatedFields } from '@/shared/helpers/get-updated-fields';
import { IRequest } from '@/shared/constants/types';
import { Activity } from '@/activity/entities/activity.entity';
import { City } from '@/city/entities/city.entity';

@Injectable()
export class FacilityService {
  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(FacilityUserPermission)
    private readonly facilityUserPermissionRepository: Repository<FacilityUserPermission>,
    @InjectRepository(TimeEntrySetting)
    private readonly timeEntrySettingRepository: Repository<TimeEntrySetting>,
    @InjectRepository(FacilityPortalSetting)
    private readonly facilityPortalSettingRepository: Repository<FacilityPortalSetting>,
    @InjectRepository(FloorDetail)
    private readonly floorDetailRepository: Repository<FloorDetail>,
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    @InjectRepository(FacilityShiftSetting)
    private readonly facilityShiftSettingRepository: Repository<FacilityShiftSetting>,
    @InjectRepository(StatusSetting)
    private readonly statusSettingRepository: Repository<StatusSetting>,
    @InjectRepository(AccountingSetting)
    private readonly accountingSettingRepository: Repository<AccountingSetting>,
    private readonly encryptDecryptService: EncryptDecryptService,
    private readonly facilityUserService: FacilityUserService,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async create(
    createFacilityDto: CreateFacilityDto,
    is_corporate_client: boolean = false,
  ): Promise<Facility> {
    if (!is_corporate_client) {
      const setting = await this.statusSettingRepository.findOne({
        where: {
          name: prospect,
        },
      });
      Object.assign(createFacilityDto, { status: setting.id });
    }
    const result = await this.facilityRepository.save(createFacilityDto);
    await this.accountingSettingRepository.save({
      facility: { id: result.id },
      billing_cycle: 15,
      invoice_due: 15,
    });
    return plainToInstance(Facility, result);
  }

  async findAll(
    options: FindManyOptions<Facility>,
  ): Promise<[Facility[], number]> {
    const [list, count] = await this.facilityRepository.findAndCount(options);
    return [plainToInstance(Facility, list), count];
  }

  async findOneWhere(options: FindOneOptions<Facility>) {
    const result = await this.facilityRepository.findOne(options);
    return plainToInstance(Facility, result);
  }

  async update(id: string, updateFacilityDto: any) {
    const { status = '' } = updateFacilityDto;
    const data = {
      ...updateFacilityDto,
      updated_at: new Date().toISOString(),
    };

    if (status) {
      const statusData = await this.statusSettingRepository.findOne({
        where: {
          id: status,
          name: active,
          status_for: USER_TYPE.facility,
        },
      });

      if (statusData) {
        Object.assign(data, { active_date: new Date().toISOString() });
      }
    }
    const record = await this.facilityRepository.update(id, data);
    return record;
  }

  async updateWhere(where: FindOptionsWhere<Facility>, updateFacilityDto: any) {
    const record = await this.facilityRepository.update(
      where,
      updateFacilityDto,
    );
    return record;
  }

  async getFacilityShiftSettings(
    options: FindManyOptions<FacilityShiftSetting>,
  ) {
    const result = await this.facilityShiftSettingRepository.find(options);
    return plainToInstance(FacilityShiftSetting, result);
  }

  async getFacilityShiftSettingV2(id: string) {
    const facility = await this.facilityRepository
      .createQueryBuilder('f')
      .select([
        'f.id AS id',
        'f.name AS name',
        'f.base_url AS base_url',
        'f.image AS image',
        'fts.name AS facility_type',
        'fts.work_comp_code AS work_comp_code',
        'f.street_address AS street_address',
        'f.house_no AS house_no',
        'f.zip_code AS zip_code',
        'f.latitude AS latitude',
        'f.longitude AS longitude',
        'f.city AS city',
        'f.state AS state',
        'f.orientation_document AS orientation_document',
        'f.orientation_process AS orientation_process',
        'f.original_filename AS original_filename',
        'f.orientation_enabled AS orientation_enabled',
        'f.is_floor AS is_floor',
      ])
      .leftJoin('f.facility_portal_setting', 'fps')
      .leftJoin('f.time_entry_setting', 'tes')
      .leftJoin('f.facility_type', 'fts')
      .leftJoin('floor_detail', 'fd', 'fd.facility = f.id')
      .leftJoin('f.accounting_setting', 'fas')
      // Join certificates and specialities using array relationships
      .leftJoin('certificate', 'fc', 'fc.id = ANY(f.certificate)')
      .leftJoin('speciality', 'fs', 'fs.id = ANY(f.speciality)')
      .addSelect(
        `
        json_build_object(
          'id', fps.id,
          'allow_cancellation', fps.allow_cancellation,
          'cancellation_advance', fps.cancellation_advance,
          'scheduling_warnings', fps.scheduling_warnings,
          'client_confirmation', fps.client_confirmation
        ) AS facility_portal_setting,

        json_build_object(
          'id', tes.id,
          'timecard_rounding', tes.timecard_rounding,
          'timecard_rounding_direction', tes.timecard_rounding_direction,
          'default_lunch_duration', tes.default_lunch_duration,
          'time_approval_method', tes.time_approval_method,
          'allowed_entries', tes.allowed_entries,
          'check_missed_meal_break', tes.check_missed_meal_break,
          'geo_fence_radius', tes.geo_fence_radius,
          'enforce_geo_fence', tes.enforce_geo_fence,
          'location', tes.location
        ) AS time_entry_setting,


        -- Get shift settings with fallback logic
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', s1.id,
                'status', s1.status,
                'name', s1.name,
                'is_default', s1.is_default,
                'start_time', s1.start_time,
                'end_time', s1.end_time,
                'shift_time_id', s1.shift_time_id,
                'shift_time_code', s1.time_code
              )
            )
            FROM facility_shift_setting s1 
            WHERE s1.facility_id = f.id AND s1.deleted_at IS NULL
            HAVING COUNT(s1.id) > 0
          ),
          -- Fallback: get default shifts
          (
            SELECT json_agg(
              json_build_object(
                'id', s2.id,
                'status', s2.status,
                'name', s2.name,
                'is_default', s2.is_default,
                'start_time', s2.start_time,
                'end_time', s2.end_time,
                'shift_time_id', s2.shift_time_id,
                'shift_time_code', s2.time_code
              )
            )
            FROM facility_shift_setting s2 
            WHERE s2.is_default = true AND s2.deleted_at IS NULL
          ),
          '[]'::json
        ) AS shift_setting,
         json_build_object(
          'id', fas.id,
          'billing_cycle', case when fas.id is not null then fas.billing_cycle else 15 end,
          'invoice_due', case when fas.id is not null then fas.invoice_due else 15 end
        ) AS accounting_setting,

        json_build_object(
          'id', fd.id,
          'floor_name', fd.name,
          'description', fd.description
        ) AS floor_detail,

        -- Aggregate certificates and specialities as arrays of objects
        COALESCE(
          json_agg(
          DISTINCT jsonb_build_object(
            'id', fc.id,
            'name', fc.name,
            'abbreviation', fc.abbreviation
          )
          ) FILTER (WHERE fc.id IS NOT NULL),
          '[]'::json
        ) AS certificate,

        COALESCE(
          json_agg(
          DISTINCT jsonb_build_object(
            'id', fs.id,
            'name', fs.name,
            'abbreviation', fs.abbreviation
          )
          ) FILTER (WHERE fs.id IS NOT NULL),
          '[]'::json
        ) AS speciality
      `,
      )
      .where('f.id = :id', { id })
      .groupBy('f.id, fps.id, tes.id, fts.id, fas.id, fd.id')
      .getRawOne();

    return plainToInstance(Facility, facility);
  }

  async saveFacilityUserPermission(
    createFacilityUserPermissionDto: CreateFacilityUserPermissionDto[],
  ) {
    const result = await this.facilityUserPermissionRepository.save(
      createFacilityUserPermissionDto,
    );
    return plainToInstance(Facility, result);
  }

  async saveTimeEntrySettings(timeEntrySettingDto: TimeEntrySettingDto) {
    const result = await this.timeEntrySettingRepository.save(
      plainToInstance(TimeEntrySetting, timeEntrySettingDto),
    );
    return plainToInstance(TimeEntrySetting, result);
  }

  async saveFacilityPortalSettings(
    facilityPortalSettingDto: FacilityPortalSettingDto,
  ) {
    const result = await this.facilityPortalSettingRepository.save(
      plainToInstance(FacilityPortalSetting, facilityPortalSettingDto),
    );
    return plainToInstance(FacilityPortalSetting, result);
  }

  async saveAccountingSettings(accountingSettingDto: AccountingSettingDto) {
    const result = await this.accountingSettingRepository.save(
      plainToInstance(AccountingSetting, accountingSettingDto),
    );
    return plainToInstance(AccountingSetting, result);
  }

  async saveFloorDetails(floorDetailDto: FloorDetailDto) {
    const result = await this.floorDetailRepository.save(
      plainToInstance(FloorDetail, floorDetailDto),
    );
    return plainToInstance(FloorDetail, result);
  }

  async deleteFloorDetails(floorIds: string[]): Promise<void> {
    if (floorIds && floorIds.length > 0) {
      await this.floorDetailRepository.delete(floorIds);
    }
  }

  async updateTimeEntrySettings(
    where: FindOptionsWhere<TimeEntrySetting>,
    timeEntrySettingDto: TimeEntrySettingDto,
  ) {
    const data = await this.timeEntrySettingRepository.findOne({ where });

    if (!data) {
      await this.timeEntrySettingRepository.save(
        plainToInstance(TimeEntrySetting, timeEntrySettingDto),
      );
    } else {
      await this.timeEntrySettingRepository.update(
        where,
        plainToInstance(TimeEntrySetting, timeEntrySettingDto),
      );
    }
  }

  async updateFacilityPortalSettings(
    where: FindOptionsWhere<FacilityPortalSetting>,
    facilityPortalSettingDto: FacilityPortalSettingDto,
  ) {
    const data = await this.facilityPortalSettingRepository.findOne({ where });

    if (!data) {
      await this.facilityPortalSettingRepository.save(
        plainToInstance(FacilityPortalSetting, facilityPortalSettingDto),
      );
    } else {
      await this.facilityPortalSettingRepository.update(
        where,
        plainToInstance(FacilityPortalSetting, facilityPortalSettingDto),
      );
    }
  }

  async sendInvitation(user: FacilityUser, facility?: Facility) {
    await this.inviteRepository.update(
      {
        email: user.email,
        role: TABLE.facility_user,
        user_id: user.id,
        type: LINK_TYPE.invitation,
      },
      {
        deleted_at: new Date().toISOString(),
      },
    );

    const invite = await this.inviteRepository.save({
      user_id: user.id,
      email: user.email,
      role: TABLE.facility_user,
      status: INVITE_STATUS.pending,
      type: LINK_TYPE.invitation,
    });

    await sendEmailHelper({
      email: user.email,
      name: user.first_name,
      email_type: EJS_FILES.invitation,
      supportEmail: process.env.SUPPORT_EMAIL,
      authority: (facility && facility.name) || 'Nurses Now',
      redirectUrl:
        process.env[`FACILITY_INVITATION_URL`] +
        `?id=${this.encryptDecryptService.encrypt(user.id)}&invite_id=${invite.id}`,
      subject: CONSTANT.EMAIL.ACCEPT_INVITE,
    });
  }

  async isInvitationExpired(user: FacilityUser | Facility, table: TABLE) {
    const data = await this.inviteRepository.findOne({
      where: [
        {
          created_at: LessThan(new Date(Date.now() - 60 * 60 * 1000)),
          user_id: user.id,
          role: table,
          status: INVITE_STATUS.pending,
        },
        {
          user_id: user.id,
          role: table,
          status: INVITE_STATUS.expired,
        },
      ],
    });

    if (data) {
      await this.inviteRepository.update(data.id, {
        status: INVITE_STATUS.expired,
      });
    }

    return data ? true : false;
  }

  async acceptInvitation(user: FacilityUser | Facility, table: TABLE) {
    const data = await this.inviteRepository.delete({
      user_id: user.id,
      role: table,
      status: INVITE_STATUS.pending,
    });

    return data ? true : false;
  }

  async isInvitationExist(
    user: FacilityUser | Facility,
    table: TABLE,
    type: LINK_TYPE,
  ) {
    const data = await this.inviteRepository.findOne({
      where: {
        user_id: user.id,
        role: table,
        type: type,
      },
    });

    return data;
  }

  async updateShiftSettings(shiftSetting: ShiftSettingDto[]) {
    await this.facilityShiftSettingRepository.save(
      plainToInstance(FacilityShiftSetting, shiftSetting),
    );

    return;
  }

  async updateAccountingSettings(
    where: FindOptionsWhere<AccountingSetting>,
    accountingSettingDto: AccountingSettingDto,
  ) {
    const data = await this.accountingSettingRepository.findOne({ where });

    if (!data) {
      await this.accountingSettingRepository.save(
        plainToInstance(AccountingSetting, accountingSettingDto),
      );
    } else {
      await this.accountingSettingRepository.update(
        where,
        plainToInstance(AccountingSetting, accountingSettingDto),
      );
    }
  }

  async setupFacility(setupFacility: SetupFacility, facility: Facility) {
    const {
      floor_details,
      time_entry_setting,
      facility_portal_setting,
      accounting_setting,
      shift_setting = [],
      ...dto
    } = setupFacility;

    if (floor_details) {
      const existingFloorDetails = facility.floor_detail || [];
      const floorIdsToDelete = existingFloorDetails
        .filter(
          (existingFloor) =>
            !floor_details.some(
              (newFloor) => newFloor?.id === existingFloor.id,
            ),
        )
        .map((floor) => floor.id);

      if (floorIdsToDelete.length) {
        await this.deleteFloorDetails(floorIdsToDelete);
      }

      await Promise.all(
        floor_details.map((floorDetail) => {
          floorDetail.facility = facility.id;
          return this.saveFloorDetails(floorDetail);
        }),
      );
    }

    const tasks = [];
    if (time_entry_setting) {
      time_entry_setting.facility = facility.id;
      tasks.push(this.saveTimeEntrySettings(time_entry_setting));
    }

    if (facility_portal_setting) {
      facility_portal_setting.facility = facility.id;
      tasks.push(this.saveFacilityPortalSettings(facility_portal_setting));
    }

    if (accounting_setting) {
      accounting_setting.facility = facility.id;
      tasks.push(this.saveAccountingSettings(accounting_setting));
    }
    tasks.push(this.updateWhere({ id: facility.id }, { ...dto }));

    if (shift_setting.length) {
      shift_setting.forEach((shift) => {
        shift.facility = facility.id;
        tasks.push(
          this.facilityShiftSettingRepository.save(
            plainToInstance(FacilityShiftSetting, shift),
          ),
        );
      });
    }

    await Promise.all(tasks);
  }

  async addContact(createFacilityUserDto: CreateFacilityUserDto, id: string) {
    const { permissions } = createFacilityUserDto;
    delete createFacilityUserDto.permissions;

    const user = await this.facilityUserService.create({
      ...createFacilityUserDto,
      status: ENTITY_STATUS.invited,
    });

    const facility = await this.findOneWhere({
      where: { id },
    });

    await this.sendInvitation(user, facility);

    const facilityUserPermissionArr = [];

    const permissionData = permissions.map((id) => {
      return {
        facility_permission: id,
        has_access: true,
        facility_user: user.id,
      };
    });

    permissionData.forEach((permission) => {
      facilityUserPermissionArr.push({
        facility_user: user.id,
        ...permission,
      });
    });

    const contactPermissions = await this.saveFacilityUserPermission(
      facilityUserPermissionArr,
    );

    return { ...user, permissions: contactPermissions };
  }
  async checkName(
    name: string,
    mobile_no: string,
    email: string,
    is_corporate_client: boolean,
  ) {
    const queryBuilder = this.facilityRepository
      .createQueryBuilder('f')
      .where(
        '(LOWER(f.name) = LOWER(:name) OR f.mobile_no = :mobile_no OR f.email = :email) AND f.is_corporate_client = :is_corporate_client',
        {
          name,
          mobile_no,
          email,
          is_corporate_client,
        },
      );

    const data = await queryBuilder.getOne();

    return data;
  }

  async getMetrics(id: string, queryParamsDto: FilterFacilityDto) {
    const { start_date, end_date } = queryParamsDto || {};

    const sql = 'SELECT * FROM get_facility_shift_metrics($1, $2, $3)';

    const rows = await this.facilityRepository.query(sql, [
      id,
      start_date,
      end_date,
    ]);

    if (!rows || rows.length === 0) return [];

    const firstRow = rows[0];
    const firstValue = Object.values(firstRow)[0];
    return firstValue ?? rows;
  }

  async deleteOpenShifts(facility: Facility) {
    const openShifts = await this.shiftRepository.find({
      where: {
        facility: { id: facility.id },
        status: In([
          SHIFT_STATUS.open,
          SHIFT_STATUS.auto_scheduling,
          SHIFT_STATUS.requested,
          SHIFT_STATUS.invite_sent,
        ]),
      },
    });

    if (openShifts.length === 0) {
      return false;
    }

    const shiftIds = openShifts.map((shift) => shift.id);
    await this.shiftRepository.update(shiftIds, {
      deleted_at: new Date().toISOString(),
    });

    return true;
  }

  async logoutAllFacilityUsers(facility: Facility) {
    const facilityUsers = await this.facilityUserService.findAllWhere({
      where: {
        facility_id: ArrayContains([facility.id]),
        status: ENTITY_STATUS.active,
      },
    });

    if (facilityUsers.length === 0) {
      return false;
    }

    const logoutPromises = facilityUsers.map((user) =>
      this.tokenRepository.update(
        { facility_user: { id: user.id } },
        {
          jwt: 'force-logout',
          refresh_jwt: 'force-logout',
          deleted_at: new Date().toISOString(),
        },
      ),
    );

    await Promise.all(logoutPromises);

    return true;
  }

  // Tracking the activity
  async facilityActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.FACILITY,
  ) {
    const action_by_type: TABLE = req.user.role;
    const action_by_id: string = req.user.id;

    const activity = this.activityRepository.create({
      action_by_type,
      entity_id,
      [action_by_type]: action_by_id,
      activity_type,
      message: {
        [req.user.role]: `${req.user.first_name} ${req.user.last_name}`,
        image:
          req.user?.base_url +
          (req.user.role === TABLE.provider
            ? req.user?.profile_image
            : req.user?.image),
        ...message,
      },
      action_for,
    });
    await this.activityRepository.save(activity);
  }

  // role update activity
  async facilityActivityUpdateLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    includedKeys?: string[],
    action_for?: ACTION_TABLES,
  ) {
    const changes = getDeepUpdatedFields(
      oldData,
      newData,
      includedKeys, // include keys to track
      true,
    ) as string[];
    const changesList = changes as string[] | undefined;
    if (!changesList || changesList.length === 0) return;

    await this.facilityActivityLog(
      req,
      entity_id,
      activity_type,
      {
        facility_name: newData.name,
        changes: changesList,
      },
      action_for,
    );
  }

  async getCityByName(cityName: string): Promise<City | null> {
    const city = await this.cityRepository.findOne({
      where: { name: cityName },
    });
    return city ? plainToInstance(City, city) : null;
  }
}
