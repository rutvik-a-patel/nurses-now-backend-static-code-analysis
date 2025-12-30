import { Provider } from '@/provider/entities/provider.entity';
import { AUTO_ASSIGN, DEFAULT_STATUS } from '@/shared/constants/enum';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { SkillChecklistResponseDto } from './dto/skill-checklist-response.dto';
import { plainToInstance } from 'class-transformer';
import { SkillChecklistResponse } from './entities/skill-checklist-response.entity';
import { SkillChecklistAnswer } from './entities/skill-checklist-answers.entity';
import { SkillChecklistAnswerModule } from './entities/skill-checklist-answer-module.entity';
import { SkillChecklistQuestionAnswer } from './entities/skill-checklist-question-answer.entity';

@Injectable()
export class SkillChecklistModuleService {
  constructor(
    @InjectRepository(SkillChecklistTemplate)
    private readonly skillChecklistTemplateRepository: Repository<SkillChecklistTemplate>,
    @InjectRepository(SkillChecklistResponse)
    private readonly skillChecklistResponseRepository: Repository<SkillChecklistResponse>,
    @InjectRepository(SkillChecklistAnswer)
    private readonly skillChecklistAnswerRepository: Repository<SkillChecklistAnswer>,
    @InjectRepository(SkillChecklistAnswerModule)
    private readonly skillChecklistAnswerModuleRepository: Repository<SkillChecklistAnswerModule>,
    @InjectRepository(SkillChecklistQuestionAnswer)
    private readonly skillChecklistQuestionAnswerRepository: Repository<SkillChecklistQuestionAnswer>,
  ) {}

  async getSkillChecklistTemplate(
    user: Provider,
  ): Promise<SkillChecklistTemplate[]> {
    const queryBuilder = await this.skillChecklistTemplateRepository
      .createQueryBuilder('st')
      .innerJoin(
        'skill_checklist_module',
        'sm',
        'sm.skill_checklist_template_id = st.id',
      )
      .innerJoin(
        'credentials',
        'c',
        `c.credential_id = st.id AND ('${user.certificate.id}' = ANY(c.licenses) OR '${user.speciality.id}' = ANY(c.licenses))`,
      )
      .select([
        'st.id AS id',
        'st.name AS name',
        'c.licenses AS certificate_id',
        'st.status AS status',
        'st.created_at AS created_at',
        `JSON_AGG(
          JSON_BUILD_OBJECT(
            'id',
            sm.id,
            'topic_name',
            sm.name,
            'order',
            sm.order,
          'sub_topic',
            (
              SELECT
                JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id',
                    ssm.id,
                    'topic_name',
                    ssm.name,
                    'questions',
                    (
                      SELECT
                        JSON_AGG(JSON_BUILD_OBJECT('id', sq.id, 'question', sq.question, 'order', sq.order) ORDER BY sq.order ASC)
                      FROM
                        skill_checklist_question sq
                      WHERE
                        sq.skill_checklist_sub_module_id = ssm.id
                        AND sq.deleted_at IS NULL
                    )
                  )
                )
              FROM
                skill_checklist_sub_module ssm
              WHERE
                ssm.skill_checklist_module_id = sm.id
                AND ssm.deleted_at IS NULL
            )
          )
        ) AS skill_checklist_module`,
      ])
      .where(
        `(c.licenses @> :certificate_id OR c.licenses @> :specialty_id) AND st.status = :status AND c.is_essential = true AND c.auto_assign = :auto_assign`,
        {
          certificate_id: [user.certificate.id],
          specialty_id: [user.speciality.id],
          status: DEFAULT_STATUS.active,
          auto_assign: AUTO_ASSIGN.application_start,
        },
      )
      .groupBy('st.id, c.licenses, c.created_at')
      .orderBy('c.created_at', 'DESC');

    const data = await queryBuilder.getRawOne();

    return data;
  }

  async saveSkillChecklist(data: any, user: Provider) {
    const { skill_checklist_module = [] } = data;

    const checklist = await this.skillChecklistResponseRepository.findOne({
      where: {
        provider: { id: user.id },
        skill_checklist_template: { id: data.id },
      },
    });

    if (checklist) return;

    const skillChecklist = await this.skillChecklistResponseRepository.save({
      provider: { id: user.id },
      skill_checklist_template: { id: data.id },
      name: data.name,
    });

    await Promise.all(
      skill_checklist_module.map(
        async (module: {
          topic_name: string;
          order: number;
          sub_topic?: {
            topic_name: string;
            questions?: { question: string; order: number }[];
          }[];
        }) => {
          const savedModule = await this.skillChecklistAnswerRepository.save({
            module: module.topic_name,
            skill_checklist_response: { id: skillChecklist.id },
            order: module.order,
          });

          await Promise.all(
            (module.sub_topic || []).map(
              async (subTopic: {
                topic_name: string;
                order: number;
                questions?: { question: string; order: number }[];
              }) => {
                const subModule =
                  await this.skillChecklistAnswerModuleRepository.save({
                    sub_module: subTopic.topic_name,
                    skill_checklist_answer: savedModule,
                  });

                await Promise.all(
                  (subTopic.questions || []).map(
                    async (question: { question: string; order: number }) => {
                      await this.skillChecklistQuestionAnswerRepository.save({
                        question: question.question,
                        skill_checklist_answer_module: subModule,
                        order: question.order,
                      });
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  async getAssignedChecklist(user: Provider) {
    const dataArr = await this.skillChecklistResponseRepository.query(
      `SELECT * FROM view_skill_checklist_response WHERE provider_id = $1 LIMIT 1`,
      [user.id],
    );
    const data = dataArr[0] || null;

    if (data) {
      const modules = data.skill_checklist_module;
      const totalSectionProgress = modules.reduce(
        (sum, m) => sum + (Number(m.section_progress) || 0),
        0,
      );
      data.overall_progress = modules.length
        ? Math.round((totalSectionProgress / modules.length) * 100) / 100
        : 0;
    }

    return data;
  }

  async saveSkillChecklistAnswer(
    skillChecklistResponseDto: SkillChecklistResponseDto[],
  ) {
    const data = skillChecklistResponseDto.map((response) => {
      this.skillChecklistQuestionAnswerRepository.update(response.id, {
        answer: response.answer,
      });
    });

    await Promise.all(data);
  }

  async getSkillChecklistResponse(
    options: FindOneOptions<SkillChecklistResponse>,
  ) {
    const result = await this.skillChecklistResponseRepository.findOne(options);
    return plainToInstance(SkillChecklistResponse, result);
  }
}
