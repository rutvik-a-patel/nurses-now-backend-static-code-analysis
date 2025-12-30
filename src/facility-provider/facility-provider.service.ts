import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilityProvider } from './entities/facility-provider.entity';
import {
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  IsNull,
  Repository,
} from 'typeorm';
import {
  FilterFacilityProviderDto,
  FilterFacilityProviderWithStaffDto,
} from './dto/filter-facility-provider.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { FlagDnrDto } from './dto/flag-dnr.dto';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  ADDRESS_TYPE,
  AUTO_ASSIGN,
  FACILITY_PROVIDER_FLAGS,
  SHIFT_STATUS,
  TABLE,
} from '@/shared/constants/enum';
import { Provider } from '@/provider/entities/provider.entity';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Shift } from '@/shift/entities/shift.entity';
import { UpdateFacilityProviderDto } from './dto/update-facility-provider.dto';
import { CreateFacilityProviderDto } from './dto/create-facility-provider.dto';
import { FilterShiftDto } from './dto/filter-shift.dto';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { AllShiftFilterDto } from '@/shift/dto/all-shift-filter.dto';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { IRequest } from '@/shared/constants/types';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';

@Injectable()
export class FacilityProviderService {
  constructor(
    @InjectRepository(FacilityProvider)
    private readonly facilityProviderRepository: Repository<FacilityProvider>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(CompetencyTestScore)
    private readonly competencyTestScoreRepository: Repository<CompetencyTestScore>,
    @InjectRepository(CredentialsCategory)
    private readonly credentialsCategoryRepository: Repository<CredentialsCategory>,
    @InjectRepository(EDocResponse)
    private readonly eDocResponseRepository: Repository<EDocResponse>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(CompetencyTestGlobalSetting)
    private readonly globalSettingRepository: Repository<CompetencyTestGlobalSetting>,
  ) {}

  async create(createFacilityProvider: CreateFacilityProviderDto) {
    const result = await this.facilityProviderRepository.save(
      plainToClass(FacilityProvider, createFacilityProvider),
    );
    return result;
  }

  async findOneWhere(where: FindOneOptions<FacilityProvider>) {
    const result = await this.facilityProviderRepository.findOne(where);
    return plainToInstance(FacilityProvider, result);
  }

  async flagAsDnr(
    where: FindOptionsWhere<FacilityProvider>,
    flagDnrDto: FlagDnrDto,
  ) {
    const result = await this.facilityProviderRepository.update(where, {
      flag: FACILITY_PROVIDER_FLAGS.dnr,
      ...flagDnrDto,
    });
    return result;
  }

  async updateWhere(
    where: FindOptionsWhere<FacilityProvider>,
    updateFacilityProviderDto: UpdateFacilityProviderDto,
  ) {
    const result = await this.facilityProviderRepository.update(
      where,
      plainToInstance(FacilityProvider, updateFacilityProviderDto),
    );
    return result;
  }

  async countOfShiftsWorked(
    providerId: string,
    facilityId: string,
  ): Promise<boolean> {
    const count = await this.shiftRepository.count({
      where: {
        provider: { id: providerId },
        status: SHIFT_STATUS.completed,
        facility: { id: facilityId },
      },
    });
    return count > 0;
  }

