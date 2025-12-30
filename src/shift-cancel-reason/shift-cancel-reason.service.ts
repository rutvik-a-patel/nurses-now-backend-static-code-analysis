import { Injectable } from '@nestjs/common';
import { CreateShiftCancelReasonDto } from './dto/create-shift-cancel-reason.dto';
import { UpdateShiftCancelReasonDto } from './dto/update-shift-cancel-reason.dto';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShiftCancelReason } from './entities/shift-cancel-reason.entity';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { USER_TYPE } from '@/shared/constants/enum';

@Injectable()
export class ShiftCancelReasonService {
  constructor(
    @InjectRepository(ShiftCancelReason)
    private readonly shiftCancelReasonRepository: Repository<ShiftCancelReason>,
  ) {}
  async create(createShiftCancelReasonDto: CreateShiftCancelReasonDto) {
    const result = await this.shiftCancelReasonRepository.save(
      createShiftCancelReasonDto,
    );
    return plainToInstance(ShiftCancelReason, result);
  }

  async findOneWhere(options: FindOneOptions<ShiftCancelReason>) {
    const result = await this.shiftCancelReasonRepository.findOne(options);
    return plainToInstance(ShiftCancelReason, result);
  }

  async checkName(reason: string, user_type: USER_TYPE, id?: string) {
    const queryBuilder = this.shiftCancelReasonRepository
      .createQueryBuilder('s')
      .where('LOWER(s.reason) = LOWER(:reason) AND s.user_type = :user_type', {
        reason,
        user_type,
      });

    if (id) {
      queryBuilder.andWhere('s.id != :id', { id });
    }

    const data = await queryBuilder.getOne();

    return data;
  }

  async findAll(
    options: FindManyOptions<ShiftCancelReason>,
  ): Promise<[ShiftCancelReason[], number]> {
    const [list, count] =
      await this.shiftCancelReasonRepository.findAndCount(options);
    return [plainToInstance(ShiftCancelReason, list), count];
  }

  async updateWhere(
    where: FindOptionsWhere<ShiftCancelReason>,
    updateShiftCancelReasonDto: UpdateShiftCancelReasonDto,
  ) {
    const record = await this.shiftCancelReasonRepository.update(where, {
      ...updateShiftCancelReasonDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.shiftCancelReasonRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async isAlreadyUsed(id: string): Promise<boolean> {
    const count = await this.shiftCancelReasonRepository
      .createQueryBuilder('scr')
      .leftJoin('shift', 's')
      .where('s.shift_cancel_reason_id = :id', { id })
      .getCount();

    return count > 0;
  }
}
