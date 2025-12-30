import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}
  async findOneWhere(options: FindOneOptions<Section>) {
    const result = await this.sectionRepository.findOne(options);
    return plainToInstance(Section, result);
  }

  async findAll(where: FindManyOptions<Section>) {
    const [list] = await this.sectionRepository.findAndCount(where);
    return plainToInstance(Section, list);
  }
}
