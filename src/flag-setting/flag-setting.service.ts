import { Injectable } from '@nestjs/common';
import { CreateFlagSettingDto } from './dto/create-flag-setting.dto';
import { UpdateFlagSettingDto } from './dto/update-flag-setting.dto';
import { FlagSetting } from './entities/flag-setting.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Injectable()
export class FlagSettingService {
  constructor(
    @InjectRepository(FlagSetting)
    private readonly flagSettingRepository: Repository<FlagSetting>,
  ) {}

  async checkName(name: string) {
    const data = await this.flagSettingRepository
      .createQueryBuilder('f')
      .where('LOWER(f.name) = LOWER(:name)', { name })
      .getOne();

    return data;
  }

  async create(createFlagSettingDto: CreateFlagSettingDto) {
    const result = await this.flagSettingRepository.save(createFlagSettingDto);
    return plainToInstance(FlagSetting, result);
  }

  async findAll(
    options: FindManyOptions<FlagSetting>,
  ): Promise<[FlagSetting[], number]> {
    const [list, count] =
      await this.flagSettingRepository.findAndCount(options);
    return [plainToInstance(FlagSetting, list), count];
  }

  async findOneWhere(options: FindOneOptions<FlagSetting>) {
    const result = await this.flagSettingRepository.findOne(options);
    return plainToInstance(FlagSetting, result);
  }

  async update(id: string, updateFlagSettingDto: UpdateFlagSettingDto) {
    const record = await this.flagSettingRepository.update(id, {
      ...updateFlagSettingDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.flagSettingRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }
}
