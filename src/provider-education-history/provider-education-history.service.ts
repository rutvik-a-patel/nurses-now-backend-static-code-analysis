import { Injectable } from '@nestjs/common';
import { CreateProviderEducationHistoryDto } from './dto/create-provider-education-history.dto';
import { UpdateProviderEducationHistoryDto } from './dto/update-provider-education-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderEducationHistory } from './entities/provider-education-history.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Injectable()
export class ProviderEducationHistoryService {
  constructor(
    @InjectRepository(ProviderEducationHistory)
    private readonly providerEducationHistoryRepository: Repository<ProviderEducationHistory>,
  ) {}

  async create(
    createProviderEducationHistoryDto: CreateProviderEducationHistoryDto,
  ) {
    const result = await this.providerEducationHistoryRepository.save(
      createProviderEducationHistoryDto,
    );
    return plainToInstance(ProviderEducationHistory, result);
  }

  async findAll(
    options: FindManyOptions<ProviderEducationHistory>,
  ): Promise<[ProviderEducationHistory[], number]> {
    const [list, count] =
      await this.providerEducationHistoryRepository.findAndCount(options);
    return [plainToInstance(ProviderEducationHistory, list), count];
  }

  async count(
    options: FindManyOptions<ProviderEducationHistory>,
  ): Promise<number> {
    const count = await this.providerEducationHistoryRepository.count(options);
    return count;
  }

  async findOneWhere(options: FindOneOptions<ProviderEducationHistory>) {
    const result =
      await this.providerEducationHistoryRepository.findOne(options);
    return plainToInstance(ProviderEducationHistory, result);
  }

  async update(
    id: string,
    updateProviderEducationHistoryDto: UpdateProviderEducationHistoryDto,
  ) {
    const record = await this.providerEducationHistoryRepository.update(id, {
      ...updateProviderEducationHistoryDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(
    where: FindOptionsWhere<ProviderEducationHistory>,
    deleteDto: DeleteDto,
  ) {
    const record = await this.providerEducationHistoryRepository.update(where, {
      deleted_at_ip: deleteDto.deleted_at_ip,
      deleted_at: new Date().toISOString(),
    });
    return record;
  }
}
