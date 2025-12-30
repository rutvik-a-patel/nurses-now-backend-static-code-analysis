import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions, IsNull } from 'typeorm';
import { Tag } from './entities/tags.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { plainToInstance } from 'class-transformer';
import { FacilityNote } from '@/facility-note/entities/facility-note.entity';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(FacilityNote)
    private readonly facilityNoteRepository: Repository<FacilityNote>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const result = await this.tagRepository.save(createTagDto);
    return plainToInstance(Tag, result);
  }

  async findOneWhere(options: FindOneOptions<Tag>) {
    const result = await this.tagRepository.findOne(options);
    return plainToInstance(Tag, result);
  }

  async findAll(options: FindManyOptions<Tag>): Promise<[Tag[], number]> {
    const [list, count] = await this.tagRepository.findAndCount(options);
    return [plainToInstance(Tag, list), count];
  }

  async fetchAllByFilter(
    queryParamsDto: MultiSelectQueryParamsDto,
  ): Promise<[Tag[], number]> {
    const { search, status, order, limit, offset } = queryParamsDto;
    const qb = this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.deleted_at IS NULL');
    // search
    if (search) {
      qb.andWhere('LOWER(tag.name) LIKE :search', {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }

    // status
    if (status && status.length) {
      qb.andWhere('tag.status IN (:...status)', {
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
    return [plainToInstance(Tag, result), count];
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const record = await this.tagRepository.update(id, {
      ...updateTagDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async checkName(name: string) {
    const data = await this.tagRepository
      .createQueryBuilder('lob')
      .where('LOWER(lob.name) = LOWER(:name)', { name })
      .getOne();

    return data;
  }

  async remove(id: string) {
    // hard delete the record due to unique constraint
    const record = await this.tagRepository.delete({
      id: id,
      deleted_at: IsNull(),
    });
    return record;
  }
  async isAlreadyUsed(id: string) {
    const count = await this.facilityNoteRepository
      .createQueryBuilder('facility_note')
      .where(':id = ANY(facility_note.tags)', { id })
      .getCount();
    return count;
  }
}
