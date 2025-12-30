import { Test, TestingModule } from '@nestjs/testing';
import { SkillChecklistTemplateController } from './skill-checklist-template.controller';
import { SkillChecklistTemplateService } from './skill-checklist-template.service';
import { SkillChecklistTemplate } from './entities/skill-checklist-template.entity';
import { CONSTANT } from '@/shared/constants/message';
import { SkillChecklistModule } from '@/skill-checklist-module/entities/skill-checklist-module.entity';
import { SkillChecklistSubModule } from '@/skill-checklist-module/entities/skill-checklist-sub-module.entity';
import { CreateSkillChecklistTemplateDto } from './dto/create-skill-checklist-template.dto';
import response from '@/shared/response';
import { SkillChecklistQuestion } from '@/skill-checklist-module/entities/skill-checklist-question.entity';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { defaultLimit, defaultOffset } from '@/shared/constants/constant';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UpdateSkillChecklistTemplateDto } from './dto/update-skill-checklist-template.dto';
import { UpdateSkillChecklistQuestionDto } from '@/skill-checklist-template/dto/update-skill-checklist-question.dto';
import {
  UpdateSkillChecklistModuleDto,
  UpdateSkillChecklistSubModuleDto,
} from '@/skill-checklist-module/dto/update-skill-checklist-module.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('SkillChecklistTemplateController', () => {
  let controller: SkillChecklistTemplateController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillChecklistTemplateController],
      providers: [
        {
          provide: SkillChecklistTemplateService,
          useValue: {
            checkName: jest.fn(),
            create: jest.fn(),
            createModule: jest.fn(),
            createSubModule: jest.fn(),
            createQuestion: jest.fn(),
            getAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            updateModule: jest.fn(),
            updateSubModule: jest.fn(),
            updateQuestion: jest.fn(),
            removeTemplate: jest.fn(),
            deleteSkillChecklist: jest.fn(),
            isTemplateUsed: jest.fn(),
          },
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

    controller = module.get<SkillChecklistTemplateController>(
      SkillChecklistTemplateController,
    );
    service = module.get<SkillChecklistTemplateService>(
      SkillChecklistTemplateService,
    );
    service.findOne = jest.fn().mockResolvedValue(null) as jest.MockedFunction<
      typeof service.findOne
    >;
    service.create = jest
      .fn()
      .mockResolvedValue(new SkillChecklistTemplate()) as jest.MockedFunction<
      typeof service.create
    >;
    service.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof service.update
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createSkillChecklistTemplateDto =
      new CreateSkillChecklistTemplateDto();
    createSkillChecklistTemplateDto.name = 'Test Template';
    createSkillChecklistTemplateDto.skill_checklist_module = [
      {
        name: 'test',
        order: 1,
        skill_checklist_template: '1',
        skill_checklist_sub_module: [
          {
            name: 'test',
            skill_checklist_module: '2',
            skill_checklist_question: [
              { question: 'test', order: 1, skill_checklist_sub_module: '1' },
            ],
          },
        ],
      },
    ];
    it('should return bad request if template already exists', async () => {
      service.checkName.mockResolvedValueOnce(true);
      const result = await controller.create(createSkillChecklistTemplateDto);
      expect(service.checkName).toHaveBeenCalledWith('Test Template');
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Skill checklist'),
          data: {},
        }),
      );
    });
    it('should create competency test setting', async () => {
      service.checkName.mockResolvedValueOnce(false);
      service.create.mockResolvedValue(new SkillChecklistTemplate());
      service.createModule.mockResolvedValue(new SkillChecklistModule());
      service.createSubModule.mockResolvedValue(new SkillChecklistSubModule());
      service.createQuestion.mockResolvedValue(new SkillChecklistQuestion());
      const result = await controller.create(createSkillChecklistTemplateDto);
      expect(service.create).toHaveBeenCalledWith(
        createSkillChecklistTemplateDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Skill Checklist'),
          data: {},
        }),
      );
    });
    it('should handle errors during the process', async () => {
      service.checkName.mockResolvedValueOnce(false);
      const error = new Error('Database Error');
      service.create.mockRejectedValue(error);
      const result = await controller.create(createSkillChecklistTemplateDto);
      expect(service.create).toHaveBeenCalledWith(
        createSkillChecklistTemplateDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto: QueryParamsDto = {
      limit: defaultLimit,
      offset: defaultOffset,
      search: 'string',
      order: { created_at: 'DESC' },
    };
    it('should return success response', async () => {
      const list = [new SkillChecklistTemplate()];
      const count = 1;

      service.getAll.mockResolvedValue([list, count]);
      const result = await controller.findAll(queryParamsDto);
      expect(service.getAll).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: count
            ? CONSTANT.SUCCESS.RECORD_FOUND('Skill Checklist')
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Skill Checklist'),
          total: count,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: list,
        }),
      );
    });

    it('should return success response', async () => {
      const list = [];
      const count = 0;

      service.getAll.mockResolvedValue([list, count]);
      const result = await controller.findAll(queryParamsDto);
      expect(service.getAll).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Skill Checklist'),
          total: count,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: list,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      service.getAll.mockRejectedValue(error);

      const result = await controller.findAll(queryParamsDto);

      expect(service.getAll).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return skill checklist', async () => {
      service.findOne.mockResolvedValue(new SkillChecklistTemplate());
      const result = await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
        relations: {
          skill_checklist_module: {
            skill_checklist_sub_module: {
              skill_checklist_question: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          status: true,
          created_at: true,
          updated_at: true,
          skill_checklist_module: {
            id: true,
            name: true,
            order: true,
            created_at: true,
            skill_checklist_sub_module: {
              id: true,
              name: true,
              created_at: true,
              skill_checklist_question: {
                id: true,
                question: true,
                order: true,
                created_at: true,
              },
            },
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Skill Checklist'),
          data: new SkillChecklistTemplate(),
        }),
      );
    });

    it('should return skill checklist', async () => {
      service.findOne.mockResolvedValue(null);
      const result = await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
        relations: {
          skill_checklist_module: {
            skill_checklist_sub_module: {
              skill_checklist_question: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          status: true,
          created_at: true,
          updated_at: true,
          skill_checklist_module: {
            id: true,
            name: true,
            order: true,
            created_at: true,
            skill_checklist_sub_module: {
              id: true,
              name: true,
              created_at: true,
              skill_checklist_question: {
                id: true,
                question: true,
                order: true,
                created_at: true,
              },
            },
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Skill Checklist'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      service.findOne.mockRejectedValue(error);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
        relations: {
          skill_checklist_module: {
            skill_checklist_sub_module: {
              skill_checklist_question: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          status: true,
          created_at: true,
          updated_at: true,
          skill_checklist_module: {
            id: true,
            name: true,
            order: true,
            created_at: true,
            skill_checklist_sub_module: {
              id: true,
              name: true,
              created_at: true,
              skill_checklist_question: {
                id: true,
                question: true,
                order: true,
                created_at: true,
              },
            },
          },
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('removeTemplate', () => {
    const id = '1';
    const deleteDto: DeleteDto = { deleted_at_ip: '127.0.0.1' };
    it('should not delete if template is in use', async () => {
      service.isTemplateUsed = jest.fn().mockResolvedValue(true);
      const result = await controller.removeTemplate(id, deleteDto);
      expect(service.isTemplateUsed).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('skill checklist'),
          data: {},
        }),
      );
    });
    it('should remove skill checklist', async () => {
      service.isTemplateUsed = jest.fn().mockResolvedValue(false);
      service.removeTemplate.mockResolvedValue({ affected: 1 });
      const result = await controller.removeTemplate(id, deleteDto);
      expect(service.removeTemplate).toHaveBeenCalledWith({ id }, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Skill Checklist Template'),
          data: {},
        }),
      );
    });
    it('should remove skill checklist', async () => {
      service.isTemplateUsed = jest.fn().mockResolvedValue(false);
      service.removeTemplate.mockResolvedValue({ affected: 0 });
      const result = await controller.removeTemplate(id, deleteDto);
      expect(service.removeTemplate).toHaveBeenCalledWith({ id }, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND(
            'Skill Checklist Template',
          ),
          data: {},
        }),
      );
    });
    it('should handle errors during the process', async () => {
      service.isTemplateUsed = jest.fn().mockResolvedValue(false);
      const error = new Error('Database Error');
      service.removeTemplate.mockRejectedValue(error);
      const result = await controller.removeTemplate('1', deleteDto);
      expect(service.removeTemplate).toHaveBeenCalledWith({ id }, deleteDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateSkillChecklistTemplateDto =
      new UpdateSkillChecklistTemplateDto();
    it('should update competency test setting', async () => {
      const mockTemplate = new SkillChecklistTemplate();
      mockTemplate.id = id;
      service.findOne.mockResolvedValue(mockTemplate);
      service.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateSkillChecklistTemplateDto,
      );

      expect(service.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(service.update).toHaveBeenCalledWith(
        { id },
        updateSkillChecklistTemplateDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Skill Checklist'),
          data: {},
        }),
      );
    });

    it('should update questions and options if provided', async () => {
      const mockQuestion = new UpdateSkillChecklistQuestionDto();
      const mockSubModule = new UpdateSkillChecklistSubModuleDto();
      mockSubModule.skill_checklist_question = [mockQuestion];
      const mockModule = new UpdateSkillChecklistModuleDto();
      mockModule.skill_checklist_sub_module = [mockSubModule];
      updateSkillChecklistTemplateDto.skill_checklist_module = [mockModule];

      const mockTemplate = new SkillChecklistTemplate();
      mockTemplate.id = id;
      service.findOne.mockResolvedValue(mockTemplate);
      service.deleteSkillChecklist.mockResolvedValue();
      service.update.mockResolvedValue({ affected: 1 });
      service.updateModule.mockResolvedValue({
        id: 'module1',
      });
      service.updateSubModule.mockResolvedValue({
        id: 'submodule1',
      });
      service.updateQuestion.mockResolvedValue({
        id: 'question1',
      });

      const result = await controller.update(
        id,
        updateSkillChecklistTemplateDto,
      );

      expect(service.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(service.updateModule).toHaveBeenCalledWith(
        expect.objectContaining({ skill_checklist_template: id }),
      );
      expect(service.updateSubModule).toHaveBeenCalledWith(
        expect.objectContaining({ skill_checklist_module: 'module1' }),
      );
      expect(service.updateQuestion).toHaveBeenCalledWith(
        expect.objectContaining({ skill_checklist_sub_module: 'submodule1' }),
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Skill Checklist'),
          data: {},
        }),
      );
    });

    it('should update questions and options if provided', async () => {
      const mockQuestion = new UpdateSkillChecklistQuestionDto();
      const mockSubModule = new UpdateSkillChecklistSubModuleDto();
      mockSubModule.skill_checklist_question = [mockQuestion];
      const mockModule = new UpdateSkillChecklistModuleDto();
      mockModule.skill_checklist_sub_module = [mockSubModule];
      updateSkillChecklistTemplateDto.skill_checklist_module = [mockModule];

      const mockTemplate = new SkillChecklistTemplate();
      mockTemplate.id = id;
      service.findOne.mockResolvedValue(mockTemplate);
      service.deleteSkillChecklist.mockResolvedValue();
      service.update.mockResolvedValue({ affected: 0 });
      service.updateModule.mockResolvedValue({
        id: 'module1',
      });
      service.updateSubModule.mockResolvedValue({
        id: 'submodule1',
      });
      service.updateQuestion.mockResolvedValue({
        id: 'question1',
      });

      const result = await controller.update(
        id,
        updateSkillChecklistTemplateDto,
      );

      expect(service.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(service.updateModule).toHaveBeenCalledWith(
        expect.objectContaining({ skill_checklist_template: id }),
      );
      expect(service.updateSubModule).toHaveBeenCalledWith(
        expect.objectContaining({ skill_checklist_module: 'module1' }),
      );
      expect(service.updateQuestion).toHaveBeenCalledWith(
        expect.objectContaining({ skill_checklist_sub_module: 'submodule1' }),
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Skill Checklist'),
          data: {},
        }),
      );
    });

    it('should handle errors during update process', async () => {
      const error = new Error('Database Error');
      service.findOne.mockRejectedValue(error);

      const result = await controller.update(
        id,
        updateSkillChecklistTemplateDto,
      );

      expect(service.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });

    it('should return bad request if template not found', async () => {
      service.findOne.mockResolvedValue(null);

      const result = await controller.update(
        id,
        updateSkillChecklistTemplateDto,
      );

      expect(service.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Skill Checklist'),
          data: {},
        }),
      );
    });
  });
});
