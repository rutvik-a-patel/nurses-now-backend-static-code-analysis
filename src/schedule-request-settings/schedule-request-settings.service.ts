import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleRequestSetting } from './entities/schedule-request-setting.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UpdateScheduleRequestSettingDto } from './dto/update-schedule-request-setting.dto';

@Injectable()
export class ScheduleRequestSettingsService {
  constructor(
    @InjectRepository(ScheduleRequestSetting)
    private readonly scheduleRequestSettingRepository: Repository<ScheduleRequestSetting>,
  ) {}

  async findAll(
    options: FindManyOptions<ScheduleRequestSetting>,
  ): Promise<ScheduleRequestSetting[]> {
    const list = await this.scheduleRequestSettingRepository.find(options);
    return plainToInstance(ScheduleRequestSetting, list);
  }

  async findOneWhere(
    options: FindOneOptions<ScheduleRequestSetting>,
  ): Promise<ScheduleRequestSetting> {
    const data = await this.scheduleRequestSettingRepository.findOne(options);
    return plainToInstance(ScheduleRequestSetting, data);
  }

  async update(
    where: FindOptionsWhere<ScheduleRequestSetting>,
    updateScheduleRequestSettingDto: UpdateScheduleRequestSettingDto,
  ) {
    const result = await this.scheduleRequestSettingRepository.update(
      where,
      updateScheduleRequestSettingDto,
    );
    return result;
  }
}
