import { Injectable } from '@nestjs/common';
import { CreateProviderSavedFacilityDto } from './dto/create-provider-saved-facility.dto';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderSavedFacility } from './entities/provider-saved-facility.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';

@Injectable()
export class ProviderSavedFacilityService {
  constructor(
    @InjectRepository(ProviderSavedFacility)
    private readonly providerSavedFacilityRepository: Repository<ProviderSavedFacility>,
    @InjectRepository(FacilityProvider)
    private readonly facilityProviderRepository: Repository<FacilityProvider>,
  ) {}

  async create(createProviderSavedFacilityDto: CreateProviderSavedFacilityDto) {
    const result = await this.providerSavedFacilityRepository.save(
      plainToClass(ProviderSavedFacility, createProviderSavedFacilityDto),
    );
    return plainToInstance(ProviderSavedFacility, result);
  }

  async findOneWhere(options: FindOneOptions<ProviderSavedFacility>) {
    const result = await this.providerSavedFacilityRepository.findOne(options);
    return plainToInstance(ProviderSavedFacility, result);
  }

  async findAll(
    options: FindManyOptions<ProviderSavedFacility>,
  ): Promise<[ProviderSavedFacility[], number]> {
    const [list, count] =
      await this.providerSavedFacilityRepository.findAndCount(options);
    return [plainToInstance(ProviderSavedFacility, list), count];
  }

  async findSelfFacility(
    options: FindManyOptions<FacilityProvider>,
  ): Promise<[FacilityProvider[], number]> {
    const [list, count] =
      await this.facilityProviderRepository.findAndCount(options);
    return [plainToInstance(FacilityProvider, list), count];
  }

  async remove(id: string) {
    const record = await this.providerSavedFacilityRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }
}
