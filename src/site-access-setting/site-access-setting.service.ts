import { Injectable } from '@nestjs/common';
import { CreateSiteAccessSettingDto } from './dto/create-site-access-setting.dto';
import { FindOneOptions, Repository } from 'typeorm';
import { SiteAccessSetting } from './entities/site-access-setting.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SiteAccessSettingService {
  constructor(
    @InjectRepository(SiteAccessSetting)
    private readonly siteAccessSettingRepository: Repository<SiteAccessSetting>,
  ) {}

  async create(createSiteAccessSettingDto: CreateSiteAccessSettingDto) {
    const result = await this.siteAccessSettingRepository.save(
      createSiteAccessSettingDto,
    );
    return plainToInstance(SiteAccessSetting, result);
  }

  async findOneWhere(where: FindOneOptions<SiteAccessSetting>) {
    const result = await this.siteAccessSettingRepository.findOne(where);
    return plainToInstance(SiteAccessSetting, result);
  }
}
