import { Injectable } from '@nestjs/common';
import { CreateHolidayGroupDto } from './dto/create-holiday-group.dto';
import { UpdateHolidayGroupDto } from './dto/update-holiday-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HolidayGroup } from './entities/holiday-group.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { GetHolidayGroupQueryParamsDto } from './dto/get-holiday-group.dto';

@Injectable()
export class HolidayGroupService {
  constructor(
    @InjectRepository(HolidayGroup)
    private readonly holidayGroupRepository: Repository<HolidayGroup>,
    @InjectRepository(FacilityHoliday)
    private readonly facilityHolidayRepository: Repository<FacilityHoliday>,
  ) {}

  async create(createHolidayGroupDto: CreateHolidayGroupDto) {
    const result = await this.holidayGroupRepository.save(
      plainToClass(HolidayGroup, createHolidayGroupDto),
    );
    return plainToInstance(HolidayGroup, result);
  }

  async findAll(where: FindManyOptions<HolidayGroup>): Promise<HolidayGroup[]> {
    const list = await this.holidayGroupRepository.find(where);
    return plainToInstance(HolidayGroup, list);
  }

  async findOneWhere(where: FindOneOptions<HolidayGroup>) {
    const result = await this.holidayGroupRepository.findOne(where);
    return plainToInstance(HolidayGroup, result);
  }

  async update(
    where: FindOptionsWhere<HolidayGroup>,
    updateHolidayGroupDto: UpdateHolidayGroupDto,
  ) {
    const result = await this.holidayGroupRepository.update(
      where,
      plainToClass(HolidayGroup, updateHolidayGroupDto),
    );
    return result;
  }

  async findAvailableHolidayGroups(
    queryParamsDto: GetHolidayGroupQueryParamsDto,
  ): Promise<HolidayGroup[]> {
    const { order, facility_holiday_id } = queryParamsDto;
    const query = this.holidayGroupRepository
      .createQueryBuilder('holiday_group')
      .leftJoin(
        FacilityHoliday,
        'fh',
        'fh.holiday_group_id = holiday_group.id AND fh.facility_id = :facility_id',
        { facility_id: facility_holiday_id },
      )
      .select([
        'holiday_group.id',
        'holiday_group.name',
        'holiday_group.start_date',
        'holiday_group.end_date',
        'holiday_group.start_time',
        'holiday_group.end_time',
      ])
      .where('fh.id IS NULL')
      .andWhere('holiday_group.status = :status', {
        status: DEFAULT_STATUS.active,
      }); // only active holidays

    if (order) {
      Object.entries(order).forEach(([field, order]) => {
        query.addOrderBy(`holiday_group.${field}`, order);
      });
    }

    const result = await query.getMany();
    return plainToInstance(HolidayGroup, result);
  }

  // To update or remove holiday_group details in facility_holiday table
  async updateFacilityHolidayDetails(
    type: 'update' | 'delete',
    holiday_id: string,
    name?: string,
  ): Promise<void> {
    if (type === 'update') {
      await this.facilityHolidayRepository
        .createQueryBuilder()
        .update(FacilityHoliday)
        .set({ name })
        .where('holiday_group_id = :holiday_id', { holiday_id })
        .execute();
    } else if (type === 'delete') {
      await this.facilityHolidayRepository
        .createQueryBuilder()
        .update(FacilityHoliday)
        .set({ holiday_group: null })
        .where('holiday_group_id = :holiday_id', { holiday_id })
        .execute();
    }
  }

  async remove(where: FindOptionsWhere<HolidayGroup>) {
    const result = await this.holidayGroupRepository.softDelete(where);
    return result;
  }

  async doesNameExists(
    name: string,
    id?: string,
  ): Promise<HolidayGroup | null> {
    if (!name) {
      return null;
    }
    const query = this.holidayGroupRepository
      .createQueryBuilder('hg')
      .select('hg.id')
      .where('LOWER(hg.name) = LOWER(:name)', { name });
    if (id) {
      query.andWhere('hg.id != :id', { id });
    }
    const data = await query.getOne();
    return data ? data : null;
  }
}
