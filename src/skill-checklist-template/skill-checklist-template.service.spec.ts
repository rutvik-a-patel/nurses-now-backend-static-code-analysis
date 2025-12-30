import { Test, TestingModule } from '@nestjs/testing';
import { SkillChecklistTemplateService } from './skill-checklist-template.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SkillChecklistTemplate } from './entities/skill-checklist-template.entity';
import { SkillChecklistModule } from '@/skill-checklist-module/entities/skill-checklist-module.entity';
import { SkillChecklistSubModule } from '@/skill-checklist-module/entities/skill-checklist-sub-module.entity';
import { SkillChecklistQuestion } from '@/skill-checklist-module/entities/skill-checklist-question.entity';
import { CreateSkillChecklistTemplateDto } from './dto/create-skill-checklist-template.dto';
import { IsNull, Repository } from 'typeorm';
import {
  CreateSkillChecklistModuleDto,
  CreateSkillChecklistSubModuleDto,
} from '@/skill-checklist-module/dto/create-skill-checklist-module.dto';
import { CreateSkillChecklistQuestionDto } from '@/skill-checklist-template/dto/create-skill-checklist-question.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { defaultLimit, defaultOffset } from '@/shared/constants/constant';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { UpdateSkillChecklistTemplateDto } from './dto/update-skill-checklist-template.dto';
import {
  UpdateSkillChecklistModuleDto,
  UpdateSkillChecklistSubModuleDto,
} from '@/skill-checklist-module/dto/update-skill-checklist-module.dto';
import { UpdateSkillChecklistQuestionDto } from '@/skill-checklist-template/dto/update-skill-checklist-question.dto';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';

