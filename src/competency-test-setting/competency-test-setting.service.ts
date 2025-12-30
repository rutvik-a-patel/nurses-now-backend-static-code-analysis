import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompetencyTestSetting } from './entities/competency-test-setting.entity';
import {
  FindOneOptions,
  FindOptionsWhere,
  In,
  IsNull,
  Repository,
} from 'typeorm';
import { CompetencyTestQuestion } from '@/competency-test-question/entities/competency-test-question.entity';
import { CompetencyTestOption } from '@/competency-test-option/entities/competency-test-option.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import {
  UpdateCompetencyTestGlobalSettingDto,
  UpdateCompetencyTestSettingDto,
} from './dto/update-competency-test-setting.dto';
import {
  CreateCompetencyTestGlobalSettingDto,
  CreateCompetencyTestSettingDto,
} from './dto/create-competency-test-setting.dto';
import { CreateCompetencyTestQuestionDto } from '@/competency-test-question/dto/create-competency-test-question.dto';
import { CreateCompetencyTestOptionDto } from '@/competency-test-option/dto/create-competency-test-option.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { UpdateCompetencyTestQuestionDto } from '@/competency-test-question/dto/update-competency-test-question.dto';
import { UpdateCompetencyTestOptionDto } from '@/competency-test-option/dto/update-competency-test-option.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CompetencyTestGlobalSetting } from './entities/competency-test-global-setting.entity';
import { TEST_STATUS } from '@/shared/constants/enum';
import { CompetencyFilterDto } from './dto/competency-filter.dto';

@Injectable()
export class CompetencyTestSettingService {
  constructor(
    @InjectRepository(CompetencyTestSetting)
    private readonly competencyTestSettingRepository: Repository<CompetencyTestSetting>,
    @InjectRepository(CompetencyTestQuestion)
    private readonly competencyTestQuestionRepository: Repository<CompetencyTestQuestion>,
    @InjectRepository(CompetencyTestOption)
    private readonly competencyTestOptionRepository: Repository<CompetencyTestOption>,
    @InjectRepository(CompetencyTestGlobalSetting)
    private readonly competencyTestGlobalSettingRepository: Repository<CompetencyTestGlobalSetting>,
  ) {}

  async checkName(name: string, id?: string) {
    const queryBuilder = this.competencyTestSettingRepository
      .createQueryBuilder('cts')
      .where('LOWER(cts.name) = LOWER(:name)', { name });
    if (id) {
      queryBuilder.andWhere('cts.id != :id', { id });
    }
    queryBuilder.andWhere('cts.deleted_at IS NULL').getOne();
    const data = await queryBuilder.getOne();
    return data;
  }

  async create(createCompetencyTestSettingDto: CreateCompetencyTestSettingDto) {
    const result = await this.competencyTestSettingRepository.save(
      plainToClass(CompetencyTestSetting, createCompetencyTestSettingDto),
    );
    return plainToInstance(CompetencyTestSetting, result);
  }

  async createQuestion(
    createCompetencyTestQuestionDto: CreateCompetencyTestQuestionDto,
  ) {
    const result = await this.competencyTestQuestionRepository.save(
      plainToClass(CompetencyTestQuestion, createCompetencyTestQuestionDto),
    );
    return plainToInstance(CompetencyTestQuestion, result);
  }

  async createOption(
    createCompetencyTestOptionDto: CreateCompetencyTestOptionDto,
  ) {
    const result = await this.competencyTestOptionRepository.save(
      plainToClass(CompetencyTestOption, createCompetencyTestOptionDto),
    );
    return plainToInstance(CompetencyTestOption, result);
  }

  async findOne(option: FindOneOptions<CompetencyTestSetting>) {
    const result = await this.competencyTestSettingRepository.findOne(option);
    return plainToInstance(CompetencyTestSetting, result);
  }

