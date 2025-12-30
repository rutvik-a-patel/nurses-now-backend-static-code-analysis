import { Injectable } from '@nestjs/common';
import { CreateSkillChecklistTemplateDto } from './dto/create-skill-checklist-template.dto';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SkillChecklistTemplate } from './entities/skill-checklist-template.entity';
import {
  FindOneOptions,
  FindOptionsWhere,
  In,
  IsNull,
  Repository,
} from 'typeorm';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { plainToClass, plainToInstance } from 'class-transformer';
import { SkillChecklistModule } from '@/skill-checklist-module/entities/skill-checklist-module.entity';
import { SkillChecklistSubModule } from '@/skill-checklist-module/entities/skill-checklist-sub-module.entity';
import {
  CreateSkillChecklistModuleDto,
  CreateSkillChecklistSubModuleDto,
} from '@/skill-checklist-module/dto/create-skill-checklist-module.dto';
import { CreateSkillChecklistQuestionDto } from '@/skill-checklist-template/dto/create-skill-checklist-question.dto';
import { SkillChecklistQuestion } from '@/skill-checklist-module/entities/skill-checklist-question.entity';
import { UpdateSkillChecklistTemplateDto } from './dto/update-skill-checklist-template.dto';
import {
  UpdateSkillChecklistModuleDto,
  UpdateSkillChecklistSubModuleDto,
} from '@/skill-checklist-module/dto/update-skill-checklist-module.dto';
import { UpdateSkillChecklistQuestionDto } from '@/skill-checklist-template/dto/update-skill-checklist-question.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CHECKLIST_STATUS } from '@/shared/constants/enum';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';

@Injectable()
export class SkillChecklistTemplateService {
  constructor(
    @InjectRepository(SkillChecklistTemplate)
    private readonly skillChecklistTemplateRepository: Repository<SkillChecklistTemplate>,
    @InjectRepository(SkillChecklistModule)
    private readonly skillChecklistModuleRepository: Repository<SkillChecklistModule>,
    @InjectRepository(SkillChecklistSubModule)
    private readonly skillChecklistSubModuleRepository: Repository<SkillChecklistSubModule>,
    @InjectRepository(SkillChecklistQuestion)
    private readonly skillChecklistQuestionRepository: Repository<SkillChecklistQuestion>,
    @InjectRepository(SkillChecklistResponse)
    private readonly skillChecklistResponseRepository: Repository<SkillChecklistResponse>,
  ) {}

  async checkName(name: string) {
    const data = await this.skillChecklistTemplateRepository
      .createQueryBuilder('sc')
      .where('LOWER(sc.name) = LOWER(:name)', { name })
      .getOne();

    return data;
  }

  async create(
    createSkillChecklistTemplateDto: CreateSkillChecklistTemplateDto,
  ) {
    const reqDto = { ...createSkillChecklistTemplateDto };
    delete reqDto.skill_checklist_module;
    const data = plainToClass(SkillChecklistTemplate, reqDto);
    const result = await this.skillChecklistTemplateRepository.save(data);
    return plainToInstance(SkillChecklistTemplate, result);
  }

  async createModule(
    createSkillChecklistModuleDto: CreateSkillChecklistModuleDto,
  ) {
    const reqDto = { ...createSkillChecklistModuleDto };
    delete reqDto.skill_checklist_sub_module;
    const data = plainToClass(SkillChecklistModule, reqDto);
    const result = await this.skillChecklistModuleRepository.save(data);
    return plainToInstance(SkillChecklistModule, result);
  }

  async createSubModule(
    createSkillChecklistSubModuleDto: CreateSkillChecklistSubModuleDto,
  ) {
    const reqDto = { ...createSkillChecklistSubModuleDto };
    delete reqDto.skill_checklist_question;
    const data = plainToClass(SkillChecklistSubModule, reqDto);
    const result = await this.skillChecklistSubModuleRepository.save(data);
    return plainToInstance(SkillChecklistSubModule, result);
  }

  async createQuestion(
    createSkillChecklistQuestionDto: CreateSkillChecklistQuestionDto,
  ) {
    const data = plainToClass(
      SkillChecklistQuestion,
      createSkillChecklistQuestionDto,
    );
    const result = await this.skillChecklistQuestionRepository.save(data);
    return plainToInstance(SkillChecklistQuestion, result);
  }

