import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateAdminDto } from './dto/update-admin.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ContactFilterDto } from '@/facility-user/dto/contact-filter.dto';
import { FilterFacilityDto } from './dto/filter-facility.dto';
import { Facility } from '@/facility/entities/facility.entity';
import { Invite } from '@/invite/entities/invite.entity';
import {
  EJS_FILES,
  ENTITY_STATUS,
  INVITE_STATUS,
  LINK_TYPE,
  TABLE,
  ACTIVITY_TYPE,
  ACTION_TABLES,
} from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Activity } from '@/activity/entities/activity.entity';
import { Role } from '@/role/entities/role.entity';
import { IRequest } from '@/shared/constants/types';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';
import { ContactUserIncludedKeys } from '@/shared/constants/constant';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly encryptDecryptService: EncryptDecryptService,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    const result = await this.adminRepository.save(createAdminDto);
    return plainToInstance(Admin, result);
  }

  async findOneWhere(options: FindOneOptions<Admin>) {
    const result = await this.adminRepository.findOne(options);
    return plainToInstance(Admin, result);
  }

  // used query to avoid importing the role module
  async findRole(id: string) {
    const rows = await this.adminRepository.query(
      `SELECT * FROM "role" WHERE id = $1 LIMIT 1`,
      [id],
    );
    const result = rows[0];
    return plainToInstance(Role, result);
  }

  async findAll(options: FindManyOptions<Admin>): Promise<[Admin[], number]> {
    const [list, count] = await this.adminRepository.findAndCount(options);
    return [plainToInstance(Admin, list), count];
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const record = await this.adminRepository.update(id, {
      ...updateAdminDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async contactActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.ADMIN,
  ) {
    const action_by_type: TABLE = req.user.role;
    const action_by_id: string = req.user.id;

    const activity = this.activityRepository.create({
      action_by_type,
      entity_id,
      [action_by_type]: action_by_id,
      activity_type,
      message,
      action_for,
    });
    await this.activityRepository.save(activity);
  }

  // shift update activity
  async contactActivityUpdateLog(
    req: IRequest,
    entity_id: string,
    oldData: Record<string, any>,
    newData: Record<string, any>,
  ) {
    const changes = getUpdatedFields(
      oldData,
      newData,
      ContactUserIncludedKeys, // include keys to track
      true,
    ) as string[];

    const changesList = changes as string[] | undefined;
    if (!changesList || changesList.length === 0) return;

    const roleChanged =
      !!oldData?.role && !!newData?.role && oldData.role.id !== newData.role.id;
    const statusChanged =
      oldData?.status != null &&
      newData?.status != null &&
      oldData.status !== newData.status;

    let activity_type = ACTIVITY_TYPE.CONTACT_USER_UPDATED;
    if (roleChanged) {
      activity_type = ACTIVITY_TYPE.CONTACT_ROLE_UPDATED;
    } else if (statusChanged) {
      if (newData.status === 'in_active') {
        activity_type = ACTIVITY_TYPE.CONTACT_DEACTIVATED;
      } else if (newData.status === 'active') {
        activity_type = ACTIVITY_TYPE.CONTACT_REACTIVATED;
      }
    }

    const contactName =
      `${oldData?.first_name ?? ''} ${oldData?.last_name ?? ''}`.trim();

    await this.contactActivityLog(req, entity_id, activity_type, {
      changes: changesList,
      contact_user: contactName,
    });
  }

  async getAllContacts(
    queryParamsDto: ContactFilterDto,
    user_id: string,
  ): Promise<[Admin[], number]> {
    const user = await this.adminRepository.findOne({ where: { id: user_id } });

    const queryBuilder = this.adminRepository.createQueryBuilder('a');

    if (queryParamsDto?.search) {
      queryBuilder.where(
        `(a.first_name ILIKE :search OR a.last_name ILIKE :search OR a.email ILIKE :search OR role.name ILIKE :search OR a.first_name || ' ' || a.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(queryParamsDto.search)}%` },
      );
    }

    queryBuilder
      .leftJoinAndSelect('a.role', 'role')
      .select([
        'a.id',
        'a.email',
        'a.first_name',
        'a.last_name',
        'a.base_url',
        'a.image',
        'a.status',
        'a.created_at',
        'a.updated_at',
        'role.id',
        'role.name',
      ])
      .limit(+queryParamsDto.limit)
      .offset(+queryParamsDto.offset);

    if (queryParamsDto.role) {
      queryBuilder.andWhere(`role.id IN (:...role)`, {
        role: queryParamsDto.role,
      });
    }
    if (queryParamsDto.status && queryParamsDto.status.length) {
      queryBuilder.andWhere(`a.status IN (:...status)`, {
        status: queryParamsDto.status,
      });
    }
    if (user.hide_inactive_users) {
      queryBuilder.andWhere(`a.status IN (:...status)`, {
        status: [ENTITY_STATUS.active, ENTITY_STATUS.invited],
      });
    }
    queryBuilder.andWhere(`a.id != '${user_id}'`);
    Object.keys(queryParamsDto.order).forEach((key) => {
      if (key.includes('.')) {
        queryBuilder.addOrderBy(`${key}`, queryParamsDto.order[key]);
      } else {
        queryBuilder.addOrderBy(`a.${key}`, queryParamsDto.order[key]);
      }
    });

    const [list, count] = await queryBuilder.getManyAndCount();
    return [list, count];
  }

  async getAllFacilities(
    filterFacilityDto: FilterFacilityDto,
  ): Promise<[Facility[], number]> {
    const {
      status,
      limit,
      offset,
      order,
      city,
      facility_type,
      is_corporate_client = false,
      search,
      start_date,
      end_date,
      address,
      state,
      zip_code,
      name = [], // facility name filtering
      contact_id = [],
    } = filterFacilityDto;
    const queryBuilder = this.facilityRepository
      .createQueryBuilder('f')
      .leftJoin('f.status', 'status')
      .leftJoin('f.facility_type', 'facility_type')
      .leftJoin('f.super_facility_user', 'primary_contact')
      .select([
        `f.id AS id`,
        `f.name AS name`,
        `f.base_url AS base_url`,
        `f.image AS image`,
        `f.email AS email`,
        `f.country_code AS country_code`,
        `f.mobile_no AS mobile_no`,
        `f.created_at AS created_at`,
        `f.updated_at AS updated_at`,
        `f.street_address AS street_address`,
        `f.house_no AS house_no`,
        `f.zip_code AS zip_code`,
        `f.city AS city`,
        `f.state AS state`,
        `f.country AS country`,
        `f.is_corporate_client AS is_corporate_client`,

        // Convert latitude & longitude to number directly
        `CAST(f.latitude AS DOUBLE PRECISION) AS latitude`,
        `CAST(f.longitude AS DOUBLE PRECISION) AS longitude`,

        // Facility type object (can be null)
        `CASE
          WHEN facility_type.id IS NOT NULL THEN jsonb_build_object(
            'id', facility_type.id,
            'name', facility_type.name,
            'work_comp_code', facility_type.work_comp_code
          )
          ELSE NULL
        END AS facility_type`,

        // Super facility user object (can be null)
        `CASE
          WHEN primary_contact.id IS NOT NULL THEN jsonb_build_object(
            'id', primary_contact.id,
            'email', primary_contact.email,
            'mobile_no', primary_contact.mobile_no,
            'first_name', primary_contact.first_name,
            'last_name', primary_contact.last_name,
            'base_url', primary_contact.base_url,
            'image', primary_contact.image
          )
          ELSE NULL
        END AS primary_contact`,
      ])
      .where(`f.is_corporate_client = :is_corporate_client`, {
        is_corporate_client,
      });

    if (name.length) {
      queryBuilder.andWhere(`f.id IN (:...name)`, {
        name: name,
      });
    }

    if (contact_id.length) {
      queryBuilder.andWhere(`primary_contact.id IN (:...contact_id)`, {
        contact_id: contact_id,
      });
    }

    if (address && parseSearchKeyword(address)) {
      queryBuilder.andWhere(
        `(f.street_address ILIKE :address OR f.house_no ILIKE :address)`,
        {
          address: `%${parseSearchKeyword(address)}%`,
        },
      );
    }

    if (!is_corporate_client) {
      // Status object
      queryBuilder.addSelect(`jsonb_build_object(
          'id', status.id,
          'name', status.name,
          'background_color', status.background_color,
          'text_color', status.text_color,
          'description', status.description,
          'status_for', status.status_for,
          'is_default', status.is_default
        ) AS status
      `);
    }
    if (facility_type) {
      queryBuilder.andWhere(`facility_type.id IN (:...facility_type)`, {
        facility_type: facility_type,
      });
    }

    if (status) {
      queryBuilder.andWhere(`status.id IN (:...status)`, {
        status: status,
      });
    }

    if (city) {
      queryBuilder.andWhere(`f.city ILIKE :city`, {
        city: `%${parseSearchKeyword(city)}%`,
      });
    }

    if (state) {
      queryBuilder.andWhere(`f.state ILIKE :state`, {
        state: `%${parseSearchKeyword(state)}%`,
      });
    }

    if (zip_code) {
      queryBuilder.andWhere(`f.zip_code ILIKE :zip_code`, {
        zip_code: `%${parseSearchKeyword(zip_code)}%`,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        `(f.name ILIKE :search OR CONCAT(f.country_code, ' ', f.mobile_no) ILIKE :search OR f.street_address ILIKE :search OR f.house_no ILIKE :search OR f.zip_code ILIKE :search)`,
        {
          search: `%${parseSearchKeyword(search)}%`,
        },
      );
    }

    if (start_date) {
      queryBuilder.andWhere(
        `TO_CHAR(f.updated_at, 'YYYY-MM-DD') >= :start_date`,
        {
          start_date,
        },
      );
    }
    if (end_date) {
      queryBuilder.andWhere(
        `TO_CHAR(f.updated_at, 'YYYY-MM-DD') <= :end_date`,
        {
          end_date,
        },
      );
    }
    Object.entries(order).forEach(([column, direction]) => {
      if (column === 'primary_contact') {
        queryBuilder.addOrderBy(
          `primary_contact.first_name || ' ' || primary_contact.last_name`,
          direction,
        );
      } else if (column === 'facility_type') {
        queryBuilder.addOrderBy(`facility_type.name`, direction);
      } else if (column === 'status') {
        queryBuilder.addOrderBy(`status.name`, direction);
      } else {
        queryBuilder.addOrderBy(`f.${column}`, direction);
      }
    });

    queryBuilder.limit(+limit).offset(+offset);

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async getFacilityDetails(id: string) {
    const data = await this.facilityRepository.findOne({
      relations: {
        status: true,
        facility_type: true,
      },
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        base_url: true,
        image: true,
        email: true,
        country_code: true,
        mobile_no: true,
        facility_type: {
          id: true,
          name: true,
          work_comp_code: true,
        },
        total_beds: true,
        street_address: true,
        house_no: true,
        zip_code: true,
        latitude: true,
        longitude: true,
        first_shift: true,
        orientation: true,
        shift_description: true,
        breaks_instruction: true,
        dress_code: true,
        parking_instruction: true,
        doors_locks: true,
        timekeeping: true,
        created_at: true,
        updated_at: true,
        is_corporate_client: true,
        general_notes: true,
        staff_note: true,
        bill_notes: true,
        website: true,
        status: {
          id: true,
          name: true,
        },
        country: true,
        state: true,
        city: true,
        employee_id: true,
        timezone: true,
        description: true,
        is_master: true,
        is_email_verified: true,
        master_facility_id: true,
      },
    });

    return data;
  }

  async sendInvitation(admin: Admin) {
    await this.inviteRepository.update(
      {
        email: admin.email,
        role: TABLE.admin,
        user_id: admin.id,
        type: LINK_TYPE.invitation,
      },
      {
        deleted_at: new Date().toISOString(),
      },
    );

    const invite = await this.inviteRepository.save({
      user_id: admin.id,
      email: admin.email,
      role: TABLE.admin,
      status: INVITE_STATUS.pending,
      type: LINK_TYPE.invitation,
    });

    await sendEmailHelper({
      email: admin.email,
      name: admin.first_name,
      authority: 'Nurses Now',
      email_type: EJS_FILES.invitation,
      supportEmail: process.env.SUPPORT_EMAIL,
      redirectUrl:
        process.env[`ADMIN_INVITATION_URL`] +
        `?id=${this.encryptDecryptService.encrypt(admin.id)}&invite_id=${invite.id}`,
      subject: CONSTANT.EMAIL.ACCEPT_INVITE,
    });
  }
}
