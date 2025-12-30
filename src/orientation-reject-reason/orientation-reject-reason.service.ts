import { Injectable } from '@nestjs/common';
import { CreateOrientationRejectReasonDto } from './dto/create-orientation-reject-reason.dto';
import { UpdateOrientationRejectReasonDto } from './dto/update-orientation-reject-reason.dto';
import { OrientationRejectReason } from './entities/orientation-reject-reason.entity';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';

@Injectable()
export class OrientationRejectReasonService {
  constructor(
    @InjectRepository(OrientationRejectReason)
    private readonly orientationRejectReasonRepository: Repository<OrientationRejectReason>,
    @InjectRepository(ProviderOrientation)
    private readonly providerOrientationRepository: Repository<ProviderOrientation>,
  ) {}

  async create(
    createOrientationRejectReasonDto: CreateOrientationRejectReasonDto,
  ) {
    const result = await this.orientationRejectReasonRepository.save(
      createOrientationRejectReasonDto,
    );
    return plainToInstance(OrientationRejectReason, result);
  }

  async findOneWhere(options: FindOneOptions<OrientationRejectReason>) {
    const result =
      await this.orientationRejectReasonRepository.findOne(options);
    return plainToInstance(OrientationRejectReason, result);
  }

  async findAll(
    options: FindManyOptions<OrientationRejectReason>,
  ): Promise<[OrientationRejectReason[], number]> {
    const [list, count] =
      await this.orientationRejectReasonRepository.findAndCount(options);
    return [plainToInstance(OrientationRejectReason, list), count];
  }

  async fetchAllByFilter(
    queryParamsDto: MultiSelectQueryParamsDto,
  ): Promise<[OrientationRejectReason[], number]> {
    const { search, status, order, limit, offset } = queryParamsDto;
    const qb = this.orientationRejectReasonRepository
      .createQueryBuilder('orr')
      .where('orr.deleted_at IS NULL');
    // search
    if (search) {
      qb.andWhere(`LOWER(orr.reason) ILIKE :search`, {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }

    // status
    if (status && status.length) {
      qb.andWhere('orr.status IN (:...status)', {
        status,
      });
    }

    // Apply pagination
    if (limit) {
      qb.limit(+limit);
    }
    if (offset) {
      qb.offset(+offset);
    }

    // Apply ordering
    if (order) {
      Object.keys(order).forEach((key) => {
        qb.addOrderBy(`${key}`, order[key]);
      });
    }

    const [result, count] = await qb.getManyAndCount();
    return [plainToInstance(OrientationRejectReason, result), count];
  }

  async update(id: string, updateTagDto: UpdateOrientationRejectReasonDto) {
    const record = await this.orientationRejectReasonRepository.update(id, {
      ...updateTagDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async checkName(reason: string) {
    const data = await this.orientationRejectReasonRepository
      .createQueryBuilder('orr')
      .where('LOWER(orr.reason) = LOWER(:reason)', { reason })
      .andWhere('orr.deleted_at IS NULL')
      .getOne();

    return data;
  }

  async remove(id: string) {
    // soft delete the record
    const record = await this.orientationRejectReasonRepository.softDelete({
      id: id,
      deleted_at: IsNull(),
    });
    return record;
  }
  async isAlreadyUsed(id: string) {
    const count = await this.providerOrientationRepository
      .createQueryBuilder('po')
      .where('po.reason_id = :id', { id })
      .getCount();
    return count;
  }
}
