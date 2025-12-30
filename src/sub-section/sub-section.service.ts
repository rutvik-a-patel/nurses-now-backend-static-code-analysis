import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { SubSection } from './entities/sub-section.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SubSectionService {
  constructor(
    @InjectRepository(SubSection)
    private readonly subSectionRepository: Repository<SubSection>,
  ) {}
  async findAll(where: FindManyOptions<SubSection>) {
    const [list] = await this.subSectionRepository.findAndCount(where);
    return plainToInstance(SubSection, list);
  }
}
