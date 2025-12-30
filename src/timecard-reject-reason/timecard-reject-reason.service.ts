import { Injectable } from '@nestjs/common';
import { CreateTimecardRejectReasonDto } from './dto/create-timecard-reject-reason.dto';
import { UpdateTimecardRejectReasonDto } from './dto/update-timecard-reject-reason.dto';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TimecardRejectReason } from './entities/timecard-reject-reason.entity';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Injectable()
export class TimecardRejectReasonService {
  constructor(
    @InjectRepository(TimecardRejectReason)
    private readonly timecardRejectReasonRepository: Repository<TimecardRejectReason>,
  ) {}
  async create(createTimecardRejectReasonDto: CreateTimecardRejectReasonDto) {
    const result = await this.timecardRejectReasonRepository.save(
      createTimecardRejectReasonDto,
    );
    return plainToInstance(TimecardRejectReason, result);
  }

  async checkName(reason: string, id?: string) {
    const queryBuilder = this.timecardRejectReasonRepository
      .createQueryBuilder('t')
      .where('LOWER(t.reason) = LOWER(:reason)', {
        reason,
      });

    if (id) {
      queryBuilder.andWhere('t.id != :id', { id });
    }

    const data = await queryBuilder.getOne();

    return data;
  }

  async findOneWhere(options: FindOneOptions<TimecardRejectReason>) {
    const result = await this.timecardRejectReasonRepository.findOne(options);
    return plainToInstance(TimecardRejectReason, result);
  }

  async findAll(
    options: FindManyOptions<TimecardRejectReason>,
  ): Promise<[TimecardRejectReason[], number]> {
    const [list, count] =
      await this.timecardRejectReasonRepository.findAndCount(options);
    return [plainToInstance(TimecardRejectReason, list), count];
  }

  async update(
    id: string,
    updateTimecardRejectReasonDto: UpdateTimecardRejectReasonDto,
  ) {
    const record = await this.timecardRejectReasonRepository.update(id, {
      ...updateTimecardRejectReasonDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.timecardRejectReasonRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async isAlreadyInUse(id: string) {
    const record = await this.timecardRejectReasonRepository
      .createQueryBuilder('trs')
      .leftJoinAndSelect(
        'trs.timecards',
        'timecard',
        'timecard.timecard_reject_reason_id = trs.id AND timecard.deleted_at IS NULL',
      )
      .where('trs.id = :id', { id })
      .andWhere('timecard.id IS NOT NULL')
      .getOne();

    return record ? true : false;
  }
}
