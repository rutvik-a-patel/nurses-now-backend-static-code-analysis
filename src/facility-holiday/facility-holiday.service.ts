import { Injectable } from '@nestjs/common';
import { FacilityHolidayItemDto } from './dto/create-facility-holiday.dto';
import { UpdateFacilityHolidayDto } from './dto/update-facility-holiday.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilityHoliday } from './entities/facility-holiday.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { DEFAULT_STATUS } from '@/shared/constants/enum';

@Injectable()
export class FacilityHolidayService {
  constructor(
    @InjectRepository(FacilityHoliday)
    private readonly facilityHolidayRepository: Repository<FacilityHoliday>,
  ) {}
  async create(createFacilityHolidayDto: FacilityHolidayItemDto[]) {
    const result = await this.facilityHolidayRepository.save(
      plainToInstance(FacilityHoliday, createFacilityHolidayDto),
    );
    return plainToInstance(FacilityHoliday, result);
  }

  async createOrUpdateBulk(
    bulkDto: FacilityHolidayItemDto[] | UpdateFacilityHolidayDto[],
  ): Promise<FacilityHoliday[]> {
    const entities = bulkDto.map((dto) => {
      if (dto.status === DEFAULT_STATUS.in_active && dto.id) {
        this.facilityHolidayRepository.update(
          {
            id: dto.id,
          },
          { status: DEFAULT_STATUS.in_active, deleted_at: new Date() },
        );
      }
      return this.facilityHolidayRepository.create({
        id: dto.id ?? undefined,
        name: dto.name,
        start_date: dto.start_date,
        end_date: dto.end_date,
        start_time: dto.start_time,
        end_time: dto.end_time,
        status: dto.status,
        facility: { id: dto.facility },
        holiday_group: { id: dto.holiday_group },
      });
    });

    return await this.facilityHolidayRepository.save(entities);
  }

  async findAll(
    where: FindManyOptions<FacilityHoliday>,
  ): Promise<[FacilityHoliday[], number]> {
    const [list, count] =
      await this.facilityHolidayRepository.findAndCount(where);
    return [plainToInstance(FacilityHoliday, list), count];
  }

  async findOneWhere(where: FindOneOptions<FacilityHoliday>) {
    const result = await this.facilityHolidayRepository.findOne(where);
    return plainToInstance(FacilityHoliday, result);
  }

  async update(
    where: FindOptionsWhere<FacilityHoliday>,
    updateFacilityHolidayDto: UpdateFacilityHolidayDto,
  ) {
    const result = await this.facilityHolidayRepository.update(
      where,
      plainToClass(FacilityHoliday, updateFacilityHolidayDto),
    );
    return result;
  }

  async remove(where: FindOptionsWhere<FacilityHoliday>) {
    const result = await this.facilityHolidayRepository.softDelete(where);
    return result;
  }
}
