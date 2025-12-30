import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompetencyTestQuestion } from '@/competency-test-question/entities/competency-test-question.entity';
import { CompetencyTestOption } from '@/competency-test-option/entities/competency-test-option.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { CompetencyTestResponseService } from './competency-test-response.service';
import { CompetencyTestResponse } from './entities/competency-test-response.entity';
import { CompetencyTestScore } from './entities/competency-test-score.entity';
import { Repository } from 'typeorm';
import { CreateCompetencyTestScoreDto } from './dto/create-competency-test-score.dto';
import { CreateCompetencyTestResponseDto } from './dto/create-competency-test-response.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Provider } from '@/provider/entities/provider.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { TokenService } from '@/token/token.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { ChatGateway } from '@/chat/chat.gateway';
import { ChatService } from '@/chat/chat.service';
import { Activity } from '@/activity/entities/activity.entity';

describe('CompetencyTestResponseService', () => {
  let service: CompetencyTestResponseService;
  let competencyTestResponseRepository: any;
  let competencyTestSettingRepository: any;
  let competencyTestOptionRepository: any;
  let competencyTestScoreRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetencyTestResponseService,
        {
          provide: getRepositoryToken(CompetencyTestResponse),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestSetting),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getRawOne: jest
                .fn()
                .mockResolvedValue(new CompetencyTestSetting()),
            })),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestQuestion),
          useValue: {
            count: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestOption),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestScore),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest
                .fn()
                .mockResolvedValue([new CompetencyTestSetting()]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompetencyTestGlobalSetting),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: FirebaseNotificationService,
          useValue: {},
        },
        { provide: TokenService, useValue: {} },
        {
          provide: UserNotificationService,
          useValue: {},
        },
        {
          provide: ChatGateway,
          useValue: {},
        },
        {
          provide: ChatService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CompetencyTestResponseService>(
      CompetencyTestResponseService,
    );
    competencyTestResponseRepository = module.get<
      Repository<CompetencyTestResponse>
    >(getRepositoryToken(CompetencyTestResponse));
    competencyTestSettingRepository = module.get<
      Repository<CompetencyTestSetting>
    >(getRepositoryToken(CompetencyTestSetting));
    competencyTestOptionRepository = module.get<
      Repository<CompetencyTestOption>
    >(getRepositoryToken(CompetencyTestOption));
    competencyTestScoreRepository = module.get<Repository<CompetencyTestScore>>(
      getRepositoryToken(CompetencyTestScore),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createScore', () => {
    it('should create test score', async () => {
      const createCompetencyTestScoreDto = new CreateCompetencyTestScoreDto();
      const competencyTestScore = new CompetencyTestScore();
      competencyTestScoreRepository.save.mockResolvedValue(competencyTestScore);
      const result = await service.createScore(createCompetencyTestScoreDto);
      expect(competencyTestScoreRepository.save).toHaveBeenCalledWith(
        createCompetencyTestScoreDto,
      );
      expect(result).toEqual(competencyTestScore);
    });
  });

  describe('createResponse', () => {
    it('should create test response', async () => {
      const createCompetencyTestResponseDto = [
        new CreateCompetencyTestResponseDto(),
      ];

      const competencyTestResponse = new CompetencyTestResponse();
      const data = plainToClass(
        CompetencyTestResponse,
        createCompetencyTestResponseDto,
      );

      competencyTestResponseRepository.save.mockResolvedValue([
        competencyTestResponse,
      ]);

      const result = await service.createResponse(
        createCompetencyTestResponseDto,
      );

      expect(competencyTestResponseRepository.save).toHaveBeenCalledWith(data);
      expect(result).toEqual([
        plainToInstance(CompetencyTestResponse, competencyTestResponse),
      ]);
    });
  });

  describe('findOneTestScore', () => {
    it('should find one test score by criteria', async () => {
      const options = { where: { id: '1' } };
      const competencyTestScore = new CompetencyTestScore();
      competencyTestScoreRepository.findOne.mockResolvedValue(
        competencyTestScore,
      );
      const result = await service.findOneTestScore(options);
      expect(competencyTestScoreRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(competencyTestScore);
    });
  });

  describe('getTotalQuestionsCount', () => {
    it('should get total questions count by criteria', async () => {
      const options = { where: { id: '1' } };
      const count = 5;
      competencyTestResponseRepository.count = jest
        .fn()
        .mockResolvedValue(count);
      const result = await service.getTotalQuestionsCount(options);
      expect(competencyTestResponseRepository.count).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(count);
    });
    it('should return 0 if no questions found', async () => {
      const options = { where: { id: 'notfound' } };
      competencyTestResponseRepository.count = jest.fn().mockResolvedValue(0);
      const result = await service.getTotalQuestionsCount(options);
      expect(result).toBe(0);
    });
  });

  describe('findOneTestOption', () => {
    it('should find one test option by criteria', async () => {
      const options = { where: { id: '1' } };
      const competencyTestOption = new CompetencyTestOption();
      competencyTestOptionRepository.findOne.mockResolvedValue(
        competencyTestOption,
      );
      const result = await service.findOneTestOption(options);
      expect(competencyTestOptionRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(competencyTestOption);
    });
  });

  describe('getTestDetails', () => {
    it('should find test details by id', async () => {
      const id = '1';
      const testResponses = [new CompetencyTestResponse()];
      const count = testResponses.length;
      competencyTestResponseRepository.findAndCount = jest
        .fn()
        .mockResolvedValue([testResponses, count]);
      const result = await service.getTestDetails(id);
      expect(
        competencyTestResponseRepository.findAndCount,
      ).toHaveBeenCalledWith({
        where: {
          competency_test_score: { id: id },
        },
        order: {
          created_at: 'ASC',
        },
      });
      expect(result).toEqual([
        plainToInstance(CompetencyTestResponse, testResponses),
        count,
      ]);
    });
    it('should return empty array and 0 if no details found', async () => {
      const id = 'notfound';
      competencyTestResponseRepository.findAndCount = jest
        .fn()
        .mockResolvedValue([[], 0]);
      const result = await service.getTestDetails(id);
      expect(result).toEqual([[], 0]);
    });
  });

  describe('getTestAttemptsCount', () => {
    it('should get test attempts count by criteria', async () => {
      const options = { where: { id: '1' } };
      const competencyTestScore = new CompetencyTestScore();
      competencyTestScoreRepository.count.mockResolvedValue(
        competencyTestScore,
      );
      const result = await service.getTestAttemptsCount(options);
      expect(competencyTestScoreRepository.count).toHaveBeenCalledWith(options);
      expect(result).toEqual(competencyTestScore);
    });
  });

  describe('getCompetencyTestName', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
        getRawOne: jest.fn(),
        orderBy: jest.fn().mockReturnThis(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      competencyTestSettingRepository.createQueryBuilder = jest.fn(
        () => mockQueryBuilder,
      );
    });
    it('should get the competency test name by id', async () => {
      const user = new Provider();
      user.certificate = new Certificate();
      user.speciality = new Speciality();
      user.certificate.id = '1';
      user.speciality.id = '1';
      const competencyTestSetting = [new CompetencyTestSetting()];
      mockQueryBuilder.getRawOne.mockResolvedValue(competencyTestSetting);
      await service.getCompetencyTestName(user);

      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });
  });

  describe('getAllTest', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      competencyTestScoreRepository.createQueryBuilder = jest.fn(
        () => mockQueryBuilder,
      );
    });
    it('should get all test list by provider id', async () => {
      const providerId = '1';
      const competencyTestScore = [new CompetencyTestScore()];
      mockQueryBuilder.getRawMany.mockResolvedValue(competencyTestScore);
      await service.getAllTest(providerId);

      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });
});
