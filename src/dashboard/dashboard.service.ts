import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Shift } from '@/shift/entities/shift.entity';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import {
  AUTO_ASSIGN,
  DEFAULT_STATUS,
  SHIFT_STATUS,
} from '@/shared/constants/enum';
import * as moment from 'moment';
import { SkillChecklistModuleService } from '@/skill-checklist-module/skill-checklist-module.service';
import { Credential } from '@/credentials/entities/credential.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { FilterEarningsDto } from './dto/filter-earnings.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(ProviderCredential)
    private readonly providerCredentialRepository: Repository<ProviderCredential>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    private readonly skillChecklistModuleService: SkillChecklistModuleService,
    @InjectRepository(Credential)
    private readonly credentialsRepository: Repository<Credential>,
    @InjectRepository(EDocResponse)
    private readonly eDocResponseRepository: Repository<EDocResponse>,
    @InjectRepository(EDoc)
    private readonly eDocRepository: Repository<EDoc>,
  ) {}

  async findOneProviderWhere(where: FindOneOptions<Provider>) {
    const result = await this.providerRepository.findOne(where);
    return plainToInstance(Provider, result);
  }

  async getProviderCredentialsSummary(
    provider: Provider,
    queryParamsDto: QueryParamsDto,
  ): Promise<[ProviderCredential[], number]> {
    const queryBuilder = this.providerCredentialRepository
      .createQueryBuilder('c')
      .distinctOn(['c.credential_id'])
      .select([
        'c.id AS id',
        'c.name AS name',
        'c.filename AS filename',
        'c.license AS license',
        `TO_CHAR(c.issue_date, 'YYYY-MM-DD') AS issue_date`,
        `TO_CHAR(c.expiry_date, 'YYYY-MM-DD') AS expiry_date`,
        'c.credential_id AS credential_id',
        `CASE
          WHEN c.expiry_date < CURRENT_DATE THEN true
          ELSE false
        END AS is_expired`,
      ])
      .where('c.provider_id = :providerId', { providerId: provider.id })
      .andWhere(`c.expiry_date <= CURRENT_DATE + INTERVAL '1 month'`)
      .andWhere(
        `NOT EXISTS (
        SELECT 1 FROM provider_credential pc2
        WHERE pc2.previous_document_id = c.id
      )`,
      )
      .orderBy('c.credential_id', 'ASC') // required for DISTINCT ON
      .addOrderBy('c.expiry_date', 'DESC') // tie-breaker (keep latest)
      .limit(+queryParamsDto.limit)
      .offset(+queryParamsDto.offset);

    const list = await queryBuilder.getRawMany();
    const count = await this.providerCredentialRepository
      .createQueryBuilder('c')
      .where('c.provider_id = :providerId', { providerId: provider.id })
      .andWhere(`c.expiry_date <= CURRENT_DATE + INTERVAL '1 month'`)
      .andWhere(
        `
          NOT EXISTS (
            SELECT 1 FROM provider_credential pc2
            WHERE pc2.previous_document_id = c.id
          )
        `,
      )
      .getCount();

    return [list, count];
  }

  async getOngoingShiftSummary(provider: Provider) {
    const queryBuilder = this.shiftRepository.createQueryBuilder('s');
    const result = await queryBuilder
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.shift_type AS shift_type',
        's.status AS status',
        `s.clock_in AS clock_in`,
        `s.clock_out AS clock_out`,
        `TO_CHAR(s.break_start_date, 'YYYY-MM-DD') AS break_start_date`,
        `s.break_start_time AS break_start_time`,
        `s.break_end_time AS break_end_time`,
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `case when set.id is not null then set.geo_fence_radius else 50 end as geo_fence_radius`,
        `s.total_worked::INTEGER AS total_worked`,
        `s.break_duration::INTEGER AS break_duration`,
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
        `TO_CHAR(s.start_date, 'Day') AS day_of_week`,
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
          'facility_type', ft.name,
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
        `ROUND((SELECT (
          ST_DistanceSphere(
            ST_MakePoint(${provider.address[0].longitude}, ${provider.address[0].latitude}),
            ST_MakePoint(f.longitude, f.latitude)
          ) / 1609.34
        ))::NUMERIC, 2) AS distance_in_miles`,
      ])
      .leftJoin('s.facility', 'f')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .leftJoin('f.facility_type', 'ft')
      .leftJoin('f.time_entry_setting', 'set')
      .where(`s.status = :status AND s.provider_id = :providerId`, {
        status: 'ongoing',
        providerId: provider.id,
      })
      .getRawOne();

    return result;
  }

  async getUpcomingShiftSummary(provider: Provider, timezone: number) {
    const queryBuilder = this.shiftRepository.createQueryBuilder('s');
    const result = await queryBuilder
      .select([
        's.id AS id',
        's.shift_id AS shift_id',
        's.shift_type AS shift_type',
        's.status AS status',
        `s.clock_in AS clock_in`,
        `s.clock_out AS clock_out`,
        `TO_CHAR(s.break_start_date, 'YYYY-MM-DD') AS break_start_date`,
        `s.break_start_time AS break_start_time`,
        `s.break_end_time AS break_end_time`,
        `s.start_time AS start_time`,
        `s.end_time AS end_time`,
        `case when set.id is not null then set.geo_fence_radius else 50 end as geo_fence_radius`,
        `s.total_worked::INTEGER AS total_worked`,
        `s.break_duration::INTEGER AS break_duration`,
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
        `TO_CHAR(s.start_date, 'Day') AS day_of_week`,
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
          'facility_type', ft.name,
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
        `ROUND((SELECT (
          ST_DistanceSphere(
            ST_MakePoint(${provider.address[0].longitude}, ${provider.address[0].latitude}),
            ST_MakePoint(f.longitude, f.latitude)
          ) / 1609.34
        ))::NUMERIC, 2) AS distance_in_miles`,
      ])
      .leftJoin('s.facility', 'f')
      .leftJoin('s.certificate', 'c')
      .leftJoin('s.speciality', 'sp')
      .leftJoin('f.facility_type', 'ft')
      .leftJoin('f.time_entry_setting', 'set')
      .where(`s.status IN (:...status) AND s.provider_id = :providerId`, {
        status: [SHIFT_STATUS.scheduled, SHIFT_STATUS.running_late],
        providerId: provider.id,
      })
      .orderBy('s.start_date', 'ASC')
      .addOrderBy('s.start_time', 'ASC')
      .getRawOne();
    return result;
  }

  async getAvailableShiftCount(provider: Provider) {
    const availableShiftCount = await this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.facility', 'f')
      .where(
        `(s.status IN ('${SHIFT_STATUS.open}', '${SHIFT_STATUS.requested}'))`,
      )
      .andWhere(`s.is_publish = true`)
      .andWhere(`s.start_date >= :start_date`, {
        start_date: moment().format('YYYY-MM-DD'),
      })
      .andWhere(
        `(SELECT (
          ST_DistanceSphere(
            ST_MakePoint(${provider.address[0].longitude}, ${provider.address[0].latitude}),
            ST_MakePoint(f.longitude, f.latitude)
          ) / 1609.34
        ))::NUMERIC <= :radius`,
        { radius: provider.radius },
      )
      .andWhere(
        `(s.id NOT IN (
          SELECT sr.shift_id FROM shift_request sr
          WHERE sr.provider_id = :provider_id
        ))`,
        { provider_id: provider.id },
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
      .andWhere(`s.certificate_id = '${provider.certificate.id}'`)
      .andWhere(`s.speciality_id = '${provider.speciality.id}'`)
      .getCount();

    return availableShiftCount;
  }

  async getScheduledShiftCount(provider: Provider) {
    const scheduledShiftCount = await this.shiftRepository
      .createQueryBuilder('s')
      .where(`s.status IN (:...status) AND s.provider_id = :providerId`, {
        status: [SHIFT_STATUS.scheduled, SHIFT_STATUS.running_late],
        providerId: provider.id,
      })
      .getCount();

    return scheduledShiftCount;
  }

  async getProviderDashboard(provider: Provider, timezone: number) {
    const ongoingShift = await this.getOngoingShiftSummary(provider);
    const availableShiftCount = await this.getAvailableShiftCount(provider);
    const totalScheduledShift = await this.getScheduledShiftCount(provider);
    const upcomingShift = await this.getUpcomingShiftSummary(
      provider,
      timezone,
    );

    return {
      ongoing_shift: ongoingShift || null,
      upcoming_shift: upcomingShift || null,
      total_scheduled_shift: totalScheduledShift,
      available_shifts: availableShiftCount,
    };
  }

  async getApplicationProgress(user: Provider) {
    const data = await this.providerRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.certificate', 'cert')
      .leftJoinAndSelect('p.speciality', 'spec')
      .select([
        `ROUND((
          (CASE WHEN p.first_name IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN p.last_name IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN p.email IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN p.mobile_no IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN p.birth_date IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN p.gender IS NOT NULL THEN 1 ELSE 0 END) +
          (SELECT
            CASE
              WHEN COUNT(*) > 0 THEN 1
              ELSE 0
            END
          FROM
            provider_address pa
          WHERE
            pa.provider_id = p.id
            AND pa.deleted_at IS NULL) +
          (CASE WHEN p.emergency_contact_name IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN p.emergency_mobile_no IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN p.relation_with IS NOT NULL THEN 1 ELSE 0 END)
          ) * 100.0 / 10, 2)::DOUBLE PRECISION
          AS profile_completed`,
        `(CASE WHEN p.signature_image IS NOT NULL THEN 100.0 ELSE 0.0 END)::DOUBLE PRECISION AS signature_completed`,
        `(CASE WHEN p.provider_acknowledgement_id IS NOT NULL THEN 100.0 ELSE 0.0 END)::DOUBLE PRECISION AS acknowledgement_completed`,
        `(SELECT
        CASE
          WHEN COUNT(*) > 0 THEN 100.0
          ELSE 0
        END
          FROM
            competency_test_score cts
          WHERE
            cts.provider_id = p.id
            AND cts.test_status = 'passed'
            AND cts.deleted_at IS NULL)::DOUBLE PRECISION AS competency_test_completed`,
        `p.checklist_completion_ratio AS skills_completed`,
        `p.credentials_completion_ratio AS credential_completed`,
        `CASE WHEN p.is_payment_setup_completed THEN 100.0 ELSE 0.0 END AS payment_setup_completed`,
        `ROUND((
          (SELECT
            CASE
              WHEN COUNT(*) > 0 THEN 1
              ELSE 0
            END
          FROM
            provider_work_history pwh
          WHERE
            pwh.provider_id = p.id
            AND pwh.deleted_at IS NULL) +
          (SELECT
            CASE
              WHEN COUNT(*) > 0 THEN 1
              ELSE 0
            END
          FROM
            provider_education_history peh
          WHERE
            peh.provider_id = p.id
            AND peh.deleted_at IS NULL) +
          (SELECT
            CASE
              WHEN COUNT(*) = 1 THEN 0.5
              WHEN COUNT(*) >= 2 THEN 1
              ELSE 0
            END
          FROM
            provider_professional_reference ppr
          WHERE
            ppr.provider_id = p.id
            AND ppr.deleted_at IS NULL)
          ) * 100.0 / 3, 2)::DOUBLE PRECISION
          AS experience_completed`,
      ])
      .where('p.id = :userId', { userId: user.id })
      .setParameters([
        {
          auto_assign: AUTO_ASSIGN.application_start,
          status: DEFAULT_STATUS.active,
        },
      ])
      .getRawOne();

    // Convert to float with 2 decimals
    Object.keys(data).forEach((key) => {
      data[key] =
        data[key] !== null ? Number(parseFloat(data[key]).toFixed(2)) : null;
    });

    let values = Object.values(data) as number[];
    let average = values.length
      ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
      : null;

    if (average != 100) {
      const skillChecklist: any =
        await this.skillChecklistModuleService.getAssignedChecklist(user);
      const credentialProgress = await this.getCredentialsProgress(user);

      data.skills_completed = Number(skillChecklist?.overall_progress) || 0;
      data.credential_completed = Number(credentialProgress) || 0;

      values = Object.values(data) as number[];
      average = values.length
        ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
        : null;

      await this.providerRepository.update(
        { id: user.id },
        {
          checklist_completion_ratio: skillChecklist?.overall_progress,
          credentials_completion_ratio: credentialProgress,
          profile_progress: average,
        },
      );
    }

    return { overall_progress: average, sectional_progress: { ...data } };
  }

  async getCredentialsProgress(user: Provider) {
    const credentials = await this.credentialsRepository
      .createQueryBuilder('c')
      .select(['count(c.id) AS count'])
      .where(
        '(:certificate_id = ANY(c.licenses) OR :speciality_id = ANY(c.licenses))',
        {
          certificate_id: user.certificate.id,
          speciality_id: user.speciality.id,
        },
      )
      .andWhere('c.is_essential = true')
      .andWhere('c.credential_id IS NULL')
      .andWhere('c.auto_assign = :auto_assign', {
        auto_assign: AUTO_ASSIGN.application_start,
      })
      .getRawOne();

    const eDoc = await this.eDocRepository
      .createQueryBuilder('ed')
      .innerJoin('credentials', 'c', 'c.credential_id = ed.id')
      .select(['count(ed.id) AS count'])
      .where(
        '(:certificate_id = ANY(c.licenses) OR :speciality_id = ANY(c.licenses))',
        {
          certificate_id: user.certificate.id,
          speciality_id: user.speciality.id,
        },
      )
      .andWhere('c.is_essential = true')
      .andWhere('c.auto_assign = :auto_assign', {
        auto_assign: AUTO_ASSIGN.application_start,
      })
      .getRawOne();

    const providerCredentials = await this.providerCredentialRepository
      .createQueryBuilder('pc')
      .leftJoin('pc.credential', 'c')
      .select(['count(pc.id) AS count'])
      .where('pc.provider_id = :provider_id', { provider_id: user.id })
      .andWhere('pc.is_other = false')
      .andWhere('c.is_essential = true')
      .andWhere('pc.previous_document_id IS NULL')
      .getRawOne();

    const eDocResponse = await this.eDocResponseRepository
      .createQueryBuilder('edr')
      .leftJoin('edr.e_doc', 'ed')
      .innerJoin('credentials', 'c', 'c.credential_id = ed.id')
      .select(['count(edr.id) AS count'])
      .where('edr.provider_id = :provider_id', { provider_id: user.id })
      .andWhere('edr.is_other = false')
      .andWhere('c.is_essential = true')
      .getRawOne();

    const credentialsCount = Number(credentials.count) || 0;
    const providerCredentialsCount = Number(providerCredentials.count) || 0;
    const eDocResponseCount = Number(eDocResponse.count) || 0;
    const eDocCount = Number(eDoc.count) || 0;

    if (!(credentialsCount + eDocCount)) return 0;

    return (
      ((eDocResponseCount + providerCredentialsCount) /
        (credentialsCount + eDocCount)) *
      100
    );
  }

  async getProviderEarnings(
    providerId: string,
    queryParams: FilterEarningsDto,
  ) {
    const { start_date, end_date, order, status } = queryParams;

    const earningsData = await this.shiftRepository
      .createQueryBuilder('s')
      .select([
        `s.start_date::text AS start_date`,
        `SUM(s.total_payable_amount)::DOUBLE PRECISION AS total_earnings`,
        `SUM(s.total_worked)::DOUBLE PRECISION AS total_worked`,
      ])
      .where('s.provider_id = :providerId', { providerId })
      .andWhere('s.status = :status', { status: SHIFT_STATUS.completed })
      .andWhere(`s.start_date BETWEEN :start_date AND :end_date`, {
        start_date,
        end_date,
      })
      .groupBy('s.start_date')
      .orderBy('s.start_date', 'ASC')
      .getRawMany();

    const earningsTotal = await this.shiftRepository
      .createQueryBuilder('s')
      .leftJoin('s.time_card', 't')
      .select([
        `COUNT(s.id)::INTEGER AS total_shifts`,
        `SUM(s.total_worked)::DOUBLE PRECISION AS total_worked`,
        `SUM(s.total_payable_amount)::DOUBLE PRECISION AS total_amount`,
        `SUM(s.total_payable_amount) FILTER (
          WHERE
            t.status = 'flagged'
        )::DOUBLE PRECISION AS pending_amount`,
      ])
      .where('s.provider_id = :providerId', { providerId })
      .andWhere('s.status = :status', { status: SHIFT_STATUS.completed })
      .andWhere(`s.start_date BETWEEN :start_date AND :end_date`, {
        start_date,
        end_date,
      })
      .getRawOne();

    const and = [];
    let query = `SELECT * from get_payment_details($1, $2, $3)`;

    if (status && status.length) {
      const statusList = status.map((s: string) => `'${s}'`).join(', ');
      and.push(`status IN (${statusList})`);
    }

    if (and.length) {
      query += ` WHERE ` + and.join(' AND ');
    }

    const orderClauses = [];

    if (order?.total_amount) {
      orderClauses.push(`total_amount ${order['total_amount']}`);
    }

    if (order?.start_date) {
      orderClauses.push(`start_date ${order['start_date']}`);
    }

    if (!orderClauses.length) {
      orderClauses.push(`start_date DESC`);
    }

    query += ` ORDER BY ${orderClauses.join(', ')}`;
    const shiftDetails = await this.shiftRepository.query(query, [
      providerId,
      start_date,
      end_date,
    ]);

    return {
      ...earningsTotal,
      earnings_data: earningsData,
      shift_details: shiftDetails,
    };
  }
}