describe('SkillChecklistTemplateService', () => {
  let service: SkillChecklistTemplateService;
  let skillChecklistTemplateRepository: any;
  let skillChecklistModuleRepository: any;
  let skillChecklistSubModuleRepository: any;
  let skillChecklistQuestionRepository: any;
  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillChecklistTemplateService,
        {
          provide: getRepositoryToken(SkillChecklistTemplate),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              getRawMany: jest
                .fn()
                .mockResolvedValue([new SkillChecklistTemplate()]),
              getCount: jest.fn().mockResolvedValue(1),
            })),
          },
        },
        {
          provide: getRepositoryToken(SkillChecklistModule),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
            softRemove: jest.fn(),
            findAndCount: jest
              .fn()
              .mockResolvedValue([new SkillChecklistModule(), 1]),
          },
        },
        {
          provide: getRepositoryToken(SkillChecklistSubModule),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
            softRemove: jest.fn(),
            findAndCount: jest
              .fn()
              .mockResolvedValue([new SkillChecklistSubModule(), 1]),
          },
        },
        {
          provide: getRepositoryToken(SkillChecklistQuestion),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SkillChecklistResponse),
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SkillChecklistTemplateService>(
      SkillChecklistTemplateService,
    );
    skillChecklistTemplateRepository = module.get<
      Repository<SkillChecklistTemplate>
    >(getRepositoryToken(SkillChecklistTemplate));
    skillChecklistModuleRepository = module.get<
      Repository<SkillChecklistModule>
    >(getRepositoryToken(SkillChecklistModule));
    skillChecklistSubModuleRepository = module.get<
      Repository<SkillChecklistSubModule>
    >(getRepositoryToken(SkillChecklistSubModule));
    skillChecklistQuestionRepository = module.get<
      Repository<SkillChecklistQuestion>
    >(getRepositoryToken(SkillChecklistQuestion));
    skillChecklistTemplateRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should save skill checklist', async () => {
      const createSkillChecklistTemplateDto =
        new CreateSkillChecklistTemplateDto();
      const skillChecklist = new SkillChecklistTemplate();
      skillChecklistTemplateRepository.save.mockResolvedValue(skillChecklist);
      const result = await service.create(createSkillChecklistTemplateDto);
      expect(skillChecklistTemplateRepository.save).toHaveBeenCalledWith(
        createSkillChecklistTemplateDto,
      );
      expect(result).toEqual(skillChecklist);
    });
  });

  describe('createModule', () => {
    it('should save skill checklist module', async () => {
      const createSkillChecklistModuleDto = new CreateSkillChecklistModuleDto();
      const skillChecklist = new SkillChecklistModule();
      skillChecklistModuleRepository.save.mockResolvedValue(skillChecklist);
      const result = await service.createModule(createSkillChecklistModuleDto);
      expect(skillChecklistModuleRepository.save).toHaveBeenCalledWith(
        createSkillChecklistModuleDto,
      );
      expect(result).toEqual(skillChecklist);
    });
  });

  describe('createSubModule', () => {
    it('should save skill checklist module', async () => {
      const createSkillChecklistSubModuleDto =
        new CreateSkillChecklistSubModuleDto();
      const skillChecklist = new SkillChecklistQuestion();
      skillChecklistSubModuleRepository.save.mockResolvedValue(skillChecklist);
      const result = await service.createSubModule(
        createSkillChecklistSubModuleDto,
      );
      expect(skillChecklistSubModuleRepository.save).toHaveBeenCalledWith(
        createSkillChecklistSubModuleDto,
      );
      expect(result).toEqual(skillChecklist);
    });
  });

  describe('createQuestion', () => {
    it('should save skill checklist module', async () => {
      const createSkillChecklistQuestionDto =
        new CreateSkillChecklistQuestionDto();
      const skillChecklist = new SkillChecklistModule();
      skillChecklistQuestionRepository.save.mockResolvedValue(skillChecklist);
      const result = await service.createQuestion(
        createSkillChecklistQuestionDto,
      );
      expect(skillChecklistQuestionRepository.save).toHaveBeenCalledWith(
        createSkillChecklistQuestionDto,
      );
      expect(result).toEqual(skillChecklist);
    });
  });

  describe('getAll', () => {
    const queryParamsDto: QueryParamsDto = {
      limit: defaultLimit,
      offset: defaultOffset,
      order: { created_at: 'DESC' },
      search: 'string',
    };
    it('should return all skill checklist', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        new SkillChecklistTemplate(),
      ]);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      const result = await service.getAll(queryParamsDto);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `s.name ILIKE :search`,
        {
          search: `%${parseSearchKeyword(queryParamsDto.search)}%`,
        },
      );
      expect(result).toEqual([[new SkillChecklistTemplate()], 1]);
    });

    it('should return all skill checklist', async () => {
      queryParamsDto.order = { total_module: 'ASC' };
      mockQueryBuilder.getRawMany.mockResolvedValue([
        new SkillChecklistTemplate(),
      ]);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      const result = await service.getAll(queryParamsDto);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `s.name ILIKE :search`,
        {
          search: `%${parseSearchKeyword(queryParamsDto.search)}%`,
        },
      );
      expect(result).toEqual([[new SkillChecklistTemplate()], 1]);
    });
  });

  describe('findOne', () => {
    it('should return one skill checklist', async () => {
      const options = { where: { name: 'CN' } };
      const skill = new SkillChecklistTemplate();
      skillChecklistTemplateRepository.findOne.mockResolvedValue(skill);
      const result = await service.findOne(options);
      expect(skillChecklistTemplateRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(skill);
    });
  });

  describe('update', () => {
    it('should update an certificate and return the result', async () => {
      const updateSkillChecklistTemplateDto =
        new UpdateSkillChecklistTemplateDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateSkillChecklistTemplateDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      skillChecklistTemplateRepository.update.mockResolvedValue(updateResult);
      const result = await service.update(
        { id },
        updateSkillChecklistTemplateDto,
      );

      expect(skillChecklistTemplateRepository.update).toHaveBeenCalledWith(
        { id },
        expectedDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('updateModule', () => {
    it('should update an module and return the result', async () => {
      const updateSkillChecklistModuleDto = new UpdateSkillChecklistModuleDto();
      const expectedDto = {
        ...updateSkillChecklistModuleDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      skillChecklistModuleRepository.save.mockResolvedValue(
        new SkillChecklistModule(),
      );
      const result = await service.updateModule(updateSkillChecklistModuleDto);

      expect(skillChecklistModuleRepository.save).toHaveBeenCalledWith(
        expectedDto,
      );
      expect(result).toEqual(new SkillChecklistModule());
    });
  });

  describe('updateSubModule', () => {
    it('should update an sub module and return the result', async () => {
      const updateSkillChecklistSubModuleDto =
        new UpdateSkillChecklistSubModuleDto();
      const expectedDto = {
        ...updateSkillChecklistSubModuleDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      skillChecklistSubModuleRepository.save.mockResolvedValue(
        new SkillChecklistModule(),
      );
      const result = await service.updateSubModule(
        updateSkillChecklistSubModuleDto,
      );

      expect(skillChecklistSubModuleRepository.save).toHaveBeenCalledWith(
        expectedDto,
      );
      expect(result).toEqual(new SkillChecklistModule());
    });
  });

  describe('updateQuestion', () => {
    it('should update an question and return the result', async () => {
      const updateSkillChecklistQuestionDto =
        new UpdateSkillChecklistQuestionDto();
      const expectedDto = {
        ...updateSkillChecklistQuestionDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      skillChecklistQuestionRepository.save.mockResolvedValue(
        new SkillChecklistQuestion(),
      );
      const result = await service.updateQuestion(
        updateSkillChecklistQuestionDto,
      );

      expect(skillChecklistQuestionRepository.save).toHaveBeenCalledWith(
        expectedDto,
      );
      expect(result).toEqual(new SkillChecklistQuestion());
    });
  });

  describe('removeTemplate', () => {
    it('should update an question and return the result', async () => {
      const deleteDto = { deleted_at_ip: '127.0.0.1' };

      skillChecklistTemplateRepository.update.mockResolvedValue({
        affected: 1,
      });
      const result = await service.removeTemplate({ id: '1' }, deleteDto);

      expect(skillChecklistTemplateRepository.update).toHaveBeenCalledWith(
        { id: '1', deleted_at: IsNull() },
        {
          deleted_at: expect.any(String),
          deleted_at_ip: '127.0.0.1',
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('deleteSkillChecklist', () => {
    const updateSkillChecklistTemplateDto =
      new UpdateSkillChecklistTemplateDto();

    updateSkillChecklistTemplateDto.delete_question = ['1'];
    updateSkillChecklistTemplateDto.delete_sub_module = ['1'];
    updateSkillChecklistTemplateDto.delete_module = ['1'];
    updateSkillChecklistTemplateDto.updated_at_ip = '127.0.0.1';

    it('should delete questions, modules and sub modules', async () => {
      skillChecklistQuestionRepository.update.mockResolvedValue({
        affected: 1,
      });
      skillChecklistSubModuleRepository.findAndCount.mockResolvedValue([
        [new SkillChecklistSubModule()],
        1,
      ]);
      skillChecklistSubModuleRepository.softRemove.mockResolvedValue({
        affected: 1,
      });
      skillChecklistModuleRepository.findAndCount.mockResolvedValue([
        [new SkillChecklistModule()],
        1,
      ]);
      skillChecklistModuleRepository.softRemove.mockResolvedValue({
        affected: 1,
      });
      skillChecklistSubModuleRepository.update.mockResolvedValue({
        affected: 1,
      });
      skillChecklistModuleRepository.update.mockResolvedValue({
        affected: 1,
      });
      await service.deleteSkillChecklist(updateSkillChecklistTemplateDto);
    });
  });
});
