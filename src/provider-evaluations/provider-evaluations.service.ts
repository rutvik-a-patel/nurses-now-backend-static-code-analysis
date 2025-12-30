import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationResponse } from './entities/evaluation-response.entity';
import { CreateEvaluationResponseDto } from './dto/create-provider-evaluation.dto';
import { ProviderEvaluation } from './entities/provider-evaluation.entity';
import { plainToInstance } from 'class-transformer';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { FilterEvaluationDto } from './dto/filter.evaluation.dto';
import { TABLE } from '@/shared/constants/enum';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { UpdateEvaluationResponseDto } from './dto/update-provider-evaluation.dto';

@Injectable()
export class ProviderEvaluationsService {
  constructor(
    @InjectRepository(EvaluationResponse)
    private readonly evaluationResponseRepository: Repository<EvaluationResponse>,
    @InjectRepository(ProviderEvaluation)
    private readonly providerEvaluationRepository: Repository<ProviderEvaluation>,
    @InjectRepository(FacilityProvider)
    private readonly facilityProviderRepository: Repository<FacilityProvider>,
  ) {}

  async createEvaluation(
    evaluationDto: CreateEvaluationResponseDto,
    user: any,
  ): Promise<ProviderEvaluation> {
    const evaluated_by = evaluationDto.evaluated_by
      ? evaluationDto.evaluated_by
      : user.role;
    const evaluated_by_id = evaluationDto.evaluated_by_id
      ? evaluationDto.evaluated_by_id
      : user.id;
    const providerEvaluation = await this.providerEvaluationRepository.save(
      plainToInstance(ProviderEvaluation, {
        ...evaluationDto,
        evaluated_by,
        evaluated_by_id,
      }),
    );

    return plainToInstance(ProviderEvaluation, providerEvaluation);
  }

  // create function for updating the evaluations
  async updateEvaluation(
    id: string,
    evaluationDto: UpdateEvaluationResponseDto,
  ) {
    await this.providerEvaluationRepository.update(id, evaluationDto);
    const updatedEvaluation = await this.providerEvaluationRepository.findOne({
      where: { id },
    });
    return plainToInstance(ProviderEvaluation, updatedEvaluation);
  }

  async getEvaluations(
    id: string,
    query: FilterEvaluationDto,
  ): Promise<[ProviderEvaluation[], number]> {
    const facilityProvider = await this.facilityProviderRepository.findOne({
      relations: ['provider', 'facility'],
      where: { id },
    });

    const queryBuilder = this.providerEvaluationRepository
      .createQueryBuilder('pe')
      .leftJoin(
        'admin',
        'a',
        `pe.evaluated_by = 'admin' AND a.id = pe.evaluated_by_id`,
      )
      .leftJoin(
        'facility_user',
        'fu',
        `pe.evaluated_by = 'facility_user' AND fu.id = pe.evaluated_by_id`,
      )
      .select([
        'pe.id AS id',
        'pe.created_at AS created_at',
        'pe.comment AS comment',
        `CASE
          WHEN pe.evaluated_by = 'admin' THEN a.first_name || ' ' || a.last_name
          WHEN pe.evaluated_by = 'facility_user' THEN fu.first_name || ' ' || fu.last_name
          ELSE NULL
        END AS evaluated_by_name`,
        `CASE
          WHEN pe.evaluated_by = 'admin' THEN a.base_url || ' ' || a.image
          WHEN pe.evaluated_by = 'facility_user' THEN fu.base_url || ' ' || fu.image
          ELSE NULL
        END AS evaluated_by_image`,
        `(SELECT json_agg(json_build_object(
          'id', er.id,
          'type', er.type,
          'value', er.value
          )) AS evaluations
        FROM evaluation_response er
        WHERE er.provider_evaluation_id = pe.id
        AND er.deleted_at IS NULL)`,
        `(SELECT ROUND((COALESCE(SUM(er.value), 0)::numeric / 16) * 100, 0)
        FROM evaluation_response er
        WHERE er.provider_evaluation_id = pe.id
        AND er.deleted_at IS NULL) AS result`,
      ])
      .where('pe.provider_id = :id', { id: facilityProvider.provider.id })
      .andWhere('pe.facility_id = :facility_id', {
        facility_id: facilityProvider.facility.id,
      });

    const search = query.search ? parseSearchKeyword(query.search) : '';

    if (search) {
      queryBuilder.andWhere(
        `(
          a.first_name || ' ' || a.last_name ILIKE :search OR
          fu.first_name || ' ' || fu.last_name ILIKE :search
        )`,
        { search: `%${search}%` },
      );
    }

    if (query.from_date) {
      queryBuilder.andWhere(
        "TO_CHAR(pe.created_at, 'YYYY-MM-DD') >= :from_date",
        {
          from_date: query.from_date,
        },
      );
    }

    if (query.to_date) {
      queryBuilder.andWhere(
        "TO_CHAR(pe.created_at, 'YYYY-MM-DD') <= :to_date",
        {
          to_date: query.to_date,
        },
      );
    }

    if (query.order) {
      Object.keys(query.order).forEach((key) => {
        if (key === 'pe.name') {
          key = `
            CASE
              WHEN pe.evaluated_by = '${TABLE.admin}' THEN a.first_name
              WHEN pe.evaluated_by = '${TABLE.facility_user}' THEN fu.first_name
            END
          `;
        }
        queryBuilder.addOrderBy(`${key}`, query.order[key]);
      });
    }

    queryBuilder.limit(+query.limit).offset(+query.offset);

    const evaluations = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();

    return [evaluations, count];
  }

