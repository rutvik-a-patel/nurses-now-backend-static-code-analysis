import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateProviderDto } from './dto/create-provider.dto';
import { EditProviderDto } from './dto/edit-provider.dto';
import { AddProviderDataDto } from './dto/add-provider-data.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import {
  DEFAULT_STATUS,
  FACILITY_PROVIDER_FLAGS,
  SHIFT_STATUS,
  USER_STATUS,
} from '@/shared/constants/enum';
import { ProviderSignatureDto } from './dto/provider-signature.dto';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import {
  FilterProviderListDto,
  FilterProviderListForAdminDto,
} from './dto/filter-provider-list.dto';
import { UpdateProviderNotificationSettingDto } from './dto/update-provider-notification-setting';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { AvailabilityStatusDTO } from './dto/provider-availability.dto';
import { ProviderAvailability } from './entities/provider-availability.entity';
import { IRequest } from '@/shared/constants/types';
import { TimeLabelSetting } from './entities/time-label-setting.entity';
import s3GetFile from '@/shared/helpers/s3-get-file';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { applicant } from '@/shared/constants/constant';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Shift } from '@/shift/entities/shift.entity';
import { ProviderCancelledShift } from '@/shift/entities/provider-cancelled-shift.entity';
import { ProviderLateShift } from '@/shift/entities/provider-late-shift.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { LocationMapDto, EntityDetailsDto } from './dto/location-map.dto';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { VoidShift } from '@/shift/entities/void-shift.entity';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(ProviderAvailability)
    private readonly providerAvailabilityRepository: Repository<ProviderAvailability>,
    @InjectRepository(CompetencyTestSetting)
    private readonly competencyTestSettingRepository: Repository<CompetencyTestSetting>,
    @InjectRepository(SkillChecklistTemplate)
    private readonly skillChecklistTemplateRepository: Repository<SkillChecklistTemplate>,
    @InjectRepository(ProviderAnalytics)
    private readonly providerAnalyticsRepository: Repository<ProviderAnalytics>,
    @InjectRepository(ProviderNotificationSetting)
    private readonly providerNotificationSettingRepository: Repository<ProviderNotificationSetting>,
    @InjectRepository(TimeLabelSetting)
    private readonly timeLabelRepository: Repository<TimeLabelSetting>,
    @InjectRepository(ProviderEvaluation)
    private readonly providerEvaluationRepository: Repository<ProviderEvaluation>,
    @InjectRepository(FacilityProvider)
    private readonly facilityProviderRepository: Repository<FacilityProvider>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(ProviderCancelledShift)
    private readonly providerCancelRepository: Repository<ProviderCancelledShift>,
    @InjectRepository(ProviderLateShift)
    private readonly providerLateShiftRepository: Repository<ProviderLateShift>,
    @InjectRepository(StatusSetting)
    private readonly statusSettingRepository: Repository<StatusSetting>,
    @InjectRepository(VoidShift)
    private readonly voidShiftsRepository: Repository<VoidShift>,
    private readonly branchAppService: BranchAppService,
  ) {}

  async create(createProviderDto: CreateProviderDto) {
    const result = await this.providerRepository.save(createProviderDto);
    return plainToInstance(Provider, result);
  }

  async update(id: string, updateProviderDto: any) {
    const record = await this.providerRepository.update(id, {
      ...updateProviderDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async findAll(
    options: FindManyOptions<Provider>,
  ): Promise<[Provider[], number]> {
    const [list, count] = await this.providerRepository.findAndCount(options);
    return [plainToInstance(Provider, list), count];
  }

  async findFacilityProvider(options: FindOneOptions<FacilityProvider>) {
    const data = await this.facilityProviderRepository.findOne(options);
    return plainToInstance(FacilityProvider, data);
  }

  async checkName(ssn: string) {
    const queryBuilder = this.providerRepository
      .createQueryBuilder('p')
      .where('LOWER(p.ssn) = LOWER(:ssn)', {
        ssn,
      });

    const data = await queryBuilder.getOne();

    return data;
  }

  async findAllV2(
    filterProviderListDto: FilterProviderListDto,
  ): Promise<[Provider[], number]> {
    const {
      search = '',
      order = {},
      limit = 10,
      offset = 0,
      certificate = [],
      speciality = [],
      status = [],
      verification_status = [],
      last_login = {},
      created_at = {},
      updated_at = {},
      first_work_date = {},
      last_paid_date = {},
    } = filterProviderListDto;

    const and = [];
    const orderBy = [];
    const parsedSearch = parseSearchKeyword(search);
    let query = `select * From view_provider_list`;
    let countQuery = `SELECT COUNT(*)::INTEGER FROM view_provider_list`;

    if (parsedSearch) {
      and.push(
        `(first_name || ' ' || middle_name || ' ' || last_name ILIKE '%${parsedSearch}%' OR nick_name ILIKE '%${parsedSearch}%' OR city ILIKE '%${parsedSearch}%' OR state ILIKE '%${parsedSearch}%' OR zip_code ILIKE '%${parsedSearch}%')`,
      );
    }

    if (certificate.length) {
      and.push(
        `certificate_id IN (${certificate.map((id) => `'${id}'`).join(',')})`,
      );
    }

    if (speciality.length) {
      and.push(
        `speciality_id IN (${speciality.map((id) => `'${id}'`).join(',')})`,
      );
    }

    if (status.length) {
      and.push(`status_id IN (${status.map((id) => `'${id}'`).join(',')})`);
    }

    if (verification_status.length) {
      and.push(
        `verification_status IN (${verification_status
          .map((status) => `'${status}'`)
          .join(',')})`,
      );
    }
    const dateFilters = [
      { filter: last_login, column: 'last_login' },
      { filter: created_at, column: 'created_at' },
      { filter: updated_at, column: 'updated_at' },
      { filter: first_work_date, column: 'first_work_date' },
      { filter: last_paid_date, column: 'last_paid_date' },
    ];

    dateFilters.forEach(({ filter, column }) => {
      if (filter && Object.keys(filter).length > 0) {
        Object.entries(filter).forEach(([key, value]) => {
          if (key === 'from_date') {
            and.push(`TO_CHAR(${column}, 'YYYY-MM-DD') >= '${value}'`);
          }
          if (key === 'to_date') {
            and.push(`TO_CHAR(${column}, 'YYYY-MM-DD') <= '${value}'`);
          }
        });
      }
    });

    Object.entries(order).forEach(([column, direction]) => {
      if (column === 'status') {
        orderBy.push(`(status->>'name') ${direction}`);
      } else {
        orderBy.push(`${column} ${direction}`);
      }
    });

    if (and.length) {
      query += ` WHERE ${and.join(' AND ')}`;
      countQuery += ` WHERE ${and.join(' AND ')}`;
    }

    query += ` ORDER BY ${orderBy.join(',')} limit ${limit} offset ${offset}`;

    const list = await this.providerRepository.query(query);
    const countResult = await this.providerRepository.query(countQuery);
    const count = countResult[0]?.count ?? 0;
    return [list, count];
  }

  async findOneWhere(options: FindOneOptions<Provider>) {
    const result = await this.providerRepository.findOne(options);
    return plainToInstance(Provider, result);
  }

  async findStatus(options: FindOneOptions<StatusSetting>) {
    const result = await this.statusSettingRepository.findOne(options);
    return plainToInstance(StatusSetting, result);
  }

  async deleteAccount(id: string) {
    await this.providerRepository.update(id, {
      profile_status: USER_STATUS.deleted,
    });
  }

  async findOneV2(id: string) {
    const query = this.providerRepository
      .createQueryBuilder('p')
      .select([
        'p.id as id',
        'p.created_at as created_at',
        'p.updated_at as updated_at',
        'p.first_name as first_name',
        'p.last_name as last_name',
        'p.middle_name as middle_name',
        'p.nick_name as nick_name',
        'p.base_url AS base_url',
        'p.profile_image as profile_image',
        'p.email as email',
        'p.country_code as country_code',
        'p.mobile_no as mobile_no',
        'p.profile_status as profile_status',
        'p.birth_date as birth_date',
        'p.gender as gender',
      ])
      .where('p.id = :recordId', { recordId: id })
      .groupBy('p.id');

    // Executing the query
    const result = await query.getRawOne();
    return result;
  }

  async findProfileData(id: string) {
    const data = await this.providerRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.facility', 'facility')
      .leftJoinAndSelect('p.certificate', 'certificate')
      .leftJoinAndSelect('p.speciality', 'speciality')
      .leftJoinAndSelect('p.address', 'address')
      .leftJoin('facility.facility_type', 'facility_type')
      .select([
        'p.id AS id',
        'p.first_name AS first_name',
        'p.nick_name AS nick_name',
        'p.middle_name AS middle_name',
        'p.last_name AS last_name',
        'p.bio AS bio',
        `To_char(p.birth_date,'YYYY-MM-DD') AS birth_date`,
        'p.citizenship AS citizenship',
        'p.country_code AS country_code',
        'p.mobile_no AS mobile_no',
        'p.email AS email',
        'p.created_at AS created_at',
        'p.emergency_mobile_country_code AS emergency_mobile_country_code',
        'p.emergency_mobile_no AS emergency_mobile_no',
        'p.emergency_contact_name AS emergency_contact_name',
        'p.relation_with AS relation_with',
        'p.gender AS gender',
        'p.email AS email',
        'p.country_code AS country_code',
        'p.mobile_no AS mobile_no',
        'p.created_at AS created_at',
        'p.first_contact_date AS first_contact_date',
        'p.first_work_date AS first_work_date',
        'p.hourly_burden AS hourly_burden',
        'p.hire_date AS hire_date',
        'p.last_paid_date AS last_paid_date',
        'p.marital_status AS marital_status',
        'p.base_url AS base_url',
        'p.profile_image AS profile_image',
        'p.race AS race',
        'p.veteran_status AS veteran_status',
        'p.radius AS radius',
        'p.signature_image AS signature_image',
        'p.work_comp_code AS work_comp_code',
        'p.notify_me AS notify_me',
        `JSON_BUILD_OBJECT(
          'id', certificate.id,
          'name', certificate.name,
          'abbreviation', certificate.abbreviation
        ) AS certificate`,
        `JSON_BUILD_OBJECT(
          'id', speciality.id,
          'name', speciality.name,
          'abbreviation', speciality.abbreviation
        ) AS speciality`,
        `JSON_BUILD_OBJECT(
          'id', facility.id,
          'email', facility.email,
          'facility_type', facility_type.name
        ) AS facility`,
        `JSON_AGG(JSON_BUILD_OBJECT(
          'id', address.id,
          'type', address.type,
          'street', address.street,
          'apartment', address.apartment,
          'zip_code', address.zip_code,
          'latitude', address.latitude,
          'longitude', address.longitude,
          'place_id', address.place_id,
          'city', address.city,
          'state', address.state,
          'country', address.country
        )) AS address`,
        ` (SELECT JSON_AGG(JSON_BUILD_OBJECT('id',"certificate".id, 'name', "certificate".name, 'abbreviation', "certificate".abbreviation)) AS certificate
          FROM unnest(p.additional_certification) AS "additional_certification"
          JOIN "certificate" ON "certificate".id = "additional_certification") AS additional_certification`,
        ` (SELECT JSON_AGG(JSON_BUILD_OBJECT('id',"speciality".id, 'name', "speciality".name, 'abbreviation', "speciality".abbreviation)) AS speciality
          FROM unnest(p.additional_speciality) AS "additional_speciality"
          JOIN "speciality" ON "speciality".id = "additional_speciality") AS additional_speciality`,
      ])
      .groupBy(
        'p.id, certificate.id, speciality.id, facility.id, facility_type.id',
      )
      .where(`p.id = :id`, {
        id: id,
      })
      .getRawOne();
    return plainToInstance(Provider, data);
  }

  async updateWhere(
    where: FindOptionsWhere<Provider>,
    editProviderDto: EditProviderDto | ProviderSignatureDto | UpdateProviderDto,
  ) {
    const partialEntity = plainToInstance(Provider, editProviderDto);
    delete partialEntity.address;
    const record = await this.providerRepository.update(where, partialEntity);

    const updatedProvider = await this.findOneWhere({ where });

    await this.branchAppService.updateEmployee(updatedProvider.id, {
      first_name: updatedProvider.first_name,
      last_name: updatedProvider.last_name,
      email_address: updatedProvider.email ? updatedProvider.email : undefined,
      phone_number: updatedProvider.mobile_no
        ? updatedProvider.country_code + '' + updatedProvider.mobile_no
        : undefined,
      type: 'HOURLY',
    });

    return record;
  }

  async addProviderData(
    where: FindOptionsWhere<Provider>,
    addProviderDataDto: AddProviderDataDto,
  ) {
    const partialEntity = plainToInstance(Provider, addProviderDataDto);
    delete partialEntity.address;
    const record = await this.providerRepository.update(where, partialEntity);

    const updatedProvider = await this.findOneWhere({ where });

    await this.branchAppService.createEmployee(updatedProvider.id, {
      first_name: updatedProvider.first_name,
      last_name: updatedProvider.last_name,
      email_address: updatedProvider.email ? updatedProvider.email : undefined,
      phone_number: updatedProvider.mobile_no
        ? updatedProvider.country_code + '' + updatedProvider.mobile_no
        : undefined,
      type: 'HOURLY',
    });

    return record;
  }

  async getProviderDetails(id: string) {
    const data = await this.providerRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.certificate', 'certificate')
      .leftJoinAndSelect('p.speciality', 'speciality')
      .leftJoinAndSelect('p.address', 'address')
      .leftJoinAndSelect('p.status', 'status')
      .leftJoin('p.reason', 'reason')
      .select([
        'p.id AS id',
        'p.first_name AS first_name',
        'p.nick_name AS nick_name',
        'p.middle_name AS middle_name',
        'p.last_name AS last_name',
        'p.base_url AS base_url',
        'p.profile_image AS profile_image',
        'status.id AS status_id',
        'status.name AS status',
        'p.email AS email',
        'p.country_code AS country_code',
        'p.mobile_no AS mobile_no',
        'p.bio AS bio',
        `TO_CHAR(p.birth_date, 'YYYY-MM-DD') AS birth_date`,
        'p.ssn AS ssn',
        'p.gender AS gender',
        'p.marital_status AS marital_status',
        'p.citizenship AS citizenship',
        'p.race AS race',
        'p.veteran_status AS veteran_status',
        `TO_CHAR(p.first_contact_date,'YYYY-MM-DD') AS first_contact_date`,
        `TO_CHAR(p.hire_date,'YYYY-MM-DD') AS hire_date`,
        `TO_CHAR(p.rehire_date,'YYYY-MM-DD') AS rehire_date`,
        `TO_CHAR(p.first_work_date,'YYYY-MM-DD') AS first_work_date`,
        `TO_CHAR(p.created_at,'YYYY-MM-DD') AS apply_date`,
        `reason.reason AS reject_reason`,
        `p.reason_description AS reason_description`,
        `(SELECT MIN(TO_CHAR(s.start_date, 'YYYY-MM-DD'))
          FROM shift s
          WHERE s.provider_id = p.id
          AND s.status = '${SHIFT_STATUS.scheduled}'
        ) AS next_scheduled`,
        `(SELECT MAX(TO_CHAR(s.start_date, 'YYYY-MM-DD'))
          FROM shift s
          WHERE s.provider_id = p.id
          AND s.status IN ('un_submitted', 'completed')
        ) AS last_scheduled`,
        `TO_CHAR(p.last_paid_date,'YYYY-MM-DD') AS last_paid_date`,
        'p.notes AS notes',
        `TO_CHAR(p.termination_date,'YYYY-MM-DD') AS termination_date`,
        `TO_CHAR(p.employed_at,'YYYY-MM-DD') AS employed_at`,
        'p.employee_id AS employee_id',
        'p.work_comp_code AS work_comp_code',
        'p.hourly_burden AS hourly_burden',
        'p.is_deceased AS is_deceased',
        `TO_CHAR(p.deceased_date,'YYYY-MM-DD') AS deceased_date`,
        `JSON_BUILD_OBJECT(
          'id', certificate.id,
          'name', certificate.name,
          'abbreviation', certificate.abbreviation,
          'background_color', certificate.background_color,
          'text_color', certificate.text_color
        ) AS certificate`,
        `JSON_BUILD_OBJECT(
          'id', speciality.id,
          'name', speciality.name,
          'abbreviation', speciality.abbreviation,
          'background_color', speciality.background_color,
          'text_color', speciality.text_color
        ) AS speciality`,
        `JSON_AGG(JSON_BUILD_OBJECT(
          'id', address.id,
          'street', address.street,
          'apartment', address.apartment,
          'zip_code', address.zip_code,
          'city', address.city,
          'state', address.state,
          'country', address.country
        )) AS address`,
        `(SELECT COALESCE(
          JSON_AGG(JSON_BUILD_OBJECT(
            'id', "certificate".id,
            'name', "certificate".name,
            'abbreviation', "certificate".abbreviation,
            'text_color', "certificate".text_color,
            'background_color', "certificate".background_color
          )),
          '[]'::json) AS certificate
        FROM unnest(p.additional_certification) AS "additional_certification"
        JOIN "certificate" ON "certificate".id = "additional_certification") AS additional_certification`,
        `(SELECT COALESCE(
          JSON_AGG(JSON_BUILD_OBJECT(
            'id', "speciality".id,
            'name', "speciality".name,
            'abbreviation', "speciality".abbreviation,
            'text_color', "speciality".text_color,
            'background_color', "speciality".background_color
          )),
          '[]'::json) AS speciality
        FROM unnest(p.additional_speciality) AS "additional_speciality"
        JOIN "speciality" ON "speciality".id = "additional_speciality") AS additional_speciality`,
      ])
      .groupBy('p.id, certificate.id, speciality.id, status.id, reason.id')
      .where(`p.id = :id`, {
        id: id,
      })
      .getRawOne();
    return plainToInstance(Provider, data);
  }

  // Provider Metrics
  async getProviderMetrics(id: string, query: QueryParamsDto) {
    const cancelledCount = await this.cancelledShiftCount(id, query);
    const cancelledWithin24Count = await this.cancelledWithin24hBeforeShift(
      id,
      query,
    );
    const cancelledShiftByFacility = await this.cancelledShiftByFacility(
      id,
      query,
    );
    const completedShiftCount = await this.completedShiftCount(id, query);
    const bookedShiftCount = await this.bookedShiftCount(id);
    const facilityDnrCount = await this.facilityDnrProvider(id, query);
    const selfDnrCount = await this.selfFacilityDnr(id, query);
    const lateShiftCount = await this.providerLateShift(id, query);
    const noShowCount = await this.noShowCount(id, query);
    return {
      booked: bookedShiftCount,
      cancelled: cancelledCount,
      cancelled_by_facility: cancelledShiftByFacility,
      cancelled_within_24: cancelledWithin24Count,
      completed: completedShiftCount,
      facility_dnr: facilityDnrCount,
      self_dnr: selfDnrCount,
      late: lateShiftCount,
      no_show: noShowCount,
    };
  }

  // Refactored individual methods with shared logic
  private applyDateFilter(
    queryBuilder: any,
    query: QueryParamsDto,
    dateColumn = 'created_at',
  ) {
    if (query?.start_date) {
      queryBuilder.andWhere(
        `TO_CHAR(${dateColumn}, 'YYYY-MM-DD') >= :startDate`,
        { startDate: query.start_date },
      );
    }
    if (query?.end_date) {
      queryBuilder.andWhere(
        `TO_CHAR(${dateColumn}, 'YYYY-MM-DD') <= :endDate`,
        { endDate: query.end_date },
      );
    }
  }

  async cancelledShiftCount(id: string, query: QueryParamsDto) {
    const queryBuilder = this.providerCancelRepository
      .createQueryBuilder('pc')
      .where('pc.provider_id = :providerId', { providerId: id })
      .andWhere('pc.deleted_at IS NULL');

    this.applyDateFilter(queryBuilder, query, 'pc.created_at');
    return queryBuilder.getCount();
  }

  async cancelledWithin24hBeforeShift(id: string, query: QueryParamsDto) {
    const queryBuilder = this.providerCancelRepository
      .createQueryBuilder('pc')
      .innerJoin('shift', 's', 's.id = pc.shift_id')
      .innerJoin('facility', 'f', 'f.id = s.facility_id')
      .where('pc.deleted_at IS NULL')
      .andWhere('pc.provider_id = :providerId', { providerId: id }).andWhere(`
      (pc.created_at)::timestamptz >= ((s.start_date + s.start_time) AT TIME ZONE COALESCE(f.timezone, 'UTC')) - interval '24 hours'
    `).andWhere(`
      (pc.created_at)::timestamptz <  ((s.start_date + s.start_time) AT TIME ZONE COALESCE(f.timezone, 'UTC'))
    `);
    this.applyDateFilter(queryBuilder, query, 'pc.created_at');
    return queryBuilder.getCount();
  }

  async cancelledShiftByFacility(id: string, query: QueryParamsDto) {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .where('s.provider_id = :providerId', { providerId: id })
      .andWhere('s.status = :status', { status: SHIFT_STATUS.cancelled })
      .andWhere('s.deleted_at IS NULL');

    this.applyDateFilter(queryBuilder, query, 's.created_at');
    return queryBuilder.getCount();
  }

  async completedShiftCount(id: string, query: QueryParamsDto) {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .where('s.provider_id = :providerId', { providerId: id })
      .andWhere('s.deleted_at IS NULL')
      .andWhere('s.status = :status', { status: SHIFT_STATUS.completed });

    // Note: Using start_date and end_date for completed shifts
    if (query?.start_date) {
      queryBuilder.andWhere(
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') >= :startDate`,
        { startDate: query.start_date },
      );
    }
    if (query?.end_date) {
      queryBuilder.andWhere(`TO_CHAR(s.end_date, 'YYYY-MM-DD') <= :endDate`, {
        endDate: query.end_date,
      });
    }

    return queryBuilder.getCount();
  }

  async bookedShiftCount(id: string) {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .where('s.provider_id = :providerId', { providerId: id })
      .andWhere('s.deleted_at IS NULL')
      .andWhere('s.status = :status', { status: SHIFT_STATUS.scheduled });

    return queryBuilder.getCount();
  }

  async noShowCount(id: string, query: QueryParamsDto) {
    const voidShiftQueryBuilder = this.voidShiftsRepository
      .createQueryBuilder('vs')
      .where('vs.provider_id = :providerId', { providerId: id })
      .andWhere('vs.deleted_at IS NULL');
    this.applyDateFilter(voidShiftQueryBuilder, query, 'vs.created_at');
    const voidShiftCount = await voidShiftQueryBuilder.getCount();

    // Count from providerLateShiftRepository
    const lateShiftQueryBuilder = this.providerLateShiftRepository
      .createQueryBuilder('pls')
      .where('pls.provider_id = :providerId', { providerId: id })
      .andWhere('pls.deleted_at IS NULL');
    this.applyDateFilter(lateShiftQueryBuilder, query, 'pls.created_at');
    const lateShiftCount = await lateShiftQueryBuilder.getCount();

    // Return the sum of both counts
    return voidShiftCount + lateShiftCount;
  }

  async facilityDnrProvider(id: string, query: QueryParamsDto) {
    const queryBuilder = this.facilityProviderRepository
      .createQueryBuilder('fp')
      .where('fp.provider_id = :providerId', { providerId: id })
      .andWhere('fp.flag = :flag', { flag: FACILITY_PROVIDER_FLAGS.dnr })
      .andWhere('fp.deleted_at IS NULL');

    this.applyDateFilter(queryBuilder, query, 'fp.created_at');
    return queryBuilder.getCount();
  }

  async selfFacilityDnr(id: string, query: QueryParamsDto) {
    const queryBuilder = this.facilityProviderRepository
      .createQueryBuilder('fp')
      .where('fp.provider_id = :providerId', { providerId: id })
      .andWhere('fp.flag = :flag', { flag: FACILITY_PROVIDER_FLAGS.self })
      .andWhere('fp.deleted_at IS NULL');

    this.applyDateFilter(queryBuilder, query, 'fp.created_at');
    return queryBuilder.getCount();
  }

  async providerLateShift(id: string, query: QueryParamsDto) {
    const queryBuilder = this.providerLateShiftRepository
      .createQueryBuilder('pls')
      .where('pls.provider_id = :providerId', { providerId: id })
      .andWhere('pls.deleted_at IS NULL');

    this.applyDateFilter(queryBuilder, query, 'pls.created_at');
    return queryBuilder.getCount();
  }

  async getCompetencyList(user: Provider) {
    const data = await this.competencyTestSettingRepository
      .createQueryBuilder('cs')
      .innerJoin(
        'credentials_requirement',
        'cr',
        `cr.credential_id = cs.id AND '${user?.certificate?.id}' = ANY(cr.certificate_or_speciality)`,
      )
      .leftJoin(
        'competency_test_score',
        'cts',
        'cts.competency_test_setting_id = cs.id AND cts.provider_id = :providerId',
        { providerId: user.id },
      )
      .select([
        'cs.id AS id',
        'cs.name AS name',
        'cs.required_score AS required_score',
        'cs.duration AS duration',
        `(SELECT COUNT(id) FROM competency_test_question WHERE competency_test_setting_id = cs.id AND deleted_at IS NUll)::INTEGER AS question_count`,
        `CASE 
            WHEN cts.id IS NOT NULL THEN TRUE 
            ELSE FALSE 
          END AS is_completed`,
        `CASE
            WHEN (SELECT COUNT(id) FROM competency_test_question WHERE competency_test_setting_id = cs.id AND deleted_at IS NULL) > 0
            THEN ROUND((COALESCE(cts.score, 0) / (SELECT COUNT(id) FROM competency_test_question WHERE competency_test_setting_id = cs.id AND deleted_at IS NULL)) * 100, 2)
            ELSE 0
          END AS percentage`,
        `CASE
            WHEN cts.score >= cs.required_score::numeric THEN TRUE
            ELSE FALSE
          END AS is_pass`,
      ])
      .where(
        `cr.certificate_or_speciality @> :certificate_id AND cs.status = :status`,
        {
          certificate_id: [user?.certificate?.id],
          status: DEFAULT_STATUS.active,
        },
      )
      .getRawMany();

    return data;
  }

  async getSkillChecklist(user: Provider) {
    const queryBuilder = this.skillChecklistTemplateRepository
      .createQueryBuilder('st')
      .innerJoin(
        'skill_checklist_module',
        'sm',
        'sm.skill_checklist_template_id = st.id',
      )
      .innerJoin(
        'credentials_requirement',
        'cr',
        `cr.credential_id = st.id AND '${user?.certificate?.id}' = ANY(cr.certificate_or_speciality)`,
      )
      .select([
        'st.id AS id',
        'st.name AS name',
        'cr.certificate_or_speciality AS certificate_id',
        'st.status AS status',
        'st.created_at AS created_at',
        `ROUND((((
          SELECT
            COUNT(DISTINCT (scr.skill_checklist_module_id))::FLOAT
          FROM
            skill_checklist_response scr
          WHERE
            scr.skill_checklist_module_id IN (
              SELECT
                "sm"."id"
              FROM
                "skill_checklist_module" "sm"
              WHERE
                "sm"."skill_checklist_template_id" = "st"."id"
                AND "sm"."deleted_at" IS NULL
            ))
        / (
          SELECT
            COUNT(DISTINCT(scm.id))::FLOAT
          FROM skill_checklist_module scm
            WHERE
              scm.skill_checklist_template_id = "st"."id"
              AND scm.deleted_at IS NULL)
          ) * 100)::NUMERIC, 2)::DOUBLE PRECISION AS overall_progress`,
        `JSON_AGG(json_build_object('id', sm.id, 'topic_name', sm.name, 'order', sm.order, 'sub_topic',
          (SELECT
            JSON_AGG(json_build_object('id', ssm.id, 'topic_name', ssm.name, 'questions',
              (SELECT
                JSON_AGG(JSON_BUILD_OBJECT('id', sq.id, 'question', sq.question, 'order', sq.order, 'answer', sr.answer))
              FROM skill_checklist_question sq
                LEFT JOIN skill_checklist_response sr
                  ON sr.skill_checklist_question_id = sq.id
                  AND sr.provider_id = '${user?.id}'
                WHERE sq.skill_checklist_sub_module_id = ssm.id
                AND sq.deleted_at IS NULL)))
            FROM skill_checklist_sub_module ssm WHERE ssm.skill_checklist_module_id = sm.id AND ssm.deleted_at IS NULL), 'section_progress',
          ROUND((((SELECT
							COUNT(DISTINCT (ss.id))
						FROM
							skill_checklist_response scr
							LEFT JOIN skill_checklist_sub_module ss ON ss.skill_checklist_module_id = sm.id
							AND ss.skill_checklist_module_id = scr.skill_checklist_module_id
            )
          / (SELECT
							COUNT(DISTINCT (ss.id))
						FROM
							skill_checklist_sub_module ss
						WHERE
							ss.skill_checklist_module_id = sm.id)) * 100)::NUMERIC, 2)::DOUBLE PRECISION )) AS skill_checklist_module`,
      ])
      .where(
        `cr.certificate_or_speciality @> :certificate_id AND st.status = :status`,
        {
          certificate_id: [user?.certificate?.id],
          status: DEFAULT_STATUS.active,
        },
      )
      .groupBy('st.id, cr.certificate_or_speciality');

    const data = await queryBuilder.getRawMany();

    return data;
  }

  async getMyPerformance(provider: Provider) {
    const [data] = await this.providerAnalyticsRepository.query(
      `SELECT * FROM provider_performance WHERE id = $1 LIMIT 1`,
      [provider.id],
    );

    const performanceVariation = await this.getPerformanceVariation(
      provider.id,
    );

    return {
      ...plainToInstance(ProviderAnalytics, data),
      ...performanceVariation,
    };
  }

  async getProviderPerformance(provider: Provider, facilityId?: string) {
    const [data] = await this.providerAnalyticsRepository.query(
      `SELECT * FROM provider_performance WHERE id = $1 LIMIT 1`,
      [provider.id],
    );

    const performanceVariation = await this.getPerformanceVariation(
      provider.id,
      facilityId,
    );

    const values = [
      Number(data.late_shift_ratio ?? 0),
      Number(data.evaluation_rating ?? 0),
      Number(data.show_rate ?? 0),
      Number(data.experience ?? 0),
      Number(data.cancellation_rate ?? 0),
      Number(data.preferred_rate ?? 0),
    ];

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    data.average_performance = Number(average.toFixed(2));

    return {
      ...plainToInstance(ProviderAnalytics, data),
      ...performanceVariation,
    };
  }

  async getPerformanceVariation(providerId: string, facilityId?: string) {
    const [[variation = {}], [cancellationRate = {}], [preferredRate = {}]] =
      await Promise.all([
        this.providerRepository.query(
          `SELECT * FROM shift_weekly_variation WHERE id = $1 LIMIT 1`,
          [providerId],
        ),
        this.providerRepository.query(
          `SELECT * FROM cancellation_variation WHERE id = $1 LIMIT 1`,
          [providerId],
        ),
        this.providerRepository.query(
          `SELECT * FROM preferred_rate_variation WHERE provider_id = $1 LIMIT 1`,
          [providerId],
        ),
      ]);

    const evaluation = await this.getEvaluationVariation(
      providerId,
      facilityId,
    );

    const result = {
      show_rate_variation: Number(
        (variation.show_rate_variation ?? 0).toFixed(2),
      ),
      late_shift_variation: Number((variation.late_variation ?? 0).toFixed(2)),
      experience_variation: Number(
        (variation.experience_variation ?? 0).toFixed(2),
      ),
      preferred_rate_variation: Number(
        (preferredRate.preferred_rate_variation ?? 0).toFixed(2),
      ),
      cancellation_rate_variation: Number(
        (cancellationRate.cancellation_variation ?? 0).toFixed(2),
      ),
      evaluation_rate_variation: Number(
        (evaluation?.evaluation_rate_variation ?? 0).toFixed(2),
      ),
    };
    return result;
  }

  async getEvaluationVariation(providerId: string, facilityId?: string) {
    const queryBuilder = this.providerEvaluationRepository
      .createQueryBuilder('pe')
      .select([
        'pe.id',
        'pe.provider_id AS id',
        'ROUND(((SUM(value)::FLOAT / 4)::NUMERIC / 5)::NUMERIC, 2)::DOUBLE PRECISION * 100.0 AS evaluation_rating',
      ])
      .leftJoin('pe.evaluation_response', 'er')
      .where('pe.provider_id = :providerId', { providerId });

    if (facilityId) {
      queryBuilder.andWhere('pe.facility_id = :facilityId', { facilityId });
    }

    queryBuilder
      .orderBy('pe.created_at', 'DESC')
      .groupBy('pe.id, pe.provider_id');

    const latestEvaluation = await queryBuilder.getRawOne();
    const previousEvaluation = await queryBuilder.offset(1).getRawOne();

    const rating = { id: providerId, evaluation_rate_variation: 0 };
    const prev = previousEvaluation?.evaluation_rating ?? 0;
    const latest = latestEvaluation?.evaluation_rating ?? 0;

    rating.evaluation_rate_variation = prev
      ? ((latest - prev) / prev) * 100
      : latest;

    return rating;
  }

  async getProviderNotificationSettings(id: string) {
    const data = await this.providerNotificationSettingRepository.find({
      where: { provider: { id } },
      order: { order_by: 'ASC' },
    });
    return plainToInstance(ProviderNotificationSetting, data);
  }

  async updateProviderNotificationSettings(
    id: string,
    updateProviderNotificationSettingDto: UpdateProviderNotificationSettingDto,
  ) {
    const updates =
      updateProviderNotificationSettingDto.provider_notification_setting;
    if (!updates?.length) return [];
    await this.providerNotificationSettingRepository.save(updates);
    const updateResult = await this.providerNotificationSettingRepository.find({
      where: { provider: { id } },
      order: { order_by: 'ASC' },
    });
    return plainToInstance(ProviderNotificationSetting, updateResult);
  }

  async getProviderAvailability(id?: string) {
    const query = this.providerAvailabilityRepository
      .createQueryBuilder('pa')
      .select([
        'pa.id AS id',
        'pa.created_at AS created_at',
        'pa.availability_type AS availability_type',
        'pa.day AS day',
        "TO_CHAR(pa.date, 'YYYY-MM-DD') AS date",
        'pa.status AS status',
        'pa.shift_time AS shift_time',
        'pa.order AS "order"',
        `(pa.shift_time::jsonb @> '{"A":true,"D":true,"E":true,"N":true,"P":true}'::jsonb) AS all_shift`,
      ]);
    if (id) {
      query.where('pa.provider_id = :providerId', { providerId: id });
    } else {
      query.where('pa.provider_id IS NULL');
    }
    query.orderBy('pa.availability_type', 'ASC').addOrderBy('pa.order', 'ASC');
    const result = await query.getRawMany();
    return result;
  }

  async addUpdateProviderAvailability(
    availabilityStatusDTO: AvailabilityStatusDTO[],
    req: IRequest,
  ): Promise<ProviderAvailability[]> {
    const results = [];
    for (const available of availabilityStatusDTO) {
      const existingStatus = await this.providerAvailabilityRepository.findOne({
        where: {
          provider: { id: req.user.id },
          day: available.day,
          availability_type: available.availability_type,
        },
      });
      available.provider = req.user.id;
      available.created_at_ip = req.ip;
      available.updated_at_ip = req.ip;

      if (existingStatus) {
        // Update existing availability

        await this.providerAvailabilityRepository.update(
          existingStatus.id,
          available as any,
        );
        const updatedRecord = await this.providerAvailabilityRepository.findOne(
          {
            where: { id: existingStatus.id },
          },
        );
        results.push(updatedRecord);
      } else {
        // Create new availability
        const newStatus = await this.providerAvailabilityRepository.save(
          available as any,
        );
        results.push(newStatus);
      }
    }

    return results;
  }

  async shiftTimeLabels() {
    const shiftTimeLabels = await this.timeLabelRepository.find({
      where: { is_active: true },
      select: {
        id: true,
        label: true,
        time_code: true,
        created_at: true,
      },
      order: { created_at: 'ASC' },
    });
    return plainToInstance(TimeLabelSetting, shiftTimeLabels);
  }

  async downloadUrl(filename: string) {
    const url = await s3GetFile(filename);
    return url;
  }

  async getProviderListForAdmin(
    filterProviderListDto: FilterProviderListForAdminDto,
  ) {
    const {
      type,
      search,
      order,
      limit,
      offset,
      email,
      provider,
      city,
      state,
      zip_code,
      certificate = [],
      speciality = [],
      status = [],
      verification_status = [],
      referred_by,
      last_login = {},
      created_at = {},
      updated_at = {},
      first_work_date = {},
      last_paid_date = {},
    } = filterProviderListDto;

    const and: string[] = [];
    const orderArr: string[] = [];

    let query = `SELECT * FROM view_provider_list_admin`;
    let countQuery = `SELECT COUNT(*)::INTEGER FROM view_provider_list_admin`;

    if (search) {
      const parsedSearch = parseSearchKeyword(search);
      if (parsedSearch) {
        and.push(
          `(name ILIKE '%${parsedSearch}%' OR email ILIKE '%${parsedSearch}%' OR city ILIKE '%${parsedSearch}%' OR state ILIKE '%${parsedSearch}%' OR zip_code ILIKE '%${parsedSearch}%')`,
        );
      }
    }

    if (city && parseSearchKeyword(city)) {
      and.push(`city ILIKE '%${parseSearchKeyword(city)}%'`);
    }

    if (state && parseSearchKeyword(state)) {
      and.push(`state ILIKE '%${parseSearchKeyword(state)}%'`);
    }

    if (zip_code && parseSearchKeyword(zip_code)) {
      and.push(`zip_code ILIKE '%${parseSearchKeyword(zip_code)}%'`);
    }

    if (referred_by) {
      and.push(`referred_by->>'id' = '${referred_by}'`);
    }

    if (email && parseSearchKeyword(email)) {
      and.push(`email ILIKE '%${parseSearchKeyword(email)}%'`);
    }

    const arrayFilters = [
      { arr: certificate, col: 'certificate_id' },
      { arr: speciality, col: 'speciality_id' },
      { arr: status, col: 'status_id' },
      { arr: verification_status, col: 'verification_status' },
    ];

    arrayFilters.forEach(({ arr, col }) => {
      if (arr.length) {
        and.push(`${col} IN (${arr.map((v) => `'${v}'`).join(',')})`);
      }
    });

    [
      { filter: last_login, column: 'last_login' },
      { filter: created_at, column: 'created_at' },
      { filter: updated_at, column: 'updated_at' },
      { filter: first_work_date, column: 'first_work_date' },
      { filter: last_paid_date, column: 'last_paid_date' },
    ].forEach(({ filter, column }) => {
      if (filter && Object.keys(filter).length > 0) {
        Object.entries(filter).forEach(([key, value]) => {
          if (key === 'from_date') {
            and.push(`TO_CHAR(${column}, 'YYYY-MM-DD') >= '${value}'`);
          }
          if (key === 'to_date') {
            and.push(`TO_CHAR(${column}, 'YYYY-MM-DD') <= '${value}'`);
          }
        });
      }
    });

    if (type === 'applicant') {
      and.push(
        `status = '${applicant}' AND certificate_id IS NOT NULL AND speciality_id IS NOT NULL`,
      );
    } else {
      and.push(`status != '${applicant}'`);
    }

    if (provider) {
      and.push(`id = '${provider}'`);
    }

    if (and.length) {
      query += ` WHERE ${and.join(' AND ')}`;
      countQuery += ` WHERE ${and.join(' AND ')}`;
    }

    Object.keys(order).forEach((key) => {
      if (key === 'referred_by.name') {
        orderArr.push(`(referred_by->>'name') ${order[key]}`);
      } else if (order[key]) {
        orderArr.push(`${key} ${order[key]}`);
      }
    });

    if (orderArr.length) query += ` ORDER BY ${orderArr.join(', ')}`;

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const data = await this.providerRepository.query(query);
    const countData = await this.providerRepository.query(countQuery);
    const count = countData[0]?.count || 0;

    return [data, count];
  }

  async getProviderDetailForAdmin(id: string) {
    const data = await this.providerRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.certificate', 'c')
      .leftJoinAndSelect('p.speciality', 'sp')
      .leftJoinAndSelect('p.address', 'a')
      .leftJoinAndSelect('p.status', 's')
      .leftJoin('p.credentials', 'pc')
      .leftJoinAndSelect('p.reason', 'r')
      .addSelect([
        'pc.id AS id',
        'pc.name AS name',
        `TO_CHAR(pc.issue_date, 'MM-DD-YYYY') AS issue_date`,
        `TO_CHAR(pc.expiry_date, 'MM-DD-YYYY') AS expiry_date`,
        `(CASE
          WHEN pc.expiry_date::date = CURRENT_DATE THEN 1
          ELSE (pc.expiry_date::date - CURRENT_DATE)
        END) AS days_remaining`,
      ])
      .select([
        'p.id',
        'p.first_name',
        'p.middle_name',
        'p.last_name',
        'p.base_url',
        'p.profile_image',
        'p.verification_status',
        's.id',
        's.name',
        'p.email',
        'p.country_code',
        'p.mobile_no',
        'p.birth_date',
        'c.id',
        'c.name',
        'c.abbreviation',
        'sp.id',
        'sp.name',
        'sp.abbreviation',
        'a.id',
        'a.street',
        'a.apartment',
        'a.city',
        'a.state',
        'a.zip_code',
        'a.country',
        'r.reason',
        'p.reason_description',
      ])
      .where(`p.id = :id`, {
        id: id,
      })
      .getOne();
    return plainToInstance(Provider, data);
  }

  async findNearbyAtCentroid(
    centroid: { lat: number; lng: number },
    query: LocationMapDto,
  ): Promise<{ providers: any[]; facilities: any[] }> {
    const result = await this.providerRepository.query(
      'SELECT find_nearby_at_centroid($1, $2, $3, $4, $5, $6) AS nearby',
      [
        centroid ? centroid.lat : null,
        centroid ? centroid.lng : null,
        query.radius ?? null,
        query.status?.length ? query.status : null,
        query.certificate_id?.length ? query.certificate_id : null,
        query.facility_status?.length ? query.facility_status : null,
      ],
    );

    const nearby = result?.[0]?.nearby ?? {
      providers: [],
      facilities: [],
    };

    return {
      radius: query.radius,
      zip_code: query.zip_code,
      ...nearby,
    };
  }

  async getProviderBasicInfo(iquery: EntityDetailsDto) {
    const { id, type, start_date, end_date } = iquery;
    const query = await this.providerRepository.query(
      `SELECT get_entity_details($1, $2, $3, $4) as details`,
      [id, type, start_date, end_date],
    );
    return query[0]?.details || null;
  }
}
