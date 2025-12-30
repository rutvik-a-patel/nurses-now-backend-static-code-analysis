import { Injectable } from '@nestjs/common';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { ShiftType } from './entities/shift-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Injectable()
export class ShiftTypeService {
  constructor(
    @InjectRepository(ShiftType)
    private readonly shiftTypeRepository: Repository<ShiftType>,
  ) {}
  async create(createShiftTypeDto: CreateShiftTypeDto) {
    const result = await this.shiftTypeRepository.save(createShiftTypeDto);
    return plainToInstance(ShiftType, result);
  }

  async findOneWhere(options: FindOneOptions<ShiftType>) {
    const result = await this.shiftTypeRepository.findOne(options);
    return plainToInstance(ShiftType, result);
  }

  async findAll(
    options: FindManyOptions<ShiftType>,
  ): Promise<[ShiftType[], number]> {
    const [list, count] = await this.shiftTypeRepository.findAndCount(options);
    return [plainToInstance(ShiftType, list), count];
  }

  async updateWhere(
    where: FindOptionsWhere<ShiftType>,
    updateShiftTypeDto: UpdateShiftTypeDto,
  ) {
    const record = await this.shiftTypeRepository.update(where, {
      ...updateShiftTypeDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.shiftTypeRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }
}