  async getEvaluationsOfStaff(
    id: string,
    query: FilterEvaluationDto,
  ): Promise<[ProviderEvaluation[], number]> {
    const queryBuilder = this.providerEvaluationRepository
      .createQueryBuilder('pe')
      .leftJoin(
        'admin',
        'a',
        `pe.evaluated_by = 'admin' AND a.id = pe.evaluated_by_id`,
      )
      .leftJoin(
        'facility_user',
        'fu',
        `pe.evaluated_by = 'facility_user' AND fu.id = pe.evaluated_by_id`,
      )
      .leftJoin('facility_provider', 'fp', 'pe.provider_id = fp.provider_id')
      .select([
        'pe.id AS id',
        'pe.created_at AS created_at',
        'fp.id AS facility_provider_id',
        'fp.facility_id AS facility_id',
        'pe.evaluated_by_id AS evaluated_by_id',
        'pe.evaluated_by AS evaluated_by',
        'pe.comment AS comment',
        `CASE
          WHEN pe.evaluated_by = 'admin' THEN a.first_name || ' ' || a.last_name
          WHEN pe.evaluated_by = 'facility_user' THEN fu.first_name || ' ' || fu.last_name
          ELSE NULL
          END AS evaluated_by_name`,
        `CASE
          WHEN pe.evaluated_by = 'admin' THEN a.base_url ||  a.image
          WHEN pe.evaluated_by = 'facility_user' THEN fu.base_url || fu.image
          ELSE NULL
          END AS evaluated_by_image`,
        `(SELECT ROUND((COALESCE(SUM(er.value), 0)::numeric / 16) * 100, 0)
        FROM evaluation_response er
        WHERE er.provider_evaluation_id = pe.id
        AND er.deleted_at IS NULL) AS result`,
        `(SELECT json_agg(json_build_object(
          'id', er.id,
          'type', er.type,
          'value', er.value
          )) AS evaluations
        FROM evaluation_response er
        WHERE er.provider_evaluation_id = pe.id
        AND er.deleted_at IS NULL)`,
      ])
      .where('pe.provider_id = :id', { id })
      .andWhere('pe.facility_id = fp.facility_id');
    const search = query.search ? parseSearchKeyword(query.search) : '';

    if (search) {
      queryBuilder.andWhere(
        `(
          a.first_name || ' ' || a.last_name ILIKE :search OR
          fu.first_name || ' ' || fu.last_name ILIKE :search
        )`,
        { search: `%${search}%` },
      );
    }

    if (query.from_date) {
      queryBuilder.andWhere(
        "TO_CHAR(pe.created_at, 'YYYY-MM-DD') >= :from_date",
        {
          from_date: query.from_date,
        },
      );
    }

    if (query.to_date) {
      queryBuilder.andWhere(
        "TO_CHAR(pe.created_at, 'YYYY-MM-DD') <= :to_date",
        {
          to_date: query.to_date,
        },
      );
    }

    if (query.order) {
      Object.keys(query.order).forEach((key) => {
        if (key === 'pe.name') {
          key = `
            CASE
              WHEN pe.evaluated_by = '${TABLE.admin}' THEN a.first_name
              WHEN pe.evaluated_by = '${TABLE.facility_user}' THEN fu.first_name
            END
          `;
        }
        if (key === 'result') {
          key = 'result';
        }
        queryBuilder.addOrderBy(`${key}`, query.order[key]);
      });
    }

    if (+query.limit > 0) {
      queryBuilder.limit(+query.limit);
    }

    if (+query.offset > 0) {
      queryBuilder.offset(+query.offset);
    }

    const evaluations = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();

    return [evaluations, count];
  }
}
