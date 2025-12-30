import { Injectable } from '@nestjs/common';
import { CreateProviderCredentialDto } from './dto/create-provider-credential.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderCredential } from './entities/provider-credential.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import {
  ApproveOrRejectProviderCredentialDto,
  UpdateProviderCredentialDto,
} from './dto/update-provider-credential.dto';
import {
  AUTO_ASSIGN,
  CREDENTIAL_STATUS,
  EJS_FILES,
  MEDIA_FOLDER,
  VALIDATE_UPON,
} from '@/shared/constants/enum';
import { Provider } from '@/provider/entities/provider.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { FilterProviderCredentialForAdminDto } from './dto/filter-provider-credential.dto';
import { FilterProviderCredentialForAdmin } from '@/shared/constants/types';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { CONSTANT } from '@/shared/constants/message';
import { basename } from 'path';
import axios from 'axios';
import * as moment from 'moment-timezone';

@Injectable()
export class ProviderCredentialsService {
  constructor(
    @InjectRepository(ProviderCredential)
    private readonly providerCredentialRepository: Repository<ProviderCredential>,
    @InjectRepository(Credential)
    private readonly credentialsRepository: Repository<Credential>,
    @InjectRepository(CredentialsCategory)
    private readonly credentialsCategoryRepository: Repository<CredentialsCategory>,
    @InjectRepository(EDoc)
    private readonly eDocsRepository: Repository<EDoc>,
    @InjectRepository(EDocResponse)
    private readonly eDocResponseRepository: Repository<EDocResponse>,
    @InjectRepository(StatusSetting)
    private readonly statusSettingRepository: Repository<StatusSetting>,
  ) {}

