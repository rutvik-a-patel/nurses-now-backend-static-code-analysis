import { Injectable } from '@nestjs/common';
import { CreateProviderWorkHistoryDto } from './dto/create-provider-work-history.dto';
import { UpdateProviderWorkHistoryDto } from './dto/update-provider-work-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderWorkHistory } from './entities/provider-work-history.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Injectable()
export class ProviderWorkHistoryService {
  constructor(
    @InjectRepository(ProviderWorkHistory)
    private readonly providerWorkHistoryRepository: Repository<ProviderWorkHistory>,
  ) {}

  async create(createProviderWorkHistoryDto: CreateProviderWorkHistoryDto) {
    const data = plainToClass(
      ProviderWorkHistory,
      createProviderWorkHistoryDto,
    );
    const result = await this.providerWorkHistoryRepository.save(data);
    return plainToInstance(ProviderWorkHistory, result);
  }

  async findAll(
    options: FindManyOptions<ProviderWorkHistory>,
  ): Promise<[ProviderWorkHistory[], number]> {
    const [list, count] =
      await this.providerWorkHistoryRepository.findAndCount(options);
    return [plainToInstance(ProviderWorkHistory, list), count];
  }

  async count(options: FindManyOptions<ProviderWorkHistory>): Promise<number> {
    const count = await this.providerWorkHistoryRepository.count(options);
    return count;
  }

  async findOneWhere(options: FindOneOptions<ProviderWorkHistory>) {
    const result = await this.providerWorkHistoryRepository.findOne(options);
    return plainToInstance(ProviderWorkHistory, result);
  }

  async update(
    id: string,
    updateProviderWorkHistoryDto: UpdateProviderWorkHistoryDto,
  ) {
    const data = plainToClass(
      ProviderWorkHistory,
      updateProviderWorkHistoryDto,
    );
    const record = await this.providerWorkHistoryRepository.update(id, {
      ...data,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(
    where: FindOptionsWhere<ProviderWorkHistory>,
    deleteDto: DeleteDto,
  ) {
    const record = await this.providerWorkHistoryRepository.update(where, {
      deleted_at_ip: deleteDto.deleted_at_ip,
      deleted_at: new Date().toISOString(),
    });
    return record;
  }
}
