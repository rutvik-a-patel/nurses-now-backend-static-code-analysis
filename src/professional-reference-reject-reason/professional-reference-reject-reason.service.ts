import { Injectable } from '@nestjs/common';
import { CreateProfessionalReferenceRejectReasonDto } from './dto/create-professional-reference-reject-reason.dto';
import { UpdateProfessionalReferenceRejectReasonDto } from './dto/update-professional-reference-reject-reason.dto';
import { ProfessionalReferenceRejectReason } from './entities/professional-reference-reject-reason.entity';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository, FindOneOptions, FindManyOptions, IsNull } from 'typeorm';

@Injectable()
export class ProfessionalReferenceRejectReasonService {
  constructor(
    @InjectRepository(ProfessionalReferenceRejectReason)
    private readonly professionalReferenceRejectReasonRepository: Repository<ProfessionalReferenceRejectReason>,
  ) {}

  async create(
    createProfessionalReferenceRejectReasonDto: CreateProfessionalReferenceRejectReasonDto,
  ) {
    const result = await this.professionalReferenceRejectReasonRepository.save(
      createProfessionalReferenceRejectReasonDto,
    );
    return plainToInstance(ProfessionalReferenceRejectReason, result);
  }

  async checkName(reason: string, id?: string) {
    const queryBuilder = this.professionalReferenceRejectReasonRepository
      .createQueryBuilder('rrr')
      .where('LOWER(rrr.reason) = LOWER(:reason)', {
        reason,
      });

    if (id) {
      queryBuilder.andWhere('rrr.id != :id', { id });
    }

    const data = await queryBuilder.getOne();

    return data;
  }

  async findOneWhere(
    options: FindOneOptions<ProfessionalReferenceRejectReason>,
  ) {
    const result =
      await this.professionalReferenceRejectReasonRepository.findOne(options);
    return plainToInstance(ProfessionalReferenceRejectReason, result);
  }

  async findAll(
    options: FindManyOptions<ProfessionalReferenceRejectReason>,
  ): Promise<[ProfessionalReferenceRejectReason[], number]> {
    const [list, count] =
      await this.professionalReferenceRejectReasonRepository.findAndCount(
        options,
      );
    return [plainToInstance(ProfessionalReferenceRejectReason, list), count];
  }

  async update(
    id: string,
    updateProfessionalReferenceRejectReasonDto: UpdateProfessionalReferenceRejectReasonDto,
  ) {
    const record =
      await this.professionalReferenceRejectReasonRepository.update(
        id,
        updateProfessionalReferenceRejectReasonDto,
      );
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record =
      await this.professionalReferenceRejectReasonRepository.update(
        { id: id, deleted_at: IsNull() },
        {
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: new Date().toISOString(),
        },
      );
    return record;
  }

  async isAlreadyInUse(id: string) {
    const record = await this.professionalReferenceRejectReasonRepository
      .createQueryBuilder('reference_reject')
      .leftJoinAndSelect(
        'reference_reject.provider_professional_reference',
        'reference',
        'reference.reason_id = reference_reject.id AND reference.deleted_at IS NULL',
      )
      .where('reference_reject.id = :id', { id })
      .andWhere('reference.id IS NOT NULL')
      .getOne();

    return record ? true : false;
  }
}