  async getAll(
    filterFacilityProviderDto: FilterFacilityProviderDto,
    id: string,
  ): Promise<[FacilityProvider[], number]> {
    const queryBuilder =
      this.facilityProviderRepository.createQueryBuilder('fp');

    queryBuilder
      .innerJoin('fp.provider', 'p')
      .leftJoin('p.certificate', 'c')
      .leftJoin('p.speciality', 'sp')
      .leftJoin('p.shift', 's')
      .leftJoin('fp.facility', 'f')
      .select([
        'fp.id AS id',
        `CASE
            WHEN fp.dnr_at IS NOT NULL THEN 'dnr'
            WHEN fp.self_dnr_at IS NOT NULL THEN 'self'
            ELSE fp.flag
          END AS flag`,
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id',"dnr".id, 'reason', "dnr".reason, 'reason_type', "dnr".reason_type, 'description', "fp".dnr_description)) AS dnr
         FROM unnest(fp.dnr_reason) AS "dnr_reason"
         JOIN "dnr_reason" dnr ON "dnr".id = "dnr_reason") AS dnr_reason`,
        'fp.created_at AS created_at',
        `jsonb_build_object(
          'id', p.id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'nick_name', p.nick_name,
          'middle_name', p.middle_name,
          'base_url', p.base_url,
          'profile_image', p.profile_image,
          'email', p.email,
          'mobile_no', p.mobile_no
        ) AS provider`,
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
        `(SELECT COUNT(s2.id)::INTEGER
          FROM shift s2
          WHERE s2.provider_id = p.id AND s2.facility_id = :facilityId AND s2.status IN ('un_submitted', 'completed')
        ) AS shifts_worked`,
        `(SELECT MAX(s2.start_date)
          FROM shift s2
          WHERE s2.provider_id = p.id AND s2.facility_id = :facilityId
            AND s2.status IN ('un_submitted', 'completed')
        ) AS last_scheduled`,
        `(SELECT MIN(s2.start_date)
          FROM shift s2
          WHERE s2.provider_id = p.id AND s2.facility_id = :facilityId
            AND s2.status = '${SHIFT_STATUS.scheduled}'
        ) AS next_scheduled`,
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
      .where(`f.id = :facilityId`)
      .setParameter('facilityId', id)
      .groupBy('fp.id, p.id, c.id, sp.id');

    if (filterFacilityProviderDto?.search) {
      queryBuilder.andWhere(
        `(p.first_name ILIKE :search OR p.last_name ILIKE :search OR p.first_name || ' ' || p.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(filterFacilityProviderDto.search)}%` },
      );
    }

    // This search will be used to search staff specifically
    if (filterFacilityProviderDto.staff) {
      queryBuilder.andWhere(
        `(p.first_name ILIKE :search OR p.last_name ILIKE :search OR p.first_name || ' ' || p.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(filterFacilityProviderDto.staff)}%` },
      );
    }
    if (filterFacilityProviderDto.start_date) {
      queryBuilder.andWhere(
        `TO_CHAR(p.created_at, 'YYYY-MM-DD') >= :start_date`,
        {
          start_date: filterFacilityProviderDto.start_date,
        },
      );
    }

    if (filterFacilityProviderDto.end_date) {
      queryBuilder.andWhere(
        `TO_CHAR(p.created_at, 'YYYY-MM-DD') <= :end_date`,
        {
          end_date: filterFacilityProviderDto.end_date,
        },
      );
    }

    if (
      filterFacilityProviderDto.certificate &&
      filterFacilityProviderDto.certificate.length
    ) {
      queryBuilder.andWhere('c.id IN (:...certificateIds)', {
        certificateIds: filterFacilityProviderDto.certificate,
      });
    }

    if (
      filterFacilityProviderDto.speciality &&
      filterFacilityProviderDto.speciality.length
    ) {
      queryBuilder.andWhere('sp.id IN (:...specialityIds)', {
        specialityIds: filterFacilityProviderDto.speciality,
      });
    }

    if (
      filterFacilityProviderDto.flag &&
      filterFacilityProviderDto.flag.length
    ) {
      queryBuilder.andWhere('fp.flag IN (:...flags)', {
        flags: filterFacilityProviderDto.flag,
      });
    }

    if (filterFacilityProviderDto.provider) {
      queryBuilder.andWhere('p.id = :providerId', {
        providerId: filterFacilityProviderDto.provider,
      });
    }

    const dateFilters = [
      {
        filter: filterFacilityProviderDto.last_scheduled,
        expr: `(SELECT MAX(TO_CHAR(s2.start_date, 'YYYY-MM-DD'))
            FROM shift s2
            WHERE s2.provider_id = p.id
              AND s2.status IN ('un_submitted','completed'))`,
        prefix: 'ls',
      },
      {
        filter: filterFacilityProviderDto.next_scheduled,
        expr: `(SELECT MIN(TO_CHAR(s3.start_date, 'YYYY-MM-DD'))
            FROM shift s3
            WHERE s3.provider_id = p.id
              AND s3.status = '${SHIFT_STATUS.scheduled}')`,
        prefix: 'ns',
      },
    ];

    dateFilters.forEach(({ filter, expr, prefix }) => {
      if (!filter) return;
      if (filter.from_date) {
        queryBuilder.andWhere(`${expr} >= :${prefix}_from`, {
          [`${prefix}_from`]: filter.from_date,
        });
      }
      if (filter.to_date) {
        queryBuilder.andWhere(`${expr} <= :${prefix}_to`, {
          [`${prefix}_to`]: filter.to_date,
        });
      }
    });

    if (filterFacilityProviderDto.order) {
      Object.keys(filterFacilityProviderDto.order).forEach((key) => {
        if (key === 'flag') {
          key = `flag::character varying`;
          filterFacilityProviderDto.order[key] =
            filterFacilityProviderDto.order['flag'];
        }
        queryBuilder.addOrderBy(
          `${key}`,
          filterFacilityProviderDto.order[key],
          'NULLS LAST',
        );
      });
    }

    queryBuilder
      .limit(+filterFacilityProviderDto.limit)
      .offset(+filterFacilityProviderDto.offset);

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async getProviderSummary(id: string) {
    const queryBuilder = this.providerRepository.createQueryBuilder('p');

    queryBuilder
      .leftJoin('p.certificate', 'c')
      .leftJoin('p.address', 'a', 'a.type = :addressType', {
        addressType: ADDRESS_TYPE.default,
      })
      .select([
        'p.id AS id',
        'p.first_name AS first_name',
        'p.last_name AS last_name',
        'p.middle_name AS middle_name',
        'p.nick_name AS nick_name',
        'p.base_url AS base_url',
        'p.profile_image AS profile_image',
        'p.email AS email',
        'p.country_code AS country_code',
        'p.mobile_no AS mobile_no',
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation,
          'text_color', c.text_color, 
          'background_color', c.background_color
        ) AS certificate`,
        `jsonb_build_object(
          'id', a.id,
          'street', a.street,
          'apartment', a.apartment,
          'zip_code', a.zip_code,
          'latitude', a.latitude,
          'longitude', a.longitude,
          'city', a.city,
          'state', a.state
        ) AS address`,
        `((SELECT SUM(s.total_worked) 
        FROM shift s 
        WHERE s.provider_id = p.id) / 60)::INTEGER AS total_worked`,
        `((SELECT COUNT(s.id) 
        FROM shift s 
        WHERE s.provider_id = p.id AND s.status = '${SHIFT_STATUS.completed}'))::INTEGER AS shifts_completed`,
        `ROUND(
          (
            (SELECT 
              CASE 
                WHEN COUNT(s.id) = 0 THEN 0
                ELSE (COUNT(s.id) FILTER (WHERE s.clock_in IS NOT NULL AND s.clock_out IS NOT NULL)::FLOAT / COUNT(s.id)::FLOAT) * 100
              END::NUMERIC
            FROM shift s 
            WHERE s.provider_id = p.id)
            ),
            2
          )::DOUBLE PRECISION AS show_rate`,
        `ROUND(
          (
            (SELECT 
              CASE 
                WHEN COUNT(s.id) = 0 THEN 0
                ELSE (COUNT(s.id) FILTER (WHERE s.clock_in BETWEEN s.start_time - INTERVAL '10 minutes' AND s.start_time + INTERVAL '10 minutes')::FLOAT / COUNT(s.id)::FLOAT) * 100
              END::NUMERIC
            FROM shift s 
            WHERE s.provider_id = p.id AND s.status IN ('${SHIFT_STATUS.completed}', '${SHIFT_STATUS.un_submitted}'))
            ),
            2
          )::DOUBLE PRECISION AS on_time_rate`,
      ])
      .where(`p.id = '${id}'`);

