import { MigrationInterface, QueryRunner } from 'typeorm';

export class ViewSkillChecklist1754548502020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE VIEW public.view_skill_checklist_for_facility AS
        SELECT
            scr.id,
            scr.name,
            scr.provider_id,
            scr.created_at,
            'completed' AS status,
            (
                SELECT
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id',
                            sca.id,
                            'section_progress',
                            ROUND(
                                (
                                    (
                                        SELECT
                                            COUNT(scqa.id) AS count
                                        FROM
                                            skill_checklist_question_answer scqa
                                            LEFT JOIN skill_checklist_answer_module am ON am.id = scqa.skill_checklist_answer_module_id
                                        WHERE
                                            am.skill_checklist_answer_id = sca.id
                                            AND scqa.answer IS NOT NULL
                                    )
                                )::NUMERIC * 100.0 / NULLIF(
                                    (
                                        SELECT
                                            COUNT(scqa.id) AS count
                                        FROM
                                            skill_checklist_question_answer scqa
                                            LEFT JOIN skill_checklist_answer_module am ON am.id = scqa.skill_checklist_answer_module_id
                                        WHERE
                                            am.skill_checklist_answer_id = sca.id
                                    ),
                                    0
                                )::NUMERIC,
                                2
                            )
                            )
                    ) AS json_agg
                FROM
                    (
                        SELECT
                            skill_checklist_answer.id,
                            skill_checklist_answer.skill_checklist_response_id
                        FROM
                            skill_checklist_answer
                        WHERE
                            skill_checklist_answer.skill_checklist_response_id = scr.id
                    ) sca
            ) AS skill_checklist_module
        FROM
	        skill_checklist_response scr;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP VIEW IF EXISTS public.view_skill_checklist_for_facility;`,
    );
  }
}
