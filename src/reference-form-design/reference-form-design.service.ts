import { Injectable } from '@nestjs/common';
import {
  CreateOptionDto,
  CreateReferenceFormDesignDto,
  CreateReferenceFormDto,
} from './dto/create-reference-form-design.dto';
import { UpdateReferenceFormDto } from './dto/update-reference-form-design.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReferenceFormDesign } from './entities/reference-form-design.entity';
import { FindOneOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ReferenceFormOption } from '@/reference-form-option/entities/reference-form-option.entity';
import { ReferenceForm } from './entities/reference-form.entity';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';

@Injectable()
export class ReferenceFormDesignService {
  constructor(
    @InjectRepository(ReferenceFormDesign)
    private readonly referenceFormDesignRepository: Repository<ReferenceFormDesign>,
    @InjectRepository(ReferenceFormOption)
    private readonly referenceFormOptionRepository: Repository<ReferenceFormOption>,
    @InjectRepository(ReferenceForm)
    private readonly referenceFormRepository: Repository<ReferenceForm>,
    @InjectRepository(ProviderProfessionalReference)
    private readonly providerProfessionalReferenceRepository: Repository<ProviderProfessionalReference>,
  ) {}

  async createReferenceForm(
    createReferenceFormDto: CreateReferenceFormDto,
  ): Promise<ReferenceForm> {
    delete createReferenceFormDto.reference_form;
    const result = await this.referenceFormRepository.save(
      createReferenceFormDto,
    );
    return plainToInstance(ReferenceForm, result);
  }

  async createReferenceFormSection(
    createReferenceFormDesignDto: CreateReferenceFormDesignDto,
  ): Promise<ReferenceFormDesign> {
    const result = await this.referenceFormDesignRepository.save(
      createReferenceFormDesignDto,
    );
    return plainToInstance(ReferenceFormDesign, result);
  }

  async findOneWhere(options: FindOneOptions<ReferenceForm>) {
    const result = await this.referenceFormRepository.findOne(options);
    return plainToInstance(ReferenceForm, result);
  }

  async findAll(
    queryParamsDto: MultiSelectQueryParamsDto,
  ): Promise<[ReferenceForm[], number]> {
    const { search, limit, offset, order, start_date, end_date, status } =
      queryParamsDto;
    const queryBuilder = this.referenceFormRepository
      .createQueryBuilder('rf')
      .leftJoin('reference_form_design', 'rfd')
      .select([
        'rf.id AS id',
        'rf.name AS name',
        `(SELECT COUNT(id)::INTEGER FROM reference_form_design WHERE reference_form_id = rf.id AND deleted_at IS NULL) AS total_questions`,
        'rf.status AS status',
        'rf.created_at AS created_at',
        'rf.updated_at AS updated_at',
      ])
      .limit(+limit)
      .offset(+offset)
      .groupBy('rf.id');

    if (queryParamsDto?.search) {
      queryBuilder.where(`LOWER(rf.name) ILIKE :search`, {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }

    if (status && status.length) {
      queryBuilder.andWhere('rf.status IN (:...status)', {
        status,
      });
    }
    if (start_date) {
      queryBuilder.andWhere(
        `TO_CHAR(rf.updated_at, 'YYYY-MM-DD') >= :start_date`,
        {
          start_date,
        },
      );
    }
    if (end_date) {
      queryBuilder.andWhere(
        `TO_CHAR(rf.updated_at, 'YYYY-MM-DD') <= :end_date`,
        {
          end_date,
        },
      );
    }
    Object.entries(order).forEach(([column, direction]) => {
      column = column === 'total_questions' ? column : `rf.${column}`;
      queryBuilder.addOrderBy(column, direction);
    });

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async remove(referenceForm: ReferenceForm) {
    const record = await this.referenceFormRepository.softRemove(referenceForm);
    return record;
  }

  async createOption(createOptionDto: CreateOptionDto[]) {
    const result = await this.referenceFormOptionRepository.save(
      plainToInstance(ReferenceFormOption, createOptionDto),
    );
    return plainToInstance(ReferenceFormOption, result);
  }

  async createReferenceFormDesign(
    referenceForm: ReferenceForm,
    createReferenceFormDesignDto: CreateReferenceFormDesignDto[],
  ) {
    const optionData = [];

    await Promise.all(
      createReferenceFormDesignDto.map(async (referenceFormData) => {
        const { options = [] } = referenceFormData;

        Object.assign(referenceFormData, { reference_form: referenceForm.id });
        const data = await this.createReferenceFormSection(referenceFormData);

        options.forEach((option) => {
          optionData.push({
            ...option,
            reference_form_design: data.id,
          });
        });
      }),
    );

    await this.createOption(optionData);
  }

  async findDesign(options: FindOneOptions<ReferenceFormDesign>) {
    const result = await this.referenceFormDesignRepository.find(options);
    return plainToInstance(ReferenceFormDesign, result);
  }

  async updateReferenceForm(
    referenceForm: ReferenceForm,
    updateReferenceFormDto: UpdateReferenceFormDto,
  ) {
    const {
      delete_question = [],
      delete_option = [],
      reference_form = [],
    } = updateReferenceFormDto;

    if (delete_question.length) {
      delete updateReferenceFormDto.delete_question;
      const questions = await this.findDesign({
        relations: {
          reference_form_option: true,
        },
        where: {
          id: In(delete_question),
        },
      });

      if (questions) {
        await this.referenceFormDesignRepository.softRemove(questions);
      }
    }

    if (delete_option.length) {
      delete updateReferenceFormDto.delete_option;
      await this.referenceFormOptionRepository.update(
        {
          id: In(delete_option),
        },
        {
          deleted_at: new Date().toISOString(),
        },
      );
    }

    await this.referenceFormRepository.update(referenceForm.id, {
      name: updateReferenceFormDto.name,
      status: updateReferenceFormDto.status,
    });

    if (reference_form.length) {
      const formPromises = reference_form.map(async (form) => {
        const { options = [] } = form;
        const formData = await this.referenceFormDesignRepository.save({
          ...form,
          reference_form: { id: referenceForm.id },
        });

        const optionPromises = options.map((option) =>
          this.referenceFormOptionRepository.save({
            ...option,
            reference_form_design: { id: formData.id },
          }),
        );

        await Promise.all(optionPromises);
      });

      await Promise.all(formPromises);
    }
  }

  async update(
    criteria: FindOptionsWhere<ReferenceForm>,
    partialEntity: QueryDeepPartialEntity<ReferenceForm>,
  ): Promise<ReferenceForm> {
    const updated = await this.referenceFormRepository.update(
      criteria,
      partialEntity,
    );
    return plainToInstance(ReferenceForm, updated);
  }
}
