import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShiftRequest } from './entities/shift-request.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UpdateShiftRequestDto } from './dto/update-shift-request.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CreateShiftRequestDto } from './dto/create-shift-request.dto';
import {
  ORIENTATION_STATUS,
  SHIFT_REQUEST_STATUS,
} from '@/shared/constants/enum';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';

@Injectable()
export class ShiftRequestService {
  constructor(
    @InjectRepository(ShiftRequest)
    private readonly shiftRequestRepository: Repository<ShiftRequest>,
    @InjectRepository(ProviderOrientation)
    private readonly providerOrientationRepository: Repository<ProviderOrientation>,
  ) {}

  async create(createShiftRequestDto: CreateShiftRequestDto) {
    const data = plainToClass(ShiftRequest, createShiftRequestDto);
    const result = await this.shiftRequestRepository.save(data);
    return plainToInstance(ShiftRequest, result);
  }

  async findAll(
    options: FindManyOptions<ShiftRequest>,
  ): Promise<[ShiftRequest[], number]> {
    const [list, count] =
      await this.shiftRequestRepository.findAndCount(options);
    return [plainToInstance(ShiftRequest, list), count];
  }

  async findOneWhere(options: FindOneOptions<ShiftRequest>) {
    const result = await this.shiftRequestRepository.findOne(options);
    return plainToInstance(ShiftRequest, result);
  }

  async update(
    where: FindOptionsWhere<ShiftRequest>,
    updateShiftRequestDto: UpdateShiftRequestDto,
  ) {
    const data = plainToClass(ShiftRequest, updateShiftRequestDto);
    const record = await this.shiftRequestRepository.update(where, {
      ...data,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(where: FindOptionsWhere<ShiftRequest>, deleteDto: DeleteDto) {
    const record = await this.shiftRequestRepository.update(
      { ...where, deleted_at: IsNull() },
      {
        status: SHIFT_REQUEST_STATUS.rejected,
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async updateOrientation(id: string, status: ORIENTATION_STATUS) {
    await this.providerOrientationRepository.update(
      { shift: { id } },
      { status },
    );
  }
}
