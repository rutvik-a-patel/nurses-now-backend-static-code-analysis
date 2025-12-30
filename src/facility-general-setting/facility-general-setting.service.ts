import { Injectable } from '@nestjs/common';
import { UpdateFacilityGeneralSettingDto } from './dto/update-facility-general-setting.dto';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { FacilityGeneralSetting } from './entities/facility-general-setting.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FacilityGeneralSettingService {
  constructor(
    @InjectRepository(FacilityGeneralSetting)
    private readonly facilityGeneralSettingRepository: Repository<FacilityGeneralSetting>,
  ) {}
  async findOneWhere(where: FindOneOptions<FacilityGeneralSetting>) {
    const result = await this.facilityGeneralSettingRepository.findOne(where);
    return plainToInstance(FacilityGeneralSetting, result);
  }

  async findAll(
    where: FindManyOptions<FacilityGeneralSetting>,
  ): Promise<FacilityGeneralSetting[]> {
    const list = await this.facilityGeneralSettingRepository.find(where);
    return plainToInstance(FacilityGeneralSetting, list);
  }

  async update(
    where: FindOptionsWhere<FacilityGeneralSetting>,
    updateFacilityGeneralSettingDto: UpdateFacilityGeneralSettingDto,
  ) {
    const result = await this.facilityGeneralSettingRepository.update(
      where,
      plainToInstance(FacilityGeneralSetting, updateFacilityGeneralSettingDto),
    );
    return result;
  }
}
