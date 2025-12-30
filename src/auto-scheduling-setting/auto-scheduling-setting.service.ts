import { Injectable } from '@nestjs/common';
import { UpdateAutoSchedulingSettingDto } from './dto/update-auto-scheduling-setting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AutoSchedulingSetting } from './entities/auto-scheduling-setting.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { getTimeCode } from '@/shared/helpers/time-code';

@Injectable()
export class AutoSchedulingSettingService {
  constructor(
    @InjectRepository(AutoSchedulingSetting)
    private readonly autoSchedulingSettingRepository: Repository<AutoSchedulingSetting>,
  ) {}
  async find(where: FindOneOptions<AutoSchedulingSetting>) {
    const result = await this.autoSchedulingSettingRepository.find(where);
    return result;
  }

  async findOneWhere(where: FindOneOptions<AutoSchedulingSetting>) {
    const result = await this.autoSchedulingSettingRepository.findOne(where);
    return result;
  }

  async update(
    id: string,
    updateAutoSchedulingSettingDto: UpdateAutoSchedulingSettingDto,
  ) {
    const result = await this.autoSchedulingSettingRepository.update(
      { id },
      {
        ...updateAutoSchedulingSettingDto,
        updated_at: new Date().toISOString(),
      },
    );
    return result;
  }

  async getAutoSchedulingTimeCode(
    start_time: string,
    end_time: string,
    facility_id: string,
  ): Promise<string> {
    const timeCode = await getTimeCode(
      start_time,
      end_time,
      facility_id,
      this.autoSchedulingSettingRepository,
    );
    return timeCode;
  }
}
