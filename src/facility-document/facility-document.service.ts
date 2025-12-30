import { Injectable } from '@nestjs/common';
import { CreateFacilityDocumentDto } from './dto/create-facility-document.dto';
import { UpdateFacilityDocumentDto } from './dto/update-facility-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilityDocument } from './entities/facility-document.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { FacilityDocumentCategory } from './entities/facility-document-category.entity';
import { plainToInstance } from 'class-transformer';
import { CreateFacilityDocumentCategoryDto } from './dto/create-facility-document-category.dto';
import { UpdateFacilityDocumentCategoryDto } from './dto/update-facility-document-category.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Injectable()
export class FacilityDocumentService {
  constructor(
    @InjectRepository(FacilityDocument)
    private readonly facilityDocument: Repository<FacilityDocument>,
    @InjectRepository(FacilityDocumentCategory)
    private readonly facilityDocumentCategory: Repository<FacilityDocumentCategory>,
  ) {}

  async checkCategoryName(name: string) {
    const data = await this.facilityDocumentCategory
      .createQueryBuilder('f')
      .where('LOWER(f.name) = LOWER(:name)', { name })
      .getOne();

    return data;
  }

  async createCategory(
    createFacilityDocumentCategoryDto: CreateFacilityDocumentCategoryDto,
  ) {
    const result = await this.facilityDocumentCategory.save(
      createFacilityDocumentCategoryDto,
    );
    return plainToInstance(FacilityDocumentCategory, result);
  }

  async checkName(name: string, category: string) {
    const data = await this.facilityDocument
      .createQueryBuilder('f')
      .where('LOWER(f.name) = LOWER(:name)', { name })
      .andWhere('f.facility_document_category = :category', { category })
      .getOne();

    return data;
  }

  async create(createFacilityDocumentDto: CreateFacilityDocumentDto) {
    const result = await this.facilityDocument.save(
      plainToInstance(FacilityDocument, createFacilityDocumentDto),
    );
    return plainToInstance(FacilityDocument, result);
  }

  async findAll(where: FindManyOptions<FacilityDocumentCategory>) {
    const list = await this.facilityDocumentCategory.find(where);
    return list;
  }

  async findOneCategory(where: FindOneOptions<FacilityDocumentCategory>) {
    const result = await this.facilityDocumentCategory.findOne(where);
    return plainToInstance(FacilityDocumentCategory, result);
  }

  async findOneDocument(where: FindOneOptions<FacilityDocument>) {
    const result = await this.facilityDocument.findOne(where);
    return plainToInstance(FacilityDocument, result);
  }

  async updateCategory(
    option: FindOptionsWhere<FacilityDocumentCategory>,
    updateFacilityDocumentCategoryDto: UpdateFacilityDocumentCategoryDto,
  ) {
    const result = await this.facilityDocumentCategory.update(
      option,
      updateFacilityDocumentCategoryDto,
    );
    return result;
  }

  async updateDocument(
    option: FindOptionsWhere<FacilityDocument>,
    updateFacilityDocumentDto: UpdateFacilityDocumentDto,
  ) {
    const result = await this.facilityDocument.update(
      option,
      plainToInstance(FacilityDocument, updateFacilityDocumentDto),
    );
    return result;
  }

  async removeCategory(
    option: FindOptionsWhere<FacilityDocumentCategory>,
    deleteDto: DeleteDto,
  ) {
    const result = await this.facilityDocumentCategory.update(option, {
      ...deleteDto,
      deleted_at: new Date().toISOString(),
    });
    return result;
  }

  async removeDocument(
    option: FindOptionsWhere<FacilityDocument>,
    deleteDto: DeleteDto,
  ) {
    const result = await this.facilityDocument.update(option, {
      ...deleteDto,
      deleted_at: new Date().toISOString(),
    });
    return result;
  }
}
