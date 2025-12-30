import { Certificate } from '@/certificate/entities/certificate.entity';
import { City } from '@/city/entities/city.entity';
import { Country } from '@/country/entities/country.entity';
import { FacilityShiftSetting } from '@/facility-shift-setting/entities/facility-shift-setting.entity';
import { FacilityPermission } from '@/facility-user/entities/facility-permission.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Role } from '@/role/entities/role.entity';
import {
  AVAILABILITY_STATUS,
  DEFAULT_STATUS,
  DNR_TYPE,
  ENTITY_STATUS,
  FACILITY_PROVIDER_FLAGS,
  FILTER_PROVIDER_BY,
  SHIFT_STATUS,
  SHIFT_TYPE,
  USER_TYPE,
} from '@/shared/constants/enum';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { State } from '@/state/entities/state.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  FindManyOptions,
  FindOneOptions,
  ILike,
  IsNull,
  Repository,
} from 'typeorm';
import {
  FilterProviderDto,
  FilterProviderV2Dto,
} from './dto/filter-provider.dto';
import { Provider } from '@/provider/entities/provider.entity';
import { ShiftType } from '@/shift-type/entities/shift-type.entity';
import { LineOfBusiness } from '@/line-of-business/entities/line-of-business.entity';
import { TimecardRejectReason } from '@/timecard-reject-reason/entities/timecard-reject-reason.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { AIService } from '@/shared/helpers/ai-service';
import { FlagSetting } from '@/flag-setting/entities/flag-setting.entity';
import { DnrReason } from '@/dnr-reason/entities/dnr-reason.entity';
import { EDocsGroup } from '@/e-docs-group/entities/e-docs-group.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { CONSTANT } from '@/shared/constants/message';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { getTimeCode } from '@/shared/helpers/time-code';
import * as moment from 'moment-timezone';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { Tag } from '@/tags/entities/tags.entity';
import { ConflictRow, IRequest, ProfileRow } from '@/shared/constants/types';
import { ProviderRejectReason } from '@/provider-reject-reason/entities/provider-reject-reason.entity';
import { OrientationRejectReason } from '@/orientation-reject-reason/entities/orientation-reject-reason.entity';
import {
  FilterDropdownDto,
  SearchDropdownDto,
  SearchUserByTypeDropdownDto,
} from './dto/filter.dropdown.dto';
import { AdminDocument } from '@/admin-document/entities/admin-document.entity';
import { Documents } from '@/documents/entities/documents.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { validateCredentials } from '@/shared/helpers/credential-rule';
import { CredentialRejectReason } from '@/credential-reject-reason/entities/credential-reject-reason.entity';
import { ProfessionalReferenceRejectReason } from '@/professional-reference-reject-reason/entities/professional-reference-reject-reason.entity';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';