  async getAll(
    queryParamsDto: CompetencyFilterDto,
  ): Promise<[CompetencyTestSetting[], number]> {
    const {
      search,
      order,
      limit,
      offset,
      duration,
      required_score,
      status,
      end_date,
      start_date,
    } = queryParamsDto;
    const queryBuilder =
      this.competencyTestSettingRepository.createQueryBuilder('c');

    if (search) {
      queryBuilder.where(`c.name ILIKE :search`, {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }

    if (status && status.length) {
      queryBuilder.andWhere('c.status IN (:...status)', {
        status,
      });
    }
    if (duration) {
      queryBuilder.andWhere('c.duration IN (:...duration)', { duration });
    }
    if (required_score) {
      queryBuilder.andWhere('c.required_score IN (:...required_score)', {
        required_score,
      });
    }
    if (start_date) {
      queryBuilder.andWhere(
        `TO_CHAR(c.updated_at, 'YYYY-MM-DD') >= :start_date`,
        {
          start_date,
        },
      );
    }

    if (end_date) {
      queryBuilder.andWhere(
        `TO_CHAR(c.updated_at, 'YYYY-MM-DD') <= :end_date`,
        {
          end_date,
        },
      );
    }

    queryBuilder
      .leftJoin('c.competency_test_question', 'question')
      .select([
        'c.id AS id',
        'c.name AS name',
        'c.required_score AS required_score',
        'c.duration AS duration',
        'c.status AS status',
        'c.updated_at AS updated_at',
        'CAST(COUNT(question) AS INTEGER) AS total_question',
      ])
      .groupBy('c.id')
      .limit(+limit)
      .offset(+offset);

    Object.entries(order).forEach(([column, direction]) => {
      column = column !== 'total_question' ? `c.${column}` : column;
      queryBuilder.addOrderBy(column, direction);
    });

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async update(
    where: FindOptionsWhere<CompetencyTestSetting>,
    updateCompetencyTestSettingDto: UpdateCompetencyTestSettingDto,
  ) {
    const reqDto = { ...updateCompetencyTestSettingDto };
    delete reqDto.competency_test_question;
    const data = plainToClass(CompetencyTestSetting, reqDto);
    const record = await this.competencyTestSettingRepository.update(where, {
      ...data,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async updateQuestion(
    updateCompetencyTestQuestionDto: UpdateCompetencyTestQuestionDto,
  ) {
    const record = await this.competencyTestQuestionRepository.save({
      ...plainToClass(CompetencyTestQuestion, updateCompetencyTestQuestionDto),
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async updateOption(
    updateCompetencyTestOptionDto: UpdateCompetencyTestOptionDto,
  ) {
    const record = await this.competencyTestOptionRepository.save({
      ...plainToClass(CompetencyTestOption, updateCompetencyTestOptionDto),
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async isTestUsed(id: string) {
    const count = await this.competencyTestSettingRepository.count({
      where: {
        competency_test_score: {
          competency_test_setting: { id },
          test_status: TEST_STATUS.pending,
        },
      },
    });

    return !!count;
  }

  async removeSetting(id: string, deleteDto: DeleteDto) {
    const record = await this.competencyTestSettingRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async removeQuestion(id: string, deleteDto: DeleteDto) {
    const record = await this.competencyTestQuestionRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }
  async removeOption(id: string, deleteDto: DeleteDto) {
    const record = await this.competencyTestOptionRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async updateCompetencyTest(
    updateCompetencyTestSettingDto: UpdateCompetencyTestSettingDto,
  ) {
    const promiseData = [];
    const { delete_option, delete_question, updated_at_ip } =
      updateCompetencyTestSettingDto;
    const deleteDto = {
      deleted_at_ip: updated_at_ip,
      deleted_at: new Date().toISOString(),
    };

    if (delete_option && delete_option.length) {
      delete updateCompetencyTestSettingDto.delete_option;
      promiseData.push(
        this.competencyTestOptionRepository.update(
          { id: In(delete_option), deleted_at: IsNull() },
          deleteDto,
        ),
      );
    }

    if (delete_question && delete_question.length) {
      delete updateCompetencyTestSettingDto.delete_question;
      promiseData.push(
        await this.competencyTestQuestionRepository.update(
          { id: In(delete_question), deleted_at: IsNull() },
          deleteDto,
        ),
        await this.competencyTestOptionRepository.update(
          {
            competency_test_question: { id: In(delete_question) },
            deleted_at: IsNull(),
          },
          deleteDto,
        ),
      );
    }

    await Promise.all(promiseData);
  }

  async createTestSetting(
    createCompetencyTestGlobalSettingDto: CreateCompetencyTestGlobalSettingDto,
  ) {
    const result = await this.competencyTestGlobalSettingRepository.save(
      plainToClass(
        CompetencyTestGlobalSetting,
        createCompetencyTestGlobalSettingDto,
      ),
    );
    return plainToInstance(CompetencyTestGlobalSetting, result);
  }

  async updateTestSetting(
    where: FindOptionsWhere<CompetencyTestGlobalSetting>,
    updateCompetencyTestGlobalSettingDto: UpdateCompetencyTestGlobalSettingDto,
  ) {
    const record = await this.competencyTestGlobalSettingRepository.update(
      where,
      {
        ...plainToClass(
          CompetencyTestGlobalSetting,
          updateCompetencyTestGlobalSettingDto,
        ),
        updated_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async findOneTestSetting(
    option: FindOneOptions<CompetencyTestGlobalSetting>,
  ) {
    const result =
      await this.competencyTestGlobalSettingRepository.findOne(option);
    return plainToInstance(CompetencyTestGlobalSetting, result);
  }
}
