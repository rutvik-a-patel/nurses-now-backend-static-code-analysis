import { Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ACTION_TABLES, ACTIVITY_TYPE, TABLE } from '@/shared/constants/enum';
import { DocumentFilter } from './dto/document-filter.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { Documents } from './entities/documents.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { IRequest } from '@/shared/constants/types';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Documents)
    private readonly documentsRepository: Repository<Documents>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto) {
    const result = await this.documentsRepository.save(createDocumentDto);
    return plainToInstance(Documents, result);
  }

  async findOneWhere(options: FindOneOptions<Documents>) {
    const result = await this.documentsRepository.findOne(options);
    return plainToInstance(Documents, result);
  }

  async findAll(
    options: FindManyOptions<Documents>,
  ): Promise<[Documents[], number]> {
    const [list, count] = await this.documentsRepository.findAndCount(options);
    return [plainToInstance(Documents, list), count];
  }
  async fetchAllDocumentsByFilter(
    filter: DocumentFilter,
  ): Promise<[Documents[], number]> {
    const qb = this.documentsRepository.createQueryBuilder('d');

    // ------------------------------------
    // COLUMNS SELECT
    // ------------------------------------
    qb.select([
      'd.id AS id',
      'd.created_at AS created_at',
      'd.updated_at AS updated_at',
      'd.name AS name',
      'd.base_url AS base_url',
      'd.filename AS filename',
      'd.original_filename AS original_filename',
      'd.document_notes AS document_notes',
      'd.status AS status',
      'd.uploaded_by_type AS uploaded_by_type',
      'd.uploaded_at AS uploaded_at',
    ]);

    // ------------------------------------
    // admin_document_category JSON
    // ------------------------------------
    qb.addSelect(
      `
    (
      SELECT jsonb_build_object(
        'id', ad.id,
        'name', ad.name,
        'category', ad.category
      )
      FROM admin_document ad
      WHERE ad.id::text = d.admin_document_category_id::text
    )
    `,
      'admin_document_category',
    );

    // ------------------------------------
    // uploaded_by polymorphic JSON
    // ------------------------------------
    qb.addSelect(
      `
    CASE
      WHEN d.uploaded_by_type = '${TABLE.provider}' THEN (
        SELECT jsonb_build_object(
          'id', p.id,
          'name', p.first_name || ' ' || p.last_name,
          'base_url', p.base_url,
          'profile_image', p.profile_image,
          'gender', p.gender
        )
        FROM provider p
        WHERE p.id::text = d.uploaded_by_id::text
      )
      WHEN d.uploaded_by_type = '${TABLE.facility}' THEN (
        SELECT jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'country', f.country,
          'timezone', f.timezone,
          'base_url', f.base_url,
          'image', f.image
        )
        FROM facility f
        WHERE f.id::text = d.uploaded_by_id::text
      )
      WHEN d.uploaded_by_type = '${TABLE.facility_user}' THEN (
        SELECT jsonb_build_object(
          'id', fu.id,
          'name', fu.first_name || ' ' || fu.last_name,
          'base_url', fu.base_url,
          'image', fu.image
        )
        FROM facility_user fu
        WHERE fu.id::text = d.uploaded_by_id::text
      )
      WHEN d.uploaded_by_type = '${TABLE.admin}' THEN (
        SELECT jsonb_build_object(
          'id', a.id,
          'name', a.first_name || ' ' || a.last_name,
          'base_url', a.base_url,
          'image', a.image
        )
        FROM admin a
        WHERE a.id::text = d.uploaded_by_id::text
      )
      ELSE NULL
    END
    `,
      'uploaded_by',
    );

    // ------------------------------------
    // FILTERS
    // ------------------------------------
    if (filter.uploaded_by) {
      qb.andWhere('d.uploaded_by_id IN (:...uploaded_by_id)', {
        uploaded_by_id: filter.uploaded_by,
      });
    }

    if (filter.provider_id) {
      qb.andWhere('d.provider_id IN (:...provider_id)', {
        provider_id: filter.provider_id,
      });
    }

    if (filter.facility_id) {
      qb.andWhere(
        'd.facility_id IN (:...facility_id) AND d.facility_id IS NOT NULL',
        {
          facility_id: filter.facility_id,
        },
      );
    }
    if (filter.admin_document_category_id) {
      qb.andWhere(
        'd.admin_document_category_id IN (:...admin_document_category_id)',
        {
          admin_document_category_id: filter.admin_document_category_id,
        },
      );
    }

    if (filter.document_notes) {
      qb.andWhere('LOWER(d.document_notes) LIKE LOWER(:document_notes)', {
        document_notes: `%${parseSearchKeyword(filter.document_notes)}%`,
      });
    }

    if (filter.name) {
      qb.andWhere('d.original_filename ILIKE (:name)', {
        name: `%${parseSearchKeyword(filter.name)}%`,
      });
    }

    if (filter.search) {
      qb.andWhere(
        `(LOWER(d.name) LIKE LOWER(:search)
        OR LOWER(d.document_notes) LIKE LOWER(:search)
        OR LOWER(d.original_filename) LIKE LOWER(:search)
        OR LOWER(d.filename) LIKE LOWER(:search))`,
        {
          search: `%${parseSearchKeyword(filter.search)}%`,
        },
      );
    }

    if (filter.start_date) {
      qb.andWhere("TO_CHAR(d.uploaded_at, 'YYYY-MM-DD') >= :start_date", {
        start_date: filter.start_date,
      });
    }
    if (filter.end_date) {
      qb.andWhere("TO_CHAR(d.uploaded_at, 'YYYY-MM-DD') <= :end_date", {
        end_date: filter.end_date,
      });
    }

    // ------------------------------------
    // ORDER / PAGINATION
    // ------------------------------------
    if (filter.order) {
      // --------SORTING admin_document_category_name------------------
      qb.addSelect(
        `(SELECT ad.name FROM admin_document ad WHERE ad.id::text = d.admin_document_category_id::text)`,
        'admin_document_category_name',
      );
      // --------SORTING uploaded_by_name------------------
      qb.addSelect(
        `CASE 
          WHEN d.uploaded_by_type = '${TABLE.provider}' THEN (
            SELECT p.first_name || ' ' || p.last_name 
            FROM provider p WHERE p.id::text = d.uploaded_by_id::text
          )
          WHEN d.uploaded_by_type = '${TABLE.facility}' THEN (
            SELECT f.name 
            FROM facility f WHERE f.id::text = d.uploaded_by_id::text
          )
          WHEN d.uploaded_by_type = '${TABLE.facility_user}' THEN (
            SELECT fu.first_name || ' ' || fu.last_name
            FROM facility_user fu WHERE fu.id::text = d.uploaded_by_id::text
          )
          WHEN d.uploaded_by_type = '${TABLE.admin}' THEN (
            SELECT a.first_name || ' ' || a.last_name
            FROM admin a WHERE a.id::text = d.uploaded_by_id::text
          )
          ELSE NULL
        END
        `,
        'uploaded_by_name',
      );

      Object.keys(filter.order).forEach((key) => {
        switch (key) {
          case 'category':
            qb.addOrderBy('admin_document_category_name', filter.order[key]);
            break;

          case 'uploaded_by':
            qb.addOrderBy('uploaded_by_name', filter.order[key]);
            break;

          default:
            qb.addOrderBy(`d.${key}`, filter.order[key]);
        }
      });
    }

    if (+filter.limit > 0) qb.limit(+filter.limit);
    if (+filter.offset > 0) qb.offset(+filter.offset);

    const data = await qb.getRawMany();
    const count = await qb.getCount();

    return [plainToInstance(Documents, data), count];
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    const record = await this.documentsRepository.update(id, updateDocumentDto);
    return record;
  }

  async remove(id: string) {
    // hard delete the record due to unique constraint
    const record = await this.documentsRepository.delete({
      id: id,
      deleted_at: IsNull(),
    });
    return record;
  }

  // Tracking the activity
  async documentsActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.DOCUMENTS,
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
  async documentsActivityUpdateLog(
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

    await this.documentsActivityLog(
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
}
