import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EDoc } from './entities/e-doc.entity';
import { FindOneOptions, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { plainToInstance } from 'class-transformer';
import { CreateEDocDto } from './dto/create-e-doc.dto';
import { UpdateEDocDto } from './dto/update-e-doc.dto';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';

@Injectable()
export class EDocsService {
  constructor(
    @InjectRepository(EDoc)
    private readonly eDocRepository: Repository<EDoc>,
    @InjectRepository(EDocResponse)
    private readonly eDocResponseRepository: Repository<EDocResponse>,
  ) {}
  async create(createEDocDto: CreateEDocDto) {
    const result = await this.eDocRepository.save(
      plainToInstance(EDoc, createEDocDto),
    );
    return plainToInstance(EDoc, result);
  }

  async findOneWhere(options: FindOneOptions<EDoc>) {
    const data = await this.eDocRepository.findOne(options);
    return plainToInstance(EDoc, data);
  }

  async updateWhere(
    options: FindOptionsWhere<EDoc>,
    updateEDocDto: UpdateEDocDto,
  ) {
    const data = await this.eDocRepository.update(
      options,
      plainToInstance(EDoc, updateEDocDto),
    );
    return data;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.eDocRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async checkName(name: string, groupId: string) {
    const data = await this.eDocRepository
      .createQueryBuilder('d')
      .where(
        'LOWER(d.name) = LOWER(:name) AND d.document_group_id = :groupId',
        { name, groupId },
      )
      .getOne();

    return data;
  }

  async isEDocUsed(id: string) {
    const data = await this.eDocResponseRepository.count({
      where: { e_doc: { id } },
    });

    return !!data;
  }
}
