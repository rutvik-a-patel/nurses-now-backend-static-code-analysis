import { Test, TestingModule } from '@nestjs/testing';
import { SkillChecklistModuleController } from './skill-checklist-module.controller';
import { SkillChecklistModuleService } from './skill-checklist-module.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';

describe('SkillChecklistTemplateController', () => {
  let controller: SkillChecklistModuleController;
  let skillChecklistModuleService: any;

  const mockUser: any = {
    id: 'user1',
    certificate: {
      id: 'certificate1',
    },
  };

  const mockData = [
    {
      id: 'template1',
      name: 'Template 1',
      certificate_id: 'certificate1',
      status: 'active',
      created_at: new Date(),
      overall_progress: 50.0,
      skill_checklist_module: [
        {
          id: 'module1',
          topic_name: 'Module 1',
          order: 1,
          sub_topic: [
            {
              id: 'submodule1',
              topic_name: 'SubModule 1',
              questions: [
                {
                  id: 'question1',
                  question: 'Question 1',
                  order: 1,
                  answer: 'Answer 1',
                },
              ],
            },
          ],
          section_progress: 50.0,
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillChecklistModuleController],
      providers: [
        {
          provide: SkillChecklistModuleService,
          useValue: {
            getSkillChecklistTemplate: jest.fn(),
            getSkillChecklistModule: jest.fn(),
            upsertSkillChecklistResponse: jest.fn(),
            getSkillChecklistResponse: jest.fn(),
            saveSkillChecklist: jest.fn(),
            getAssignedChecklist: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SkillChecklistModuleController>(
      SkillChecklistModuleController,
    );
    skillChecklistModuleService = module.get<SkillChecklistModuleService>(
      SkillChecklistModuleService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSkillChecklistTopics', () => {
    const req: any = { user: mockUser };
    it('should return skill checklist topics for a given user', async () => {
      skillChecklistModuleService.getSkillChecklistResponse.mockResolvedValue(
        {},
      );
      skillChecklistModuleService.getAssignedChecklist.mockResolvedValue(
        mockData,
      );

      const result = await controller.getSkillChecklistTopics(req);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Skill Checklist Module'),
          data: mockData,
        }),
      );
      expect(
        skillChecklistModuleService.getSkillChecklistTemplate,
      ).not.toHaveBeenCalled(); // Should not be called if checklist exists
    });

    it('should return empty data if no skill checklist topics are found', async () => {
      skillChecklistModuleService.getSkillChecklistResponse.mockResolvedValue(
        {},
      );
      skillChecklistModuleService.getAssignedChecklist.mockResolvedValue({});

      const result = await controller.getSkillChecklistTopics(req);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Skill Checklist Module'),
          data: {},
        }),
      );
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Something went wrong');
      skillChecklistModuleService.getSkillChecklistResponse.mockRejectedValue(
        error,
      );

      const result = await controller.getSkillChecklistTopics(req);

      expect(result).toEqual(response.failureResponse(error));
      expect(
        skillChecklistModuleService.getSkillChecklistResponse,
      ).toHaveBeenCalledWith({ where: { provider: { id: mockUser.id } } });
    });
  });
});
