import { Injectable } from '@nestjs/common';
import { CreateProviderRejectReasonDto } from './dto/create-provider-reject-reason.dto';
import { UpdateProviderRejectReasonDto } from './dto/update-provider-reject-reason.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository, FindOneOptions, FindManyOptions, IsNull } from 'typeorm';
import { ProviderRejectReason } from './entities/provider-reject-reason.entity';

@Injectable()
export class ProviderRejectReasonService {
  constructor(
    @InjectRepository(ProviderRejectReason)
    private readonly providerReasonRepository: Repository<ProviderRejectReason>,
  ) {}
  async create(createProviderRejectReasonDto: CreateProviderRejectReasonDto) {
    const result = await this.providerReasonRepository.save(
      createProviderRejectReasonDto,
    );
    return plainToInstance(ProviderRejectReason, result);
  }

  async checkName(reason: string, id?: string) {
    const queryBuilder = this.providerReasonRepository
      .createQueryBuilder('p')
      .where('LOWER(p.reason) = LOWER(:reason)', {
        reason,
      });

    if (id) {
      queryBuilder.andWhere('p.id != :id', { id });
    }

    const data = await queryBuilder.getOne();

    return data;
  }

  async findOneWhere(options: FindOneOptions<ProviderRejectReason>) {
    const result = await this.providerReasonRepository.findOne(options);
    return plainToInstance(ProviderRejectReason, result);
  }

  async findAll(
    options: FindManyOptions<ProviderRejectReason>,
  ): Promise<[ProviderRejectReason[], number]> {
    const [list, count] =
      await this.providerReasonRepository.findAndCount(options);
    return [plainToInstance(ProviderRejectReason, list), count];
  }

  async update(
    id: string,
    updateProviderRejectReasonDto: UpdateProviderRejectReasonDto,
  ) {
    const record = await this.providerReasonRepository.update(
      id,
      updateProviderRejectReasonDto,
    );
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.providerReasonRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async isAlreadyInUse(id: string) {
    const record = await this.providerReasonRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect(
        'p.provider',
        'provider',
        'provider.reason_id = p.id AND provider.deleted_at IS NULL',
      )
      .where('p.id = :id', { id })
      .andWhere('provider.id IS NOT NULL')
      .getOne();

    return record ? true : false;
  }
}
