import { MigrationInterface, QueryRunner } from 'typeorm';

export class StaffView1755663797948 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE VIEW public.view_provider_list_admin AS
        SELECT
            p.id,
            p.created_at,
            p.updated_at,
            (p.first_name::TEXT || ' '::TEXT) || p.last_name::TEXT AS name,
            p.base_url,
            p.profile_image,
            p.email,
            p.country_code,
            p.mobile_no,
            p.verification_status,
            p.first_work_date,
            p.last_paid_date,
            ROUND(p.profile_progress, 0) AS profile_progress,
            sp.id AS speciality_id,
            sp.abbreviation AS speciality,
            c.id AS certificate_id,
            c.abbreviation AS certificate,
            s.id AS status_id,
            s.name AS status,
            s.background_color,
            s.text_color,
            pa.zip_code,
            pa.city,
            pa.state,
            (
                SELECT
                    MAX(token.login_at) AS max
                FROM
                    token
                WHERE
                    token.provider_id = p.id
                GROUP BY
                    token.provider_id
            ) AS last_login,
            (
                SELECT
                    JSON_BUILD_OBJECT(
                        'id',
                        pr.id,
                        'name',
                        (pr.first_name::TEXT || ' '::TEXT) || pr.last_name::TEXT,
                        'base_url',
                        pr.base_url,
                        'profile_image',
                        pr.profile_image
                    ) AS json_build_object
                FROM
                    provider pr
                WHERE
                    id = (
                        SELECT
                            rf.referred_by
                        FROM
                            refer_friend rf
                        WHERE
                            rf.email = p.email
                            AND rf.status <> 'invited'::refer_friend_status_enum
                        ORDER BY
                            rf.created_at ASC
                        LIMIT
                            1
                    )
            ) AS referred_by
        FROM
            provider p
            LEFT JOIN certificate c ON c.id = p.certificate_id
            AND c.deleted_at IS NULL
            LEFT JOIN status_setting s ON s.id = p.status
            AND s.deleted_at IS NULL
            LEFT JOIN speciality sp ON sp.id = p.speciality_id
            AND sp.deleted_at IS NULL
            LEFT JOIN provider_address pa ON pa.provider_id = p.id
            AND pa.type = 'default'::provider_address_type_enum
            AND pa.deleted_at IS NULL
        WHERE
            p.deleted_at IS NULL
        GROUP BY
            p.id,
            s.id,
            c.id,
            sp.id,
            pa.id;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP VIEW IF EXISTS view_provider_list_admin
      `);
  }
}
