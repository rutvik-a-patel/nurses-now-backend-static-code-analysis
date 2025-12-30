import { Injectable } from '@nestjs/common';
import { CreateDnrReasonDto } from './dto/create-dnr-reason.dto';
import { UpdateDnrReasonDto } from './dto/update-dnr-reason.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DnrReason } from './entities/dnr-reason.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { DNR_TYPE } from '@/shared/constants/enum';

@Injectable()
export class DnrReasonService {
  constructor(
    @InjectRepository(DnrReason)
    private readonly dnrReasonRepository: Repository<DnrReason>,
  ) {}

  async create(createDnrReasonDto: CreateDnrReasonDto) {
    const result = await this.dnrReasonRepository.save({
      ...createDnrReasonDto,
    });
    return plainToInstance(DnrReason, result);
  }

  async findAll(
    options: FindManyOptions<DnrReason>,
  ): Promise<[DnrReason[], number]> {
    const [list, count] = await this.dnrReasonRepository.findAndCount(options);
    return [plainToInstance(DnrReason, list), count];
  }

  async findOneWhere(options: FindOneOptions<DnrReason>) {
    const data = await this.dnrReasonRepository.findOne(options);
    return plainToInstance(DnrReason, data);
  }

  async updateWhere(
    options: FindOptionsWhere<DnrReason>,
    updateDnrReasonDto: UpdateDnrReasonDto,
  ) {
    const data = await this.dnrReasonRepository.update(
      options,
      updateDnrReasonDto,
    );
    return data;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.dnrReasonRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async checkName(name: string, type: DNR_TYPE) {
    const data = await this.dnrReasonRepository
      .createQueryBuilder('dnr')
      .where('LOWER(dnr.reason) = LOWER(:name) AND dnr.reason_type = :type', {
        name,
        type,
      })
      .getOne();

    return data;
  }
}
