import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilityShiftSetting } from './entities/facility-shift-setting.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { CreateFacilityShiftSettingDto } from './dto/create-facility-shift-setting.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateFacilityShiftSettingDto } from './dto/update-facility-shift-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { TimingSettingDto } from './dto/facility-setting-filter.dto';

@Injectable()
export class FacilityShiftSettingService {
  constructor(
    @InjectRepository(FacilityShiftSetting)
    private readonly facilityShiftSettingRepository: Repository<FacilityShiftSetting>,
  ) {}

  async create(createFacilityShiftSettingDto: CreateFacilityShiftSettingDto) {
    const result = await this.facilityShiftSettingRepository.save(
      createFacilityShiftSettingDto,
    );
    return plainToInstance(FacilityShiftSetting, result);
  }

  async checkName(name: string, id?: string) {
    const queryBuilder = this.facilityShiftSettingRepository
      .createQueryBuilder('f')
      .where('LOWER(f.name) = LOWER(:name) AND f.is_default = true', {
        name,
      });

    if (id) {
      queryBuilder.andWhere('f.id != :id', { id });
    }

    const data = await queryBuilder.getOne();

    return data;
  }

  async findAll(
    options: FindManyOptions<FacilityShiftSetting>,
  ): Promise<[FacilityShiftSetting[], number]> {
    const [list, count] =
      await this.facilityShiftSettingRepository.findAndCount(options);
    return [plainToInstance(FacilityShiftSetting, list), count];
  }
  async findAllShiftTimeWithCode(
    queryParamsDto: TimingSettingDto,
  ): Promise<any[]> {
    const qb = this.facilityShiftSettingRepository.createQueryBuilder('s');
    qb.select([
      's.id AS id',
      's.created_at AS created_at',
      's.status AS status',
      's.name AS name',
      's.is_default AS is_default',
      's.start_time AS start_time',
      's.end_time AS end_time',
      's.shift_time_id AS shift_time_id',
      `s.time_code AS shift_time_code`,
    ]).where('s.facility_id IS NULL');

    // Optional WHERE filter
    if (queryParamsDto.search) {
      qb.andWhere('s.name ILIKE :name', {
        name: `%${parseSearchKeyword(queryParamsDto.search)}%`,
      });
    }

    if (queryParamsDto.start_time) {
      qb.andWhere('s.start_time IN (:...start_time)', {
        start_time: queryParamsDto.start_time,
      });
    }

    if (queryParamsDto.end_time) {
      qb.andWhere('s.end_time IN (:...end_time)', {
        end_time: queryParamsDto.end_time,
      });
    }

    if (queryParamsDto.status && queryParamsDto.status.length) {
      qb.andWhere('s.status IN (:...status)', {
        status: queryParamsDto.status,
      });
    }

    // Optional ORDER
    if (queryParamsDto.order) {
      Object.entries(queryParamsDto.order).forEach(([field, direction]) => {
        qb.addOrderBy(`s.${field}`, direction as 'ASC' | 'DESC');
      });
    }

    // Pagination
    if (queryParamsDto.limit) qb.take(+queryParamsDto.limit);
    if (queryParamsDto.offset) qb.skip(+queryParamsDto.offset);

    const data = await qb.getRawMany();
    const count = await qb.getCount();
    return [data, count];
  }

  async findOneWhere(where: FindOneOptions<FacilityShiftSetting>) {
    const result = await this.facilityShiftSettingRepository.findOne(where);
    return plainToInstance(FacilityShiftSetting, result);
  }

  async updateWhere(
    where: FindOptionsWhere<FacilityShiftSetting>,
    updateFacilityShiftSettingDto: UpdateFacilityShiftSettingDto,
  ) {
    const result = await this.facilityShiftSettingRepository.update(
      where,
      updateFacilityShiftSettingDto,
    );
    return result;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const result = await this.facilityShiftSettingRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return result;
  }
}
