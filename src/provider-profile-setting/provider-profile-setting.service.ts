import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderProfileSetting } from './entities/provider-profile-setting.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ProviderProfileSettingSubSection } from './entities/provider-profile-setting-sub-section.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class ProviderProfileSettingService {
  constructor(
    @InjectRepository(ProviderProfileSetting)
    private readonly providerProfileSettingRepository: Repository<ProviderProfileSetting>,
    @InjectRepository(ProviderProfileSettingSubSection)
    private readonly providerProfileSettingSubSectionRepository: Repository<ProviderProfileSettingSubSection>,
  ) {}

  async findAll(where: FindManyOptions<ProviderProfileSetting>) {
    const result = await this.providerProfileSettingRepository.find(where);
    return plainToInstance(ProviderProfileSetting, result);
  }

  async findOneWhere(where: FindOneOptions<ProviderProfileSetting>) {
    const result = await this.providerProfileSettingRepository.findOne(where);
    return plainToInstance(ProviderProfileSetting, result);
  }

  async updateSubSection(id: string, updateSettingDto: UpdateSettingDto) {
    const record = await this.providerProfileSettingSubSectionRepository.update(
      id,
      {
        ...updateSettingDto,
        updated_at: new Date().toISOString(),
      },
    );
    return record;
  }
}
