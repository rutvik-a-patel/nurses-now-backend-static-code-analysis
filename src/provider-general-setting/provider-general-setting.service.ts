import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ProviderGeneralSettingSection } from './entities/provider-general-setting-section.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ProviderGeneralSettingSubSection } from './entities/provider-general-setting-sub-section.entity';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class ProviderGeneralSettingService {
  constructor(
    @InjectRepository(ProviderGeneralSettingSection)
    private readonly providerGeneralSettingSectionRepository: Repository<ProviderGeneralSettingSection>,
    @InjectRepository(ProviderGeneralSettingSubSection)
    private readonly providerGeneralSettingSubSectionRepository: Repository<ProviderGeneralSettingSubSection>,
  ) {}

  async createSource(createSourceDto: CreateSourceDto) {
    const sourceData = plainToClass(
      ProviderGeneralSettingSubSection,
      createSourceDto,
    );
    const result =
      await this.providerGeneralSettingSubSectionRepository.save(sourceData);
    return plainToInstance(ProviderGeneralSettingSubSection, result);
  }

  async findOneSubSection(
    options: FindOneOptions<ProviderGeneralSettingSubSection>,
  ) {
    const result =
      await this.providerGeneralSettingSubSectionRepository.findOne(options);
    return plainToInstance(ProviderGeneralSettingSubSection, result);
  }

  async findOneSourceName(name: string) {
    const queryBuilder =
      this.providerGeneralSettingSubSectionRepository.createQueryBuilder('p');

    const result = await queryBuilder
      .where('LOWER(p.name) = LOWER(:name)', {
        name: name,
      })
      .getOne();

    return plainToInstance(ProviderGeneralSettingSubSection, result);
  }

  async updateSubSection(id: string, updateSettingDto: UpdateSettingDto) {
    const record = await this.providerGeneralSettingSubSectionRepository.update(
      id,
      {
        ...updateSettingDto,
        updated_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async findOneSectionWhere(
    options: FindOneOptions<ProviderGeneralSettingSection>,
  ) {
    const result =
      await this.providerGeneralSettingSectionRepository.findOne(options);
    return plainToInstance(ProviderGeneralSettingSection, result);
  }

  async findAllSectionWhere(
    options: FindManyOptions<ProviderGeneralSettingSection>,
  ) {
    const result =
      await this.providerGeneralSettingSectionRepository.find(options);
    return plainToInstance(ProviderGeneralSettingSection, result);
  }
}
