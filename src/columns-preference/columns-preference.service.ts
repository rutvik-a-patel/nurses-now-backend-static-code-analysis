import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { ColumnsPreference } from './entities/columns-preference.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ColumnsPreferenceService {
  constructor(
    @InjectRepository(ColumnsPreference)
    private readonly columnsPreferenceRepository: Repository<ColumnsPreference>,
  ) {}

  async findOne(
    options: FindOneOptions<ColumnsPreference>,
  ): Promise<ColumnsPreference | null> {
    const result = await this.columnsPreferenceRepository.findOne(options);
    return plainToInstance(ColumnsPreference, result);
  }

  async create(data: Partial<ColumnsPreference>): Promise<ColumnsPreference> {
    const result = await this.columnsPreferenceRepository.save(data);
    return plainToInstance(ColumnsPreference, result);
  }

  async update(id: string, data: Partial<ColumnsPreference>) {
    await this.columnsPreferenceRepository.update({ id }, data);
    const updatedPreference = await this.columnsPreferenceRepository.findOne({
      where: { id },
    });
    return plainToInstance(ColumnsPreference, updatedPreference);
  }
}
