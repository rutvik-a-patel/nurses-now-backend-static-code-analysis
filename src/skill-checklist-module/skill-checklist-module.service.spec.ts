import { Test, TestingModule } from '@nestjs/testing';
import { SkillChecklistModuleService } from './skill-checklist-module.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';
import { Repository } from 'typeorm';
import { AUTO_ASSIGN, DEFAULT_STATUS } from '@/shared/constants/enum';
import { plainToInstance } from 'class-transformer';
import { SkillChecklistAnswer } from './entities/skill-checklist-answers.entity';
import { SkillChecklistAnswerModule } from './entities/skill-checklist-answer-module.entity';
import { SkillChecklistQuestionAnswer } from './entities/skill-checklist-question-answer.entity';
import { SkillChecklistResponseDto } from './dto/skill-checklist-response.dto';

describe('SkillChecklistModuleService', () => {
  let service: SkillChecklistModuleService;
  let skillChecklistResponseRepository: any;
  let skillChecklistAnswerRepository: any;
  let skillChecklistAnswerModuleRepository: any;
  let skillChecklistQuestionAnswerRepository: any;
  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getCount: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillChecklistModuleService,
        {
          provide: getRepositoryToken(SkillChecklistTemplate),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(SkillChecklistResponse),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SkillChecklistAnswer),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SkillChecklistAnswerModule),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SkillChecklistQuestionAnswer),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SkillChecklistModuleService>(
      SkillChecklistModuleService,
    );
    skillChecklistResponseRepository = module.get<
      Repository<SkillChecklistResponse>
    >(getRepositoryToken(SkillChecklistResponse));
    skillChecklistAnswerRepository = module.get<
      Repository<SkillChecklistAnswer>
    >(getRepositoryToken(SkillChecklistAnswer));
    skillChecklistAnswerModuleRepository = module.get<
      Repository<SkillChecklistAnswerModule>
    >(getRepositoryToken(SkillChecklistAnswerModule));
    skillChecklistQuestionAnswerRepository = module.get<
      Repository<SkillChecklistQuestionAnswer>
    >(getRepositoryToken(SkillChecklistQuestionAnswer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSkillChecklistTemplate', () => {
    const user: any = {
      id: '1',
      certificate: { id: '1' },
      speciality: { id: '1' },
    };
    it('should return template data when found', async () => {
      const mockData = {
        id: 'template-id',
        name: 'Test Template',
        skill_checklist_module: [],
      };
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockData);
      const result = await service.getSkillChecklistTemplate(user);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `(c.licenses @> :certificate_id OR c.licenses @> :specialty_id) AND st.status = :status AND c.is_essential = true AND c.auto_assign = :auto_assign`,
        {
          certificate_id: [user.certificate.id],
          specialty_id: [user.speciality.id],
          status: DEFAULT_STATUS.active,
          auto_assign: AUTO_ASSIGN.application_start,
        },
      );
      expect(result).toBe(mockData);
    });

    it('should return undefined if no data found', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(undefined);
      const result = await service.getSkillChecklistTemplate(user);
      expect(result).toBeUndefined();
    });
  });

  describe('saveSkillChecklist', () => {
    const user: any = { id: 'user-1' };
    const data = {
      id: 'template-1',
      name: 'Test Checklist',
      skill_checklist_module: [
        {
          topic_name: 'Module 1',
          sub_topic: [
            {
              topic_name: 'Sub Module 1.1',
              questions: [{ question: 'Question 1' }],
            },
          ],
        },
      ],
    };

    it('should not save if checklist already exists', async () => {
      skillChecklistResponseRepository.findOne.mockResolvedValueOnce({});
      await service.saveSkillChecklist(data, user);
      expect(skillChecklistResponseRepository.save).not.toHaveBeenCalled();
    });

    it('should save new checklist and its modules', async () => {
      skillChecklistResponseRepository.findOne.mockResolvedValueOnce(null);
      skillChecklistResponseRepository.save.mockResolvedValueOnce({
        id: 'response-1',
      });
      skillChecklistAnswerRepository.save.mockResolvedValueOnce({
        id: 'answer-1',
      });
      skillChecklistAnswerModuleRepository.save.mockResolvedValueOnce({
        id: 'answer-module-1',
      });
      skillChecklistQuestionAnswerRepository.save.mockResolvedValueOnce({});

      await service.saveSkillChecklist(data, user);

      expect(skillChecklistResponseRepository.save).toHaveBeenCalledWith({
        provider: { id: user.id },
        skill_checklist_template: { id: data.id },
        name: data.name,
      });
      expect(skillChecklistAnswerRepository.save).toHaveBeenCalled();
      expect(skillChecklistAnswerModuleRepository.save).toHaveBeenCalled();
      expect(skillChecklistQuestionAnswerRepository.save).toHaveBeenCalled();
    });
  });

  describe('getAssignedChecklist', () => {
    const user: any = { id: 'user-1' };

    it('should return assigned checklist with overall_progress', async () => {
      const mockData = {
        skill_checklist_module: [
          { section_progress: '80' },
          { section_progress: '60' },
        ],
      };
      skillChecklistResponseRepository.query.mockResolvedValueOnce([mockData]);
      const result = await service.getAssignedChecklist(user);
      expect(result.overall_progress).toBe(70);
    });

    it('should return null if no data found', async () => {
      skillChecklistResponseRepository.query.mockResolvedValueOnce([]);
      const result = await service.getAssignedChecklist(user);
      expect(result).toBeNull();
    });

    it('should handle overall_progress calculation with no modules', async () => {
      const mockData = { skill_checklist_module: [] };
      skillChecklistResponseRepository.query.mockResolvedValueOnce([mockData]);
      const result = await service.getAssignedChecklist(user);
      expect(result.overall_progress).toBe(0);
    });
  });

  describe('saveSkillChecklistAnswer', () => {
    it('should update answers for all responses', async () => {
      const dto: SkillChecklistResponseDto[] = [
        { id: '1', answer: 1 },
        { id: '2', answer: 0 },
      ];
      await service.saveSkillChecklistAnswer(dto);
      expect(
        skillChecklistQuestionAnswerRepository.update,
      ).toHaveBeenCalledTimes(2);
      expect(
        skillChecklistQuestionAnswerRepository.update,
      ).toHaveBeenCalledWith('1', { answer: 1 });
      expect(
        skillChecklistQuestionAnswerRepository.update,
      ).toHaveBeenCalledWith('2', { answer: 0 });
    });
  });

  describe('getSkillChecklistResponse', () => {
    it('should return one skill checklist', async () => {
      const options = { where: { id: '1' } };
      const skill = { id: 1, answer: 'yes' };
      skillChecklistResponseRepository.findOne.mockResolvedValueOnce(skill);
      const result = await service.getSkillChecklistResponse(options);
      expect(skillChecklistResponseRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(plainToInstance(SkillChecklistResponse, skill));
    });
  });
});
