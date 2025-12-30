import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubAcknowledgement } from './entities/sub-acknowledgement.entity';
import { Repository } from 'typeorm';
import {
  AcknowledgementQuestion,
  CreateProviderAcknowledgementDto,
} from './dto/create-provider-acknowledgement.dto';
import { plainToClass } from 'class-transformer';
import { ProviderAcknowledgement } from './entities/provider-acknowledgement.entity';

@Injectable()
export class ProviderAcknowledgementService {
  constructor(
    @InjectRepository(SubAcknowledgement)
    private readonly subAcknowledgementRepository: Repository<SubAcknowledgement>,
    @InjectRepository(ProviderAcknowledgement)
    private readonly providerAcknowledgementRepository: Repository<ProviderAcknowledgement>,
  ) {}

  async createAcknowledgementResponse(
    acknowledgementQuestion: AcknowledgementQuestion,
  ) {
    const data = {
      generalSettingSubSection: acknowledgementQuestion.acknowledgementSetting,
      response: acknowledgementQuestion.response,
      remark: acknowledgementQuestion.remark,
    };

    const result = await this.subAcknowledgementRepository.save(data);
    return plainToClass(SubAcknowledgement, result);
  }

  async createProviderAcknowledgement(
    createProviderAcknowledgementDto: CreateProviderAcknowledgementDto,
  ) {
    const result = await this.providerAcknowledgementRepository.save(
      createProviderAcknowledgementDto,
    );
    return plainToClass(SubAcknowledgement, result);
  }
}