  async getAll(
    queryParamsDto: MultiSelectQueryParamsDto,
  ): Promise<[SkillChecklistTemplate[], number]> {
    const queryBuilder =
      this.skillChecklistTemplateRepository.createQueryBuilder('s');

    if (queryParamsDto?.search) {
      queryBuilder.where(`s.name ILIKE :search`, {
        search: `%${parseSearchKeyword(queryParamsDto.search)}%`,
      });
    }
    if (queryParamsDto?.start_date) {
      queryBuilder.andWhere(
        "TO_CHAR(s.updated_at, 'YYYY-MM-DD') >= :start_date",
        {
          start_date: queryParamsDto.start_date,
        },
      );
    }
    if (queryParamsDto?.end_date) {
      queryBuilder.andWhere(
        "TO_CHAR(s.updated_at, 'YYYY-MM-DD') <= :end_date",
        {
          end_date: queryParamsDto.end_date,
        },
      );
    }

    if (queryParamsDto?.status?.length) {
      queryBuilder.andWhere('s.status IN (:...status)', {
        status: queryParamsDto.status,
      });
    }
    queryBuilder.andWhere('s.deleted_at IS NULL');
    queryBuilder
      .leftJoin('s.skill_checklist_module', 'module')
      .select([
        's.id AS id',
        's.name AS name',
        's.status AS status',
        's.updated_at AS updated_at',
        'CAST(COUNT(module) AS INTEGER) AS total_module',
      ])
      .groupBy('s.id')
      .limit(+queryParamsDto.limit)
      .offset(+queryParamsDto.offset);

    Object.entries(queryParamsDto.order).forEach(([column, direction]) => {
      column = column !== 'total_module' ? `s.${column}` : column;
      queryBuilder.addOrderBy(column, direction);
    });

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async findOne(option: FindOneOptions<SkillChecklistTemplate>) {
    const result = await this.skillChecklistTemplateRepository.findOne(option);
    return plainToInstance(SkillChecklistTemplate, result);
  }

  async update(
    where: FindOptionsWhere<SkillChecklistTemplate>,
    updateSkillChecklistTemplateDto: UpdateSkillChecklistTemplateDto,
  ) {
    const reqDto = { ...updateSkillChecklistTemplateDto };
    delete reqDto.skill_checklist_module;
    const data = plainToClass(SkillChecklistTemplate, reqDto);
    const record = await this.skillChecklistTemplateRepository.update(where, {
      ...data,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async updateModule(
    updateSkillChecklistModuleDto: UpdateSkillChecklistModuleDto,
  ) {
    const reqDto = { ...updateSkillChecklistModuleDto };
    delete reqDto.skill_checklist_sub_module;
    const data = plainToClass(SkillChecklistModule, reqDto);
    const record = await this.skillChecklistModuleRepository.save({
      ...data,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async updateSubModule(
    updateSkillChecklistSubModuleDto: UpdateSkillChecklistSubModuleDto,
  ) {
    const reqDto = { ...updateSkillChecklistSubModuleDto };
    delete reqDto.skill_checklist_question;
    const data = plainToClass(SkillChecklistSubModule, reqDto);
    const record = await this.skillChecklistSubModuleRepository.save({
      ...data,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async updateQuestion(
    updateSkillChecklistQuestionDto: UpdateSkillChecklistQuestionDto,
  ) {
    const reqDto = { ...updateSkillChecklistQuestionDto };
    const data = plainToClass(SkillChecklistQuestion, reqDto);
    const record = await this.skillChecklistQuestionRepository.save({
      ...data,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async isTemplateUsed(id: string) {
    const count = await this.skillChecklistResponseRepository.count({
      where: {
        skill_checklist_template: { id },
        status: CHECKLIST_STATUS.pending,
      },
    });

    return !!count;
  }

  async removeTemplate(
    where: FindOptionsWhere<SkillChecklistTemplate>,
    deleteDto: DeleteDto,
  ) {
    const record = await this.skillChecklistTemplateRepository.update(
      { ...where, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async deleteSkillChecklist(
    updateSkillChecklistTemplateDto: UpdateSkillChecklistTemplateDto,
  ) {
    const { delete_question, delete_sub_module, delete_module, updated_at_ip } =
      updateSkillChecklistTemplateDto;

    if (delete_question && delete_question.length) {
      delete updateSkillChecklistTemplateDto.delete_question;

      await this.skillChecklistQuestionRepository.update(
        { id: In(delete_question), deleted_at: IsNull() },
        {
          deleted_at_ip: updated_at_ip,
          deleted_at: new Date().toISOString(),
        },
      );
    }

    if (delete_sub_module && delete_sub_module.length) {
      delete updateSkillChecklistTemplateDto.delete_sub_module;

      const [list] = await this.skillChecklistSubModuleRepository.findAndCount({
        where: { id: In(delete_sub_module) },
        relations: {
          skill_checklist_question: true,
        },
      });

      if (list.length)
        await this.skillChecklistSubModuleRepository.softRemove(list);
    }

    if (delete_module && delete_module.length) {
      delete updateSkillChecklistTemplateDto.delete_module;

      const [list] = await this.skillChecklistModuleRepository.findAndCount({
        where: { id: In(delete_module) },
        relations: {
          skill_checklist_sub_module: {
            skill_checklist_question: true,
          },
        },
      });

      if (list.length)
        await this.skillChecklistModuleRepository.softRemove(list);
    }
  }
}
