import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyTestResponseController } from './competency-test-response.controller';
import { CompetencyTestResponseService } from './competency-test-response.service';
import { CompetencyTestSettingService } from '@/competency-test-setting/competency-test-setting.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { TEST_STATUS, EXPIRATION_DURATION_TYPE } from '@/shared/constants/enum';
import { ProviderService } from '@/provider/provider.service';
import { IRequest } from '@/shared/constants/types';

describe('CompetencyTestResponseController', () => {
  let controller: CompetencyTestResponseController;
  let competencyTestResponseService: any;
  let competencyTestSettingService: any;
  let providerService: any;

  beforeEach(async () => {
    const competencyTestResponseServiceMock = {
      getCompetencyTestName: jest.fn(),
      getAssignedTest: jest.fn(),
      getTestDetails: jest.fn(),
      getTotalQuestionsCount: jest.fn(),
      findOneTestScore: jest.fn(),
      findOneTestOption: jest.fn(),
      createScore: jest.fn(),
      createResponse: jest.fn(),
      getTestAttemptsCount: jest.fn(),
      deleteUnusedTestScore: jest.fn(),
      assignTest: jest.fn(),
    };
    const competencyTestSettingServiceMock = {
      findOne: jest.fn(),
      findOneTestSetting: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetencyTestResponseController],
      providers: [
        {
          provide: CompetencyTestResponseService,
          useValue: competencyTestResponseServiceMock,
        },
        {
          provide: CompetencyTestSettingService,
          useValue: competencyTestSettingServiceMock,
        },
        {
          provide: ProviderService,
          useValue: {
            findOneWhere: jest.fn(),
            update: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<CompetencyTestResponseController>(
      CompetencyTestResponseController,
    );
    competencyTestResponseService = module.get<CompetencyTestResponseService>(
      CompetencyTestResponseService,
    );
    competencyTestSettingService = module.get<CompetencyTestSettingService>(
      CompetencyTestSettingService,
    );
    providerService = module.get<ProviderService>(ProviderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCompetencyTestName', () => {
    const req: any = { user: { id: '1' } };
    it('should return the Competency Test if found and assign test on new cycle', async () => {
      const competencyTest = { id: 'test-id' };
      const testSetting = {
        total_attempts: 2,
        reassignment_duration: 1,
        reassignment_duration_type: EXPIRATION_DURATION_TYPE.day,
      };
      const provider = {
        id: '1',
        certificate: {},
        test_attempts: 0,
        test_date: new Date(),
      };
      providerService.findOneWhere.mockResolvedValue(provider);
      competencyTestResponseService.getCompetencyTestName.mockResolvedValue({
        ...competencyTest,
      });
      competencyTestSettingService.findOneTestSetting.mockResolvedValue(
        testSetting,
      );
      competencyTestResponseService.assignTest = jest.fn();
      providerService.update.mockResolvedValue({});
      competencyTestResponseService.getAssignedTest.mockResolvedValue({
        ...competencyTest,
        remaining_attempts: 2,
      });
      const result = await controller.getCompetencyTestName(req);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Competency Test'),
          data: expect.objectContaining({
            id: 'test-id',
            remaining_attempts: 2,
          }),
        }),
      );
      expect(competencyTestResponseService.assignTest).toHaveBeenCalledWith(
        2,
        req.user,
        expect.objectContaining({ id: 'test-id' }),
      );
    });

    it('should reset attempts if attempts exhausted and reassignment duration passed', async () => {
      const competencyTest = { id: 'test-id' };
      const testSetting = {
        total_attempts: 2,
        reassignment_duration: 1,
        reassignment_duration_type: EXPIRATION_DURATION_TYPE.day,
      };
      const oldDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const provider = {
        id: '1',
        certificate: {},
        test_attempts: 2,
        test_date: oldDate,
      };
      providerService.findOneWhere.mockResolvedValue(provider);
      competencyTestResponseService.getCompetencyTestName.mockResolvedValue({
        ...competencyTest,
      });
      competencyTestSettingService.findOneTestSetting.mockResolvedValue(
        testSetting,
      );
      competencyTestResponseService.assignTest = jest.fn();
      providerService.update.mockResolvedValue({});
      competencyTestResponseService.getAssignedTest.mockResolvedValue({
        ...competencyTest,
        remaining_attempts: 2,
      });
      const result = await controller.getCompetencyTestName(req);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Competency Test'),
          data: expect.objectContaining({
            id: 'test-id',
            remaining_attempts: 2,
          }),
        }),
      );
      expect(providerService.update).toHaveBeenCalledWith('1', {
        test_attempts: 0,
      });
      expect(competencyTestResponseService.assignTest).toHaveBeenCalledWith(
        2,
        req.user,
        expect.objectContaining({ id: 'test-id' }),
      );
    });

    it('should return profile incomplete if certificate not found', async () => {
      const provider = { id: '1', certificate: null };
      providerService.findOneWhere.mockResolvedValue(provider);
      const result = await controller.getCompetencyTestName(req);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INCOMPLETE_PROFILE,
          data: {},
        }),
      );
    });

    it('should return bad request if test data not found', async () => {
      const provider = { id: '1', certificate: {} };
      providerService.findOneWhere.mockResolvedValue(provider);
      competencyTestResponseService.getCompetencyTestName.mockResolvedValue(
        null,
      );
      const result = await controller.getCompetencyTestName(req);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const error = new Error('Database Error');
      providerService.findOneWhere.mockRejectedValue(error);
      const result = await controller.getCompetencyTestName(req);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getTestDetails', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };
    it('should return the Test Details if found', async () => {
      const competencyTest = { id: 'test-id' };
      const provider = { id: '1', test_attempts: 0, test_date: new Date() };
      const score = { id: 'score-id', test_status: TEST_STATUS.pending };
      competencyTestSettingService.findOne.mockResolvedValue(competencyTest);
      // First call: check for passed test
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce(
        null,
      ); // passed check
      providerService.findOneWhere.mockResolvedValue(provider);
      // Second call: check for pending score
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce(
        score,
      );
      competencyTestResponseService.getTestDetails.mockResolvedValue([
        [{ id: 'q1' }],
        1,
      ]);
      providerService.update.mockResolvedValue({});
      competencyTestResponseService.createScore.mockResolvedValue({
        ...score,
        test_status: TEST_STATUS.failed,
      });
      competencyTestResponseService.saveAttempts = jest.fn();
      const result = await controller.getTestDetails(id, req);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Competency Test Question'),
          data: expect.objectContaining({
            question_count: 1,
            competency_test_score: 'score-id',
            data: [{ id: 'q1' }],
          }),
        }),
      );
    });

    it('should return bad request if test not found', async () => {
      competencyTestSettingService.findOne.mockResolvedValue(null);
      const result = await controller.getTestDetails(id, req);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        }),
      );
    });

    it('should return bad request if already passed', async () => {
      competencyTestSettingService.findOne.mockResolvedValue({ id: 'test-id' });
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce({
        test_status: TEST_STATUS.passed,
      });
      const result = await controller.getTestDetails(id, req);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RESPONSE_ALREADY_SUBMITTED('Response'),
          data: {},
        }),
      );
    });

    it('should return bad request if attempt limit reached', async () => {
      competencyTestSettingService.findOne.mockResolvedValue({ id: 'test-id' });
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce(
        null,
      ); // passed check
      providerService.findOneWhere.mockResolvedValue({ id: '1' });
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce(
        null,
      ); // pending check
      const result = await controller.getTestDetails(id, req);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ATTEMPT_LIMIT_REACHED,
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const error = new Error('Database Error');
      competencyTestSettingService.findOne.mockRejectedValue(error);
      const result = await controller.getTestDetails(id, req);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('saveCompetencyTestResponse', () => {
    const req = { user: { id: '1' } } as IRequest;
    const id = '1';
    const validDto = {
      competency_test_score: 'score-id',
      response: [
        {
          id: 'resp-id',
          competency_test_question: 'q1',
          competency_test_option: 'opt1',
          answer: 'A',
          correct_answer: 'A',
        },
      ],
    };
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return bad request if no test found', async () => {
      competencyTestSettingService.findOne.mockResolvedValue(null);
      const result = await controller.saveCompetencyTestResponse(
        id,
        validDto,
        req,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        }),
      );
    });

    it('should return bad request if already passed', async () => {
      competencyTestSettingService.findOne.mockResolvedValue({
        id: 'test-id',
        required_score: 100,
      });
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce({
        test_status: TEST_STATUS.passed,
      });
      const result = await controller.saveCompetencyTestResponse(
        id,
        validDto,
        req,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RESPONSE_ALREADY_SUBMITTED('Response'),
          data: {},
        }),
      );
    });

    it('should return success response (passed)', async () => {
      competencyTestSettingService.findOne.mockResolvedValue({
        id: 'test-id',
        required_score: 100,
      });
      // 1st call: check for passed score
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce(
        null,
      );
      competencyTestSettingService.findOneTestSetting.mockResolvedValue({
        total_attempts: 2,
      });
      providerService.findOneWhere.mockResolvedValue({
        id: '1',
        test_attempts: 0,
      });
      competencyTestResponseService.getTotalQuestionsCount.mockResolvedValue(1);
      // 2nd call: fetch the score object for the attempt
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce({
        id: 'score-id',
        score: 0,
      });
      competencyTestResponseService.createScore.mockResolvedValue({
        id: 'score-id',
        score: 100,
        test_status: TEST_STATUS.passed,
      });
      competencyTestResponseService.createResponse.mockResolvedValue({});
      providerService.update.mockResolvedValue({});
      const result = await controller.saveCompetencyTestResponse(
        id,
        validDto,
        req,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Competency Test Submitted'),
          data: expect.objectContaining({
            score: 100,
            test_status: TEST_STATUS.passed,
            remaining_attempts: 2,
          }),
        }),
      );
    });

    it('should return success response (failed)', async () => {
      competencyTestSettingService.findOne.mockResolvedValue({
        id: 'test-id',
        required_score: 100,
      });
      // 1st call: check for passed score
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce(
        null,
      );
      competencyTestSettingService.findOneTestSetting.mockResolvedValue({
        total_attempts: 2,
      });
      providerService.findOneWhere.mockResolvedValue({
        id: '1',
        test_attempts: 0,
      });
      competencyTestResponseService.getTotalQuestionsCount.mockResolvedValue(1);
      // 2nd call: fetch the score object for the attempt
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce({
        id: 'score-id',
        score: 0,
      });
      competencyTestResponseService.createScore.mockResolvedValue({
        id: 'score-id',
        score: 0,
        test_status: TEST_STATUS.failed,
      });
      competencyTestResponseService.createResponse.mockResolvedValue({});
      providerService.update.mockResolvedValue({});
      const failDto = {
        ...validDto,
        response: [
          { ...validDto.response[0], answer: 'B', correct_answer: 'A' },
        ],
      };
      const result = await controller.saveCompetencyTestResponse(
        id,
        failDto,
        req,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Competency Test Submitted'),
          data: expect.objectContaining({
            score: 0,
            test_status: TEST_STATUS.failed,
            remaining_attempts: 2,
          }),
        }),
      );
    });

    it('should return success response if no answers submitted', async () => {
      competencyTestSettingService.findOne.mockResolvedValue({
        id: 'test-id',
        required_score: 100,
      });
      // 1st call: check for passed score
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce(
        null,
      );
      competencyTestSettingService.findOneTestSetting.mockResolvedValue({
        total_attempts: 2,
      });
      providerService.findOneWhere.mockResolvedValue({
        id: '1',
        test_attempts: 0,
      });
      competencyTestResponseService.getTotalQuestionsCount.mockResolvedValue(1);
      // 2nd call: fetch the score object for the attempt
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce({
        id: 'score-id',
        score: 0,
      });
      competencyTestResponseService.createScore.mockResolvedValue({
        id: 'score-id',
        score: 0,
        test_status: TEST_STATUS.failed,
      });
      providerService.update.mockResolvedValue({});
      const emptyDto = { ...validDto, response: [] };
      const result = await controller.saveCompetencyTestResponse(
        id,
        emptyDto,
        req,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Competency Test Submitted'),
          data: expect.objectContaining({ score: 0, remaining_attempts: 2 }),
        }),
      );
    });

    it('should handle errors gracefully', async () => {
      competencyTestSettingService.findOne.mockResolvedValue({
        id: 'test-id',
        required_score: 100,
      });
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce(
        null,
      ); // passed check
      competencyTestSettingService.findOneTestSetting.mockResolvedValue({
        total_attempts: 2,
      });
      providerService.findOneWhere.mockResolvedValue({
        id: '1',
        test_attempts: 0,
      });
      competencyTestResponseService.getTotalQuestionsCount.mockResolvedValue(1);
      competencyTestResponseService.findOneTestScore.mockResolvedValueOnce({
        id: 'score-id',
        score: 0,
      }); // fetch score
      competencyTestResponseService.createScore.mockRejectedValue(
        new Error('Something went wrong'),
      );
      const result = await controller.saveCompetencyTestResponse(
        id,
        validDto,
        req,
      );
      expect(result).toEqual(
        response.failureResponse(new Error('Something went wrong')),
      );
    });
  });
});
