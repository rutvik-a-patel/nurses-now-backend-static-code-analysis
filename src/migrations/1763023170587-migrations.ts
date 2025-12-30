import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1763023170587 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE VIEW dnr_report AS
      SELECT
        fp.id AS id,
        fp.dnr_type::CHARACTER VARYING AS dnr_type,
        fp.created_at AS created_at,
        fp.dnr_at AS dnr_at,
        fp.updated_at AS updated_at,
        fp.flag::CHARACTER VARYING AS flag,
        fp.created_by_id AS created_by_id,
        fp.created_by_type AS created_by_type,
        (
            CASE
                WHEN fp.created_by_type = 'facility_user' THEN (
                    JSONB_BUILD_OBJECT(
                        'id',
                        cb_fu.id,
                        'first_name',
                        cb_fu.first_name,
                        'last_name',
                        cb_fu.last_name,
                        'base_url',
                        cb_fu.base_url,
                        'image',
                        cb_fu.image,
                        'created_by_type',
                        fp.created_by_type
                    )
                )::TEXT
                WHEN fp.created_by_type = 'admin' THEN (
                    JSONB_BUILD_OBJECT(
                        'id',
                        cb_admin.id,
                        'first_name',
                        cb_admin.first_name,
                        'last_name',
                        cb_admin.last_name,
                        'base_url',
                        cb_admin.base_url,
                        'image',
                        cb_admin.image,
                        'created_by_type',
                        fp.created_by_type
                    )
                )::TEXT
                ELSE NULL
            END
        )::JSONB AS created_by,
        JSONB_BUILD_OBJECT(
            'id',
            p.id,
            'first_name',
            p.first_name,
            'middle_name',
            p.middle_name,
            'last_name',
            p.last_name,
            'profile_image',
            p.profile_image,
            'base_url',
            p.base_url,
            'status',
            s.name,
            'status_id',
            s.id,
            'text_color',
            s.text_color,
            'background_color',
            s.background_color,
            'certificate',
            JSONB_BUILD_OBJECT(
                'id',
                c.id,
                'name',
                c.name,
                'abbreviation',
                c.abbreviation
            )
        ) AS provider,
        JSONB_BUILD_OBJECT(
            'id',
            f.id,
            'name',
            f.name,
            'status',
            JSONB_BUILD_OBJECT('id', fs.id, 'name', fs.name, 'text_color', fs.text_color, 'background_color', fs.background_color),
            'base_url',
            f.base_url,
            'image',
            f.image,
            'facility_type',
            JSONB_BUILD_OBJECT('id', ft.id, 'name', ft.name)
        ) AS facility,
        JSONB_BUILD_OBJECT(
            'id',
            dr.id,
            'reason',
            dr.reason,
            'dnr_description',
            fp.dnr_description
        ) AS dnr_reason
    FROM
        facility_provider fp
        INNER JOIN provider p ON p.id = fp.provider_id
        AND fp.deleted_at IS NULL
        LEFT JOIN certificate c ON c.id = p.certificate_id
        AND c.deleted_at IS NULL
        LEFT JOIN facility f ON f.id = fp.facility_id
        AND f.deleted_at IS NULL
        LEFT JOIN status_setting s ON s.id = p.status
        AND s.deleted_at IS NULL
        LEFT JOIN status_setting fs ON fs.id = f.status
        AND fs.deleted_at IS NULL
        LEFT JOIN line_of_business ft ON ft.id = f.facility_type_id
        AND ft.deleted_at IS NULL
        LEFT JOIN dnr_reason dr ON dr.id::UUID = ANY (fp.dnr_reason)
        AND dr.deleted_at IS NULL
        LEFT JOIN "admin" cb_admin ON cb_admin.id::TEXT = fp.created_by_id::TEXT
        AND fp.created_by_type = 'admin'
        LEFT JOIN "facility_user" cb_fu ON cb_fu.id::TEXT = fp.created_by_id::TEXT
        AND fp.created_by_type = 'facility_user'
    WHERE
        fp.flag::TEXT = 'dnr'
        AND fp.flag IS NOT NULL
    UNION
    SELECT
        fp.id AS id,
        (
            CASE
                WHEN self_dnr = TRUE THEN 'self'
                ELSE ''
            END
        ) AS dnr_type,
        fp.created_at AS created_at,
        fp.self_dnr_at AS dnr_at,
        fp.updated_at AS updated_at,
        (
            CASE
                WHEN self_dnr = TRUE THEN 'self'
                ELSE ''
            END
        ) AS flag,
        p.id AS created_by_id,
        'provider' AS created_by_type,
        JSONB_BUILD_OBJECT(
            'id',
            p.id,
            'first_name',
            p.first_name,
            'last_name',
            p.last_name,
            'base_url',
            p.base_url,
            'image',
            p.profile_image,
            'created_by_type',
            fp.created_by_type
        ) AS created_by,
        JSONB_BUILD_OBJECT(
            'id',
            p.id,
            'first_name',
            p.first_name,
            'middle_name',
            p.middle_name,
            'last_name',
            p.last_name,
            'profile_image',
            p.profile_image,
            'base_url',
            p.base_url,
            'status',
            s.name,
            'status_id',
            s.id,
            'text_color',
            s.text_color,
            'background_color',
            s.background_color,
            'certificate',
            JSONB_BUILD_OBJECT(
                'id',
                c.id,
                'name',
                c.name,
                'abbreviation',
                c.abbreviation
            )
        ) AS provider,
        JSONB_BUILD_OBJECT(
            'id',
            f.id,
            'name',
            f.name,
            'status',
            JSONB_BUILD_OBJECT('id', fs.id, 'name', fs.name, 'text_color', fs.text_color, 'background_color', fs.background_color),
            'base_url',
            f.base_url,
            'image',
            f.image,
            'facility_type',
            JSONB_BUILD_OBJECT('id', ft.id, 'name', ft.name)
        ) AS facility,
        null AS dnr_reason
    FROM
        facility_provider fp
        INNER JOIN provider p ON p.id = fp.provider_id
        AND fp.deleted_at IS NULL
        LEFT JOIN certificate c ON c.id = p.certificate_id
        AND c.deleted_at IS NULL
        LEFT JOIN facility f ON f.id = fp.facility_id
        AND f.deleted_at IS NULL
        LEFT JOIN status_setting s ON s.id = p.status
        AND s.deleted_at IS NULL
        LEFT JOIN status_setting fs ON fs.id = f.status
        AND fs.deleted_at IS NULL
        LEFT JOIN line_of_business ft ON ft.id = f.facility_type_id
        AND ft.deleted_at IS NULL
        LEFT JOIN dnr_reason dr ON dr.id::UUID = ANY (fp.dnr_reason)
        AND dr.deleted_at IS NULL
    WHERE
        fp.self_dnr = TRUE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS "dnr_report"`);
  }
}