@Injectable()
export class DropdownService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(Speciality)
    private readonly specialityRepository: Repository<Speciality>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(FacilityPermission)
    private readonly facilityPermissionRepository: Repository<FacilityPermission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(FacilityUser)
    private readonly facilityUserRepository: Repository<FacilityUser>,
    @InjectRepository(FacilityShiftSetting)
    private readonly facilityShiftSettingRepository: Repository<FacilityShiftSetting>,
    @InjectRepository(ShiftCancelReason)
    private readonly shiftCancelReasonRepository: Repository<ShiftCancelReason>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(ShiftType)
    private readonly shiftTypeRepository: Repository<ShiftType>,
    @InjectRepository(LineOfBusiness)
    private readonly lineOfBusinessRepository: Repository<LineOfBusiness>,
    @InjectRepository(TimecardRejectReason)
    private readonly timecardRejectReasonRepository: Repository<TimecardRejectReason>,
    @InjectRepository(CompetencyTestSetting)
    private readonly competencyTestSettingRepository: Repository<CompetencyTestSetting>,
    @InjectRepository(SkillChecklistTemplate)
    private readonly skillChecklistTemplateRepository: Repository<SkillChecklistTemplate>,
    @InjectRepository(FlagSetting)
    private readonly flagSettingRepository: Repository<FlagSetting>,
    @InjectRepository(DnrReason)
    private readonly dnrReasonRepository: Repository<DnrReason>,
    @InjectRepository(EDocsGroup)
    private readonly eDocsGroupRepository: Repository<EDocsGroup>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly aiService: AIService,
    @InjectRepository(FloorDetail)
    private readonly floorDetailRepository: Repository<FloorDetail>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(CredentialsCategory)
    private readonly credentialsCategoryRepository: Repository<CredentialsCategory>,
    @InjectRepository(StatusSetting)
    private readonly statusSettingRepository: Repository<StatusSetting>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(ProviderRejectReason)
    private readonly providerRejectReasonRepository: Repository<ProviderRejectReason>,
    @InjectRepository(OrientationRejectReason)
    private readonly orientationRejectReasonRepository: Repository<OrientationRejectReason>,
    @InjectRepository(AdminDocument)
    private readonly adminDocumentRepository: Repository<AdminDocument>,
    @InjectRepository(Documents)
    private readonly documentRepository: Repository<Documents>,
    @InjectRepository(FacilityProvider)
    private readonly facilityProviderRepository: Repository<FacilityProvider>,
    @InjectRepository(CredentialRejectReason)
    private readonly credentialRejectReasonRepository: Repository<CredentialRejectReason>,
    @InjectRepository(ProfessionalReferenceRejectReason)
    private readonly professionalReferenceRejectReasonRepository: Repository<ProfessionalReferenceRejectReason>,
  ) {}

  async getCertificates(filter: FilterDropdownDto) {
    const { search, facility_id } = filter;
    const facilityCertificates = [];
    if (facility_id) {
      const facility = await this.facilityRepository.findOne({
        where: { id: facility_id },
        select: { certificate: true },
      });
      if (facility?.certificate.length) {
        facilityCertificates.push(...facility.certificate);
      }
    }

    const dropdown = this.certificateRepository
      .createQueryBuilder('c')
      .select([
        'c.id AS id',
        'c.name AS name',
        'c.abbreviation AS abbreviation',
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id',"speciality".id, 'name', "speciality".name, 'abbreviation', "speciality".abbreviation, 'text_color', "speciality".text_color, 'background_color', "speciality".background_color)) AS specialities
          FROM unnest(c.specialities) AS "specialities"
          JOIN "speciality" ON "speciality".id = "specialities" AND speciality.status = '${DEFAULT_STATUS.active}') AS specialities`,
      ])
      .where('c.status = :status', { status: DEFAULT_STATUS.active })
      .andWhere('c.deleted_at IS NULL');
    if (search) {
      dropdown.andWhere('c.name ILIKE :search', {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }
    if (facilityCertificates.length) {
      dropdown.andWhere('c.id IN (:...facilityCertificates)', {
        facilityCertificates,
      });
    }
    return await dropdown.getRawMany();
  }

  async getFacilityCertificatesOrNull(filter: FilterDropdownDto) {
    const { search, facility_id } = filter;
    const facilityCertificates = [];
    const facility = await this.facilityRepository.findOne({
      where: { id: facility_id },
      select: { certificate: true },
    });
    if (facility?.certificate.length) {
      facilityCertificates.push(...facility.certificate);
    }

    const dropdown = this.certificateRepository
      .createQueryBuilder('c')
      .select([
        'c.id AS id',
        'c.name AS name',
        'c.abbreviation AS abbreviation',
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id',"speciality".id, 'name', "speciality".name, 'abbreviation', "speciality".abbreviation, 'text_color', "speciality".text_color, 'background_color', "speciality".background_color)) AS specialities
          FROM unnest(c.specialities) AS "specialities"
          JOIN "speciality" ON "speciality".id = "specialities" AND speciality.status = '${DEFAULT_STATUS.active}') AS specialities`,
      ])
      .where('c.status = :status', { status: DEFAULT_STATUS.active })
      .andWhere('c.id IN (:...facilityCertificates)', {
        facilityCertificates: facilityCertificates.length
          ? facilityCertificates
          : [null],
      })
      .andWhere('c.deleted_at IS NULL');
    if (search) {
      dropdown.andWhere('c.name ILIKE :search', {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }
    return await dropdown.getRawMany();
  }

  async getSpecialties(filter: FilterDropdownDto) {
    const { search, facility_id } = filter;
    const facilitySpeciality = [];
    if (facility_id) {
      const facility = await this.facilityRepository.findOne({
        where: { id: facility_id },
        select: { speciality: true },
      });
      if (facility?.speciality.length) {
        facilitySpeciality.push(...facility.speciality);
      }
    }

    const dropdown = this.specialityRepository
      .createQueryBuilder('s')
      .select([
        's.id AS id',
        's.name AS name',
        's.abbreviation AS abbreviation',
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id',"certificate".id, 'name', "certificate".name, 'abbreviation', "certificate".abbreviation, 'text_color', "certificate".text_color, 'background_color', "certificate".background_color)) AS certificates
          FROM unnest(s.certificates) AS "certificates"
          JOIN "certificate" ON "certificate".id = "certificates" AND certificate.status = '${DEFAULT_STATUS.active}') AS certificates`,
      ])
      .where('s.status = :status', { status: DEFAULT_STATUS.active })
      .andWhere('s.deleted_at IS NULL');
    if (search) {
      dropdown.andWhere('s.name ILIKE :search', {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }
    if (facilitySpeciality.length) {
      dropdown.andWhere('s.id IN (:...facilitySpeciality)', {
        facilitySpeciality,
      });
    }

    return await dropdown.getRawMany();
  }
  async getFacilitySpecialtiesOnly(filter: FilterDropdownDto) {
    const { search, facility_id } = filter;
    const facilitySpeciality = [];
    const facility = await this.facilityRepository.findOne({
      where: { id: facility_id },
      select: { speciality: true },
    });
    if (facility?.speciality.length) {
      facilitySpeciality.push(...facility.speciality);
    }

    const dropdown = this.specialityRepository
      .createQueryBuilder('s')
      .select([
        's.id AS id',
        's.name AS name',
        's.abbreviation AS abbreviation',
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id',"certificate".id, 'name', "certificate".name, 'abbreviation', "certificate".abbreviation, 'text_color', "certificate".text_color, 'background_color', "certificate".background_color)) AS certificates
          FROM unnest(s.certificates) AS "certificates"
          JOIN "certificate" ON "certificate".id = "certificates" AND certificate.status = '${DEFAULT_STATUS.active}') AS certificates`,
      ])
      .where('s.status = :status', { status: DEFAULT_STATUS.active })
      .andWhere('s.id IN (:...facilitySpeciality)', {
        facilitySpeciality: facilitySpeciality.length
          ? facilitySpeciality
          : [null],
      })
      .andWhere('s.deleted_at IS NULL');
    if (search) {
      dropdown.andWhere('s.name ILIKE :search', {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }

    return await dropdown.getRawMany();
  }

  async getCountry() {
    const country = await this.countryRepository.find({
      where: {
        deleted_at: IsNull(),
      },
      select: ['id', 'name', 'flag', 'phone_code'],
      order: { name: 'ASC' },
    });
    return country;
  }

  async getState(where: FindManyOptions<State>) {
    const state = await this.stateRepository.find(where);
    return state;
  }

  async getCity(where: FindManyOptions<City>) {
    const state = await this.cityRepository.find(where);
    return state;
  }

  async getFacilityPermissions(where: FindManyOptions<FacilityPermission>) {
    const permissions = await this.facilityPermissionRepository.find(where);
    return permissions;
  }

  async getRoles(where: FindManyOptions<Role>) {
    const roles = await this.roleRepository.find(where);
    return roles;
  }

  async getFacility(where: FindManyOptions<Facility>) {
    const facility = await this.facilityRepository.find(where);
    return facility;
  }

  async getTimeSettingForShift(id: string) {
    let shiftSettings = await this.facilityShiftSettingRepository.find({
      where: { facility: { id: id }, status: DEFAULT_STATUS.active },
      order: { shift_time_id: 'ASC' },
    });
    if (!shiftSettings || shiftSettings.length === 0) {
      shiftSettings = await this.facilityShiftSettingRepository.find({
        where: { is_default: true, status: DEFAULT_STATUS.active },
        order: { shift_time_id: 'ASC' },
      });
    }
    return plainToInstance(FacilityShiftSetting, shiftSettings);
  }

  async getShiftCancelReason(where: FindManyOptions<ShiftCancelReason>) {
    const facility = await this.shiftCancelReasonRepository.find(where);
    return facility;
  }

  async findOneFacilityWhere(where: FindOneOptions<Facility>) {
    const result = await this.facilityRepository.findOne(where);
    return plainToInstance(Facility, result);
  }

  async getFacilityUserDropDown(facilityId?: string) {
    const queryBuilder = this.facilityUserRepository
      .createQueryBuilder('fu')
      .select([
        'fu.id',
        'fu.first_name',
        'fu.last_name',
        'fu.base_url',
        'fu.image',
      ])
      .where('fu.status = :status', { status: ENTITY_STATUS.active })
      .orderBy('fu.first_name', 'ASC');

    if (facilityId) {
      queryBuilder.andWhere('fu.facility_id @> ARRAY[:facilityId]::uuid[]', {
        facilityId,
      });
    }

    const facility = await queryBuilder.getMany();
    return facility;
  }

  async getProvider(where: FindManyOptions<Provider>) {
    const provider = await this.providerRepository.find(where);
    return provider;
  }

  async getFacilityUser(
    facilityIds: string[],
    search: string,
    is_billing: boolean,
  ) {
    const queryBuilder = this.facilityUserRepository
      .createQueryBuilder('fu')
      .select([
        'fu.id',
        'fu.first_name',
        'fu.last_name',
        'fu.email',
        'fu.country_code',
        'fu.mobile_no',
        'fu.base_url',
        'fu.image',
        'fu.signature',
        'fu.facility_id',
      ])
      .where('fu.facility_id && ARRAY[:...facilityIds]::uuid[]', {
        facilityIds,
      })
      .andWhere('fu.status = :status', {
        status: ENTITY_STATUS.active,
      });

    if (is_billing) {
      queryBuilder
        .innerJoin(
          'facility_user_permission',
          'fup',
          'fup.facility_user_id = fu.id',
        )
        .innerJoin(
          'facility_permission',
          'fp',
          `fp.id = fup.facility_permission_id AND fp.name IN ('can_manage_billing', 'can_see_billing_summary')`,
        );
    }
    if (search) {
      queryBuilder.andWhere(
        `(fu.first_name ILIKE :search OR fu.last_name ILIKE :search OR fu.email ILIKE :search OR fu.first_name || ' ' || fu.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(search)}%` },
      );
    }
    const result = await queryBuilder.getMany();
    return plainToInstance(FacilityUser, result);
  }

  async getAllProvider(filterProviderDto: FilterProviderDto) {
    const queryBuilder = this.providerRepository
      .createQueryBuilder('p')
      .leftJoin('p.certificate', 'c')
      .leftJoin('p.speciality', 'sp')
      .select([
        'p.id AS id',
        'p.first_name AS first_name',
        'p.middle_name AS middle_name',
        'p.nick_name AS nick_name',
        'p.last_name AS last_name',
        'p.base_url AS base_url',
        'p.profile_image AS profile_image',
        `jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'abbreviation', c.abbreviation,
            'text_color', c.text_color, 
            'background_color', c.background_color
        ) AS certificate`,
      ])
      .where(
        'p.is_active = true AND (p.is_mobile_verified = true OR p.is_email_verified = true)',
      )
      .orderBy('p.first_name', 'ASC');

    if (filterProviderDto?.search) {
      queryBuilder.andWhere(
        `(p.first_name ILIKE :search OR p.last_name ILIKE :search OR p.first_name || ' ' || p.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(filterProviderDto.search)}%` },
      );
    }

    if (filterProviderDto.facility_id) {
      switch (filterProviderDto.filter) {
        case FILTER_PROVIDER_BY.preferred:
          queryBuilder.leftJoin('p.facility_provider', 'fp');
          queryBuilder
            .andWhere(`fp.flag = :preferredFlag`, {
              preferredFlag: FACILITY_PROVIDER_FLAGS.preferred,
            })
            .andWhere('fp.facility_id = :facilityId', {
              facilityId: filterProviderDto.facility_id,
            });
          break;

        case FILTER_PROVIDER_BY.past:
          queryBuilder.leftJoin('p.facility_provider', 'fp');
          queryBuilder
            .andWhere(`(fp.flag IS NULL OR fp.flag != :dnrFlag)`, {
              dnrFlag: FACILITY_PROVIDER_FLAGS.dnr,
            })
            .andWhere('fp.facility_id = :facilityId', {
              facilityId: filterProviderDto.facility_id,
            });
          break;

        case FILTER_PROVIDER_BY.ai:
          const facility = await this.facilityRepository.findOne({
            where: { id: filterProviderDto.facility_id },
          });

          const providers = await this.aiService.getAIRecommendations(
            facility.id,
            filterProviderDto.speciality_id,
            filterProviderDto.certificate_id,
          );

          if (providers && providers.length > 0) {
            queryBuilder.andWhere('p.id IN (:...providerIds)', {
              providerIds: providers,
            });
            break;
          }
          return [];
        default:
          break;
      }
    }
    queryBuilder.andWhere(
      `(c.id = :certificateId 
        OR :certificateId = ANY(p.additional_certification))
       AND (sp.id = :specialityId 
        OR :specialityId = ANY(p.additional_speciality))`,
      {
        certificateId: filterProviderDto.certificate_id,
        specialityId: filterProviderDto.speciality_id,
      },
    );
    const provider = await queryBuilder.getRawMany();
    return provider;
  }

  async getAllProviderV2(filterProviderDto: FilterProviderV2Dto) {
    const {
      facility_id,
      speciality_id,
      certificate_id,
      start_time,
      end_time,
      dates,
      filter,
      search,
    } = filterProviderDto;

    const queryBuilder = this.providerRepository
      .createQueryBuilder('p')
      .distinctOn(['p.id'])
      .leftJoin('p.certificate', 'c')
      .leftJoin('p.speciality', 'sp')
      .leftJoinAndSelect('p.credentials', 'pc')
      .select([
        'p.id AS id',
        'p.first_name AS first_name',
        'p.last_name AS last_name',
        'p.base_url AS base_url',
        'p.profile_image AS profile_image',
        'p.shift_time AS shift_time',
        `jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'abbreviation', c.abbreviation,
            'text_color', c.text_color,
            'background_color', c.background_color
        ) AS certificate`,
        `jsonb_build_object(
          'is_verified',pc.is_verified,
          'credential',pc.credential_id,
          'expiry_date',pc.expiry_date
        ) AS credentials`,
      ])
      .where(
        `p.is_active = true AND (p.is_mobile_verified = true OR p.is_email_verified = true) AND profile_status != 'deleted'`,
      )
      .addOrderBy('p.id', 'ASC')
      .addOrderBy('p.first_name', 'ASC');

    if (search) {
      queryBuilder.andWhere(
        `(p.first_name ILIKE :search OR p.last_name ILIKE :search OR p.first_name || ' ' || p.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(search)}%` },
      );
    }

    if (facility_id) {
      switch (filter) {
        case FILTER_PROVIDER_BY.preferred:
        case FILTER_PROVIDER_BY.oriented:
          queryBuilder.leftJoin('p.facility_provider', 'fp');
          if (filter === FILTER_PROVIDER_BY.preferred) {
            queryBuilder
              .andWhere('fp.flag = :preferredFlag', {
                preferredFlag: FACILITY_PROVIDER_FLAGS.preferred,
              })
              .andWhere('fp.facility_id = :facilityId', {
                facilityId: facility_id,
              });
          } else {
            queryBuilder
              .andWhere('(fp.flag IS NULL OR fp.flag != :dnrFlag)', {
                dnrFlag: FACILITY_PROVIDER_FLAGS.dnr,
              })
              .andWhere('fp.facility_id = :facilityId', {
                facilityId: facility_id,
              });
          }
          break;

        case FILTER_PROVIDER_BY.ai:
          const facility = await this.facilityRepository.findOne({
            where: { id: facility_id },
          });

          const providers = await this.aiService.getAIRecommendations(
            facility.id,
            speciality_id,
            certificate_id,
          );

          if (providers && providers.length > 0) {
            queryBuilder.andWhere('p.id IN (:...providerIds)', {
              providerIds: providers,
            });
          } else return [];
          break;
      }
    }

    queryBuilder.andWhere(
      `(c.id = :certificateId
        OR :certificateId = ANY(p.additional_certification))
       AND (sp.id = :specialityId
        OR :specialityId = ANY(p.additional_speciality))`,
    );
    queryBuilder.setParameters({
      certificateId: certificate_id,
      specialityId: speciality_id,
    });

    const providers = await queryBuilder.getRawMany();

    const isCredentialValid = (credentials: any): boolean => {
      if (!credentials) return false;
      if (credentials.is_verified === false) return false;
      if (new Date(credentials.expiry_date) < new Date()) return false;
      return true;
    };

    const patchMidnight = (time: string) =>
      time === '00:00' ? '23:59:59' : time;

    const subtractOneSecond = (time: string): string => {
      return moment(time, 'HH:mm:ss').subtract(1, 'seconds').format('HH:mm:ss');
    };

    const patchedEndTime = subtractOneSecond(patchMidnight(end_time));

    const shiftsQuery = await this.shiftRepository
      .createQueryBuilder('shift')
      .leftJoin('shift.provider', 'p')
      .select([
        'shift.provider_id AS provider',
        `TO_CHAR(shift.start_date, 'YYYY-MM-DD') AS start_date`,
        'shift.start_time AS start_time',
        `CASE
         WHEN shift.end_time = '00:00' THEN '23:59:59'
         ELSE shift.end_time
       END AS end_time`,
        'shift.facility_id AS facility_id',
      ])
      .andWhere(
        `TO_CHAR(shift.start_date, 'YYYY-MM-DD') IN (:...dates) AND shift.status = :scheduled OR shift.status = :ongoing`,
        {
          dates,
          scheduled: SHIFT_STATUS.scheduled,
          ongoing: SHIFT_STATUS.ongoing,
        },
      )
      .getRawMany();

    const results = await Promise.all(
      providers.map(async (provider) => {
        let availabilityStatus = AVAILABILITY_STATUS.UNAVAILABLE;
        const bookedShifts = [];
        const availableDates: string[] = [];
        const unavailableDates: string[] = [];

        if (!isCredentialValid(provider.credentials)) {
          return {
            ...provider,
            availability: AVAILABILITY_STATUS.UNAVAILABLE,
            booked_shift: bookedShifts,
            reason: 'Invalid or expired credentials',
          };
        }

        // check preferences of provider
        const providerPreferences = provider.shift_time;
        const shiftCode = await getTimeCode(
          start_time,
          end_time,
          facility_id,
          this.shiftRepository,
        );
        const hasMatchingShiftTime =
          providerPreferences && providerPreferences[shiftCode] === true;

        // check providers availability
        let isUnavailable = false;

        dates.forEach((requestedDate) => {
          const matchingShifts = shiftsQuery.filter(
            (shift) =>
              shift.provider === provider.id &&
              shift.start_date === requestedDate,
          );

          let isDateUnavailable = false;

          matchingShifts.forEach((shift) => {
            const shiftStart = moment(
              `${shift.start_date} ${shift.start_time}`,
              'YYYY-MM-DD HH:mm:ss',
            );

            const shiftEnd =
              shift.end_time === '00:00'
                ? moment(`${shift.start_date} 23:59:59`, 'YYYY-MM-DD HH:mm:ss')
                : moment(
                    `${shift.start_date} ${subtractOneSecond(shift.end_time)}`,
                    'YYYY-MM-DD HH:mm:ss',
                  );

            const requestStart = moment(
              `${requestedDate} ${start_time}`,
              'YYYY-MM-DD HH:mm',
            );

            const requestEnd = moment(
              `${requestedDate} ${patchedEndTime}`,
              'YYYY-MM-DD HH:mm:ss',
            );

            const isSameFacility = shift.facility_id === facility_id;
            const bufferEnd = isSameFacility
              ? shiftEnd.clone()
              : shiftEnd.clone().add(1, 'hour');

            const isOverlapping =
              requestStart.isBefore(bufferEnd) &&
              requestEnd.isAfter(shiftStart);

            if (isOverlapping) {
              bookedShifts.push({
                start_time: shift.start_time,
                end_time: shift.end_time,
                start_date: shift.start_date,
                facility: shift.facility_id,
              });

              if (bookedShifts.length > 0) {
                isDateUnavailable = true;
              }
            }
          });

          if (isDateUnavailable) {
            unavailableDates.push(requestedDate);
            isUnavailable = true;
          } else {
            availableDates.push(requestedDate);
          }
        });

        const formattedUnavailableDates = unavailableDates.map((date) =>
          moment(date).format('MM/DD/YYYY'),
        );
        const formattedAvailableDates = availableDates.map((date) =>
          moment(date).format('MM/DD/YYYY'),
        );
        let reason = '';
        if (bookedShifts.length === dates.length && isUnavailable) {
          availabilityStatus = AVAILABILITY_STATUS.UNAVAILABLE;
          reason = CONSTANT.VALIDATION.PROVIDER_UNAVAILABLE(
            `${provider.first_name} ${provider.last_name}`,
          );
        } else if (bookedShifts.length > 0 && isUnavailable) {
          availabilityStatus = AVAILABILITY_STATUS.PARTIAL;
          reason = CONSTANT.VALIDATION.PARTIAL_AVAILABLE(
            `${provider.first_name} ${provider.last_name}`,
            formattedUnavailableDates,
            formattedAvailableDates,
          );
        } else if (hasMatchingShiftTime) {
          availabilityStatus = AVAILABILITY_STATUS.AVAILABLE;
          reason = `Provider ${provider.first_name} ${provider.last_name} is available on ${formattedAvailableDates.join(', ')}`;
        } else {
          reason = CONSTANT.VALIDATION.SHIFT_TIME_PREFERENCE_MISMATCH(
            `${provider.first_name} ${provider.last_name}`,
          );
        }
        return {
          id: provider.id,
          first_name: provider.first_name,
          last_name: provider.last_name,
          base_url: provider.base_url,
          profile_image: provider.profile_image,
          certificate: provider.certificate,
          availability: availabilityStatus,
          booked_shift: bookedShifts,
          reason,
        };
      }),
    );

    return results;
  }

  async getAllProviderV3(
    filterProviderDto: FilterProviderV2Dto,
    req: IRequest,
  ) {
    const {
      facility_id,
      speciality_id,
      certificate_id,
      start_time,
      end_time,
      dates,
      filter,
      search,
    } = filterProviderDto;

    if (!dates || dates.length === 0) return [];
    dates.sort((a, b) => moment(a).diff(moment(b)));

    const facility = await this.facilityRepository.findOne({
      where: { id: facility_id },
    });

    const queryBuilder = this.facilityProviderRepository
      .createQueryBuilder('fp')
      .distinctOn(['fp.provider_id'])
      .leftJoin('fp.provider', 'p')
      .leftJoin('fp.facility', 'f')
      .leftJoin('p.certificate', 'c')
      .leftJoin('p.speciality', 'sp')
      .leftJoin('p.status', 'st')
      .select([
        'p.id AS id',
        'p.first_name AS first_name',
        'p.last_name AS last_name',
        'p.base_url AS base_url',
        'p.profile_image AS profile_image',
        'p.verification_status AS verification_status',
        `jsonb_build_object(
          'id', st.id,
          'name', st.name
        ) AS status`,
        `jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation,
          'text_color', c.text_color,
          'background_color', c.background_color
        ) AS certificate`,
      ])
      .addSelect(
        `(SELECT COALESCE(JSON_AGG(row_to_json(t)), '[]')
          FROM (
            SELECT DISTINCT ON (pc.credential_id)
              pc.id,
              pc.name,
              pc.is_verified,
              pc.credential_id,
              pc.expiry_date,
              c.name as credential_name,
              c.approval_required,
              c.validate
            FROM provider_credential pc
            LEFT JOIN credentials c ON pc.credential_id = c.id
            WHERE pc.provider_id = p.id
              AND pc.is_other = false
              AND pc.deleted_at IS NULL
            ORDER BY pc.credential_id ASC, pc.created_at DESC
          ) t
        )`,
        'credentials',
      )

      .where(
        `fp.facility_id = '${facility_id}' AND p.is_active = true AND (p.is_mobile_verified = true OR p.is_email_verified = true) AND profile_status != 'deleted'`,
      )
      .addOrderBy('fp.provider_id', 'ASC')
      .addOrderBy('p.first_name', 'ASC');

    if (search) {
      queryBuilder.andWhere(
        `(p.first_name ILIKE :search OR p.last_name ILIKE :search OR p.first_name || ' ' || p.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(search)}%` },
      );
    }

    if (facility_id) {
      switch (filter) {
        case FILTER_PROVIDER_BY.preferred:
          queryBuilder.andWhere(
            `fp.flag = '${FACILITY_PROVIDER_FLAGS.preferred}' AND fp.facility_id = '${facility_id}'`,
          );
          break;

        case FILTER_PROVIDER_BY.ai: {
          const providersAI = await this.aiService.getAIRecommendations(
            facility.id,
            speciality_id,
            certificate_id,
          );
          if (providersAI && providersAI.length > 0) {
            queryBuilder.andWhere('p.id IN (:...providerIds)', {
              providerIds: providersAI,
            });
          } else return [];
          break;
        }
      }
    }

    // Only list staff matching certificate/speciality (keep)
    queryBuilder.andWhere(
      `(c.id = :certificateId OR :certificateId = ANY(p.additional_certification))
     AND (sp.id = :specialityId OR :specialityId = ANY(p.additional_speciality))`,
    );
    queryBuilder.setParameters({
      certificateId: certificate_id,
      specialityId: speciality_id,
    });

    const providers = await queryBuilder.getRawMany();
    if (!providers || providers.length === 0) return [];

    const providerIds: string[] = providers.map((p: any) => p.id);

    const profileRows: ProfileRow[] = await this.shiftRepository.query(
      `
    SELECT provider_id,
           to_char(d, 'YYYY-MM-DD') AS d,
           time_code,
           global_ok,
           profile_ok,
           profile_source,
           profile_reason
    FROM fn_availability_of_staff_with_temp_perm_message($1::uuid[], $2::date[], $3::uuid, $4::time, $5::time)
    `,
      [providerIds, dates, facility_id, start_time, end_time],
    );

    // index profile decisions by provider|date
    const profileIndex = new Map<string, ProfileRow>();
    for (const r of profileRows) profileIndex.set(`${r.provider_id}|${r.d}`, r);

    // fetch conflicts in bulk
    const conflicts: ConflictRow[] = await this.shiftRepository.query(
      `
    SELECT
      provider_id,
      to_char(start_date, 'YYYY-MM-DD') AS start_date,
      to_char(start_time, 'HH24:MI:SS') AS start_time,
      to_char(end_time,   'HH24:MI:SS') AS end_time,
      facility_id
    FROM fn_conflicting_shifts_bulk($1::uuid[], $2::uuid, $3::date[], $4::time, $5::time, $6::uuid)
    `,
      [providerIds, facility_id, dates, start_time, end_time, null],
    );

    const conflictIndex = new Map<string, ConflictRow[]>();
    for (const c of conflicts) {
      const k = `${c.provider_id}|${c.start_date}`;
      const arr = conflictIndex.get(k) ?? [];
      arr.push(c);
      conflictIndex.set(k, arr);
    }

    const results = await Promise.all(
      providers.map((provider) =>
        this.processProviderAvailability(
          provider,
          dates,
          facility,
          req,
          profileIndex,
          conflictIndex,
        ),
      ),
    );

    return results;
  }

  private async processProviderAvailability(
    provider: any,
    dates: string[],
    facility: any,
    req: IRequest,
    profileIndex: Map<string, ProfileRow>,
    conflictIndex: Map<string, ConflictRow[]>,
  ) {
    let availabilityStatus = AVAILABILITY_STATUS.UNAVAILABLE;
    const bookedShifts: Array<{
      start_time: string;
      end_time: string;
      start_date: string;
      facility: string;
    }> = [];
    const availableDates: string[] = [];
    const unavailableDates: string[] = [];

    // track per-cause
    const blockedBy = {
      global: [] as string[],
      profileTemp: [] as string[],
      profilePerm: [] as string[],
      profileProgressIncomplete: [] as string[],
      facilityDNR: [] as string[],
      selfDNR: [] as string[],
      bothDNR: [] as string[],
      conflict: [] as string[],
      credentials: [] as string[],
    };

    // Check credentials first (global gate)
    if (!validateCredentials(provider, facility.timezone, req).ok) {
      for (const d of dates) {
        blockedBy.credentials.push(d);
        unavailableDates.push(d);
      }
    } else {
      // Priority order: (profile_check = credentials_check) > shift_conflict_check
      for (const requestedDate of dates) {
        const key = `${provider.id}|${requestedDate}`;
        const dec = profileIndex.get(key);

        // defaults if somehow missing (shouldn't happen)
        const globalOK = dec?.global_ok ?? false;
        const profileOK = dec?.profile_ok ?? true;

        // Priority 1: Profile check (highest priority blocker)
        if (!globalOK) {
          unavailableDates.push(requestedDate);
          blockedBy.global.push(requestedDate);
          continue;
        }
        if (!profileOK) {
          unavailableDates.push(requestedDate);
          if (dec?.profile_source === 'TEMP') {
            blockedBy.profileTemp.push(requestedDate);
          } else if (dec?.profile_source === 'PERM') {
            blockedBy.profilePerm.push(requestedDate);
          } else if (dec?.profile_source === 'PROFILE_PROGRESS_INCOMPLETE') {
            blockedBy.profileProgressIncomplete.push(requestedDate);
          } else if (dec?.profile_source === 'DNR') {
            blockedBy.facilityDNR.push(requestedDate);
          } else if (dec?.profile_source === 'SELF') {
            blockedBy.selfDNR.push(requestedDate);
          } else if (dec?.profile_source === 'DNR_BOTH') {
            blockedBy.bothDNR.push(requestedDate);
          } else {
            blockedBy.profilePerm.push(requestedDate); // conservative default
          }
          continue;
        }

        // Conflict check (lowest priority, only checked if all above pass)
        const dayConflicts = conflictIndex.get(key) ?? [];
        if (dayConflicts.length > 0) {
          unavailableDates.push(requestedDate);
          blockedBy.conflict.push(requestedDate);
          for (const s of dayConflicts) {
            bookedShifts.push({
              start_time: s.start_time,
              end_time: s.end_time,
              start_date: s.start_date,
              facility: s.facility_id,
            });
          }
        } else {
          availableDates.push(requestedDate);
        }
      }
    }

    let reason = '';
    if (unavailableDates.length === dates.length) {
      availabilityStatus = AVAILABILITY_STATUS.UNAVAILABLE;
      reason = this.determineAvailabilityReason(
        provider,
        blockedBy,
        bookedShifts,
      );
    } else if (unavailableDates.length > 0) {
      availabilityStatus = AVAILABILITY_STATUS.PARTIAL;
      reason = CONSTANT.VALIDATION.PARTIAL_AVAILABLE(
        `${provider.first_name} ${provider.last_name}`,
        unavailableDates.map((d) => moment(d).format('MM/DD/YYYY')),
        availableDates.map((d) => moment(d).format('MM/DD/YYYY')),
      );
    } else {
      availabilityStatus = AVAILABILITY_STATUS.AVAILABLE;
      reason = ''; // no message when fully available
    }

    return {
      id: provider.id,
      first_name: provider.first_name,
      last_name: provider.last_name,
      base_url: provider.base_url,
      profile_image: provider.profile_image,
      certificate: provider.certificate,
      availability: availabilityStatus,
      booked_shift: bookedShifts,
      reason,
    };
  }

  private determineAvailabilityReason(
    provider: any,
    blockedBy: any,
    bookedShifts: any[],
  ): string {
    const fmt = (arr: string[]) =>
      arr.map((d) => moment(d).format('MM/DD/YYYY')).join(', ');

    // Priority order for reason: profile > orientation > credentials > shift_conflict
    if (blockedBy.credentials.length) {
      return CONSTANT.VALIDATION.PENDING_OR_EXPIRED;
    } else if (blockedBy.global.length) {
      return CONSTANT.VALIDATION.SHIFT_TIME_PREFERENCE_MISMATCH(
        `${provider.first_name} ${provider.last_name}`,
      );
    } else if (
      blockedBy.profileTemp.length ||
      blockedBy.profilePerm.length ||
      blockedBy.profileProgressIncomplete.length ||
      blockedBy.facilityDNR.length ||
      blockedBy.selfDNR.length ||
      blockedBy.bothDNR.length
    ) {
      if (blockedBy.profileTemp.length && blockedBy.profilePerm.length) {
        return CONSTANT.VALIDATION.STAFF_TEMP_PERM_AVAILABILITY(
          fmt(blockedBy.profileTemp),
          fmt(blockedBy.profilePerm),
        );
      } else if (blockedBy.profileTemp.length) {
        return CONSTANT.VALIDATION.STAFF_TEMP_AVAILABILITY(
          fmt(blockedBy.profileTemp),
        );
      } else if (blockedBy.profileProgressIncomplete.length) {
        return CONSTANT.ERROR.STAFF_PROFILE_UNVERIFIED;
      } else if (blockedBy.facilityDNR.length) {
        return CONSTANT.VALIDATION.STAFF_FACILITY_DNR;
      } else if (blockedBy.selfDNR.length) {
        return CONSTANT.VALIDATION.STAFF_SELF_DNR;
      } else if (blockedBy.bothDNR.length) {
        return CONSTANT.VALIDATION.STAFF_BOTH_DNR;
      } else {
        return CONSTANT.VALIDATION.STAFF_PERM_AVAILABILITY(
          fmt(blockedBy.profilePerm),
        );
      }
    } else if (blockedBy.conflict.length) {
      const notes = bookedShifts
        .map(
          (b) =>
            `${moment(b.start_date).format('MM/DD/YYYY')} ${moment(b.start_time, 'HH:mm:ss').format('hh:mm A')}-${moment(b.end_time, 'HH:mm').format('hh:mm A')}`,
        )
        .join(', ');
      return CONSTANT.VALIDATION.OVERLAP_SHIFT(notes);
    } else {
      return CONSTANT.VALIDATION.PROVIDER_UNAVAILABLE(
        `${provider.first_name} ${provider.last_name}`,
      );
    }
  }

  async getShiftTypes() {
    const shiftTypes = await this.shiftTypeRepository.find({
      where: { status: DEFAULT_STATUS.active },
      select: {
        id: true,
        name: true,
        shift_type: true,
        status: true,
      },
    });

    const categorizedShiftTypes = {
      [SHIFT_TYPE.per_diem_shifts]: [],
      [SHIFT_TYPE.long_term_shifts]: [],
      [SHIFT_TYPE.travel_assignments]: [],
    };

    shiftTypes.forEach((shiftType) => {
      categorizedShiftTypes[shiftType.shift_type].push(shiftType);
    });

    return categorizedShiftTypes;
  }

  async getLineOfBusiness() {
    const lob = await this.lineOfBusinessRepository.find({
      where: { status: DEFAULT_STATUS.active },
      select: { id: true, name: true, work_comp_code: true },
    });

    return lob;
  }

  async getAllTimecardRejectReason() {
    const data = await this.timecardRejectReasonRepository.find({
      where: { status: DEFAULT_STATUS.active },
      select: { id: true, reason: true },
    });

    return data;
  }

  async getCredentialsCategory() {
    const data = await this.credentialsCategoryRepository.find({
      where: { status: DEFAULT_STATUS.active },
      select: { id: true, name: true },
    });

    return data;
  }

  async getCompetencyTest() {
    const data = await this.competencyTestSettingRepository.find({
      where: { status: DEFAULT_STATUS.active },
      select: { id: true, name: true },
    });

    return data;
  }

  async getSkillChecklist() {
    const data = await this.skillChecklistTemplateRepository.find({
      where: { status: DEFAULT_STATUS.active },
      select: { id: true, name: true },
    });

    return data;
  }

  async getFlagList(where: FindManyOptions<FlagSetting>) {
    const flags = await this.flagSettingRepository.find(where);
    return flags;
  }

  async getDNRReason(reason_type: DNR_TYPE) {
    const data = await this.dnrReasonRepository.find({
      where: {
        reason_type,
        status: DEFAULT_STATUS.active,
      },
      select: {
        id: true,
        reason: true,
      },
    });

    return data;
  }

  async getEDocGroups() {
    const data = await this.eDocsGroupRepository.find({
      where: {
        status: DEFAULT_STATUS.active,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return data;
  }

  async getAllAdminUser(options: FindManyOptions<Admin>) {
    const data = await this.adminRepository.find(options);
    return data;
  }

  async getEDocs() {
    const data = await this.eDocsGroupRepository.find({
      relations: { document: true },
      where: {
        status: DEFAULT_STATUS.active,
      },
      select: {
        id: true,
        name: true,
        document: {
          id: true,
          name: true,
        },
      },
    });

    return data;
  }

  async getAllFloorListing(where: FindManyOptions<FloorDetail>) {
    const result = await this.floorDetailRepository.find(where);
    return result;
  }

  async getStatusOption(options: FindManyOptions<StatusSetting>) {
    const data = await this.statusSettingRepository.find(options);
    return plainToInstance(StatusSetting, data);
  }

  async getStatusOptionAsRequired(query: SearchUserByTypeDropdownDto) {
    // Fetch everything once
    const all = await this.statusSettingRepository
      .createQueryBuilder('ss')
      .where('ss.status = :active', { active: DEFAULT_STATUS.active })
      .orderBy('ss.name', 'ASC')
      .getMany();

    const wantsProvider = query.provider;
    const wantsFacility = query.facility;

    // If neither flag is provided → return all
    const returnAll = !wantsProvider && !wantsFacility;

    // Split results
    const provider =
      wantsProvider || returnAll
        ? all.filter((i) => i.status_for === USER_TYPE.provider)
        : [];

    const facility =
      wantsFacility || returnAll
        ? all.filter((i) => i.status_for === USER_TYPE.facility)
        : [];

    return {
      provider: plainToInstance(StatusSetting, provider),
      facility: plainToInstance(StatusSetting, facility),
    };
  }

  async relatesTo(search: string) {
    const facility = await this.facilityRepository.find({
      where: search
        ? {
            name: ILike(`%${parseSearchKeyword(search)}%`),
          }
        : {},
      relations: { status: true },
      select: {
        id: true,
        name: true,
        base_url: true,
        image: true,
      },
      order: { name: 'ASC' },
    });
    const facilityUser = await this.facilityUserRepository.find({
      where: search
        ? [
            {
              first_name: ILike(`%${parseSearchKeyword(search)}%`),
            },
            {
              last_name: ILike(`%${parseSearchKeyword(search)}%`),
            },
          ]
        : {},
      select: {
        id: true,
        first_name: true,
        last_name: true,
        base_url: true,
        image: true,
      },
      order: { first_name: 'ASC', last_name: 'ASC' },
    });
    const qb = this.providerRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.status', 'status')
      .select([
        'provider.id',
        'provider.first_name',
        'provider.last_name',
        'provider.base_url',
        'provider.profile_image',
      ])
      .andWhere('provider.is_active = true')
      .andWhere('provider.first_name IS NOT NULL')
      .andWhere('provider.last_name IS NOT NULL');

    if (search) {
      const keyword = `%${parseSearchKeyword(search)}%`;
      qb.andWhere(
        '(provider.first_name ILIKE :keyword OR provider.last_name ILIKE :keyword)',
        { keyword },
      );
    }

    qb.orderBy('provider.first_name', 'ASC').addOrderBy(
      'provider.last_name',
      'ASC',
    );

    const provider = await qb.getMany();

    return { facility, facility_user: facilityUser, provider };
  }

  async tags(search: string) {
    const tag = await this.tagRepository.find({
      where: search
        ? {
            name: ILike(`%${parseSearchKeyword(search)}%`),
            status: DEFAULT_STATUS.active,
          }
        : { status: DEFAULT_STATUS.active },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });

    return tag;
  }

  async getAllProviderRejectReason() {
    const data = await this.providerRejectReasonRepository.find({
      where: { status: DEFAULT_STATUS.active },
      select: ['id', 'reason'],
      order: { reason: 'ASC' },
    });

    return data;
  }

  async getAllOrientationRejectReason() {
    const data = await this.orientationRejectReasonRepository.find({
      where: { status: DEFAULT_STATUS.active },
      select: ['id', 'reason'],
      order: { reason: 'ASC' },
    });

    return data;
  }

  async searchProvider(search: string, _status: 'Active' | 'Applicant') {
    const queryBuilder = this.providerRepository
      .createQueryBuilder('p')
      .leftJoin('p.status', 'st')
      .select([
        'p.id AS id',
        'p.first_name AS first_name',
        'p.last_name AS last_name',
        'p.base_url AS base_url',
        'p.profile_image AS profile_image',
      ]);

    if (search && parseSearchKeyword(search)) {
      queryBuilder.andWhere(
        `(p.first_name ILIKE :search OR p.last_name ILIKE :search OR p.first_name || ' ' || p.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(search)}%` },
      );
    }

    const data = await queryBuilder
      .orderBy('p.first_name', 'ASC')
      .addOrderBy('p.last_name', 'ASC')
      .getRawMany();

    return data;
  }

  async searchUsers(search: string, facilityId: string) {
    const queryBuilder = this.facilityUserRepository
      .createQueryBuilder('fu')
      .select([
        'fu.id AS id',
        'fu.first_name AS first_name',
        'fu.last_name AS last_name',
        'fu.base_url AS base_url',
        'fu.image AS image',
      ]);

    if (facilityId) {
      queryBuilder.andWhere('fu.facility_id = :facilityId', { facilityId });
    }

    if (search && parseSearchKeyword(search)) {
      queryBuilder.andWhere(
        `(fu.first_name ILIKE :search OR fu.last_name ILIKE :search OR fu.first_name || ' ' || fu.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(search)}%` },
      );
    }

    const data = await queryBuilder
      .orderBy('fu.first_name', 'ASC')
      .addOrderBy('fu.last_name', 'ASC')
      .getRawMany();

    const query = this.adminRepository
      .createQueryBuilder('admin')
      .select([
        'admin.id AS id',
        'admin.first_name AS first_name',
        'admin.last_name AS last_name',
        'admin.base_url AS base_url',
        'admin.image AS image',
      ])
      .where(`admin.status = 'active'`);

    if (search && parseSearchKeyword(search)) {
      query.andWhere(
        `(admin.first_name ILIKE :search OR admin.last_name ILIKE :search OR admin.first_name || ' ' || admin.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(search)}%` },
      );
    }

    const adminData = await query
      .orderBy('admin.first_name', 'ASC')
      .addOrderBy('admin.last_name', 'ASC')
      .getRawMany();

    if (adminData.length > 0) data.push(...adminData);

    return data;
  }

  async getPrimaryContact(search: string) {
    const queryBuilder = await this.facilityUserRepository
      .createQueryBuilder('fu')
      .select([
        'fu.id AS id',
        'fu.first_name AS first_name',
        'fu.last_name AS last_name',
        'fu.base_url AS base_url',
        'fu.image AS image',
      ])
      .where(`fu.primary_facility_id IS NOT NULL`)
      .andWhere(`fu.status = 'active'`);

    if (search && parseSearchKeyword(search)) {
      queryBuilder.andWhere(
        `(fu.first_name ILIKE :search OR fu.last_name ILIKE :search OR fu.first_name || ' ' || fu.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(search)}%` },
      );
    }

    const data = await queryBuilder
      .orderBy('fu.first_name', 'ASC')
      .addOrderBy('fu.last_name', 'ASC')
      .getRawMany();

    return data;
  }

  async getDocuments(filter: SearchDropdownDto) {
    const { search, category, document, notes } = filter;
    const data = [];
    // admin document dropdown
    if (category) {
      const acQuery = this.adminDocumentRepository
        .createQueryBuilder('ad')
        .select([
          'ad.id AS id',
          'ad.name AS name',
          'ad.status AS status',
          'ad.category AS category',
        ]);
      if (search && parseSearchKeyword(search)) {
        const keyword = `%${parseSearchKeyword(search)}%`;
        acQuery.where('ad.category::text ILIKE :search', { search: keyword });
      }
      const acData = await acQuery.orderBy('ad.category', 'ASC').getRawMany();
      data.push(...acData);
    }

    // document dropdown
    if (document || notes) {
      const docQuery = this.documentRepository.createQueryBuilder('doc');

      if (document) {
        docQuery.select([
          'doc.id AS id',
          'doc.name AS name',
          'doc.filename AS filename',
          'doc.original_filename AS original_filename',
        ]);
        if (search && parseSearchKeyword(search)) {
          const keyword = `%${parseSearchKeyword(search)}%`;
          docQuery.where(
            'doc.name ILIKE :search OR doc.original_filename ILIKE :search OR doc.filename ILIKE :search',
            { search: keyword },
          );
        }
        docQuery.orderBy('doc.name', 'ASC');
      }
      if (notes) {
        docQuery.select(['doc.id AS id', 'doc.document_notes AS notes']);
        if (search && parseSearchKeyword(search)) {
          const keyword = `%${parseSearchKeyword(search)}%`;
          docQuery.where('doc.document_notes ILIKE :search', {
            search: keyword,
          });
        }
        docQuery.orderBy('doc.document_notes', 'ASC');
      }

      const docData = await docQuery.getRawMany();
      data.push(...docData);
    }

    return data;
  }

  async getUserByType(filter: SearchUserByTypeDropdownDto) {
    const { search, admin, facility_user, provider } = filter;

    // If all three are undefined, include all types. Otherwise include only those explicitly true.
    const includeAll =
      admin === undefined &&
      facility_user === undefined &&
      provider === undefined;
    const includeAdmin = includeAll ? true : !!admin;
    const includeFacilityUser = includeAll ? true : !!facility_user;
    const includeProvider = includeAll ? true : !!provider;

    const data = [];

    if (includeAdmin) {
      const aQuery = this.adminRepository
        .createQueryBuilder('a')
        .select([
          'a.id AS id',
          "a.first_name || ' ' || a.last_name AS name",
          'a.base_url AS base_url',
          'a.image AS image',
          "'admin' AS user_type",
        ]);
      if (search && parseSearchKeyword(search)) {
        const keyword = `%${parseSearchKeyword(search)}%`;
        aQuery.where(
          "a.first_name ILIKE :search OR a.last_name ILIKE :search OR a.first_name || ' ' || a.last_name ILIKE :search",
          { search: keyword },
        );
      }
      const aData = await aQuery.orderBy('a.first_name', 'ASC').getRawMany();
      data.push(...aData);
    }

    if (includeFacilityUser) {
      const fuQuery = this.facilityUserRepository
        .createQueryBuilder('fu')
        .select([
          'fu.id AS id',
          "fu.first_name || ' ' || fu.last_name AS name",
          'fu.base_url AS base_url',
          'fu.image AS image',
          "'facility_user' AS user_type",
        ]);
      if (search && parseSearchKeyword(search)) {
        const keyword = `%${parseSearchKeyword(search)}%`;
        fuQuery.where(
          "fu.first_name ILIKE :search OR fu.last_name ILIKE :search OR fu.first_name || ' ' || fu.last_name ILIKE :search",
          { search: keyword },
        );
      }
      fuQuery.orderBy('fu.first_name', 'ASC');
      const fuData = await fuQuery.getRawMany();
      data.push(...fuData);
    }

    if (includeProvider) {
      const pQuery = this.providerRepository
        .createQueryBuilder('p')
        .select([
          'p.id AS id',
          "p.first_name || ' ' || p.last_name AS name",
          'p.base_url AS base_url',
          'p.profile_image AS image',
          "'provider' AS user_type",
        ]);
      if (search && parseSearchKeyword(search)) {
        const keyword = `%${parseSearchKeyword(search)}%`;
        pQuery.where(
          "p.first_name ILIKE :search OR p.last_name ILIKE :search OR p.first_name || ' ' || p.last_name ILIKE :search",
          { search: keyword },
        );
      }
      const pData = await pQuery.orderBy('p.first_name', 'ASC').getRawMany();
      data.push(...pData);
    }

    return data;
  }

  async getCredentialRejectReason() {
    const data = await this.credentialRejectReasonRepository.find({
      where: { status: DEFAULT_STATUS.active },
      select: ['id', 'reason'],
      order: { reason: 'ASC' },
    });

    return data;
  }

  async getReferenceRejectReasons() {
    const data = await this.professionalReferenceRejectReasonRepository.find({
      where: { status: DEFAULT_STATUS.active },
      select: ['id', 'reason'],
      order: { reason: 'ASC' },
    });

    return data;
  }

  async categoriesWithCredentialsDocuments(filter: QueryParamsDto) {
    const { search } = filter;

    const queryBuilder = this.credentialsCategoryRepository
      .createQueryBuilder('cc')
      .leftJoin('cc.credentials', 'c')
      .select([
        'cc.id',
        'cc.created_at',
        'cc.name',
        'cc.status',

        'c.id',
        'c.created_at',
        'c.name',
      ])
      .where('cc.status = :active', { active: DEFAULT_STATUS.active })
      .orderBy('cc.name', 'ASC')
      .addOrderBy('c.name', 'ASC');

    if (search && parseSearchKeyword(search)) {
      const keyword = `%${parseSearchKeyword(search)}%`;
      queryBuilder.andWhere('cc.name ILIKE :search OR c.name ILIKE :search', {
        search: keyword,
      });
    }

    return await queryBuilder.getMany();
  }
}
