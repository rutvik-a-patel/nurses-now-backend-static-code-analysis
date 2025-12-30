import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  IsNull,
  In,
} from 'typeorm';
import { FacilityNote } from './entities/facility-note.entity';
import { CreateFacilityNoteDto } from './dto/create-facility-note.dto';
import { UpdateFacilityNoteDto } from './dto/update-facility-note.dto';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { FacilityNoteFilterDto } from './dto/queryFilter.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  DEFAULT_STATUS,
  TABLE,
} from '@/shared/constants/enum';
import { IRequest } from '@/shared/constants/types';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';
import { Activity } from '@/activity/entities/activity.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';

@Injectable()
export class FacilityNoteService {
  constructor(
    @InjectRepository(FacilityNote)
    private readonly facilityNoteRepository: Repository<FacilityNote>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(FacilityUser)
    private readonly facilityUserRepository: Repository<FacilityUser>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(createFacilityNoteDto: CreateFacilityNoteDto) {
    const result = await this.facilityNoteRepository.save({
      ...createFacilityNoteDto,
    });
    return plainToInstance(FacilityNote, result);
  }

  async findOneWhere(options: FindOneOptions<FacilityNote>) {
    const result = await this.facilityNoteRepository.findOne(options);
    return plainToInstance(FacilityNote, result);
  }

  async findAll(
    options: FindManyOptions<FacilityNote>,
  ): Promise<[FacilityNote[], number]> {
    const [list, count] =
      await this.facilityNoteRepository.findAndCount(options);
    return [plainToInstance(FacilityNote, list), count];
  }

  async update(id: string, updateFacilityNoteDto: UpdateFacilityNoteDto) {
    const record = await this.facilityNoteRepository.update(id, {
      ...updateFacilityNoteDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.facilityNoteRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
        status: DEFAULT_STATUS.in_active,
      },
    );
    return record;
  }

  async isAlreadyUsed(id: string) {
    const record = await this.facilityNoteRepository.countBy({
      id,
    });
    return record;
  }

  async detailedList(
    facilityNoteFilterDto: FacilityNoteFilterDto,
  ): Promise<[FacilityNote[], number]> {
    const { search, limit, offset, order, tag_id, created_by, relates_to } =
      facilityNoteFilterDto;

    const qb = this.facilityNoteRepository
      .createQueryBuilder('fn')
      .leftJoin('fn.created_by_id', 'a');

    qb.select('fn.id', 'id')
      .addSelect('fn.description', 'description')
      .addSelect(`to_char(fn.date, 'YYYY-MM-DD')`, 'date')
      .addSelect('fn.status', 'status')
      .addSelect('fn.created_at', 'created_at')
      .addSelect('fn.updated_at', 'updated_at')
      // created by
      .addSelect(
        `jsonb_build_object(
        'id', a.id,
        'name', a.first_name || ' ' || a.last_name,
        'base_url', a.base_url,
        'image', a.image,
        'status', a.status
      )`,
        'created_by',
      )
      // Enriched columns

      // TAGS
      .addSelect(
        `(
      SELECT COALESCE(
        JSON_AGG(
        jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'description', t.description,
          'status', t.status::text
        )
        ),
        '[]'
      )
      FROM UNNEST(fn.tags) AS tag_id
      JOIN tag t ON t.id = tag_id
      )`,
        'tags',
      )

      // Wrapping related entities under one "relates_to" JSON object
      .addSelect(
        `jsonb_build_object(
          'provider', (
            SELECT COALESCE(
              JSON_AGG(
                jsonb_build_object(
                  'id', p.id,
                  'name', p.first_name || ' ' || p.last_name,
                  'base_url', p.base_url,
                  'profile_image', p.profile_image,
                  'gender', p.gender
                )
              ), '[]'
            )
            FROM UNNEST(fn.relates_to) AS provider_id
            JOIN provider p ON p.id = provider_id
          ),
          'facility', (
            SELECT COALESCE(
              JSON_AGG(
                jsonb_build_object(
                  'id', f.id,
                  'name', f.name,
                  'country', f.country,
                  'timezone', f.timezone,
                  'base_url', f.base_url,
                  'image', f.image,
                  'is_master', f.is_master,
                  'master_facility_id', f.master_facility_id
                )
              ), '[]'
            )
            FROM UNNEST(fn.relates_to) AS facility_id
            JOIN facility f ON f.id = facility_id
          ),
          'facility_user', (
            SELECT COALESCE(
              JSON_AGG(
                jsonb_build_object(
                  'id', fu.id,
                  'name', fu.first_name || ' ' || fu.last_name,
                  'title', fu.title,
                  'base_url', fu.base_url,
                  'image', fu.image
                )
              ), '[]'
            )
            FROM UNNEST(fn.relates_to) AS facility_user_id
            JOIN facility_user fu ON fu.id = facility_user_id
          )
        )`,
        'relates_to',
      );

    // Search filter
    if (search) {
      qb.andWhere('fn.description ILIKE :search', {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }

    // Tag filter: fetch any record where the tag_id matches any in fn.tags
    if (tag_id) {
      qb.andWhere('fn.tags && :tag_ids', { tag_ids: tag_id });
    }

    if (created_by) {
      qb.andWhere('fn.created_by_id = :created_by', { created_by });
    }

    if (relates_to) {
      qb.andWhere(':relates_to = ANY(fn.relates_to)', { relates_to });
    }

    // Ordering
    const [orderField, orderDirection] = Object.entries(order)[0];
    if (orderField === 'created_by') {
      qb.addOrderBy(`a.first_name || ' ' || a.last_name`, orderDirection);
    } else {
      // Default ordering by the field specified in the order object
      qb.orderBy(`fn.${orderField}`, orderDirection);
    }

    // Pagination
    qb.limit(+limit).offset(+offset);

    const data = await qb.getRawMany();
    const count = await qb.getCount();
    return [plainToInstance(FacilityNote, data), count];
  }

  async relatesToList(
    userId: string,
    filter: FacilityNoteFilterDto,
  ): Promise<[FacilityNote[], number]> {
    const qb = this.facilityNoteRepository
      .createQueryBuilder('fn')
      .where(`:userId = ANY(fn.relates_to)`, { userId });

    if (filter.search) {
      qb.andWhere('fn.description ILIKE :search', {
        search: `%${parseSearchKeyword(filter.search)}%`,
      });
    }

    if (filter.order) {
      Object.entries(filter.order).forEach(([field, dir]) => {
        qb.addOrderBy(`fn.${field}`, dir as 'ASC' | 'DESC');
      });
    }

    qb.limit(+filter.limit || 10);
    qb.offset(+filter.offset || 0);

    const [list, count] = await qb.getManyAndCount();
    return [list, count];
  }
  // Tracking the activity
  async facilityNoteActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.FACILITY_NOTE,
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
  async facilityNoteActivityUpdateLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    includedKeys?: string[],
    action_for?: ACTION_TABLES,
  ) {
    const changes = getUpdatedFields(
      oldData,
      newData,
      includedKeys, // include keys to track
      true,
    ) as string[];

    const changesList = changes as string[] | undefined;
    if (!changesList || changesList.length === 0) return;

    await this.facilityNoteActivityLog(
      req,
      entity_id,
      activity_type,
      {
        changes: changesList,
      },
      action_for,
    );
  }

  // related_to records listing
  async getNoteWithRelations(noteId: string) {
    const note = await this.facilityNoteRepository.findOne({
      where: { id: noteId },
    });

    if (!note || !note.relates_to?.length) {
      return {
        note,
        facilityUsers: [],
        facilities: [],
        providers: [],
      };
    }

    const ids = note.relates_to;

    // Run queries in parallel 🚀
    const [facilityUsers, facilities, providers] = await Promise.all([
      this.facilityUserRepository.find({
        where: { id: In(ids) },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          title: true,
          base_url: true,
          image: true,
        },
      }),
      this.facilityRepository.find({
        where: { id: In(ids) },
        select: {
          id: true,
          name: true,
          base_url: true,
          image: true,
          timezone: true,
        },
      }),
      this.providerRepository.find({
        where: { id: In(ids) },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          base_url: true,
          profile_image: true,
        },
      }),
    ]);

    return {
      description: note.description,
      facilityUsers,
      facilities,
      providers,
    };
  }
}
