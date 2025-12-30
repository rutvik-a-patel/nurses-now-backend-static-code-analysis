import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { StatusSetting } from './entities/status-setting.entity';
import { plainToInstance } from 'class-transformer';
import { CreateStatusSettingDto } from './dto/create-status-setting.dto';
import { UpdateStatusSettingDto } from './dto/update-status-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { USER_TYPE } from '@/shared/constants/enum';
import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';

@Injectable()
export class StatusSettingService {
  constructor(
    @InjectRepository(StatusSetting)
    private readonly statusSettingRepository: Repository<StatusSetting>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(createStatusSettingDto: CreateStatusSettingDto) {
    const result = await this.statusSettingRepository.save(
      createStatusSettingDto,
    );
    return plainToInstance(StatusSetting, result);
  }

  async findOneWhere(options: FindOneOptions<StatusSetting>) {
    const result = await this.statusSettingRepository.findOne(options);
    return plainToInstance(StatusSetting, result);
  }

  async findAll(
    options: FindManyOptions<StatusSetting>,
  ): Promise<[StatusSetting[], number]> {
    const [list, count] =
      await this.statusSettingRepository.findAndCount(options);
    return [plainToInstance(StatusSetting, list), count];
  }

  async update(id: string, updateStatusSettingDto: UpdateStatusSettingDto) {
    const record = await this.statusSettingRepository.update(id, {
      ...updateStatusSettingDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.statusSettingRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async checkName(name: string, status_for: USER_TYPE) {
    const data = await this.statusSettingRepository
      .createQueryBuilder('ss')
      .where('LOWER(ss.name) = LOWER(:name)', { name })
      .andWhere('ss.status_for = :status_for', {
        status_for,
      })
      .getOne();

    return data;
  }
  async isAlreadyUsed(id: string) {
    const facilityCount = await this.facilityRepository.countBy({
      status: { id },
    });

    const providerCount = await this.providerRepository.countBy({
      status: { id },
    });
    return facilityCount > 0 || providerCount > 0;
  }
}
