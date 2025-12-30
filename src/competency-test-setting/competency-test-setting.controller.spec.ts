import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyTestSettingController } from './competency-test-setting.controller';
import { CompetencyTestSettingService } from './competency-test-setting.service';
import {
  CreateCompetencyTestGlobalSettingDto,
  CreateCompetencyTestSettingDto,
} from './dto/create-competency-test-setting.dto';
import { CreateCompetencyTestQuestionDto } from '@/competency-test-question/dto/create-competency-test-question.dto';
import { CreateCompetencyTestOptionDto } from '@/competency-test-option/dto/create-competency-test-option.dto';
import { CompetencyTestSetting } from './entities/competency-test-setting.entity';
import { CompetencyTestQuestion } from '@/competency-test-question/entities/competency-test-question.entity';
import { CompetencyTestOption } from '@/competency-test-option/entities/competency-test-option.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CompetencyTestGlobalSetting } from './entities/competency-test-global-setting.entity';
import {
  UpdateCompetencyTestGlobalSettingDto,
  UpdateCompetencyTestSettingDto,
} from './dto/update-competency-test-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { IsNull } from 'typeorm';
import { UpdateCompetencyTestOptionDto } from '@/competency-test-option/dto/update-competency-test-option.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('CompetencyTestSettingController', () => {
  let controller: CompetencyTestSettingController;
  let competencyTestSettingService: any;

  beforeEach(async () => {
    const competencyTestSettingServiceMock = {
      create: jest.fn(),
      createTestSetting: jest.fn(),
      createQuestion: jest.fn(),
      createOption: jest.fn(),
      getAll: jest.fn(),
      findOne: jest.fn(),
      updateCompetencyTest: jest.fn(),
      updateTestSetting: jest.fn(),
      update: jest.fn(),
      updateQuestion: jest.fn(),
      updateOption: jest.fn(),
      removeSetting: jest.fn(),
      removeQuestion: jest.fn(),
      removeOption: jest.fn(),
      findOneTestSetting: jest.fn(),
      checkName: jest.fn(),
      isTestUsed: jest.fn(), // <-- add this mock
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetencyTestSettingController],
      providers: [
        {
          provide: CompetencyTestSettingService,
          useValue: competencyTestSettingServiceMock,
        },
        {
          provide: AccessControlGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<CompetencyTestSettingController>(
      CompetencyTestSettingController,
    );
    competencyTestSettingService = module.get<CompetencyTestSettingService>(
      CompetencyTestSettingService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create competency test setting', async () => {
      const createCompetencyTestSettingDto =
        new CreateCompetencyTestSettingDto();
      createCompetencyTestSettingDto.competency_test_question = [
        {
          ...new CreateCompetencyTestQuestionDto(),
          competency_test_option: [new CreateCompetencyTestOptionDto()],
        },
      ];
      competencyTestSettingService.create.mockResolvedValue(
        new CompetencyTestSetting(),
      );
      competencyTestSettingService.createQuestion.mockResolvedValue(
        new CompetencyTestQuestion(),
      );
      competencyTestSettingService.createOption.mockResolvedValue(
        new CompetencyTestOption(),
      );
      const result = await controller.create(createCompetencyTestSettingDto);
      expect(competencyTestSettingService.create).toHaveBeenCalledWith(
        createCompetencyTestSettingDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Competency Test'),
          data: {},
        }),
      );
    });

    it('should create global test setting', async () => {
      const createCompetencyTestSettingDto =
        new CreateCompetencyTestSettingDto();
      createCompetencyTestSettingDto.competency_test_question = [
        {
          ...new CreateCompetencyTestQuestionDto(),
          competency_test_option: [new CreateCompetencyTestOptionDto()],
        },
      ];
      createCompetencyTestSettingDto.global_test_setting =
        new CreateCompetencyTestGlobalSettingDto();
      const setting = new CompetencyTestSetting();
      setting.id = '1';
      competencyTestSettingService.create.mockResolvedValue(setting);
      competencyTestSettingService.createQuestion.mockResolvedValue(
        new CompetencyTestQuestion(),
      );
      competencyTestSettingService.createOption.mockResolvedValue(
        new CompetencyTestOption(),
      );
      competencyTestSettingService.createTestSetting.mockResolvedValue(
        new CompetencyTestGlobalSetting(),
      );
      const result = await controller.create(createCompetencyTestSettingDto);
      expect(competencyTestSettingService.create).toHaveBeenCalledWith(
        createCompetencyTestSettingDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Competency Test'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const createCompetencyTestSettingDto =
        new CreateCompetencyTestSettingDto();
      const error = new Error('Database Error');
      competencyTestSettingService.create.mockRejectedValue(error);

      const result = await controller.create(createCompetencyTestSettingDto);

      expect(competencyTestSettingService.create).toHaveBeenCalledWith(
        createCompetencyTestSettingDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto: any = {
      limit: 10,
      offset: 0,
      search: 'test',
      order: { created_at: 'ASC' },
    };
    it('should get all test setting list', async () => {
      const mockTests = Array(10).fill(new CompetencyTestSetting());
      const mockCount = 10;
      competencyTestSettingService.getAll.mockResolvedValue([
        mockTests,
        mockCount,
      ]);

      const result = await controller.findAll(queryParamsDto);

      expect(competencyTestSettingService.getAll).toHaveBeenCalledWith(
        queryParamsDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Competency Test'),
          total: mockCount,
          limit: queryParamsDto.limit,
          offset: queryParamsDto.offset,
          data: mockTests,
        }),
      );
    });

    it('should return no contacts found when list is empty', async () => {
      competencyTestSettingService.getAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(queryParamsDto);

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Competency Test'),
          total: 0,
          limit: queryParamsDto.limit,
          offset: queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors when fetching contacts fails', async () => {
      const errorMessage = 'Database error';
      competencyTestSettingService.getAll.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await controller.findAll(queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getGlobalSetting', () => {
    it('should return bad request if setting not found', async () => {
      competencyTestSettingService.findOneTestSetting.mockResolvedValue(null);

      const result = await controller.getGlobalSetting();

      expect(
        competencyTestSettingService.findOneTestSetting,
      ).toHaveBeenCalledWith({ where: { competency_test_setting: IsNull() } });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Test settings'),
          data: {},
        }),
      );
    });

    it('should return bad request if setting not found', async () => {
      const mockSetting = new CompetencyTestSetting();
      competencyTestSettingService.findOneTestSetting.mockResolvedValue(
        mockSetting,
      );

      const result = await controller.getGlobalSetting();

      expect(
        competencyTestSettingService.findOneTestSetting,
      ).toHaveBeenCalledWith({ where: { competency_test_setting: IsNull() } });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Test settings'),
          data: mockSetting,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      competencyTestSettingService.findOneTestSetting.mockRejectedValue(error);

      const result = await controller.getGlobalSetting();

      expect(
        competencyTestSettingService.findOneTestSetting,
      ).toHaveBeenCalledWith({ where: { competency_test_setting: IsNull() } });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should find one test setting', async () => {
      const mockTests = new CompetencyTestSetting();
      competencyTestSettingService.findOne.mockResolvedValue(mockTests);
      competencyTestSettingService.findOneTestSetting.mockResolvedValue(
        new CompetencyTestGlobalSetting(),
      );

      const result = await controller.findOne(id);

      expect(competencyTestSettingService.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
        relations: {
          test_setting: true,
          competency_test_question: {
            competency_test_option: true,
          },
        },
        select: {
          id: true,
          name: true,
          required_score: true,
          duration: true,
          status: true,
          created_at: true,
          updated_at: true,
          competency_test_question: {
            id: true,
            question: true,
            order: true,
            created_at: true,
            competency_test_option: {
              id: true,
              option: true,
              order: true,
              is_answer: true,
              created_at: true,
            },
          },
        },
      });
      expect(
        competencyTestSettingService.findOneTestSetting,
      ).toHaveBeenCalledWith({ where: { competency_test_setting: IsNull() } });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Competency Test'),
          data: mockTests,
        }),
      );
    });

    it('should return bad request if no data found', async () => {
      const mockTests = null;
      competencyTestSettingService.findOne.mockResolvedValue(mockTests);

      const result = await controller.findOne(id);

      expect(competencyTestSettingService.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
        relations: {
          test_setting: true,
          competency_test_question: {
            competency_test_option: true,
          },
        },
        select: {
          id: true,
          name: true,
          required_score: true,
          duration: true,
          status: true,
          created_at: true,
          updated_at: true,
          competency_test_question: {
            id: true,
            question: true,
            order: true,
            created_at: true,
            competency_test_option: {
              id: true,
              option: true,
              order: true,
              is_answer: true,
              created_at: true,
            },
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        }),
      );
    });

    it('should handle errors when fetching contacts fails', async () => {
      const errorMessage = 'Database error';
      competencyTestSettingService.findOne.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await controller.findOne(id);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('update', () => {
    const id = '1';

    it('should update competency test setting', async () => {
      const updateCompetencyTestSettingDto =
        new UpdateCompetencyTestSettingDto();
      const mockTemplate = new CompetencyTestSetting();
      mockTemplate.id = id;
      competencyTestSettingService.findOne.mockResolvedValue(mockTemplate);
      competencyTestSettingService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateCompetencyTestSettingDto,
      );

      expect(competencyTestSettingService.findOne).toHaveBeenCalledWith({
        relations: {
          test_setting: true,
        },
        where: {
          id,
        },
      });
      expect(competencyTestSettingService.update).toHaveBeenCalledWith(
        { id },
        updateCompetencyTestSettingDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Competency Test'),
          data: {},
        }),
      );
    });

    it('should update global test setting if provided', async () => {
      const updateCompetencyTestSettingDto =
        new UpdateCompetencyTestSettingDto();
      updateCompetencyTestSettingDto.global_test_setting =
        new UpdateCompetencyTestGlobalSettingDto();
      const globalSetting = new CompetencyTestGlobalSetting();
      globalSetting.id = 'test_setting_id';
      const mockTemplate = new CompetencyTestSetting();
      mockTemplate.id = id;
      mockTemplate.test_setting = globalSetting; // Ensure this is set correctly
      competencyTestSettingService.findOne.mockResolvedValue(mockTemplate);
      competencyTestSettingService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateCompetencyTestSettingDto,
      );

      expect(competencyTestSettingService.findOne).toHaveBeenCalledWith({
        relations: {
          test_setting: true,
        },
        where: {
          id,
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Competency Test'),
          data: {},
        }),
      );
    });

    it('should create global test setting if not exist', async () => {
      const updateCompetencyTestSettingDto =
        new UpdateCompetencyTestSettingDto();
      updateCompetencyTestSettingDto.global_test_setting =
        new UpdateCompetencyTestGlobalSettingDto();
      const mockTemplate = new CompetencyTestSetting();
      mockTemplate.id = id;
      competencyTestSettingService.findOne.mockResolvedValue(mockTemplate);
      competencyTestSettingService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateCompetencyTestSettingDto,
      );

      expect(competencyTestSettingService.findOne).toHaveBeenCalledWith({
        relations: {
          test_setting: true,
        },
        where: {
          id,
        },
      });
      expect(
        competencyTestSettingService.createTestSetting,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ competency_test_setting: id }),
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Competency Test'),
          data: {},
        }),
      );
    });

    it('should update questions and options if provided', async () => {
      const updateCompetencyTestSettingDto =
        new UpdateCompetencyTestSettingDto();
      updateCompetencyTestSettingDto.competency_test_question = [
        {
          id: 'question1',
          competency_test_option: [new UpdateCompetencyTestOptionDto()],
          competency_test_setting: '1',
          order: 1,
          question: 'demo',
          updated_at_ip: '127.0.0.1',
        },
      ];
      const mockTemplate = new CompetencyTestSetting();
      mockTemplate.id = id;
      competencyTestSettingService.findOne.mockResolvedValue(mockTemplate);
      competencyTestSettingService.update.mockResolvedValue({ affected: 1 });
      competencyTestSettingService.updateQuestion.mockResolvedValue({
        id: 'question1',
      });

      const result = await controller.update(
        id,
        updateCompetencyTestSettingDto,
      );

      expect(competencyTestSettingService.findOne).toHaveBeenCalledWith({
        relations: {
          test_setting: true,
        },
        where: {
          id,
        },
      });
      expect(competencyTestSettingService.updateQuestion).toHaveBeenCalledWith(
        expect.objectContaining({ competency_test_setting: id }),
      );
      expect(competencyTestSettingService.updateOption).toHaveBeenCalledWith(
        expect.objectContaining({ competency_test_question: 'question1' }),
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Competency Test'),
          data: {},
        }),
      );
    });

    it('should update questions and options if provided', async () => {
      const updateCompetencyTestSettingDto =
        new UpdateCompetencyTestSettingDto();
      updateCompetencyTestSettingDto.competency_test_question = [
        {
          id: 'question1',
          competency_test_option: [new UpdateCompetencyTestOptionDto()],
          competency_test_setting: '1',
          order: 1,
          question: 'demo',
          updated_at_ip: '127.0.0.1',
        },
      ];
      const mockTemplate = new CompetencyTestSetting();
      mockTemplate.id = id;
      competencyTestSettingService.findOne.mockResolvedValue(mockTemplate);
      competencyTestSettingService.update.mockResolvedValue({ affected: 0 });
      competencyTestSettingService.updateQuestion.mockResolvedValue({
        id: 'question1',
      });

      const result = await controller.update(
        id,
        updateCompetencyTestSettingDto,
      );

      expect(competencyTestSettingService.findOne).toHaveBeenCalledWith({
        relations: {
          test_setting: true,
        },
        where: {
          id,
        },
      });
      expect(competencyTestSettingService.updateQuestion).toHaveBeenCalledWith(
        expect.objectContaining({ competency_test_setting: id }),
      );
      expect(competencyTestSettingService.updateOption).toHaveBeenCalledWith(
        expect.objectContaining({ competency_test_question: 'question1' }),
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        }),
      );
    });

    it('should handle errors during update process', async () => {
      const updateCompetencyTestSettingDto =
        new UpdateCompetencyTestSettingDto();
      const error = new Error('Database Error');
      competencyTestSettingService.findOne.mockRejectedValue(error);

      const result = await controller.update(
        id,
        updateCompetencyTestSettingDto,
      );

      expect(competencyTestSettingService.findOne).toHaveBeenCalledWith({
        relations: {
          test_setting: true,
        },
        where: {
          id,
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });

    it('should return bad request if template not found', async () => {
      const updateCompetencyTestSettingDto =
        new UpdateCompetencyTestSettingDto();
      competencyTestSettingService.findOne.mockResolvedValue(null);

      const result = await controller.update(
        id,
        updateCompetencyTestSettingDto,
      );

      expect(competencyTestSettingService.findOne).toHaveBeenCalledWith({
        relations: {
          test_setting: true,
        },
        where: {
          id,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        }),
      );
    });
  });

  describe('removeTemplate', () => {
    const id = '1';
    const deleteDto = new DeleteDto();

    it('should remove a competency test setting', async () => {
      competencyTestSettingService.isTestUsed.mockResolvedValue(false);
      competencyTestSettingService.removeSetting.mockResolvedValue({
        affected: 1,
      });

      const result = await controller.removeTemplate(id, deleteDto);

      expect(competencyTestSettingService.removeSetting).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Competency Test'),
          data: {},
        }),
      );
    });

    it('should return not found if no records are affected', async () => {
      competencyTestSettingService.isTestUsed.mockResolvedValue(false);
      competencyTestSettingService.removeSetting.mockResolvedValue({
        affected: 0,
      });

      const result = await controller.removeTemplate(id, deleteDto);

      expect(competencyTestSettingService.removeSetting).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Competency Test Setting'),
          data: {},
        }),
      );
    });

    it('should handle errors during removal', async () => {
      competencyTestSettingService.isTestUsed.mockResolvedValue(false);
      const error = new Error('Database Error');
      competencyTestSettingService.removeSetting.mockRejectedValue(error);

      const result = await controller.removeTemplate(id, deleteDto);

      expect(competencyTestSettingService.removeSetting).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('removeQuestion', () => {
    const id = '1';
    const deleteDto = new DeleteDto();

    it('should remove a competency test question', async () => {
      competencyTestSettingService.removeQuestion.mockResolvedValue({
        affected: 1,
      });

      const result = await controller.removeQuestion(id, deleteDto);

      expect(competencyTestSettingService.removeQuestion).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Competency Test Question'),
          data: {},
        }),
      );
    });

    it('should return not found if no records are affected', async () => {
      competencyTestSettingService.removeQuestion.mockResolvedValue({
        affected: 0,
      });

      const result = await controller.removeQuestion(id, deleteDto);

      expect(competencyTestSettingService.removeQuestion).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND(
            'Competency Test Question',
          ),
          data: {},
        }),
      );
    });

    it('should handle errors during removal', async () => {
      const error = new Error('Database Error');
      competencyTestSettingService.removeQuestion.mockRejectedValue(error);

      const result = await controller.removeQuestion(id, deleteDto);

      expect(competencyTestSettingService.removeQuestion).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('removeOption', () => {
    const id = '1';
    const deleteDto = new DeleteDto();

    it('should remove a competency test option', async () => {
      competencyTestSettingService.removeOption.mockResolvedValue({
        affected: 1,
      });

      const result = await controller.removeOption(id, deleteDto);

      expect(competencyTestSettingService.removeOption).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Competency Test Option'),
          data: {},
        }),
      );
    });

    it('should return not found if no records are affected', async () => {
      competencyTestSettingService.removeOption.mockResolvedValue({
        affected: 0,
      });

      const result = await controller.removeOption(id, deleteDto);

      expect(competencyTestSettingService.removeOption).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Competency Test Option'),
          data: {},
        }),
      );
    });

    it('should handle errors during removal', async () => {
      const error = new Error('Database Error');
      competencyTestSettingService.removeOption.mockRejectedValue(error);

      const result = await controller.removeOption(id, deleteDto);

      expect(competencyTestSettingService.removeOption).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('saveGlobalTestSetting', () => {
    const testGlobalSettingDto = new UpdateCompetencyTestGlobalSettingDto();

    it('should save a global test setting', async () => {
      competencyTestSettingService.findOneTestSetting.mockResolvedValue(null);
      competencyTestSettingService.createTestSetting.mockResolvedValue({});

      const result =
        await controller.saveGlobalTestSetting(testGlobalSettingDto);

      expect(
        competencyTestSettingService.findOneTestSetting,
      ).toHaveBeenCalledWith({
        where: {
          competency_test_setting: IsNull(),
        },
      });
      expect(
        competencyTestSettingService.createTestSetting,
      ).toHaveBeenCalledWith(testGlobalSettingDto);
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Test settings saved'),
          data: {},
        }),
      );
    });

    it('should update existing global test setting if found', async () => {
      const mockSetting = { id: '1' };
      competencyTestSettingService.findOneTestSetting.mockResolvedValue(
        mockSetting,
      );
      competencyTestSettingService.updateTestSetting.mockResolvedValue({});

      const result =
        await controller.saveGlobalTestSetting(testGlobalSettingDto);

      expect(
        competencyTestSettingService.findOneTestSetting,
      ).toHaveBeenCalledWith({
        where: {
          competency_test_setting: IsNull(),
        },
      });
      expect(
        competencyTestSettingService.updateTestSetting,
      ).toHaveBeenCalledWith({ id: mockSetting.id }, testGlobalSettingDto);
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Test settings saved'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      competencyTestSettingService.findOneTestSetting.mockRejectedValue(error);

      const result =
        await controller.saveGlobalTestSetting(testGlobalSettingDto);

      expect(
        competencyTestSettingService.findOneTestSetting,
      ).toHaveBeenCalledWith({
        where: {
          competency_test_setting: IsNull(),
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('saveTestSetting', () => {
    const id = '1';
    const testGlobalSettingDto = new UpdateCompetencyTestGlobalSettingDto();

    it('should save a test setting', async () => {
      competencyTestSettingService.findOneTestSetting.mockResolvedValue(null);
      competencyTestSettingService.createTestSetting.mockResolvedValue({});

      const result = await controller.saveTestSetting(id, testGlobalSettingDto);

      expect(
        competencyTestSettingService.findOneTestSetting,
      ).toHaveBeenCalledWith({
        where: { competency_test_setting: { id } },
      });
      expect(
        competencyTestSettingService.createTestSetting,
      ).toHaveBeenCalledWith({
        ...testGlobalSettingDto,
        competency_test_setting: id,
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Test settings saved'),
          data: {},
        }),
      );
    });

    it('should update existing test setting if found', async () => {
      const mockSetting = { id: '1' };
      competencyTestSettingService.findOneTestSetting.mockResolvedValue(
        mockSetting,
      );
      competencyTestSettingService.updateTestSetting.mockResolvedValue({});

      const result = await controller.saveTestSetting(id, testGlobalSettingDto);

      expect(
        competencyTestSettingService.findOneTestSetting,
      ).toHaveBeenCalledWith({
        where: { competency_test_setting: { id } },
      });
      expect(
        competencyTestSettingService.updateTestSetting,
      ).toHaveBeenCalledWith(
        { competency_test_setting: { id } },
        testGlobalSettingDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Test settings saved'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      competencyTestSettingService.findOneTestSetting.mockRejectedValue(error);

      const result = await controller.saveTestSetting(id, testGlobalSettingDto);

      expect(
        competencyTestSettingService.findOneTestSetting,
      ).toHaveBeenCalledWith({
        where: { competency_test_setting: { id } },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
