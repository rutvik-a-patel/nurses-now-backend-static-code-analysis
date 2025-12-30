import { Injectable } from '@nestjs/common';
import { CreateProviderProfessionalReferenceDto } from './dto/create-provider-professional-reference.dto';
import { UpdateProviderProfessionalReferenceDto } from './dto/update-provider-professional-reference.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderProfessionalReference } from './entities/provider-professional-reference.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { ReferenceForm } from '@/reference-form-design/entities/reference-form.entity';
import { ProfessionalReferenceResponse } from '@/professional-reference-response/entities/professional-reference-response.entity';

@Injectable()
export class ProviderProfessionalReferenceService {
  constructor(
    @InjectRepository(ProviderProfessionalReference)
    private readonly providerProfessionalReferenceRepository: Repository<ProviderProfessionalReference>,
    @InjectRepository(ProfessionalReferenceResponse)
    private readonly professionalReferenceResponseRepository: Repository<ProfessionalReferenceResponse>,
    @InjectRepository(ReferenceForm)
    private readonly referenceFormRepository: Repository<ReferenceForm>,
  ) {}

  async create(
    createProviderProfessionalReferenceDto: CreateProviderProfessionalReferenceDto,
  ) {
    const data = plainToClass(
      ProviderProfessionalReference,
      createProviderProfessionalReferenceDto,
    );
    const result =
      await this.providerProfessionalReferenceRepository.save(data);
    return plainToInstance(ProviderProfessionalReference, result);
  }

  async findAll(
    options: FindManyOptions<ProviderProfessionalReference>,
  ): Promise<[ProviderProfessionalReference[], number]> {
    const [list, count] =
      await this.providerProfessionalReferenceRepository.findAndCount(options);
    return [plainToInstance(ProviderProfessionalReference, list), count];
  }

  async count(
    options: FindManyOptions<ProviderProfessionalReference>,
  ): Promise<number> {
    const count =
      await this.providerProfessionalReferenceRepository.count(options);
    return count;
  }

  async findOneWhere(options: FindOneOptions<ProviderProfessionalReference>) {
    const result =
      await this.providerProfessionalReferenceRepository.findOne(options);
    return plainToInstance(ProviderProfessionalReference, result);
  }
  async update(
    id: string,
    updateProviderProfessionalReferenceDto: UpdateProviderProfessionalReferenceDto,
  ) {
    const data = plainToClass(
      ProviderProfessionalReference,
      updateProviderProfessionalReferenceDto,
    );
    const record = await this.providerProfessionalReferenceRepository.update(
      id,
      {
        ...data,
        updated_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async remove(
    where: FindOptionsWhere<ProviderProfessionalReference>,
    deleteDto: DeleteDto,
  ) {
    const record = await this.providerProfessionalReferenceRepository.update(
      where,
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async findOneReferenceForm(options: FindOneOptions<ReferenceForm>) {
    const result = await this.referenceFormRepository.findOne(options);
    return plainToInstance(ReferenceForm, result);
  }

  /**
   * Update reminder counters for a professional reference
   */
  async updateReminderCounters(id: string, remindersSent: number) {
    const record = await this.providerProfessionalReferenceRepository.update(
      id,
      {
        total_reminder_sent: remindersSent,
        updated_at: new Date().toISOString(),
      },
    );
    return record;
  }

  /**
   * Bulk update status for multiple references
   */
  async updateStatus(ids: string[], status: string) {
    const record = await this.providerProfessionalReferenceRepository.update(
      ids,
      {
        status: status as any,
        updated_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async getProfessionalReferenceResponses(professional_id: string) {
    return await this.professionalReferenceResponseRepository
      .createQueryBuilder('ppr')
      .where('ppr.provider_professional_reference_id = :professional_id', {
        professional_id,
      })
      .select(['ppr.question', 'ppr.answer'])
      .getMany();
  }
}
