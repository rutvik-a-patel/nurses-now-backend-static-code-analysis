import { Injectable } from '@nestjs/common';
import { CreateAdminDocumentDto } from './dto/create-admin-document.dto';
import { UpdateAdminDocumentDto } from './dto/update-admin-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminDocument } from './entities/admin-document.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CATEGORY_TYPES } from '@/shared/constants/enum';
import { Documents } from '@/documents/entities/documents.entity';

@Injectable()
export class AdminDocumentService {
  constructor(
    @InjectRepository(AdminDocument)
    private readonly adminDocumentRepository: Repository<AdminDocument>,
    @InjectRepository(Documents)
    private readonly documentRepository: Repository<Documents>,
  ) {}

  async create(createAdminDocumentDto: CreateAdminDocumentDto) {
    const result = await this.adminDocumentRepository.save(
      createAdminDocumentDto,
    );
    return plainToInstance(AdminDocument, result);
  }

  async checkName(name: string, category: CATEGORY_TYPES, id?: string) {
    const queryBuilder = this.adminDocumentRepository
      .createQueryBuilder('a')
      .where('LOWER(a.name) = LOWER(:name) AND a.category = :category', {
        name,
        category,
      });

    if (id) {
      queryBuilder.andWhere('a.id != :id', { id });
    }

    const data = await queryBuilder.getOne();

    return data;
  }

  async findAll() {
    const list = await this.adminDocumentRepository
      .createQueryBuilder('a')
      .select([
        'a.category as category',
        `json_agg(json_build_object(
          'id', a.id, 
          'name', a.name, 
          'note', a.note, 
          'status', a.status
        )
        ORDER BY a.created_at DESC  
        ) AS document_categories`,
      ])
      .groupBy('a.category')
      .getRawMany();

    if (!list.length) {
      return [
        { category: CATEGORY_TYPES.agency, document_categories: [] },
        { category: CATEGORY_TYPES.clients, document_categories: [] },
        { category: CATEGORY_TYPES.provider, document_categories: [] },
      ];
    }

    return list;
  }

  async findOneWhere(where: FindOneOptions<AdminDocument>) {
    const result = await this.adminDocumentRepository.findOne(where);
    return plainToInstance(AdminDocument, result);
  }

  async update(
    option: FindOptionsWhere<AdminDocument>,
    updateAdminDocumentDto: UpdateAdminDocumentDto,
  ) {
    const result = await this.adminDocumentRepository.update(
      option,
      updateAdminDocumentDto,
    );
    return result;
  }

  async remove(option: FindOptionsWhere<AdminDocument>, deleteDto: DeleteDto) {
    const result = await this.adminDocumentRepository.update(option, {
      ...deleteDto,
      deleted_at: new Date().toISOString(),
    });
    return result;
  }

  async isAlreadyInUse(id: string) {
    const result = await this.documentRepository.count({
      where: { admin_document_category: { id } },
    });
    return result > 0;
  }
}