    const result = queryBuilder.getRawOne();
    return result;
  }

  async findProviderDetails(where: FindOneOptions<Provider>) {
    const result = await this.providerRepository.findOne(where);
    return plainToInstance(Provider, result);
  }

  async getProviderDetails(id: string, facility_id: string) {
    const data = await this.providerRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.certificate', 'certificate')
      .leftJoinAndSelect('p.speciality', 'speciality')
      .leftJoinAndSelect('p.address', 'address')
      .leftJoinAndSelect('p.facility_provider', 'fp')
      .select([
        'p.id AS id',
        'p.first_name AS first_name',
        'p.nick_name AS nick_name',
        'p.middle_name AS middle_name',
        'p.last_name AS last_name',
        'p.bio AS bio',
        'p.birth_date AS birth_date',
        'p.email AS email',
        'p.mobile_no AS mobile_no',
        'p.base_url AS base_url',
        'p.profile_image AS profile_image',
        'fp.id AS facility_provider_id',
        `CASE
            WHEN fp.dnr_at IS NOT NULL THEN 'dnr'
            WHEN fp.self_dnr_at IS NOT NULL THEN 'self'
            ELSE fp.flag
          END AS flag`,
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
      .groupBy('p.id, certificate.id, speciality.id, fp.id')
      .where(`p.id = :id AND fp.facility_id = :facility_id`, {
        id,
        facility_id,
      })
      .getRawOne();
    return plainToInstance(Provider, data);
  }

  async getScheduledCalendar(
    facilityProvider: FacilityProvider,
    start_date: string,
    end_date: string,
  ) {
    const result = await this.providerRepository.query(
      `SELECT * FROM get_provider_shifts_for_month($1, $2, $3, $4)`,
      [
        facilityProvider.provider.id,
        facilityProvider.facility.id,
        start_date,
        end_date,
      ],
    );

    return result;
  }

  async getScheduledCalendarForAdmin(
    provider: Provider,
    start_date: string,
    end_date: string,
  ) {
    const result = await this.providerRepository.query(
      `SELECT * FROM get_provider_shifts_for_month_admin($1, $2, $3)`,
      [provider.id, start_date, end_date],
    );

    return result;
  }

  async getShiftHistory(
    facilityProvider: FacilityProvider,
    queryParamsDto: AllShiftFilterDto,
  ): Promise<[Shift[], number]> {
    const queryBuilder = this.shiftRepository.createQueryBuilder('s');

    queryBuilder
      .leftJoin('s.facility', 'f')
      .leftJoin('f.facility_type', 'ft')
      .leftJoin(
        'admin',
        'created_by_admin',
        's.created_by_id = created_by_admin.id AND s.created_by_type = :createdAdminType',
        { createdAdminType: TABLE.admin },
      )
      .leftJoin(
        'facility',
        'created_by_facility',
        's.created_by_id = created_by_facility.id AND s.created_by_type = :createdFacilityType',
        { createdFacilityType: TABLE.facility },
      )
      .leftJoin(
        'facility_user',
        'created_by_facility_user',
        's.created_by_id = created_by_facility_user.id AND s.created_by_type = :createdFacilityUserType',
        { createdFacilityUserType: TABLE.facility_user },
      )
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.shift_type AS shift_type',
        's.updated_at AS updated_at',
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `s.status AS status`,
        `s.description AS description`,
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
        `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
        's.created_at AS created_at',
        's.temp_conf_at AS temp_conf_at',
        's.client_conf_at AS client_conf_at',
        `get_shift_time_code(s.start_time, s.end_time, s.facility_id) AS shift_time_code`,
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'facility_type', ft.name
        ) AS facility`,
        `CASE
          WHEN s.created_by_type = 'admin' THEN jsonb_build_object('id', created_by_admin.id, 'name', created_by_admin.first_name || ' ' || created_by_admin.last_name, 'image', created_by_admin.image, 'base_url', created_by_admin.base_url)
          WHEN s.created_by_type = 'facility' THEN jsonb_build_object('id', created_by_facility.id, 'name', created_by_facility.name, 'image', created_by_facility.image, 'base_url', created_by_facility.base_url)
          WHEN s.created_by_type = 'facility_user' THEN jsonb_build_object('id', created_by_facility_user.id, 'name', created_by_facility_user.first_name || ' ' || created_by_facility_user.last_name, 'image', created_by_facility_user.image, 'base_url', created_by_facility_user.base_url)
          ELSE NULL
        END AS created_by`,
      ])
      .where(`s.provider_id = '${facilityProvider.provider.id}'`)
      .andWhere(`s.facility_id = '${facilityProvider.facility.id}'`);

    if (queryParamsDto.status) {
      queryBuilder.andWhere('s.status IN (:...status)', {
        status: queryParamsDto.status,
      });
    } else {
      queryBuilder.andWhere('s.status IN (:...status)', {
        status: [
          SHIFT_STATUS.completed,
          SHIFT_STATUS.cancelled,
          SHIFT_STATUS.un_submitted,
        ],
      });
    }
    if (queryParamsDto.start_date) {
      queryBuilder.andWhere(
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') >= :start_date`,
        {
          start_date: queryParamsDto.start_date,
        },
      );
    }
    ///need to add provider cancelled shift
    if (queryParamsDto.end_date) {
      queryBuilder.andWhere(
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') <= :end_date`,
        {
          end_date: queryParamsDto.end_date,
        },
      );
    }

    if (queryParamsDto.order) {
      Object.keys(queryParamsDto.order).forEach((key) => {
        if (key === 'created_by') {
          // Order by created_by's first_name or name dynamically based on created_by_type
          queryBuilder.addOrderBy(
            `CASE
          WHEN s.created_by_type = 'admin' THEN created_by_admin.first_name
          WHEN s.created_by_type = 'facility' THEN created_by_facility.name
          WHEN s.created_by_type = 'facility_user' THEN created_by_facility_user.first_name
          ELSE NULL
        END`,
            queryParamsDto.order[key],
          );
        } else {
          queryBuilder.addOrderBy(`${key}`, queryParamsDto.order[key]);
        }
      });
    }
    queryBuilder.limit(+queryParamsDto.limit).offset(+queryParamsDto.offset);
    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async getShiftHistoryForAdminPortal(
    id: string,
    queryParamsDto: AllShiftFilterDto,
  ): Promise<[Shift[], number]> {
    const queryBuilder = this.shiftRepository.createQueryBuilder('s');

    queryBuilder
      .leftJoin('s.facility', 'f')
      .leftJoin('f.facility_type', 'ft')
      .leftJoin(
        'admin',
        'created_by_admin',
        's.created_by_id = created_by_admin.id AND s.created_by_type = :createdAdminType',
        { createdAdminType: TABLE.admin },
      )
      .leftJoin(
        'facility',
        'created_by_facility',
        's.created_by_id = created_by_facility.id AND s.created_by_type = :createdFacilityType',
        { createdFacilityType: TABLE.facility },
      )
      .leftJoin(
        'facility_user',
        'created_by_facility_user',
        's.created_by_id = created_by_facility_user.id AND s.created_by_type = :createdFacilityUserType',
        { createdFacilityUserType: TABLE.facility_user },
      )
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.shift_type AS shift_type',
        's.updated_at AS updated_at',
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `s.status AS status`,
        `s.description AS description`,
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date`,
        `TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date`,
        's.created_at AS created_at',
        's.temp_conf_at AS temp_conf_at',
        's.client_conf_at AS client_conf_at',
        `get_shift_time_code(s.start_time, s.end_time, s.facility_id) AS shift_time_code`,
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'facility_type', ft.name
        ) AS facility`,
        `CASE
          WHEN s.created_by_type = 'admin' THEN jsonb_build_object('id', created_by_admin.id, 'name', created_by_admin.first_name || ' ' || created_by_admin.last_name, 'image', created_by_admin.image, 'base_url', created_by_admin.base_url)
          WHEN s.created_by_type = 'facility' THEN jsonb_build_object('id', created_by_facility.id, 'name', created_by_facility.name, 'image', created_by_facility.image, 'base_url', created_by_facility.base_url)
          WHEN s.created_by_type = 'facility_user' THEN jsonb_build_object('id', created_by_facility_user.id, 'name', created_by_facility_user.first_name || ' ' || created_by_facility_user.last_name, 'image', created_by_facility_user.image, 'base_url', created_by_facility_user.base_url)
          ELSE NULL
        END AS created_by`,
      ])
      .where(`s.provider_id = '${id}'`)
      .andWhere(`s.deleted_at IS NULL`);

    if (queryParamsDto.status) {
      queryBuilder.andWhere('s.status IN (:...status)', {
        status: queryParamsDto.status,
      });
    } else {
      queryBuilder.andWhere('s.status IN (:...status)', {
        status: [
          SHIFT_STATUS.completed,
          SHIFT_STATUS.cancelled,
          SHIFT_STATUS.un_submitted,
        ],
      });
    }
    if (queryParamsDto.start_date) {
      queryBuilder.andWhere(
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') >= :start_date`,
        {
          start_date: queryParamsDto.start_date,
        },
      );
    }
    ///need to add provider cancelled shift
    if (queryParamsDto.end_date) {
      queryBuilder.andWhere(
        `TO_CHAR(s.start_date, 'YYYY-MM-DD') <= :end_date`,
        {
          end_date: queryParamsDto.end_date,
        },
      );
    }

    if (queryParamsDto.shift_id) {
      queryBuilder.andWhere('s.shift_id ILIKE :shiftId', {
        shiftId: `%${queryParamsDto.shift_id}%`,
      });
    }

    if (queryParamsDto.created_by) {
      queryBuilder.andWhere('s.created_by_id = :createdBy', {
        createdBy: queryParamsDto.created_by,
      });
    }

    if (queryParamsDto.order) {
      Object.keys(queryParamsDto.order).forEach((key) => {
        if (key === 'created_by') {
          // Order by created_by's first_name or name dynamically based on created_by_type
          queryBuilder.addOrderBy(
            `CASE
          WHEN s.created_by_type = 'admin' THEN created_by_admin.first_name
          WHEN s.created_by_type = 'facility' THEN created_by_facility.name
          WHEN s.created_by_type = 'facility_user' THEN created_by_facility_user.first_name
          ELSE NULL
        END`,
            queryParamsDto.order[key],
          );
        } else {
          queryBuilder.addOrderBy(`${key}`, queryParamsDto.order[key]);
        }
      });
    }
    queryBuilder.limit(+queryParamsDto.limit).offset(+queryParamsDto.offset);
    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async findAllFacilities(
    id: string,
    queryParamsDto: QueryParamsDto,
  ): Promise<[FacilityProvider[], number]> {
    const queryBuilder =
      this.facilityProviderRepository.createQueryBuilder('fp');

    queryBuilder
      .leftJoin('fp.provider', 'p')
      .leftJoin('fp.facility', 'f')
      .select([
        'fp.id AS id',
        `fp.flag AS flag`,
        'fp.created_at AS created_at',
        `jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'base_url', f.base_url,
          'image', f.image,
          'house_no', f.house_no,
          'street_address', f.street_address,
          'city', f.city,
          'state', f.state,
          'country', f.country,
          'zip_code', f.zip_code
        ) AS facility`,
        `(SELECT COUNT(s2.id)::INTEGER
          FROM shift s2
          WHERE s2.provider_id = p.id AND s2.facility_id = f.id AND s2.status IN ('un_submitted', 'completed')
        ) AS shifts_worked`,
      ])
      .where(`p.id = :providerId`, { providerId: id })
      .groupBy('fp.id, f.id, p.id');

    if (queryParamsDto.order) {
      Object.keys(queryParamsDto.order).forEach((key) => {
        if (key === 'location') {
          queryBuilder.addOrderBy(
            `CONCAT(f.house_no, ' ', f.street_address, ' ', f.city, ' ', f.state, ' ', f.zip_code)`,
            queryParamsDto.order[key],
          );
        } else {
          queryBuilder.addOrderBy(`${key}`, queryParamsDto.order[key]);
        }
      });
    }

    queryBuilder.limit(+queryParamsDto.limit).offset(+queryParamsDto.offset);

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async getShifts(
    facilityId: string,
    provider: Provider,
    filterDto: FilterShiftDto,
  ): Promise<[Shift[], number]> {
    const {
      certificate = [],
      speciality = [],
      start_date = '',
      end_date = '',
      limit = 10,
      offset = 0,
      order,
    } = filterDto;

    const queryBuilder = this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.start_date AS start_date',
        's.start_time AS start_time',
        's.end_time AS end_time',
        'c.abbreviation AS certificate',
        'sp.abbreviation AS speciality',
        `get_shift_time_code(s.start_time, s.end_time, s.facility_id) AS shift_time_code`,
      ])
      .where(`s.status = 'open'`)
      .andWhere(`s.facility_id = :facilityId`, { facilityId })
      .andWhere(`s.certificate_id = :certificate`, {
        certificate: provider.certificate.id,
      });

    queryBuilder
      // availability check of the provider
      .andWhere(
        `
        EXISTS (
          SELECT 1
          FROM FN_AVAILABILITY_OF_STAFF_WITH_TEMP_PERM_MESSAGE(
            ARRAY[:providerId]::UUID[],
            ARRAY[s.start_date]::DATE[],
            s.facility_id,
            s.start_time,
            s.end_time
          ) AS f
          WHERE f.provider_id = :providerId
            AND f.d = s.start_date
            AND f.global_ok = TRUE
            AND f.profile_ok = TRUE
            AND f.time_code = GET_SHIFT_TIME_CODE(s.start_time, s.end_time, s.facility_id)
        )
      `,
        { providerId: provider.id },
      )
      // Conflict check using fn_conflicting_shifts_bulk
      .andWhere(
        `
        NOT EXISTS (
          SELECT 1
          FROM fn_conflicting_shifts_bulk(
            ARRAY[:providerId]::UUID[],
            s.facility_id,
            ARRAY[s.start_date]::DATE[],
            s.start_time,
            s.end_time
          ) AS conflict
          WHERE conflict.provider_id = :providerId
            AND conflict.start_date = s.start_date
        )
      `,
        { providerId: provider.id },
      );

    if (certificate.length) {
      queryBuilder.andWhere('c.id IN (:...certificateIds)', {
        certificateIds: certificate,
      });
    }

    if (speciality.length) {
      queryBuilder.andWhere('sp.id IN (:...specialityIds)', {
        specialityIds: speciality,
      });
    }

    if (start_date) {
      queryBuilder.andWhere('s.start_date >= :startDate', {
        startDate: new Date(start_date),
      });
    }

    if (end_date) {
      queryBuilder.andWhere('s.end_date <= :endDate', {
        endDate: new Date(end_date),
      });
    }

    if (order) {
      Object.keys(order).forEach((key) => {
        if (key.includes('.')) {
          queryBuilder.addOrderBy(`${key}`, order[key]);
        } else {
          queryBuilder.addOrderBy(`s.${key}`, order[key]);
        }
      });
    }

    queryBuilder.limit(+limit).offset(+offset);
    const shifts = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [shifts, count];
  }

  async getAllCredentials(user: Provider, search: string) {
    const credentials = await this.getAllCredentialsCategory(user, search);
    const others = await this.getAllOtherCredentialsCategory(user, search);
    const competencyTest = await this.getCompetencyTest(user, search);
    const assignedChecklist = await this.getAssignedChecklist(user, search);
    const eDocResponse = await this.getEDocResponse(user, search);

    return {
      credentials,
      others,
      competency_test: competencyTest,
      skill_checklist: assignedChecklist,
      e_doc: eDocResponse,
    };
  }

  async getAllCredentialsCategory(user: Provider, search: string) {
    let rawQuery = `
      SELECT
        vc.category_id AS id,
        vc.category_name AS name,
        JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'id', vc.credential_id,
            'name', vc.credential_name,
            'category_name', vc.category_name,
            'expiry_required', vc.expiry_required,
            'issued_required', vc.issued_required,
            'document_required', vc.document_required,
            'doc_number_required', vc.doc_number_required,
            'is_essential', vc.is_essential,
            'approval_required', vc.approval_required,
            'document_response',
              CASE
                WHEN pc.id IS NOT NULL THEN jsonb_build_object(
                  'id', pc.id,
                  'credential', vc.credential_name,
                  'base_url', pc.base_url,
                  'filename', pc.filename,
                  'original_filename', pc.original_filename,
                  'document_id', pc.document_id,
                  'license', pc.license,
                  'issue_date', pc.issue_date,
                  'expiry_date', pc.expiry_date,
                  'is_other', pc.is_other,
                  'is_verified', pc.is_verified,
                  'credential_id', pc.credential_id,
                  'days_remaining', CASE
                    WHEN pc.expiry_date::date = CURRENT_DATE THEN 1
                    ELSE (pc.expiry_date::date - CURRENT_DATE)
                  END,
                  'reason_description',
                    CASE
                      WHEN pc.is_verified = 'rejected' THEN jsonb_build_object(
                        'id', r.id,
                        'reason', r.reason,
                        'description', r.description,
                        'staff_note', p.reason_description
                      )
                      ELSE NULL
                    END
                )
                ELSE NULL
              END
          )
        ) AS credentials
      FROM view_credentials_category_with_documents vc
      LEFT JOIN LATERAL (
        SELECT *
        FROM provider_credential pc_sub
        WHERE pc_sub.credential_id = vc.credential_id AND pc_sub.provider_id = $1 AND pc_sub.deleted_at IS NULL
        ORDER BY pc_sub.created_at DESC, pc_sub.expiry_date DESC
        LIMIT 1
      ) pc ON true
      LEFT JOIN provider p ON p.id = pc.provider_id AND p.deleted_at IS NULL
      LEFT JOIN provider_reject_reason r ON r.id = p.reason_id AND r.deleted_at IS NULL
      WHERE ($2 = ANY(vc.licenses) OR $3 = ANY(vc.licenses))
        AND vc.parent_credential_id IS NULL
        AND vc.is_essential = true
        AND vc.auto_assign = $4
        AND vc.category_deleted_at IS NULL
        AND vc.credential_deleted_at IS NULL
        AND pc.id IS NOT NULL
    `;

    const parsedSearch = search ? `%${parseSearchKeyword(search)}%` : undefined;
    const params = [
      user.id,
      user.certificate.id,
      user.speciality.id,
      AUTO_ASSIGN.application_start,
    ];

    if (parsedSearch) {
      rawQuery += ` AND (vc.category_name ILIKE $5 OR vc.credential_name ILIKE $5)`;
      params.push(parsedSearch);
    }

    rawQuery += `
      GROUP BY vc.category_id, vc.category_name
      ORDER BY vc.category_id ASC
    `;

    const result = await this.credentialsCategoryRepository.query(
      rawQuery,
      params,
    );

    return result;
  }

  async getAllOtherCredentialsCategory(user: Provider, search: string) {
    let rawQuery = `
    SELECT
      vc.category_id AS id,
      vc.category_name AS name,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'id', vc.credential_id,
          'name', vc.credential_name,
          'category_name', vc.category_name,
          'expiry_required', vc.expiry_required,
          'issued_required', vc.issued_required,
          'document_required', vc.document_required,
          'doc_number_required', vc.doc_number_required,
          'is_essential', vc.is_essential,
          'approval_required', vc.approval_required,
          'document_response',
            CASE
              WHEN pc.id IS NOT NULL IS TRUE THEN jsonb_build_object(
                'id', pc.id,
                'credential', vc.credential_name,
                'base_url', pc.base_url,
                'filename', pc.filename,
                'original_filename', pc.original_filename,
                'document_id', pc.document_id,
                'license', pc.license,
                'issue_date', pc.issue_date,
                'expiry_date', pc.expiry_date,
                'days_remaining', CASE
                  WHEN pc.expiry_date::date = CURRENT_DATE THEN 1
                  ELSE (pc.expiry_date::date - CURRENT_DATE)
                END,
                'is_other', pc.is_other,
                'is_verified', pc.is_verified,
                'credential_id', pc.credential_id,
                'reason_description',
                  CASE
                    WHEN pc.is_verified = 'rejected' THEN jsonb_build_object(
                      'id', r.id,
                      'reason', r.reason,
                      'description', r.description,
                      'staff_note', p.reason_description
                    )
                    ELSE NULL
                  END
              )
              ELSE NULL
            END
        )
      ) AS credentials
    FROM view_credentials_category_with_documents vc

    INNER JOIN LATERAL (
      SELECT pc_sub.*
      FROM provider_credential pc_sub
      WHERE pc_sub.credential_id = vc.credential_id
        AND pc_sub.provider_id = $1
        AND pc_sub.deleted_at IS NULL
      ORDER BY pc_sub.created_at DESC, pc_sub.expiry_date DESC
      LIMIT 1
    ) pc ON TRUE

    LEFT JOIN provider p ON p.id = pc.provider_id AND p.deleted_at IS NULL
    LEFT JOIN provider_reject_reason r ON r.id = p.reason_id AND r.deleted_at IS NULL

    WHERE ($2 = ANY(vc.licenses) OR $3 = ANY(vc.licenses))
      AND vc.parent_credential_id IS NULL
      AND vc.is_essential = FALSE
      AND vc.auto_assign = $4
      AND vc.category_deleted_at IS NULL
      AND vc.credential_deleted_at IS NULL
  `;
    const parsedSearch = search ? `%${parseSearchKeyword(search)}%` : undefined;
    const params = [
      user.id,
      user.certificate.id,
      user.speciality.id,
      AUTO_ASSIGN.application_start,
    ];

    if (parsedSearch) {
      rawQuery += ` AND (vc.category_name ILIKE $5 OR vc.credential_name ILIKE $5)`;
      params.push(parsedSearch);
    }

    rawQuery += `
    GROUP BY vc.category_id, vc.category_name
    ORDER BY vc.category_id ASC
  `;

    const result = await this.credentialsCategoryRepository.query(
      rawQuery,
      params,
    );

    // Merge all credentials into a single object with name "Other Credentials"
    if (!result.length) return [];
    const merged = {
      id: result[0].id,
      name: 'Other Credentials',
      credentials: result.flatMap((r) => r.credentials || []),
    };
    return [merged];
  }

  async getCompetencyTest(user: Provider, search: string) {
    const parsedSearch = search ? `%${parseSearchKeyword(search)}%` : undefined;
    const result = await this.competencyTestScoreRepository.findOne({
      relations: {
        provider: true,
        competency_test_setting: { test_setting: true },
      },
      where: {
        provider: { id: user.id },
        name: parsedSearch ? ILike(parsedSearch) : undefined,
      },
      select: {
        id: true,
        name: true,
        test_status: true,
        score: true,
        updated_at: true,
        created_at: true,
        provider: { id: true, test_attempts: true },
        competency_test_setting: {
          id: true,
          test_setting: { id: true, total_attempts: true },
        },
      },
      order: { updated_at: 'DESC' },
    });

    if (!result) return [];

    if (result?.competency_test_setting?.test_setting) {
      Object.assign(result, {
        max_attempts:
          result.competency_test_setting.test_setting.total_attempts,
      });
    } else {
      const setting = await this.globalSettingRepository.findOne({
        where: {
          competency_test_setting: IsNull(),
        },
        select: { id: true, total_attempts: true },
      });

      if (setting) {
        Object.assign(result, { max_attempts: setting.total_attempts });
      }
    }

    result.score = parseFloat(result.score.toString());
    return [result];
  }

  async getAssignedChecklist(user: Provider, search: string) {
    const params = [user.id];
    const parsedSearch = search ? `%${parseSearchKeyword(search)}%` : undefined;
    let query = `SELECT * FROM view_skill_checklist_for_facility WHERE provider_id = $1`;
    if (parsedSearch) {
      query += ` AND name ILIKE $2`;
      params.push(parsedSearch);
    }
    query += ` LIMIT 1`;

    const dataArr = await this.competencyTestScoreRepository.query(
      query,
      params,
    );
    const data = dataArr[0] || null;

    if (data && Array.isArray(data.skill_checklist_module)) {
      const modules: Array<{ section_progress: number | string }> =
        data.skill_checklist_module;
      const totalSectionProgress = modules.reduce(
        (sum: number, m: { section_progress: number | string }) =>
          sum + (Number(m.section_progress) || 0),
        0,
      );
      data.score = modules.length
        ? Math.round((totalSectionProgress / modules.length) * 100) / 100
        : 0;
      delete data.skill_checklist_module;
      return data.score === 100 ? [data] : [];
    }

    return [];
  }

  async getEDocResponse(user: Provider, search: string) {
    const parsedSearch = search ? `%${parseSearchKeyword(search)}%` : undefined;

    const eDocResponse = this.eDocResponseRepository
      .createQueryBuilder('edr')
      .leftJoin('edr.e_doc', 'ed')
      .select([
        'edr.id AS id',
        'edr.base_url AS base_url',
        'edr.document AS document',
        'ed.name AS name',
        'edr.created_at AS created_at',
      ])
      .where('edr.provider_id = :id', { id: user.id });
    if (parsedSearch) {
      eDocResponse.andWhere(
        `(ed.name ILIKE :search OR edr.document ILIKE :search)`,
        {
          search: parsedSearch,
        },
      );
    }
    const data = await eDocResponse.getRawMany();

    return data;
  }

  // For logging the activity

  // Tracking the activity
  async providerActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.FACILITY_PROVIDER,
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

  // role update activity
  async providerActivityUpdateLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    includedKeys?: string[],
  ) {
    const changes = getUpdatedFields(
      oldData,
      newData,
      includedKeys, // include keys to track
      true,
    ) as string[];

    const changesList = changes as string[] | undefined;
    if (!changesList || changesList.length === 0) return;

    await this.providerActivityLog(req, entity_id, activity_type, {
      changes: changesList,
    });
  }

  async listOfFacilityStaffWorked(
    query: FilterFacilityProviderWithStaffDto,
  ): Promise<[FacilityProvider[], number]> {
    const queryBuilder = this.facilityProviderRepository
      .createQueryBuilder('fp')
      .leftJoin('fp.provider', 'p')
      .leftJoin('fp.facility', 'f')
      .select([
        'fp.id AS id',
        'fp.created_at AS created_at',
        'fp.flag::text AS flag',
        'p.id AS provider_id',
        'f.id AS facility_id',
        'f.name AS name',
        'f.base_url AS base_url',
        'f.image AS image',
        'f.house_no AS house_no',
        'f.street_address AS street_address',
        'f.city AS city',
        'f.state AS state',
        'f.country AS country',
        'f.zip_code AS zip_code',
        `(SELECT COUNT(s2.id)::INTEGER
          FROM shift s2
          WHERE s2.provider_id = p.id AND s2.facility_id = f.id AND s2.status IN ('completed')
        ) AS shifts_worked`,
      ])
      .andWhere(
        `EXISTS (
          SELECT 1
          FROM shift s3
          WHERE s3.provider_id = p.id AND s3.facility_id = f.id AND s3.status IN ('completed')
        )`,
      );

    if (query.provider_id && query.provider_id.length) {
      queryBuilder.andWhere('fp.provider_id IN (:...provider_ids)', {
        provider_ids: query.provider_id,
      });
    }

    if (query.facility_id && query.facility_id.length) {
      queryBuilder.andWhere('fp.facility_id IN (:...facility_ids)', {
        facility_ids: query.facility_id,
      });
    }

    if (query.location) {
      queryBuilder.andWhere(
        `COALESCE(f.house_no, '') || ' ' || COALESCE(f.street_address, '') || ' ' || COALESCE(f.city, '') || ' ' || COALESCE(f.state, '') || ' ' || COALESCE(f.zip_code, '') ILIKE :location`,
        { location: `%${parseSearchKeyword(query.location)}%` },
      );
    }

    if (query.order) {
      Object.keys(query.order).forEach((key) => {
        if (key === 'location') {
          queryBuilder.addOrderBy(
            `COALESCE(f.house_no, '') || ' ' || COALESCE(f.street_address, '') || ' ' || COALESCE(f.city, '') || ' ' || COALESCE(f.state, '') || ' ' || COALESCE(f.zip_code, '')`,
            query.order[key],
          );
        } else {
          queryBuilder.addOrderBy(`${key}`, query.order[key]);
        }
      });
    }

    if (+query.limit > 0) {
      queryBuilder.limit(+query.limit);
    }
    if (+query.offset > 0) {
      queryBuilder.offset(+query.offset);
    }
    const data = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [plainToInstance(FacilityProvider, data), count];
  }
}
