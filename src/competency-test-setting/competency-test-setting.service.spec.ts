import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompetencyTestQuestion } from '@/competency-test-question/entities/competency-test-question.entity';
import { CompetencyTestOption } from '@/competency-test-option/entities/competency-test-option.entity';
import { CreateCompetencyTestQuestionDto } from '@/competency-test-question/dto/create-competency-test-question.dto';
import { CreateCompetencyTestOptionDto } from '@/competency-test-option/dto/create-competency-test-option.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { IsNull } from 'typeorm';
import { UpdateCompetencyTestOptionDto } from '@/competency-test-option/dto/update-competency-test-option.dto';
import { UpdateCompetencyTestQuestionDto } from '@/competency-test-question/dto/update-competency-test-question.dto';
import { CompetencyTestSettingService } from '@/competency-test-setting/competency-test-setting.service';
import {
  CreateCompetencyTestSettingDto,
  CreateCompetencyTestGlobalSettingDto,
} from '@/competency-test-setting/dto/create-competency-test-setting.dto';
import {
  UpdateCompetencyTestSettingDto,
  UpdateCompetencyTestGlobalSettingDto,
} from '@/competency-test-setting/dto/update-competency-test-setting.dto';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';

describe('CompetencyTestSettingService', () => {
  let service: CompetencyTestSettingService;
  let competencyTestSettingRepository: any;
  let competencyTestQuestionRepository: any;
  let competencyTestOptionRepository: any;
  let competencyTestGlobalSettingRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetencyTestSettingService,
        {
          provide: getRepositoryToken(CompetencyTestSetting),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest
                .fn()
                .mockResolvedValue([[new CompetencyTestSetting()], 1]),
            })),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestQuestion),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestOption),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestGlobalSetting),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompetencyTestSettingService>(
      CompetencyTestSettingService,
    );
    competencyTestSettingRepository = module.get<
      Repository<CompetencyTestSetting>
    >(getRepositoryToken(CompetencyTestSetting));
    competencyTestQuestionRepository = module.get<
      Repository<CompetencyTestQuestion>
    >(getRepositoryToken(CompetencyTestQuestion));
    competencyTestOptionRepository = module.get<
      Repository<CompetencyTestOption>
    >(getRepositoryToken(CompetencyTestOption));
    competencyTestGlobalSettingRepository = module.get<
      Repository<CompetencyTestGlobalSetting>
    >(getRepositoryToken(CompetencyTestGlobalSetting));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a competency test setting', async () => {
      const createDto = new CreateCompetencyTestSettingDto();
      const savedSetting = plainToClass(CompetencyTestSetting, createDto);
      competencyTestSettingRepository.save.mockResolvedValue(savedSetting);

      const result = await service.create(createDto);

      expect(competencyTestSettingRepository.save).toHaveBeenCalledWith(
        plainToClass(CompetencyTestSetting, createDto),
      );
      expect(result).toEqual(
        plainToInstance(CompetencyTestSetting, savedSetting),
      );
    });
  });

  describe('createQuestion', () => {
    it('should create a competency test question', async () => {
      const createDto = new CreateCompetencyTestQuestionDto();
      const savedQuestion = plainToClass(CompetencyTestQuestion, createDto);
      competencyTestQuestionRepository.save.mockResolvedValue(savedQuestion);

      const result = await service.createQuestion(createDto);

      expect(competencyTestQuestionRepository.save).toHaveBeenCalledWith(
        plainToClass(CompetencyTestQuestion, createDto),
      );
      expect(result).toEqual(
        plainToInstance(CompetencyTestQuestion, savedQuestion),
      );
    });
  });

  describe('createOption', () => {
    it('should create a competency test option', async () => {
      const createDto = new CreateCompetencyTestOptionDto();
      const savedOption = plainToClass(CompetencyTestOption, createDto);

      competencyTestOptionRepository.save.mockResolvedValue(savedOption);

      const result = await service.createOption(createDto);

      expect(competencyTestOptionRepository.save).toHaveBeenCalledWith(
        plainToClass(CompetencyTestOption, createDto),
      );
      expect(result).toEqual(
        plainToInstance(CompetencyTestOption, savedOption),
      );
    });
  });

  describe('findOne', () => {
    it('should find a competency test setting', async () => {
      const findOption = { where: { id: 'test-id' } };
      const foundSetting = new CompetencyTestSetting();

      competencyTestSettingRepository.findOne.mockResolvedValue(foundSetting);

      const result = await service.findOne(findOption);

      expect(competencyTestSettingRepository.findOne).toHaveBeenCalledWith(
        findOption,
      );
      expect(result).toEqual(
        plainToInstance(CompetencyTestSetting, foundSetting),
      );
    });
  });

  describe('getAll', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      competencyTestSettingRepository.createQueryBuilder = jest.fn(
        () => mockQueryBuilder,
      );
    });
    it('should get all test settings without search', async () => {
      const queryParamsDto = new QueryParamsDto();
      queryParamsDto.order = { total_question: 'ASC' };
      const competencyTestSetting = [new CompetencyTestSetting()];
      const count = competencyTestSetting.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(competencyTestSetting);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      const result = await service.getAll(queryParamsDto);
      expect(result).toEqual([competencyTestSetting, count]);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });

    it('should get all test settings with search', async () => {
      const queryParamsDto = new QueryParamsDto();
      queryParamsDto.search = 'demo';
      queryParamsDto.order = { created_at: 'ASC' };
      const competencyTestSetting = [new CompetencyTestSetting()];
      const count = competencyTestSetting.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(competencyTestSetting);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      const result = await service.getAll(queryParamsDto);
      expect(result).toEqual([competencyTestSetting, count]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `c.name ILIKE :search`,
        { search: `%${parseSearchKeyword(queryParamsDto.search)}%` },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a competency test setting', async () => {
      const where = { id: 'test-id' };
      const updateDto = new UpdateCompetencyTestSettingDto();
      competencyTestSettingRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.update(where, updateDto);

      expect(competencyTestSettingRepository.update).toHaveBeenCalledWith(
        where,
        expect.objectContaining({
          ...plainToClass(CompetencyTestSetting, updateDto),
          updated_at: expect.any(String),
        }),
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('updateQuestion', () => {
    it('should update a competency test question', async () => {
      const updateDto = new UpdateCompetencyTestQuestionDto();
      const updatedQuestion = plainToClass(CompetencyTestQuestion, updateDto);

      competencyTestQuestionRepository.save.mockResolvedValue(updatedQuestion);
      const result = await service.updateQuestion(updateDto);

      expect(competencyTestQuestionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updatedQuestion,
          updated_at: expect.any(String),
        }),
      );
      expect(result).toEqual(updatedQuestion);
    });
  });

  describe('updateOption', () => {
    it('should update a competency test option', async () => {
      const updateDto = new UpdateCompetencyTestOptionDto();
      const updatedOption = plainToClass(CompetencyTestOption, updateDto);

      competencyTestOptionRepository.save.mockResolvedValue(updatedOption);
      const result = await service.updateOption(updateDto);

      expect(competencyTestOptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updatedOption,
          updated_at: expect.any(String),
        }),
      );
      expect(result).toEqual(updatedOption);
    });
  });

  describe('removeSetting', () => {
    it('should remove a competency test setting', async () => {
      const id = 'test-id';
      const deleteDto = new DeleteDto();

      competencyTestSettingRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.removeSetting(id, deleteDto);

      expect(competencyTestSettingRepository.update).toHaveBeenCalledWith(
        { id, deleted_at: IsNull() },
        expect.objectContaining({
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        }),
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('removeQuestion', () => {
    it('should remove a competency test question', async () => {
      const id = 'test-id';
      const deleteDto = new DeleteDto();

      competencyTestQuestionRepository.update.mockResolvedValue({
        affected: 1,
      });
      const result = await service.removeQuestion(id, deleteDto);

      expect(competencyTestQuestionRepository.update).toHaveBeenCalledWith(
        { id, deleted_at: IsNull() },
        expect.objectContaining({
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        }),
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('removeOption', () => {
    it('should remove a competency test option', async () => {
      const id = 'test-id';
      const deleteDto = new DeleteDto();

      competencyTestOptionRepository.update.mockResolvedValue({
        affected: 1,
      });
      const result = await service.removeOption(id, deleteDto);

      expect(competencyTestOptionRepository.update).toHaveBeenCalledWith(
        { id, deleted_at: IsNull() },
        expect.objectContaining({
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        }),
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('createTestSetting', () => {
    it('should create a competency test global setting', async () => {
      const createDto = new CreateCompetencyTestGlobalSettingDto();
      const savedSetting = plainToClass(CompetencyTestGlobalSetting, createDto);

      competencyTestGlobalSettingRepository.save.mockResolvedValue(
        savedSetting,
      );
      const result = await service.createTestSetting(createDto);

      expect(competencyTestGlobalSettingRepository.save).toHaveBeenCalledWith(
        plainToClass(CompetencyTestGlobalSetting, createDto),
      );
      expect(result).toEqual(
        plainToInstance(CompetencyTestGlobalSetting, savedSetting),
      );
    });
  });

  describe('updateTestSetting', () => {
    it('should update a competency test global setting', async () => {
      const where = { id: 'test-id' };
      const updateDto = new UpdateCompetencyTestGlobalSettingDto();

      competencyTestGlobalSettingRepository.update.mockResolvedValue({
        affected: 1,
      });
      const result = await service.updateTestSetting(where, updateDto);

      expect(competencyTestGlobalSettingRepository.update).toHaveBeenCalledWith(
        where,
        expect.objectContaining({
          ...plainToClass(CompetencyTestGlobalSetting, updateDto),
          updated_at: expect.any(String),
        }),
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('findOneTestSetting', () => {
    it('should find one competency test global setting', async () => {
      const findOption = { where: { id: 'test-id' } };
      const foundSetting = new CompetencyTestGlobalSetting();

      competencyTestGlobalSettingRepository.findOne.mockResolvedValue(
        foundSetting,
      );
      const result = await service.findOneTestSetting(findOption);

      expect(
        competencyTestGlobalSettingRepository.findOne,
      ).toHaveBeenCalledWith(findOption);
      expect(result).toEqual(
        plainToInstance(CompetencyTestGlobalSetting, foundSetting),
      );
    });
  });

  describe('updateCompetencyTest', () => {
    it('should update competency test', async () => {
      const updateDto = new UpdateCompetencyTestSettingDto();
      updateDto.delete_option = ['1'];
      updateDto.delete_question = ['1'];
      competencyTestOptionRepository.update.mockResolvedValue({
        affected: 1,
      });
      competencyTestQuestionRepository.update.mockResolvedValue({
        affected: 1,
      });
      competencyTestOptionRepository.update.mockResolvedValue({
        affected: 1,
      });
      await service.updateCompetencyTest(updateDto);
    });
  });
});
