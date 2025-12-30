import { Provider } from '@/provider/entities/provider.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompetencyTestResponse } from './entities/competency-test-response.entity';
import {
  FindManyOptions,
  FindOneOptions,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  AUTO_ASSIGN,
  DEFAULT_STATUS,
  PushNotificationType,
  TABLE,
  TEST_STATUS,
} from '@/shared/constants/enum';
import { plainToClass, plainToInstance } from 'class-transformer';
import { CompetencyTestQuestion } from '@/competency-test-question/entities/competency-test-question.entity';
import { CreateCompetencyTestResponseDto } from './dto/create-competency-test-response.dto';
import { CompetencyTestScore } from './entities/competency-test-score.entity';
import { CreateCompetencyTestScoreDto } from './dto/create-competency-test-score.dto';
import { CompetencyTestOption } from '@/competency-test-option/entities/competency-test-option.entity';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';
import { CONSTANT } from '@/shared/constants/message';
import * as moment from 'moment';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Activity } from '@/activity/entities/activity.entity';
import { IRequest } from '@/shared/constants/types';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';

@Injectable()
export class CompetencyTestResponseService {
  constructor(
    @InjectRepository(CompetencyTestResponse)
    private readonly competencyTestResponseRepository: Repository<CompetencyTestResponse>,
    @InjectRepository(CompetencyTestSetting)
    private readonly competencyTestSettingRepository: Repository<CompetencyTestSetting>,
    @InjectRepository(CompetencyTestQuestion)
    private readonly competencyTestQuestionRepository: Repository<CompetencyTestQuestion>,
    @InjectRepository(CompetencyTestScore)
    private readonly competencyTestScoreRepository: Repository<CompetencyTestScore>,
    @InjectRepository(CompetencyTestOption)
    private readonly competencyTestOptionRepository: Repository<CompetencyTestOption>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(CompetencyTestGlobalSetting)
    private readonly globalSettingRepository: Repository<CompetencyTestGlobalSetting>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  async createScore(
    createCompetencyTestScoreDto:
      | CreateCompetencyTestScoreDto
      | CompetencyTestScore,
  ) {
    const data = plainToClass(
      CompetencyTestScore,
      createCompetencyTestScoreDto,
    );
    const result = await this.competencyTestScoreRepository.save(data);
    return plainToInstance(CompetencyTestScore, result);
  }

  async createResponse(
    createCompetencyTestResponseDto: CreateCompetencyTestResponseDto[],
  ) {
    const data = plainToInstance(
      CompetencyTestResponse,
      createCompetencyTestResponseDto,
    );
    const result = await this.competencyTestResponseRepository.save(data);
    return plainToInstance(CompetencyTestResponse, result);
  }

  async findOneTestScore(
    option: FindOneOptions<CompetencyTestScore>,
  ): Promise<CompetencyTestScore> {
    const result = await this.competencyTestScoreRepository.findOne(option);
    return plainToInstance(CompetencyTestScore, result);
  }

  async getTotalQuestionsCount(
    option: FindOneOptions<CompetencyTestResponse>,
  ): Promise<number> {
    const count = await this.competencyTestResponseRepository.count(option);
    return count;
  }

  async findOneTestOption(
    option: FindOneOptions<CompetencyTestOption>,
  ): Promise<CompetencyTestOption> {
    const result = await this.competencyTestOptionRepository.findOne(option);
    return plainToInstance(CompetencyTestOption, result);
  }

  async getAssignedTest(user: Provider) {
    const score = await this.competencyTestScoreRepository
      .createQueryBuilder('score')
      .select([
        'score.score::FLOAT as percentage',
        'score.name AS name',
        'score.required_score AS required_score',
        'score.duration AS duration',
        'score.total_questions AS question_count',
        'score.competency_test_setting_id AS id',
      ])
      .where('score.provider_id = :providerId', { providerId: user.id })
      .getRawOne();

    const isPassed =
      score?.percentage !== undefined
        ? parseFloat(score.percentage as any) >=
          parseFloat(score.required_score as any)
        : false;

    Object.assign(score, {
      is_completed: score?.test_status === TEST_STATUS.passed,
      percentage: isPassed ? parseFloat(score.percentage as any) : 0,
      is_pass: isPassed,
    });

    return score;
  }

  async getCompetencyTestName(user: Provider) {
    const score = await this.findOneTestScore({
      where: { provider: { id: user.id }, test_status: TEST_STATUS.passed },
    });
    const data = await this.competencyTestSettingRepository
      .createQueryBuilder('cs')
      .innerJoin(
        'credentials',
        'c',
        `c.credential_id = cs.id AND ('${user.certificate.id}' = ANY(c.licenses) OR '${user.speciality.id}' = ANY(c.licenses))`,
      )
      .leftJoin(
        'competency_test_score',
        'cts',
        `cts.competency_test_setting_id = cs.id AND cts.provider_id = '${user.id}'` +
          (score?.id ? ` AND cts.id = '${score.id}'` : ''),
      )
      .select([
        'DISTINCT cs.id AS id',
        'cs.name AS name',
        'cs.required_score AS required_score',
        'cs.duration AS duration',
        'c.created_at AS created_at',
        `(SELECT
            COUNT(id)
          FROM
            competency_test_question
          WHERE
            competency_test_setting_id = cs.id
            AND deleted_at IS NULL)::INTEGER AS question_count`,
        `CASE
          WHEN cts.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_completed`,
        `ROUND(COALESCE((
          SELECT
            cts_latest.score
          FROM
            competency_test_score cts_latest
          WHERE
            cts_latest.competency_test_setting_id = cs.id
              AND cts_latest.provider_id = '${user.id}'
          ORDER BY
            cts_latest.created_at DESC
          LIMIT 1
        ), 0)::NUMERIC, 2)::FLOAT AS percentage`,
        `CASE
          WHEN cts.score >= cs.required_score::numeric THEN TRUE
          ELSE FALSE
        END AS is_pass`,
      ])
      .where(
        `(c.licenses @> :certificate_id OR c.licenses @> :specialty_id) AND cs.status = :status AND c.is_essential = true AND c.auto_assign = :auto_assign`,
        {
          certificate_id: [user.certificate.id],
          specialty_id: [user.speciality.id],
          status: DEFAULT_STATUS.active,
          auto_assign: AUTO_ASSIGN.application_start,
        },
      )
      .orderBy('c.created_at', 'DESC')
      .getRawOne();

    return data;
  }

  async getTestDetails(id: string) {
    const [list, count] =
      await this.competencyTestResponseRepository.findAndCount({
        where: {
          competency_test_score: { id: id },
        },
        order: {
          created_at: 'ASC',
        },
      });

    return [plainToInstance(CompetencyTestResponse, list), count];
  }

  async getTestAttemptsCount(
    option: FindManyOptions<CompetencyTestScore>,
  ): Promise<number> {
    const count = await this.competencyTestScoreRepository.count(option);
    return count;
  }

  async getAllTest(providerId: string) {
    const queryBuilder =
      this.competencyTestScoreRepository.createQueryBuilder('cs');

    queryBuilder
      .leftJoin('cs.provider', 'p')
      .leftJoin('cs.competency_test_setting', 'c')
      .select([
        'c.id AS id',
        'c.name AS name',
        'c.required_score AS required_score',
        'ROUND(AVG(cs.score), 2)::DOUBLE PRECISION AS score',
        'MAX(cs.created_at) AS assigned_on',
        'COUNT(cs.id)::INTEGER AS total_attempts',
        `jsonb_agg(
          jsonb_build_object(
            'id', cs.id,
            'score', cs.score,
            'updated_at', cs.updated_at
          )
        ) AS attempts`,
        `CASE
          WHEN bool_or(cs.test_status = '${TEST_STATUS.passed}') THEN true
          ELSE false
        END AS is_completed`,
      ])
      .groupBy('c.id')
      .where(`p.id = '${providerId}'`);

    const result = await queryBuilder.getRawMany();
    return result;
  }

  async assignTest(remainingAttempts: number, user: Provider, data: any) {
    const testScore = await this.findOneTestScore({
      where: {
        provider: { id: user.id },
        test_status: TEST_STATUS.pending,
      },
    });

    if (testScore) return;

    const competencyTestScore: CreateCompetencyTestScoreDto = {
      score: 0,
      test_status: TEST_STATUS.pending,
      provider: user.id,
      name: data.name,
      competency_test_setting: data.id,
      duration: data.duration,
      required_score: data.required_score,
      total_questions: data.question_count,
    };

    for (let index = 0; index < remainingAttempts; index++) {
      await this.createScore(competencyTestScore);
    }

    return;
  }

  async saveAttempts(score: CompetencyTestScore) {
    const scoreDetails = await this.competencyTestScoreRepository.find({
      where: {
        provider: { id: score.provider.id },
        competency_test_setting: { id: score.competency_test_setting.id },
      },
    });

    const testData = await this.competencyTestQuestionRepository.find({
      relations: { competency_test_option: true },
      where: {
        competency_test_setting: { id: score.competency_test_setting.id },
      },
      order: {
        order: 'ASC',
        competency_test_option: {
          order: 'ASC',
        },
      },
    });

    const payload = [];

    scoreDetails.forEach((testScore) => {
      testData.forEach((test) => {
        const numberWords = ['one', 'two', 'three', 'four'];
        const record: any = {
          competency_test_score: testScore.id,
          question: test.question,
        };

        test.competency_test_option.forEach((option, index) => {
          const word = numberWords[index] || (index + 1).toString();
          record[`option_${word}`] = option.option;
          if (option.is_answer) {
            record['correct_answer'] = option.option;
          }
        });

        payload.push(record);
      });
    });

    await this.competencyTestResponseRepository.save(
      plainToInstance(CompetencyTestResponse, payload),
    );

    return;
  }

  async reassignCompetencyTest(payload: { id: string; provider_id: string }) {
    const scoresToRemove = await this.competencyTestScoreRepository.find({
      where: {
        provider: { id: payload.provider_id },
        competency_test_setting: { id: payload.id },
      },
    });
    if (scoresToRemove.length > 0) {
      await this.competencyTestScoreRepository.remove(scoresToRemove);
    }

    const testSetting = await this.globalSettingRepository.findOne({
      where: [
        { competency_test_setting: { id: payload?.id } },
        { competency_test_setting: IsNull() },
      ],
    });

    await this.providerRepository.update(
      { id: payload.provider_id },
      { test_attempts: 0, test_date: null },
    );

    const user = await this.providerRepository.findOne({
      where: { id: payload.provider_id },
      relations: { certificate: true, speciality: true },
    });

    const testData = await this.getCompetencyTestName(user);
    testData.remaining_attempts = testSetting.total_attempts;
    await this.assignTest(testSetting.total_attempts, user, testData);
    await this.sendReassignTestNotification(user);
    return testData;
  }

  async sendReassignTestNotification(user: Provider) {
    const notification =
      await this.notificationService.createUserSpecificNotification({
        title: CONSTANT.NOTIFICATION.TEST_REASSIGN_TITLE,
        text: CONSTANT.NOTIFICATION.TEST_REASSIGN_TEXT,
        push_type: PushNotificationType.notify,
      });

    // Send notification to provider
    await this.firebaseNotificationService.sendNotificationToOne(
      notification,
      TABLE.provider,
      user.id,
      {
        expire_in: 0,
        is_timer: false,
        status: PushNotificationType.notify,
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        start_time: moment().format('HH:mm:ss'),
        end_time: moment().format('HH:mm:ss'),
        to: 'notification_data',
        created_at: new Date().toISOString(),
        description: CONSTANT.NOTIFICATION.TEST_REASSIGN_DESCRIPTION,
      },
    );
  }

  async deleteUnusedTestScore(user: Provider, id: string) {
    await this.competencyTestScoreRepository.update(
      { id, provider: { id: user.id }, test_status: TEST_STATUS.pending },
      { deleted_at: new Date() },
    );
  }

  // Tracking the activity
  async reassignActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.PROVIDER,
  ) {
    const action_by_type: TABLE = req.user.role;
    const action_by_id: string = req.user.id;

    const activity = this.activityRepository.create({
      action_by_type,
      entity_id,
      [action_by_type]: action_by_id,
      activity_type,
      message,
      action_for,
    });
    await this.activityRepository.save(activity);
  }

  // role update activity
  async reassignActivityUpdateLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    includedKeys?: string[],
  ) {
    const changes = getUpdatedFields(
      oldData,
      newData,
      includedKeys, // include keys to track
      true,
    ) as string[];

    const changesList = changes as string[] | undefined;
    if (!changesList || changesList.length === 0) return;

    await this.reassignActivityLog(req, entity_id, activity_type, {
      changes: changesList,
    });
  }

  async getTestResponses(testId: string, providerId: string) {
    const responses = await this.competencyTestScoreRepository.find({
      where: {
        competency_test_setting: { id: testId },
        provider: { id: providerId },
        test_status: Not(TEST_STATUS.pending),
      },
      order: { updated_at: 'ASC' },
    });
    return plainToInstance(CompetencyTestResponse, responses);
  }
}
