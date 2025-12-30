import { Injectable } from '@nestjs/common';
import { CreateCredentialsCategoryDto } from './dto/create-credentials-category.dto';
import { UpdateCredentialsCategoryDto } from './dto/update-credentials-category.dto';
import { CredentialsCategory } from './entities/credentials-category.entity';
import { plainToInstance } from 'class-transformer';
import { FindOneOptions, IsNull, Repository } from 'typeorm';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { InjectRepository } from '@nestjs/typeorm';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { FilterCredentialsDto } from './dto/filter-credentials.dto';
import { Credential } from '@/credentials/entities/credential.entity';

@Injectable()
export class CredentialsCategoryService {
  constructor(
    @InjectRepository(CredentialsCategory)
    private readonly credentialsCategoryRepository: Repository<CredentialsCategory>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(ProviderCredential)
    private readonly providerCredentialRepository: Repository<ProviderCredential>,
  ) {}
  async create(createCredentialsCategoryDto: CreateCredentialsCategoryDto) {
    const result = await this.credentialsCategoryRepository.save(
      createCredentialsCategoryDto,
    );
    return plainToInstance(CredentialsCategory, result);
  }

  async findOneWhere(options: FindOneOptions<CredentialsCategory>) {
    const result = await this.credentialsCategoryRepository.findOne(options);
    return plainToInstance(CredentialsCategory, result);
  }

  async findAll(filterCredentialsDto: FilterCredentialsDto) {
    const {
      specialty = '',
      certificate = '',
      auto_assign = '',
      credentials_category = [],
      search = '',
    } = filterCredentialsDto || {};

    const queryBuilder = this.credentialsCategoryRepository
      .createQueryBuilder('cc')
      .leftJoin('cc.credentials', 'c')
      .leftJoin('c.created_by', 'cb')
      .leftJoin('c.updated_by', 'ub')
      .select([
        'cc.id AS id',
        'cc.name AS name',
        'cc.created_at AS created_at',
        `COALESCE(JSON_AGG(
          JSON_BUILD_OBJECT(
            'id',
            c.id,
            'name',
            c.name,
            'credential_id',
            c.credential_id,
            'created_at',
            c.created_at,
            'is_essential',
				    c.is_essential,
            'expiry_required',c.expiry_required,
            'issued_required',c.issued_required,
            'document_required',c.document_required,
            'doc_number_required',c.doc_number_required,
            'approval_required',c.approval_required,
            'state',
            (select JSON_AGG(JSON_BUILD_OBJECT('id', s.id, 'name', s.iso_code)) from state s where s.id = ANY(c.state_id)),
            'category',
            cc.name,
            'auto_assign',
            c.auto_assign,
            'validate',
            c.validate,
            'creator',
            CONCAT(cb.first_name, ' ', cb.last_name),
            'created_at',
            c.created_at,
            'modifier',
            CONCAT(ub.first_name, ' ', ub.last_name),
            'updated_at',
            c.updated_at,
            'licenses',
            (
              SELECT
                JSON_AGG(merged)
              FROM
                (
                  SELECT
                    JSON_BUILD_OBJECT('type', 'certificate', 'id', cert.id, 'name', cert.name, 'abbreviation', cert.abbreviation, 'text_color', cert.text_color, 'background_color', cert.background_color) AS merged
                  FROM
                    UNNEST(c.licenses) AS license_id
                    JOIN certificate cert ON cert.id = license_id
                  WHERE
                    cert.deleted_at IS NULL
                  UNION ALL
                  SELECT
                    JSON_BUILD_OBJECT('type', 'speciality', 'id', spec.id, 'name', spec.name, 'abbreviation', spec.abbreviation, 'text_color', spec.text_color, 'background_color', spec.background_color) AS merged
                  FROM
                    UNNEST(c.licenses) AS license_id
                    JOIN speciality spec ON spec.id = license_id
                  WHERE
                    spec.deleted_at IS NULL
                ) AS all_licenses
            )
          )
          ORDER BY c.created_at DESC
      ) FILTER (WHERE c.id IS NOT NULL), '[]') AS credential_document`,
      ]);

    if (specialty) {
      queryBuilder.andWhere('c.licenses @> :specialty', {
        specialty: [specialty],
      });
    }

    if (certificate) {
      queryBuilder.andWhere('c.licenses @> :certificate', {
        certificate: [certificate],
      });
    }

    if (auto_assign) {
      queryBuilder.andWhere('c.auto_assign IN (:...auto_assign)', {
        auto_assign: auto_assign,
      });
    }

    if (credentials_category.length) {
      queryBuilder.andWhere('cc.id IN (:...credentials_category)', {
        credentials_category: credentials_category,
      });
    }

    if (search && parseSearchKeyword(search)) {
      const searchKeyword = parseSearchKeyword(search);
      queryBuilder.andWhere(
        `LOWER(cc.name) ILIKE LOWER(:search) OR LOWER(c.name) ILIKE LOWER(:search)`,
        { search: `%${searchKeyword}%` },
      );
    }

    queryBuilder.groupBy('cc.id');

    return await queryBuilder.getRawMany();
  }

  async update(
    id: string,
    updateCredentialsCategoryDto: UpdateCredentialsCategoryDto,
  ) {
    const record = await this.credentialsCategoryRepository.update(id, {
      ...updateCredentialsCategoryDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async checkRequirementExist(id: string) {
    const credentials = await this.credentialRepository.count({
      relations: { credentials_category: true },
      where: { credentials_category: { id } },
    });

    const uploadDocumentCount = await this.providerCredentialRepository.count({
      where: { credential: { credentials_category: { id } } },
    });

    return !!uploadDocumentCount || !!credentials;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    await this.credentialRepository.update(
      { credentials_category: { id }, deleted_at: IsNull() },
      {
        deleted_at: new Date().toISOString(),
        deleted_at_ip: deleteDto.deleted_at_ip,
      },
    );

    const record = await this.credentialsCategoryRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async checkName(name: string) {
    const data = await this.credentialsCategoryRepository
      .createQueryBuilder('c')
      .where('LOWER(c.name) = LOWER(:name)', { name })
      .getOne();

    return data;
  }
}
