import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindOptionsWhere } from 'typeorm';
import { ProviderOrientation } from './entities/provider-orientation.entity';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { plainToClass, plainToInstance } from 'class-transformer';
import { FilterProviderOrientationDto } from './dto/filter-provider-orientation.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CreateProviderOrientationDto } from './dto/create-provider-orientation.dto';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  CREDENTIAL_STATUS,
  EJS_FILES,
  ORIENTATION_STATUS,
  ORIENTATION_TYPE,
  PushNotificationType,
  TABLE,
} from '@/shared/constants/enum';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { CONSTANT } from '@/shared/constants/message';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import * as moment from 'moment';
import { Shift } from '@/shift/entities/shift.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Documents } from '../documents/entities/documents.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { IRequest } from '@/shared/constants/types';
import { Activity } from '@/activity/entities/activity.entity';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';
import { CreateShiftRequestDto } from '@/shift-request/dto/create-shift-request.dto';

@Injectable()
export class ProviderOrientationService {
  constructor(
    @InjectRepository(ProviderOrientation)
    private readonly providerOrientationRepository: Repository<ProviderOrientation>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Documents)
    private readonly orientationDocumentRepository: Repository<Documents>,
    @InjectRepository(FacilityProvider)
    private readonly facilityProviderRepository: Repository<FacilityProvider>,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(ShiftRequest)
    private readonly shiftRequestRepository: Repository<ShiftRequest>,
  ) {}

  async create(
    createProviderOrientationDto: CreateProviderOrientationDto,
  ): Promise<ProviderOrientation> {
    const providerOrientation = this.providerOrientationRepository.create({
      ...createProviderOrientationDto,
      facility: { id: createProviderOrientationDto.facility_id } as any,
      provider: { id: createProviderOrientationDto.provider_id } as any,
    });
    const result =
      await this.providerOrientationRepository.save(providerOrientation);
    return plainToInstance(ProviderOrientation, result);
  }

  async findAll(
    facilityId: string,
    filterProviderOrientationDto: FilterProviderOrientationDto,
  ): Promise<[any[], number]> {
    const {
      limit,
      offset,
      order,
      status,
      certificate_id,
      speciality_id,
      search,
      start_date,
      end_date,
    } = filterProviderOrientationDto;

    const queryBuilder = this.providerOrientationRepository
      .createQueryBuilder('po')
      .leftJoin('po.provider', 'p')
      .leftJoin('po.facility', 'f')
      .leftJoin('p.certificate', 'c')
      .leftJoin('p.speciality', 's')
      .leftJoin('po.shift', 'sh')
      .select([
        'po.id as id',
        "TO_CHAR(po.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at",
        "TO_CHAR(po.updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at",
        `po.status::text as status`,
        'po.is_read AS is_read',

        // provider JSON
        `json_build_object(
        'id', p.id,
        'first_name', p.first_name,
        'middle_name', p.middle_name,
        'last_name', p.last_name,
        'base_url', p.base_url,
        'profile_image', p.profile_image,
        'email', p.email,
        'mobile_no', p.mobile_no,
        'certificate', json_build_object(
          'id', c.id,
          'name', c.name,
          'abbreviation', c.abbreviation
        ),
        'speciality', json_build_object(
          'id', s.id,
          'name', s.name,
          'abbreviation', s.abbreviation
        )
      ) as provider`,

        // facility JSON
        `json_build_object(
        'id', f.id,
        'name', f.name,
        'orientation_process', f.orientation_process,
        'orientation_document', f.orientation_document,
        'original_filename', f.original_filename,
        'base_url', f.base_url,
        'orientation_enabled', f.orientation_enabled
      ) as facility`,

        // shift JSON (nullable)
        `CASE
        WHEN sh.id IS NOT NULL
        THEN json_build_object('id', sh.id)
        ELSE NULL
      END as shift`,
      ])
      .where(
        "po.facility_id = :facilityId AND po.deleted_at IS NULL AND po.status != 'completed'",
        {
          facilityId,
        },
      );

    // Apply filters
    if (status?.length) {
      queryBuilder.andWhere(
        `po.status::text IN (:...status) AND po.status != 'completed'`,
        {
          status,
        },
      );
    }

    if (certificate_id) {
      queryBuilder.andWhere('p.certificate_id IN (:...certificate_id)', {
        certificate_id,
      });
    }

    if (speciality_id) {
      queryBuilder.andWhere('p.speciality_id IN (:...speciality_id)', {
        speciality_id,
      });
    }

    if (start_date) {
      queryBuilder.andWhere('DATE(po.created_at) >= :start_date', {
        start_date,
      });
    }

    if (end_date) {
      queryBuilder.andWhere('DATE(po.created_at) <= :end_date', {
        end_date,
      });
    }

    // Search functionality
    if (search) {
      queryBuilder.andWhere(
        `(p.first_name ILIKE :search OR p.last_name ILIKE :search OR p.email ILIKE :search OR p.first_name || ' ' || p.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(search)}%` },
      );
    }
    const ORDER_BY_MAP = {
      status: 'po.status::text',
      created_at: 'po.created_at',
      'provider.name': `p.first_name || ' ' || p.last_name`,
      'provider.email': 'p.email',
      'provider.mobile_no': 'p.mobile_no',
      'provider.certificate': 'c.name',
      'provider.speciality': 's.name',
    };
    // Apply ordering
    if (order) {
      Object.entries(order).forEach(([column, direction]) => {
        const orderExpr = ORDER_BY_MAP[column];
        if (!orderExpr) {
          throw new BadRequestException(`Invalid order field: ${column}`);
        }
        queryBuilder.addOrderBy(orderExpr, direction);
      });
    }

    // Apply pagination
    if (limit) {
      queryBuilder.limit(+limit);
    }
    if (offset) {
      queryBuilder.offset(+offset);
    }

    // total count (separate query without pagination)
    const count = await queryBuilder.clone().getCount();

    // raw JSON output
    const list = await queryBuilder.getRawMany();

    return [plainToInstance(ProviderOrientation, list), count];
  }

  async findOneWhere(
    where: FindOneOptions<ProviderOrientation>,
  ): Promise<ProviderOrientation | null> {
    const result = await this.providerOrientationRepository.findOne(where);
    return plainToInstance(ProviderOrientation, result);
  }

  async findOrientationDocument(
    where: FindOneOptions<Documents>,
  ): Promise<Documents | null> {
    const result = await this.orientationDocumentRepository.findOne(where);
    return plainToInstance(Documents, result);
  }

  async updateOrientationDocument(
    where: FindOptionsWhere<Documents>,
    data: Partial<Documents>,
  ) {
    return await this.orientationDocumentRepository.update(where, data);
  }

  async findOneShift(options: FindOneOptions) {
    const result = await this.shiftRepository.findOne(options);
    return plainToInstance(Shift, result);
  }

  async updateShift(
    criteria: FindOptionsWhere<Shift>,
    partialEntity: QueryDeepPartialEntity<Shift>,
  ) {
    const result = await this.shiftRepository.update(criteria, partialEntity);
    return result;
  }

  async findShiftRequest(options: FindOneOptions) {
    const result = await this.shiftRequestRepository.findOne(options);
    return plainToInstance(ShiftRequest, result);
  }

  async createShiftRequest(createShiftRequestDto: CreateShiftRequestDto) {
    const data = plainToClass(ShiftRequest, createShiftRequestDto);
    const result = await this.shiftRequestRepository.save(data);
    return plainToInstance(ShiftRequest, result);
  }

  async updateShiftRequest(
    criteria: FindOptionsWhere<ShiftRequest>,
    partialEntity: QueryDeepPartialEntity<ShiftRequest>,
  ) {
    const result = await this.shiftRequestRepository.update(
      criteria,
      partialEntity,
    );
    return result;
  }

  // method to update the provider orientation status and send email to the provider
  async assignPacket(
    providerOrientation: ProviderOrientation,
    req: IRequest,
  ): Promise<void> {
    const { provider, facility } = providerOrientation;

    if (facility?.orientation_process === ORIENTATION_TYPE.orientation_shift) {
      throw new BadRequestException(
        'Orientation process is not set to electronic orientation documents',
      );
    }
    // Send email to the provider
    await sendEmailHelper({
      email: provider.email,
      name: provider.first_name,
      authority: facility.name,
      redirectUrl: `${process.env.EMAIL_VERIFICATION_URL}orientation?document=${facility?.orientation_document}&filename=${facility?.original_filename}&facility_id=${facility.id}`,
      email_type: EJS_FILES.orientation_packet,
      subject: CONSTANT.EMAIL.ORIENTATION_PACKET_SUBJECT(facility.name),
    });

    // Update the provider orientation status
    await this.providerOrientationRepository.update(
      { provider: { id: providerOrientation.provider.id } },
      { status: ORIENTATION_STATUS.packet_sent },
    );

    const isExist = await this.orientationDocumentRepository.findOne({
      where: {
        provider: { id: provider.id },
        facility: { id: facility.id },
      },
    });

    if (!isExist) {
      // Packet issuing to the provider who have requested to orientation
      await this.orientationDocumentRepository.save({
        base_url: process.env.AWS_ASSETS_PATH,
        filename: facility.orientation_document,
        name: facility.original_filename,
        original_filename: facility.original_filename,
        provider: { id: providerOrientation.provider.id },
        facility: { id: providerOrientation.facility.id },
        issue_date: moment.tz(facility.timezone).toDate(),
        uploaded_by_id: req.user.id,
        uploaded_by_type: req.user.role,
        uploaded_at: moment.tz(facility.timezone).toDate(),
        document_notes: 'Orientation Packet Issued',
      });
    }

    await this.orientationDocumentRepository.update(
      { provider: { id: provider.id }, facility: { id: facility.id } },
      {
        base_url: process.env.AWS_ASSETS_PATH,
        filename: facility.orientation_document,
        name: facility.original_filename,
        original_filename: facility.original_filename,
        provider: { id: providerOrientation.provider.id },
        facility: { id: providerOrientation.facility.id },
        issue_date: moment.tz(facility.timezone).toDate(),
        completed_date: null,
        is_verified: CREDENTIAL_STATUS.pending,
        uploaded_by_id: req.user.id,
        uploaded_by_type: req.user.role,
        uploaded_at: moment.tz(facility.timezone).toDate(),
        document_notes: 'Orientation Packet Issued',
      },
    );

    // Create notification entity (can also be pre-created/reused)
    const notification =
      await this.notificationService.createUserSpecificNotification({
        title: CONSTANT.NOTIFICATION.ORIENTATION_PACKET(facility.name),
        text: CONSTANT.NOTIFICATION.ORIENTATION_PACKET_TEXT(facility.name),
        push_type: PushNotificationType.orientation_packet,
      });

    // Send notification to provider
    await this.firebaseNotificationService.sendNotificationToOne(
      notification,
      TABLE.provider,
      provider.id,
      {
        expire_in: 0,
        is_timer: false,
        status: PushNotificationType.orientation_packet,

        // Use first shift from newShifts array for notification details
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        start_time: moment().format('HH:mm:ss'),
        end_time: moment().format('HH:mm:ss'),
        to: 'notification_data',
        created_at: new Date().toISOString(),
        facility: {
          id: facility.id,
          name: facility.name,
          base_url: process.env.AWS_ASSETS_PATH,
          document: facility.orientation_document,
          original_filename: facility.original_filename,
        },
        description: CONSTANT.NOTIFICATION.ORIENTATION_PACKET_TEXT(
          facility.name,
        ),
      },
    );
  }

  async completeOrientation() {
    // Update the provider orientation status
    await this.providerOrientationRepository.update(
      { status: ORIENTATION_STATUS.packet_sent },
      { status: ORIENTATION_STATUS.orientation_completed },
    );
  }
  async rejectOrientationRequest(
    providerOrientation: ProviderOrientation,
    reason: string,
  ): Promise<void> {
    const { provider, facility } = providerOrientation;

    // Update the provider orientation status
    await this.providerOrientationRepository.update(
      { provider: { id: provider.id }, facility: { id: facility.id } },
      {
        status: ORIENTATION_STATUS.orientation_rejected,
        reason: { id: reason },
        shift: null,
      },
    );

    // Create notification entity (can also be pre-created/reused)
    const notification =
      await this.notificationService.createUserSpecificNotification({
        title: CONSTANT.NOTIFICATION.ORIENTATION_REJECTED,
        text: CONSTANT.NOTIFICATION.ORIENTATION_REJECTED_TEXT(facility.name),
        push_type: PushNotificationType.nearby_notify,
      });

    // Send notification to provider
    await this.firebaseNotificationService.sendNotificationToOne(
      notification,
      TABLE.provider,
      provider.id,
      {
        expire_in: 0,
        is_timer: false,
        status: PushNotificationType.auto_scheduling,

        // Use first shift from newShifts array for notification details
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        start_time: moment().format('HH:mm:ss'),
        end_time: moment().format('HH:mm:ss'),
        to: 'notification_data',
        created_at: new Date().toISOString(),
        description: CONSTANT.NOTIFICATION.ORIENTATION_REJECTED_TEXT(
          facility.name,
        ),
      },
    );
  }

  async update(
    criteria: FindOptionsWhere<ProviderOrientation>,
    partialEntity: QueryDeepPartialEntity<ProviderOrientation>,
  ) {
    const record = await this.providerOrientationRepository.update(
      criteria,
      partialEntity,
    );
    return record;
  }

  async updateDocument(
    criteria: FindOptionsWhere<Documents>,
    partialEntity: QueryDeepPartialEntity<Documents>,
  ) {
    const record = await this.orientationDocumentRepository.update(
      criteria,
      partialEntity,
    );
    return record;
  }

  async remove(
    where: FindOptionsWhere<ProviderOrientation>,
    deleteDto: DeleteDto,
  ) {
    const record = await this.providerOrientationRepository.update(where, {
      deleted_at_ip: deleteDto.deleted_at_ip,
      deleted_at: new Date().toISOString(),
    });
    return record;
  }

  async listSubmittedDocuments(
    provider_id: string,
    facility_id: string,
  ): Promise<{ name: string; documents: Documents[] }> {
    const queryBuilder = this.orientationDocumentRepository
      .createQueryBuilder('od')
      .select([
        'od.id AS id',
        'od.base_url AS base_url',
        'od.name AS name',
        'od.base_url AS base_url',
        'od.filename AS filename',
        'od.original_filename AS original_filename',
        'od.issue_date AS issue_date',
        'od.created_at AS created_at',
        'od.is_verified AS is_verified',
        `'Orientation Packet' AS credential_name`,
        'od.issue_date AS issue_date',
        'od.completed_date AS completed_date',
        'od.verified_by_id AS verified_by_id',
        'od.verified_by_type AS verified_by_type',
        'od.credential_rejected_at AS credential_rejected_at',
        'od.credential_approved_at AS credential_approved_at',
        'od.is_verified AS is_verified',
        'od.reason_description AS reason_description',
        'od.reason_id AS reason_id',
        'od.issue_date AS issue_date',
      ])
      .where('od.provider_id = :provider_id', { provider_id })
      .andWhere('od.facility_id = :facility_id', { facility_id })
      .orderBy('od.created_at', 'DESC');

    // Only return selected fields
    const documents = await queryBuilder.getRawMany();

    return {
      name: 'Orientation Packet',
      documents: plainToInstance(Documents, documents),
    };
  }

  async orientationDocumentsDetails(document_id: string): Promise<Documents> {
    const queryBuilder = this.orientationDocumentRepository
      .createQueryBuilder('od')
      .leftJoin('od.provider', 'p')
      .leftJoin('od.facility', 'f')
      .leftJoin('od.reason', 'r')
      .select([
        'od.id AS id',
        'od.base_url AS base_url',
        'od.name AS name',
        'od.base_url AS base_url',
        'od.filename AS filename',
        'od.original_filename AS original_filename',
        'od.issue_date AS issue_date',
        'od.created_at AS created_at',
        'od.is_verified AS is_verified',
        `'Orientation Packet' AS credential_name`,
        'od.issue_date AS issue_date',
        'od.completed_date AS completed_date',
        'od.verified_by_id AS verified_by_id',
        'od.verified_by_type AS verified_by_type',
        'od.credential_rejected_at AS credential_rejected_at',
        'od.credential_approved_at AS credential_approved_at',
        'od.is_verified AS is_verified',
        'od.issue_date AS issue_date',
        `json_build_object(
          'id', p.id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'base_url', p.base_url,
          'profile_image', p.profile_image,
          'email', p.email,
          'mobile_no', p.mobile_no
        ) as provider`,
        `json_build_object(
          'id', f.id,
          'name', f.name,
          'orientation_process', f.orientation_process,
          'orientation_document', f.orientation_document,
          'original_filename', f.original_filename,
          'base_url', f.base_url
        ) as facility`,
        `json_build_object(
          'id', r.id,
          'reason', r.reason
        ) as reject_reason`,
      ])
      .where('od.id = :document_id', { document_id })
      .orderBy('od.created_at', 'DESC');

    // Only return selected fields
    const documents = await queryBuilder.getRawOne();

    return plainToInstance(Documents, documents);
  }

  async countBy(where: any) {
    const result = await this.providerOrientationRepository.count(where);
    return plainToInstance(Number, result);
  }

  // facility provider record check
  async checkFacilityProvider(where: FindOneOptions<FacilityProvider>) {
    const result = await this.facilityProviderRepository.findOne(where);
    return plainToInstance(FacilityProvider, result);
  }

  // facility provider record add
  async addFacilityProvider(data: Partial<FacilityProvider>) {
    const result = await this.facilityProviderRepository.save(
      plainToClass(FacilityProvider, data),
    );
    return result;
  }

  // For logging the activity

  // Tracking the activity
  async providerOrientationActivityLog(
    req: IRequest,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.PROVIDER_ORIENTATION,
  ) {
    const action_by_type: TABLE = req.user.role;
    const action_by_id: string = req.user.id;

    const activity = this.activityRepository.create({
      action_by_type,
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
  async providerOrientationActivityUpdateLog(
    req: IRequest,
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

    await this.providerOrientationActivityLog(req, activity_type, {
      changes: changesList,
    });
  }
}