  async create(createProviderCredentialDto: CreateProviderCredentialDto) {
    const { original_filename } = createProviderCredentialDto;
    if (original_filename?.endsWith('.pdf')) {
      const timestamp = Date.now();
      createProviderCredentialDto.original_filename = original_filename.replace(
        /\.pdf$/,
        `_${timestamp}.pdf`,
      );
    }

    const result = await this.providerCredentialRepository.save(
      plainToClass(ProviderCredential, createProviderCredentialDto),
    );
    return plainToInstance(ProviderCredential, result);
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

    const eDoc = await this.eDocsRepository
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
      .select(['count(pc.id) AS count'])
      .where('pc.provider_id = :provider_id', { provider_id: user.id })
      .andWhere('pc.is_other = false')
      .andWhere('pc.previous_document_id IS NULL')
      .getRawOne();

    const eDocResponse = await this.eDocResponseRepository
      .createQueryBuilder('edr')
      .select(['count(edr.id) AS count'])
      .where('edr.provider_id = :provider_id', { provider_id: user.id })
      .andWhere('edr.is_other = false')
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

  async findAll(
    where: FindManyOptions<ProviderCredential>,
  ): Promise<[ProviderCredential[], number]> {
    const [list, count] =
      await this.providerCredentialRepository.findAndCount(where);
    return [list, count];
  }

  async findOneWhere(where: FindOneOptions<ProviderCredential>) {
    const result = await this.providerCredentialRepository.findOne(where);
    return plainToInstance(ProviderCredential, result);
  }

  async statusSetting(where: FindOneOptions<StatusSetting>) {
    const result = await this.statusSettingRepository.findOne(where);
    return plainToInstance(StatusSetting, result);
  }

  async updateWhere(
    where: FindOptionsWhere<ProviderCredential>,
    updateProviderCredentialDto: UpdateProviderCredentialDto,
  ) {
    const result = await this.providerCredentialRepository.update(
      where,
      plainToClass(ProviderCredential, updateProviderCredentialDto),
    );
    return result;
  }

  async getAllCredentialsCategory(user: Provider, isResponse: boolean = false) {
    let rawQuery = `
    SELECT
      vc.category_id AS id,
      vc.category_name AS name,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'id', vc.credential_id,
          'name', vc.credential_name,
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
                'reason_description',
                  CASE
                    WHEN pc.is_verified = 'rejected' THEN jsonb_build_object(
                      'id', r.id,
                      'reason', r.reason,
                      'staff_note', pc.reason_description
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
    LEFT JOIN credential_reject_reason r ON r.id = pc.reason_id AND r.deleted_at IS NULL
    WHERE ($2 = ANY(vc.licenses) OR $3 = ANY(vc.licenses))
      AND vc.parent_credential_id IS NULL
      AND vc.is_essential = TRUE
      AND vc.auto_assign = $4
      AND vc.category_deleted_at IS NULL
      AND vc.credential_deleted_at IS NULL
  `;

    if (isResponse) {
      rawQuery += ` AND pc.id IS NOT NULL`;
    }

    rawQuery += `
    GROUP BY vc.category_id, vc.category_name
    ORDER BY vc.category_id ASC
  `;

    const result = await this.credentialsCategoryRepository.query(rawQuery, [
      user.id,
      user.certificate.id,
      user.speciality.id,
      AUTO_ASSIGN.application_start,
    ]);

    return result;
  }

  async getOtherCredentialsCategory(user: Provider, search: string) {
    const params = [
      user.id, // $1: provider_id for LATERAL
      user.certificate.id, // $2
      user.speciality.id, // $3
    ];

    let sql = `
    SELECT
      v.credential_id AS id,
      v.credential_name AS name,
      v.created_at,
      v.expiry_required,
      v.issued_required,
      v.document_required,
      v.doc_number_required,
      v.approval_required,
      v.is_essential,
      CASE
        WHEN pc.id IS NOT NULL THEN jsonb_build_object(
          'id', pc.id,
          'credential', v.credential_name,
          'filename', pc.filename,
          'original_filename', pc.original_filename,
          'document_id', pc.document_id,
          'license', pc.license,
          'issue_date', pc.issue_date,
          'expiry_date', pc.expiry_date,
          'is_other', pc.is_other,
          'is_verified', pc.is_verified,
          'credential_id', pc.credential_id,
          'reason_description',
            CASE WHEN pc.is_verified = 'rejected'
              THEN jsonb_build_object(
                'id', r.id,
                'reason', r.reason,
                'description', r.description,
                'staff_note', pc.reason_description
              )
              ELSE NULL
            END
        )
        ELSE NULL
      END AS document_response
    FROM view_credentials_category v
    LEFT JOIN LATERAL (
      SELECT *
      FROM provider_credential pc_sub
      WHERE pc_sub.credential_id = v.credential_id
        AND pc_sub.provider_id = $1
        AND pc_sub.deleted_at IS NULL
      ORDER BY pc_sub.created_at DESC, pc_sub.expiry_date DESC
      LIMIT 1
    ) pc ON TRUE
    LEFT JOIN provider p ON p.id = pc.provider_id AND p.deleted_at IS NULL
    LEFT JOIN provider_reject_reason r ON r.id = pc.reason_id AND r.deleted_at IS NULL
    WHERE ($2 = ANY(v.licenses) OR $3 = ANY(v.licenses))
  `;

    if (search) {
      sql += ` AND v.credential_name ILIKE $4`;
      params.push(`%${parseSearchKeyword(search)}%`);
    }

    sql += ` ORDER BY v.created_at DESC`;

    return this.credentialsRepository.query(sql, params);
  }

  async getOtherCredentialsData(provider_id: string) {
    const queryBuilder = this.providerCredentialRepository
      .createQueryBuilder('pc')
      .leftJoin('pc.provider', 'p')
      .leftJoin('pc.reason', 'r')
      .leftJoin('pc.credential', 'c')
      .select([
        'pc.id AS id',
        'pc.name AS name',
        'pc.created_at AS created_at',
        'pc.license AS license',
        'pc.issue_date AS issue_date',
        'pc.expiry_date AS expiry_date',
        'pc.is_other AS is_other',
        'pc.is_verified AS is_verified',
        `CASE WHEN pc.is_verified = '${CREDENTIAL_STATUS.rejected}' THEN pc.reason_description ELSE NULL END AS reason_description`,
        'pc.credential_id AS credential_id',
        `CASE
            WHEN pc.is_verified = '${CREDENTIAL_STATUS.rejected}' THEN jsonb_build_object(
              'id', r.id,
              'reason', r.reason,
              'description', r.description,
              'staff_note', pc.reason_description
            )
            ELSE NULL
          END AS reason_description`,
        'c.id AS credential_id',
        'c.expiry_required AS expiry_required',
        'c.issued_required AS issued_required',
        'c.document_required AS document_required',
        'c.doc_number_required AS doc_number_required',
        'c.is_essential AS is_essential',
        'c.approval_required AS approval_required',
        'c.auto_assign AS auto_assign',
      ])
      .where('p.id = :userId', { userId: provider_id })
      .andWhere('pc.is_other = true')
      .andWhere(
        `
        NOT EXISTS (
          SELECT 1
          FROM provider_credential pc2
          WHERE pc2.previous_document_id = pc.id
        )
      `,
      )
      .orderBy('pc.created_at', 'DESC');

    const providerCredentials = await queryBuilder.getRawMany();

    return providerCredentials;
  }

  async getEDocForProvider(user: Provider): Promise<EDoc[]> {
    const data = await this.eDocsRepository
      .createQueryBuilder('ed')
      .innerJoin('credentials', 'c', 'c.credential_id = ed.id')
      .leftJoin(
        'e_doc_response',
        'edr',
        'edr.e_doc_id = ed.id AND edr.provider_id = :provider_id',
        { provider_id: user.id },
      )
      .select([
        'ed.id AS id',
        'ed.name AS name',
        'ed.base_url AS base_url',
        'ed.document AS document',
        'ed.new_file AS new_file',
        'ed.attachment_label AS attachment_label',
        'ed.expiration_period AS expiration_period',
        'ed.expiration_duration AS expiration_duration',
        'ed.field_settings AS field_settings',
        'ed.created_at AS created_at',
        'ed.updated_at AS updated_at',
        'c.is_essential AS is_essential',
        `CASE
          WHEN
            edr.id IS NULL THEN NULL
          ELSE JSON_BUILD_OBJECT('id', edr.id, 'base_url', edr.base_url, 'document', edr.document, 'status', edr.status)
        END
        AS doc_response`,
      ])
      .where(
        '(:certificate_id = ANY(c.licenses) OR :speciality_id = ANY(c.licenses))',
        {
          certificate_id: user.certificate.id,
          speciality_id: user.speciality.id,
        },
      )
      .getRawMany();

    return data;
  }

  async getAllProviderCredentialForAdmin(
    queryParams: FilterProviderCredentialForAdminDto,
  ): Promise<{ list: ProviderCredential[]; count: number }> {
    const {
      provider_ids,
      order,
      offset,
      limit,
      status,
      issue_date,
      expiry_date,
      search,
    } = queryParams;

    const queryBuilder = this.providerCredentialRepository
      .createQueryBuilder('pc')
      .select([
        'pc.id AS id',
        'pc.name AS name',
        'pc.base_url AS base_url',
        'pc.filename AS filename',
        'pc.original_filename AS original_filename',
        'pc.document_id AS document_id',
        'c.id AS credential_id',
        'c.name AS credential_name',
        'pc.license AS license',
        'pc.credential_rejected_at AS credential_rejected_at',
        'pc.credential_approved_at AS credential_approved_at',
        `TO_CHAR(pc.issue_date, 'MM-DD-YYYY') AS issue_date`,
        `CASE
          WHEN pc.expiry_date::date = CURRENT_DATE THEN 1
          ELSE (pc.expiry_date::date - CURRENT_DATE)
        END AS days_remaining`,
        'pc.created_at AS created_at',
        `TO_CHAR(pc.expiry_date, 'MM-DD-YYYY') AS expiry_date`,
        `CASE
          WHEN pc.is_verified = 'verified' THEN 'Yes'
          ELSE 'No'
        END AS is_verified`,
        'pc.is_verified AS status',
        'provider.first_name AS first_name',
        'provider.last_name AS last_name',
        'provider.id AS provider_id',
        'provider.mobile_no AS mobile_no',
        'provider.country_code AS country_code',
        'pc.reason_id AS reason_id',
        'r.reason AS reject_reason',
        'pc.reason_description AS reason_description',
        'cc.name AS category_name',
      ])
      .leftJoin(
        'pc.provider',
        'provider',
        'provider.deleted_at IS NULL and provider.id = pc.provider_id',
      )
      .leftJoin('pc.credential', 'c')
      .leftJoin('c.credentials_category', 'cc')
      .leftJoin(
        'provider_credential',
        'pc_next',
        'pc_next.previous_document_id = pc.id',
      )
      .leftJoin('pc.reason', 'r')
      .where('pc_next.id IS NULL AND c.approval_required = true'); // Only get latest credentials (no newer document exists)

    const dateFilters = [
      { filter: issue_date, column: 'issue_date' },
      { filter: expiry_date, column: 'expiry_date' },
    ];
    const and = [];
    dateFilters.forEach(({ filter, column }) => {
      if (filter && Object.keys(filter).length > 0) {
        Object.entries(filter).forEach(([key, value]) => {
          if (key === 'from_date') {
            and.push(`TO_CHAR(pc.${column}, 'YYYY-MM-DD') >= '${value}'`);
          }
          if (key === 'to_date') {
            and.push(`TO_CHAR(pc.${column}, 'YYYY-MM-DD') <= '${value}'`);
          }
        });
      }
    });

    if (CREDENTIAL_STATUS[status]) {
      queryBuilder.andWhere('pc.is_verified = :status', { status });
    } else if (status === 'expired') {
      queryBuilder.andWhere('pc.expiry_date < CURRENT_DATE');
    } else if (status === 'expiring_soon') {
      queryBuilder.andWhere(
        "pc.expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND pc.expiry_date > CURRENT_DATE",
      );
    }

    if (search) {
      queryBuilder.andWhere(
        `(
          provider.first_name ILIKE :search OR
          provider.last_name ILIKE :search OR
          provider.first_name || ' ' || provider.last_name ILIKE :search OR
          provider.mobile_no ILIKE :search OR
          pc.name ILIKE :search OR
          pc.original_filename ILIKE :search
        )`,
        { search: `%${parseSearchKeyword(search)}%` },
      );
    }
    if (provider_ids) {
      queryBuilder.andWhere('provider.id IN (:...providerIds)', {
        providerIds: provider_ids,
      });
    }

    if (and.length) {
      queryBuilder.andWhere(`${and.join(' AND ')}`);
    }

    Object.entries(order).forEach(([column, direction]) => {
      if (column === 'first_name') {
        queryBuilder.addOrderBy(
          `provider.${column} || provider.last_name`,
          direction,
        );
      } else if (column === 'days_remaining') {
        queryBuilder.addOrderBy(
          `(CASE 
        WHEN pc.expiry_date IS NULL THEN NULL
        ELSE (pc.expiry_date::date - CURRENT_DATE)
          END)`,
          direction,
          'NULLS LAST',
        );
      } else if (column === 'is_verified') {
        queryBuilder.addOrderBy(
          `CASE
            WHEN pc.is_verified = 'verified' THEN 'Yes'
            ELSE 'No'
          END`,
          direction,
        );
      } else if (column === 'category_name') {
        queryBuilder.addOrderBy(`cc.name`, direction);
      } else {
        queryBuilder.addOrderBy(`pc.${column}`, direction);
      }
    });

    queryBuilder.limit(+limit).offset(+offset);

    const [data, count] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount(),
    ]);

