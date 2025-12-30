import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProviderList1753335642526 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE VIEW view_provider_list AS 
        SELECT
            "p"."id" AS id,
            "c"."id" AS certificate_id,
            "sp"."id" AS speciality_id,
            "s"."id" AS status_id,
            "p"."created_at" AS created_at,
            "p"."updated_at" AS updated_at,
            "p"."first_name" AS first_name,
            "p"."last_name" AS last_name,
            "p"."middle_name" AS middle_name,
            "p"."nick_name" AS nick_name,
            "p"."base_url" AS base_url,
            "p"."profile_image" AS profile_image,
            "p"."email" AS email,
            "p"."country_code" AS country_code,
            "p"."mobile_no" AS mobile_no,
            "p"."profile_status" AS profile_status,
            "p"."birth_date" AS birth_date,
            "p"."gender" AS gender,
            "p"."verification_status" AS verification_status,
            "p"."hire_date" AS hire_date,
            "p"."rehire_date" AS rehire_date,
            "p"."first_work_date" AS first_work_date,
            "p"."last_paid_date" AS last_paid_date,
            "sp"."abbreviation" AS speciality_name,
            "c"."abbreviation" AS certificate_name,
            "pa"."zip_code",
            "pa"."city",
            "pa"."state",
            (
                SELECT
                    MAX(token.login_at)
                FROM
                    token
                WHERE
                    token.provider_id = p.id
                GROUP BY
                    token.provider_id
            ) AS last_login,
            JSON_BUILD_OBJECT('id', "s"."id", 'name', "s"."name", 'description', "s"."description", 'background_color', "s"."background_color", 'text_color', s.text_color) AS status,
            JSON_BUILD_OBJECT('id', "c"."id", 'name', "c"."name", 'abbreviation', "c"."abbreviation", 'background_color', "c"."background_color", 'text_color', c.text_color) AS certificate,
            JSON_BUILD_OBJECT('id', "sp"."id", 'name', "sp"."name", 'abbreviation', "sp"."abbreviation", 'background_color', "sp"."background_color", 'text_color', sp.text_color) AS speciality,
            (
                SELECT
                    JSON_BUILD_OBJECT('zip_code', a.zip_code, 'city', a.city, 'state', a.state)
                FROM
                    provider_address a
                WHERE
                    a.provider_id = "p"."id"
                    AND a.deleted_at IS NULL
                    AND a.type = 'default'
                LIMIT
                    1
            ) AS address,
            (
                SELECT
                    COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id', "certificate".id, 'name', "certificate".name, 'abbreviation', "certificate".abbreviation, 'text_color', "certificate".text_color, 'background_color', "certificate".background_color)), '[]'::JSON) AS certificate
                FROM
                    UNNEST("p"."additional_certification") AS "additional_certification"
                    JOIN "certificate" ON "certificate".id = "additional_certification"
            ) AS additional_certification,
            (
                SELECT
                    COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id', "speciality".id, 'name', "speciality".name, 'abbreviation', "speciality".abbreviation, 'text_color', "speciality".text_color, 'background_color', "speciality".background_color)), '[]'::JSON) AS speciality
                FROM
                    UNNEST("p"."additional_speciality") AS "additional_speciality"
                    JOIN "speciality" ON "speciality".id = "additional_speciality"
            ) AS additional_speciality,
            (
                WITH RECURSIVE
                    date_series AS (
                        SELECT
                            current_date::date AS date
                        UNION ALL
                        SELECT
                            (date + INTERVAL '1 day')::date
                        FROM
                            date_series
                        WHERE
                            date < (current_date + INTERVAL '30 day')::date
                    )
                SELECT
                    TO_CHAR(date_series.date, 'YYYY-MM-DD') AS available_on
                FROM
                    date_series
                    LEFT JOIN (
                        SELECT
                            shift.start_date::date
                        FROM
                            shift
                        WHERE
                            shift.provider_id = p.id
                            AND shift.start_date >= current_date
                    ) AS shifts ON date_series.date = shifts.start_date
                WHERE
                    shifts.start_date IS NULL
                ORDER BY
                    date_series.date
                LIMIT
                    1
            ) AS available_on
        FROM
            "provider" "p"
            LEFT JOIN "certificate" "c" ON "c"."id" = "p"."certificate_id"
            AND ("c"."deleted_at" IS NULL)
            LEFT JOIN "status_setting" "s" ON "s"."id" = "p"."status"
            AND ("s"."deleted_at" IS NULL)
            LEFT JOIN "speciality" "sp" ON "sp"."id" = "p"."speciality_id"
            AND ("sp"."deleted_at" IS NULL)
            LEFT JOIN "provider_address" "pa" ON "pa"."provider_id" = "p"."id"
            AND "pa"."type" = 'default'
            AND "pa"."deleted_at" IS NULL
        WHERE
            "p"."deleted_at" IS NULL
        GROUP BY
            "p"."id",
            "s"."id",
            "c"."id",
            "sp"."id",
            "pa"."id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP VIEW IF EXISTS view_provider_list;
    `);
  }
}
