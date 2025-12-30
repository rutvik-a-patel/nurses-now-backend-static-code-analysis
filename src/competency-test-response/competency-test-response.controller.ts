import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { CompetencyTestResponseService } from './competency-test-response.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { IRequest } from '@/shared/constants/types';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CreateCompetencyTestResponseArrayDto } from './dto/create-competency-test-response.dto';
import {
  ACTIVITY_TYPE,
  ADDRESS_TYPE,
  TEST_STATUS,
} from '@/shared/constants/enum';
import { CompetencyTestSettingService } from '@/competency-test-setting/competency-test-setting.service';
import { IsNull } from 'typeorm';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { ProviderService } from '@/provider/provider.service';
import * as moment from 'moment';

@Controller('competency-test-response')
export class CompetencyTestResponseController {
  constructor(
    private readonly competencyTestResponseService: CompetencyTestResponseService,
    private readonly competencyTestSettingService: CompetencyTestSettingService,
    private readonly providerService: ProviderService,
  ) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('test-name')
  async getCompetencyTestName(@Req() req: IRequest) {
    try {
      const { user } = req;

      // Fetch provider with required relations
      const provider = await this.providerService.findOneWhere({
        where: {
          id: user.id,
          address: { type: ADDRESS_TYPE.default },
        },
        relations: { address: true, certificate: true },
      });

      if (!provider?.certificate) {
        return response.badRequest({
          message: CONSTANT.ERROR.INCOMPLETE_PROFILE,
          data: {},
        });
      }

      let testData =
        await this.competencyTestResponseService.getCompetencyTestName(user);

      if (!testData) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        });
      }

      // Retrieve test settings
      let testSetting =
        await this.competencyTestSettingService.findOneTestSetting({
          where: { competency_test_setting: { id: testData.id } },
        });

      if (!testSetting) {
        testSetting =
          await this.competencyTestSettingService.findOneTestSetting({
            where: { competency_test_setting: IsNull() },
          });
      }

      // Calculate remaining attempts
      let remainingAttempts =
        testSetting.total_attempts - provider.test_attempts;
      const testDate = moment(provider.test_date).add(
        testSetting.reassignment_duration,
        testSetting.reassignment_duration_type,
      );

      if (!remainingAttempts && moment().isAfter(testDate)) {
        remainingAttempts = testSetting.total_attempts;
        await this.providerService.update(provider.id, { test_attempts: 0 });
      }

      // Merge remaining attempts into result data
      testData.remaining_attempts = remainingAttempts;

      // Assign test if it's a fresh attempt cycle
      if (remainingAttempts === testSetting.total_attempts) {
        await this.competencyTestResponseService.assignTest(
          remainingAttempts,
          user,
          testData,
        );
      }

      testData = await this.competencyTestResponseService.getAssignedTest(user);
      testData.remaining_attempts = remainingAttempts;

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Competency Test'),
        data: testData ? testData : {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('test-details/:id')
  async getTestDetails(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const test = await this.competencyTestSettingService.findOne({
        where: { id: id },
      });

      if (!test) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        });
      }

      const testScore =
        await this.competencyTestResponseService.findOneTestScore({
          where: {
            test_status: TEST_STATUS.passed,
            provider: { id: req.user.id },
          },
        });

      if (testScore) {
        return response.badRequest({
          message: CONSTANT.ERROR.RESPONSE_ALREADY_SUBMITTED('Response'),
          data: {},
        });
      }

      const provider = await this.providerService.findOneWhere({
        where: {
          id: req.user.id,
        },
      });

      const score = await this.competencyTestResponseService.findOneTestScore({
        relations: {
          provider: true,
          competency_test_setting: true,
        },
        where: {
          provider: { id: req.user.id },
          competency_test_setting: { id },
          test_status: TEST_STATUS.pending,
        },
      });

      if (!score) {
        return response.badRequest({
          message: CONSTANT.ERROR.ATTEMPT_LIMIT_REACHED,
          data: {},
        });
      }

      const providerDto = { test_attempts: provider.test_attempts + 1 };
      if (!provider.test_attempts) {
        Object.assign(providerDto, { test_date: new Date().toISOString() });
        await this.competencyTestResponseService.saveAttempts(score);
      }

      const [list, count] =
        await this.competencyTestResponseService.getTestDetails(score.id);

      await this.providerService.update(req.user.id, providerDto);

      await this.competencyTestResponseService.createScore({
        ...score,
        test_status: TEST_STATUS.failed,
      });

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Competency Test Question'),
        data: {
          question_count: count,
          competency_test_score: score.id,
          data: list,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('reassign-test')
  async reassignCompetencyTest(
    @Body() payload: { id: string; provider_id: string },
    @Req() req: IRequest,
  ) {
    try {
      const result =
        await this.competencyTestResponseService.reassignCompetencyTest(
          payload,
        );

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test Score'),
          data: {},
        });
      }

      // Log Activity
      await this.competencyTestResponseService.reassignActivityLog(
        req,
        payload.provider_id,
        ACTIVITY_TYPE.COMPETENCY_TEST_REASSIGNED,
        {
          provider_id: payload.provider_id,
          competency_test_score_id: payload.id,
        },
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Competency Test Reassigned'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post(':id')
  async saveCompetencyTestResponse(
    @Param('id', UUIDValidationPipe) id: string,
    @Body()
    createCompetencyTestResponseArrayDto: CreateCompetencyTestResponseArrayDto,
    @Req() req: IRequest,
  ) {
    try {
      const { competency_test_score } = createCompetencyTestResponseArrayDto;
      const testResponse = createCompetencyTestResponseArrayDto?.response || [];

      const test = await this.competencyTestSettingService.findOne({
        where: { id },
      });

      if (!test) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        });
      }

      const testScore =
        await this.competencyTestResponseService.findOneTestScore({
          where: {
            test_status: TEST_STATUS.passed,
            provider: { id: req.user.id },
          },
        });

      if (testScore) {
        return response.badRequest({
          message: CONSTANT.ERROR.RESPONSE_ALREADY_SUBMITTED('Response'),
          data: {},
        });
      }

      const totalQuestions =
        await this.competencyTestResponseService.getTotalQuestionsCount({
          where: {
            competency_test_score: { id: competency_test_score },
          },
        });

      let testSetting =
        await this.competencyTestSettingService.findOneTestSetting({
          where: { competency_test_setting: { id: id } },
        });

      if (!testSetting) {
        testSetting =
          await this.competencyTestSettingService.findOneTestSetting({
            where: { competency_test_setting: IsNull() },
          });
      }

      const provider = await this.providerService.findOneWhere({
        where: {
          id: req.user.id,
        },
      });

      const answerArr = [];
      let correctCount = 0;

      let scoreData = await this.competencyTestResponseService.findOneTestScore(
        {
          where: {
            id: competency_test_score,
          },
        },
      );

      scoreData.score = +scoreData.score;
      if (!testResponse.length) {
        scoreData.test_status = TEST_STATUS.failed;
        scoreData = await this.competencyTestResponseService.createScore({
          ...scoreData,
          updated_at: new Date().toISOString() as any,
        });

        return response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Competency Test Submitted'),
          data: {
            ...scoreData,
            remaining_attempts:
              testSetting.total_attempts - provider.test_attempts,
          },
        });
      }

      for (const answer of testResponse) {
        const isCorrect =
          answer.answer === answer.correct_answer ? true : false;
        answerArr.push({
          ...answer,
          is_correct: isCorrect,
        });
        correctCount = isCorrect ? correctCount + 1 : correctCount;
      }

      scoreData.score = (correctCount / totalQuestions) * 100;
      scoreData.test_status =
        scoreData.score >= +scoreData.required_score
          ? TEST_STATUS.passed
          : TEST_STATUS.failed;

      scoreData = await this.competencyTestResponseService.createScore({
        ...scoreData,
        updated_at: new Date().toISOString() as any,
      });

      if (scoreData.test_status === TEST_STATUS.passed) {
        await this.competencyTestResponseService.deleteUnusedTestScore(
          provider,
          id,
        );
      }

      if (answerArr.length) {
        await this.competencyTestResponseService.createResponse(answerArr);
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Competency Test Submitted'),
        data: {
          ...scoreData,
          remaining_attempts:
            testSetting.total_attempts - provider.test_attempts,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('test-responses/:id')
  async getTestResponses(
    @Param('id', UUIDValidationPipe) id: string,
    @Query('provider_id', UUIDValidationPipe) provider_id: string,
  ) {
    try {
      const result = await this.competencyTestResponseService.getTestResponses(
        id,
        provider_id,
      );

      if (!result.length) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test Response'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Competency Test Response'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
