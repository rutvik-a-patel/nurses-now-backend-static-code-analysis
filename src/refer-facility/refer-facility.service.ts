import { Injectable } from '@nestjs/common';
import { CreateReferFacilityDto } from './dto/create-refer-facility.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReferFacility } from './entities/refer-facility.entity';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ReferFacilityService {
  constructor(
    @InjectRepository(ReferFacility)
    private readonly referFacilityRepository: Repository<ReferFacility>,
  ) {}

  async create(createReferFacilityDto: CreateReferFacilityDto) {
    const result = await this.referFacilityRepository.save(
      plainToClass(ReferFacility, createReferFacilityDto),
    );
    return result;
  }
}
