import { Injectable } from '@nestjs/common';
import { UpdateFacilityProfileSettingDto } from './dto/update-facility-profile-setting.dto';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { FacilityProfileSetting } from './entities/facility-profile-setting.entity';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FacilityProfileSettingService {
  constructor(
    @InjectRepository(FacilityProfileSetting)
    private readonly facilityProfileSettingRepository: Repository<FacilityProfileSetting>,
  ) {}

  async findOneWhere(where: FindOneOptions<FacilityProfileSetting>) {
    const result = await this.facilityProfileSettingRepository.findOne(where);
    return plainToInstance(FacilityProfileSetting, result);
  }

  async findAll() {
    const data = await this.facilityProfileSettingRepository
      .createQueryBuilder('s')
      .select([
        's.section as section',
        `json_agg(json_build_object(
        'id', s.id,
        'name', s.name,
        'status', s.status,
        'is_required', s.is_required,
        'key', s.key,
        'placeholder', s.placeholder,
        'type', s.type
      ) ORDER BY s.order ASC
        ) AS form_fields`,
      ])
      .groupBy('s.section, s.created_at')
      .addOrderBy('s.created_at', 'ASC')
      .getRawMany();
    return data;
  }

  async update(
    where: FindOptionsWhere<FacilityProfileSetting>,
    updateFacilityProfileSettingDto: UpdateFacilityProfileSettingDto,
  ) {
    const result = await this.facilityProfileSettingRepository.update(
      where,
      plainToInstance(FacilityProfileSetting, updateFacilityProfileSettingDto),
    );
    return result;
  }
}
