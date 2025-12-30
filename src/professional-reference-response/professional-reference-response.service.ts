import { Injectable } from '@nestjs/common';
import { CreateProfessionalReferenceResponseDto } from './dto/create-professional-reference-response.dto';
import { plainToInstance } from 'class-transformer';
import { ProfessionalReferenceResponse } from './entities/professional-reference-response.entity';
import { ReferenceFormDesign } from '@/reference-form-design/entities/reference-form-design.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class ProfessionalReferenceResponseService {
  constructor(
    @InjectRepository(ProfessionalReferenceResponse)
    private readonly professionalReferenceResponseRepository: Repository<ProfessionalReferenceResponse>,
    @InjectRepository(ReferenceFormDesign)
    private readonly referenceFormDesignRepository: Repository<ReferenceFormDesign>,
    @InjectRepository(ProviderProfessionalReference)
    private readonly providerProfessionalReferenceRepository: Repository<ProviderProfessionalReference>,
  ) {}

  async createResponse(
    createProfessionalReferenceResponseDto: CreateProfessionalReferenceResponseDto[],
    provider_professional_reference: string,
  ) {
    const result = [];

    for (const dto of createProfessionalReferenceResponseDto) {
      const fetchQuestions = await this.referenceFormDesignRepository.findOne({
        where: {
          id: dto.reference_form_design as unknown as string,
        },
        relations: {
          reference_form_option: true,
        },
        order: {
          order: 'ASC',
        },
      });
      result.push({
        question: fetchQuestions.name,
        answer: dto.answer,
        provider_professional_reference: {
          id: provider_professional_reference,
        },
      });
    }
    const created =
      await this.professionalReferenceResponseRepository.save(result);
    return plainToInstance(ProfessionalReferenceResponse, created);
  }

  async findReferenceFormDesign(options: FindOneOptions<ReferenceFormDesign>) {
    const result = await this.referenceFormDesignRepository.find(options);
    return plainToInstance(ReferenceFormDesign, result);
  }

  async findOneProfessionalReference(
    options: FindOneOptions<ProviderProfessionalReference>,
  ) {
    const result =
      await this.providerProfessionalReferenceRepository.findOne(options);
    return plainToInstance(ProviderProfessionalReference, result);
  }

  async updateProviderProfessionalReference(
    criteria: FindOptionsWhere<ProviderProfessionalReference>,
    partialEntity: QueryDeepPartialEntity<ProviderProfessionalReference>,
  ) {
    const result = await this.providerProfessionalReferenceRepository.update(
      criteria,
      partialEntity,
    );
    return plainToInstance(ProviderProfessionalReference, result);
  }
}