    return {
      list: plainToInstance(ProviderCredential, data),
      count,
    };
  }

  async getProviderCredentialStatusCounts(): Promise<FilterProviderCredentialForAdmin> {
    const queryBuilder = this.providerCredentialRepository
      .createQueryBuilder('pc')
      .leftJoin(
        'pc.provider',
        'provider',
        'provider.deleted_at IS NULL and provider.id = pc.provider_id',
      )
      .leftJoin(
        'provider_credential',
        'pc_next',
        'pc_next.previous_document_id = pc.id',
      )
      .leftJoin('pc.credential', 'c')
      .where('pc_next.id IS NULL AND c.approval_required = true');

    queryBuilder.select([
      `COUNT(*) FILTER (
      WHERE pc.is_verified = '${CREDENTIAL_STATUS.pending}'
    )::INTEGER AS pending`,

      `COUNT(*) FILTER (
      WHERE pc.expiry_date < CURRENT_DATE
    )::INTEGER AS expired`,

      `COUNT(*) FILTER (
      WHERE pc.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
      AND pc.expiry_date > CURRENT_DATE
    )::INTEGER AS expiring_soon`,

      `COUNT(*) FILTER (
      WHERE pc.is_verified = '${CREDENTIAL_STATUS.rejected}'
    )::INTEGER AS rejected`,

      `COUNT(*) FILTER (
      WHERE pc.is_verified = '${CREDENTIAL_STATUS.verified}'
    )::INTEGER AS approved`,
    ]);

    const result = await queryBuilder.getRawOne();

    return {
      pending: result.pending || 0,
      expired: result.expired || 0,
      expiring_soon: result.expiring_soon || 0,
      rejected: result.rejected || 0,
      approved: result.approved || 0,
    };
  }

  async approveOrRejectProviderCredential(
    id: string,
    approveOrRejectProviderCredentialDto: ApproveOrRejectProviderCredentialDto,
  ): Promise<{ affected: number }> {
    const updateData = {
      ...approveOrRejectProviderCredentialDto,
      reason: approveOrRejectProviderCredentialDto.reason
        ? { id: approveOrRejectProviderCredentialDto.reason }
        : undefined,
    };

    const result = await this.providerCredentialRepository.update(
      { id },
      updateData,
    );

    return { affected: result.affected ?? 0 };
  }

  async getLatestCredentialsByProvider(providerId: string) {
    const rows = await this.providerCredentialRepository
      .createQueryBuilder('pc')
      .distinctOn(['pc.credential_id'])
      .leftJoin('pc.provider', 'p')
      .leftJoin('p.status', 's')
      .where('p.id = :providerId AND pc.deleted_at IS NULL', { providerId })
      .orderBy('pc.credential_id', 'ASC')
      .addOrderBy('pc.created_at', 'DESC')
      .select([
        'pc.id AS id',
        'pc.is_verified AS is_verified',
        'pc.credential_id AS credential_id',
        'pc.name AS name',
        'p.id AS provider_id',
        'p.profile_progress AS profile_progress',
        'p.verification_status AS verification_status',
        's.name AS status',
      ])
      .getRawMany();

    return rows;
  }

  async checkIfExpiredLatestCredentialsByProvider(
    providerId: string,
    timezone: string,
    type?: string,
  ): Promise<{ expired: boolean; notApproved: boolean; rejected: boolean }> {
    const rows = await this.providerCredentialRepository
      .createQueryBuilder('pc')
      .distinctOn(['pc.credential_id'])
      .leftJoin('pc.provider', 'p')
      .leftJoin('pc.credential', 'c')
      .where('p.id = :providerId AND pc.is_other = false', { providerId })
      .orderBy('pc.credential_id', 'ASC')
      .addOrderBy('pc.created_at', 'DESC')
      .select([
        'pc.id AS id',
        "TO_CHAR(pc.expiry_date, 'YYYY-MM-DD') AS expiry_date",
        'pc.is_verified AS is_verified',
        'p.id AS provider_id',
        'pc.credential_id AS credential_id',
        'pc.name AS name',
        'c.approval_required AS approval_required',
        'c.validate AS validate',
      ])
      .getRawMany();

    let expired = false;
    let notApproved = false;
    let rejected = false;

    const now = moment()
      .tz(timezone || 'UTC')
      .format('YYYY-MM-DD');

    for (const row of rows) {
      const expiryDate = row.expiry_date ? row.expiry_date : null;
      const isExpired = moment(expiryDate).isBefore(now, 'day');
      const isVerified = row.is_verified as string | null;
      const validate = row.validate as VALIDATE_UPON;

      // Rejected (when approval was required and current latest is rejected)
      if (row.approval_required && isVerified === CREDENTIAL_STATUS.rejected) {
        rejected = true;
        continue;
      }

      if (isExpired) {
        expired = true;
        if (type == 'invitation') {
          expired = validate === VALIDATE_UPON.refuse ? true : false;
        }
      }

      if (row.approval_required && isVerified !== CREDENTIAL_STATUS.verified) {
        notApproved = true;
      }

      // early exit if all flags true
      if (expired && notApproved && rejected) break;
    }

    return { expired, notApproved, rejected };
  }

  async sendCredentialToMail(credential: ProviderCredential, emails: string[]) {
    // Build URL safely (handles trailing slashes)
    const fileUrl = new URL(
      credential.filename,
      credential.base_url,
    ).toString();
    // 1) Fetch the file as a Buffer
    const response = await axios.get<ArrayBuffer>(fileUrl, {
      responseType: 'arraybuffer',
    });
    const fileBuffer = Buffer.from(response.data);

    // Nice email filename (either provided original, or derived)
    const emailFileName = basename(credential.filename) || 'credential.pdf';

    // 2) Send email(s) with buffer attachment
    for (const recipient of emails) {
      await sendEmailHelper({
        email: recipient,
        email_type: EJS_FILES.staff_credential,
        subject: CONSTANT.EMAIL.STAFF_CREDENTIAL,
        redirectUrl: process.env.FACILITY_URL,
        supportEmail: process.env.SUPPORT_EMAIL,
        data: {
          providerName: `${credential.provider.first_name} ${credential.provider.last_name}`,
          certificate: credential.provider.certificate?.name,
          speciality: credential.provider.speciality?.name,
        },
        attachments: [
          {
            filename: emailFileName,
            content: fileBuffer,
            contentType: 'application/pdf',
            folder: MEDIA_FOLDER.credential,
          },
        ],
      });
    }
  }

  async getAllCredentialHistoryOfProvider(
    query: FilterProviderCredentialForAdminDto,
  ): Promise<[ProviderCredential[], number]> {
    const { order, offset, limit, provider_ids, credential_ids } = query;

    const queryBuilder = this.providerCredentialRepository
      .createQueryBuilder('pc')
      .leftJoin('pc.provider', 'provider')
      .leftJoin('pc.credential', 'c')
      .leftJoin('c.credentials_category', 'cc')

      .leftJoin('pc.reason', 'r')
      .select([
        'pc.id AS id',
        'pc.name AS name',
        'pc.base_url AS base_url',
        'pc.filename AS filename',
        'pc.original_filename AS original_filename',
        'pc.document_id AS document_id',
        'c.id AS credential_id',
        'c.name AS credential_name',
        'pc.license AS license',
        'pc.credential_rejected_at AS credential_rejected_at',
        'pc.credential_approved_at AS credential_approved_at',
        `TO_CHAR(pc.issue_date, 'MM-DD-YYYY') AS issue_date`,
        // LEAD for next created_at
        `LEAD(pc.created_at) OVER (
          PARTITION BY pc.provider_id, pc.credential_id
          ORDER BY pc.created_at
        ) AS next_created_at`,
        // Days Remaining Logic
        `CASE
          WHEN 
            LEAD(pc.created_at) OVER (
                PARTITION BY pc.provider_id, pc.credential_id
                ORDER BY pc.created_at
            ) IS NULL
          THEN
            CASE
              WHEN (pc.expiry_date::date - CURRENT_DATE) = 0
                THEN 1
              ELSE (pc.expiry_date::date - CURRENT_DATE)
            END
          ELSE
            CASE
              WHEN (
                pc.expiry_date::date -
                LEAD(pc.created_at) OVER (
                  PARTITION BY pc.provider_id, pc.credential_id
                  ORDER BY pc.created_at
                )::date
              ) = 0
                THEN 1
              ELSE (
                pc.expiry_date::date -
                LEAD(pc.created_at) OVER (
                  PARTITION BY pc.provider_id, pc.credential_id
                  ORDER BY pc.created_at
                )::date
              )
            END
        END AS days_remaining`,
        'pc.created_at AS created_at',
        `TO_CHAR(pc.expiry_date, 'MM-DD-YYYY') AS expiry_date`,
        `CASE
          WHEN pc.is_verified = 'verified' THEN 'Yes'
          ELSE 'No'
        END AS is_verified`,
        'pc.is_verified AS status',
        'provider.first_name AS first_name',
        'provider.last_name AS last_name',
        'provider.id AS provider_id',
        'provider.mobile_no AS mobile_no',
        'provider.country_code AS country_code',
        'pc.reason_id AS reason_id',
        'r.reason AS reject_reason',
        'pc.reason_description AS reason_description',
        'cc.name AS category_name',
      ])
      .where(
        'pc.credential_id IN (:...credential_ids) AND pc.provider_id IN (:...provider_ids)',
        { credential_ids, provider_ids },
      );

    if (order) {
      Object.entries(order).forEach(([column, direction]) => {
        if (column === 'first_name') {
          queryBuilder.addOrderBy(
            `provider.${column} || provider.last_name`,
            direction,
          );
        } else if (column === 'days_remaining') {
          queryBuilder.addOrderBy(
            `CASE WHEN pc.expiry_date::date < CURRENT_DATE THEN 0 ELSE (pc.expiry_date::date - CURRENT_DATE) END`,
            direction,
            'NULLS LAST',
          );
        } else if (column === 'is_verified') {
          queryBuilder.addOrderBy(
            `CASE
            WHEN pc.is_verified = 'verified' THEN 'Yes'
            ELSE 'No'
          END`,
            direction,
          );
        } else if (column === 'category_name') {
          queryBuilder.addOrderBy(`cc.name`, direction);
        } else {
          queryBuilder.addOrderBy(`pc.${column}`, direction);
        }
      });
    }

    if (limit) {
      queryBuilder.limit(+limit);
    }

    if (offset) {
      queryBuilder.offset(+offset);
    }

    const data = await queryBuilder.getRawMany();
    const count = data.length;
    return [plainToInstance(ProviderCredential, data), count];
  }
}
