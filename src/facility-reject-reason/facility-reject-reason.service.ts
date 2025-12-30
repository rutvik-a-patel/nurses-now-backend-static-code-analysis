import { Injectable } from '@nestjs/common';
import { CreateFacilityRejectReasonDto } from './dto/create-facility-reject-reason.dto';
import { UpdateFacilityRejectReasonDto } from './dto/update-facility-reject-reason.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository, FindOneOptions, FindManyOptions, IsNull } from 'typeorm';
import { FacilityRejectReason } from './entities/facility-reject-reason.entity';

@Injectable()
export class FacilityRejectReasonService {
  constructor(
    @InjectRepository(FacilityRejectReason)
    private readonly facilityReasonRepository: Repository<FacilityRejectReason>,
  ) {}
  async create(createFacilityRejectReasonDto: CreateFacilityRejectReasonDto) {
    const result = await this.facilityReasonRepository.save(
      createFacilityRejectReasonDto,
    );
    return plainToInstance(FacilityRejectReason, result);
  }

  async checkName(reason: string, id?: string) {
    const queryBuilder = this.facilityReasonRepository
      .createQueryBuilder('f')
      .where('LOWER(f.reason) = LOWER(:reason)', {
        reason,
      });

    if (id) {
      queryBuilder.andWhere('f.id != :id', { id });
    }

    const data = await queryBuilder.getOne();

    return data;
  }

  async findOneWhere(options: FindOneOptions<FacilityRejectReason>) {
    const result = await this.facilityReasonRepository.findOne(options);
    return plainToInstance(FacilityRejectReason, result);
  }

  async findAll(
    options: FindManyOptions<FacilityRejectReason>,
  ): Promise<[FacilityRejectReason[], number]> {
    const [list, count] =
      await this.facilityReasonRepository.findAndCount(options);
    return [plainToInstance(FacilityRejectReason, list), count];
  }

  async update(
    id: string,
    updateFacilityRejectReasonDto: UpdateFacilityRejectReasonDto,
  ) {
    const record = await this.facilityReasonRepository.update(
      id,
      updateFacilityRejectReasonDto,
    );
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.facilityReasonRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }
}
