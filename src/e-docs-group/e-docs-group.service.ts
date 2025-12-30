import { Injectable } from '@nestjs/common';
import { CreateEDocsGroupDto } from './dto/create-e-docs-group.dto';
import { UpdateEDocsGroupDto } from './dto/update-e-docs-group.dto';
import { EDocsGroup } from './entities/e-docs-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { EDoc } from '@/e-docs/entities/e-doc.entity';

@Injectable()
export class EDocsGroupService {
  constructor(
    @InjectRepository(EDocsGroup)
    private readonly eDocsGroupRepository: Repository<EDocsGroup>,
    @InjectRepository(EDoc)
    private readonly eDocRepository: Repository<EDoc>,
  ) {}

  async create(createEDocsGroupDto: CreateEDocsGroupDto) {
    const result = await this.eDocsGroupRepository.save(createEDocsGroupDto);
    return plainToInstance(EDocsGroup, result);
  }

  async findAll(options: FindManyOptions<EDocsGroup>): Promise<EDocsGroup[]> {
    const list = await this.eDocsGroupRepository.find(options);
    return plainToInstance(EDocsGroup, list);
  }

  async findOneWhere(options: FindOneOptions<EDocsGroup>) {
    const data = await this.eDocsGroupRepository.findOne(options);
    return plainToInstance(EDocsGroup, data);
  }

  async updateWhere(
    options: FindOptionsWhere<EDocsGroup>,
    updateEDocsGroupDto: UpdateEDocsGroupDto,
  ) {
    const data = await this.eDocsGroupRepository.update(
      options,
      updateEDocsGroupDto,
    );
    return data;
  }

  async remove(id: string) {
    const data = await this.findOneWhere({
      where: { id: id },
      relations: { document: true },
    });

    await this.eDocsGroupRepository.softRemove(data);
  }

  async checkName(name: string) {
    const data = await this.eDocsGroupRepository
      .createQueryBuilder('d')
      .where('LOWER(d.name) = LOWER(:name)', { name })
      .getOne();

    return data;
  }

  async isGroupUsed(id: string) {
    const data = await this.eDocRepository.count({
      where: { document_group: { id } },
    });

    return !!data;
  }
}
