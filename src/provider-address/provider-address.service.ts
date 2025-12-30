import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderAddress } from './entities/provider-address.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateProviderAddressDto } from './dto/create-provider-address.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UpdateProviderAddressDto } from './dto/update-provider-address.dto';

@Injectable()
export class ProviderAddressService {
  constructor(
    @InjectRepository(ProviderAddress)
    private readonly providerAddressRepository: Repository<ProviderAddress>,
  ) {}

  async create(createProviderAddressDto: CreateProviderAddressDto) {
    const result = await this.providerAddressRepository.save(
      createProviderAddressDto,
    );
    return plainToInstance(ProviderAddress, result);
  }

  async updateWhere(
    where: FindOptionsWhere<ProviderAddress>,
    updateProviderAddressDto: UpdateProviderAddressDto,
  ) {
    const partialEntity = plainToClass(
      ProviderAddress,
      updateProviderAddressDto,
    );
    const record = await this.providerAddressRepository.update(
      where,
      partialEntity,
    );
    return record;
  }

  async findOneWhere(where: FindOneOptions<ProviderAddress>) {
    const record = await this.providerAddressRepository.findOne(where);
    return plainToInstance(ProviderAddress, record);
  }
}
