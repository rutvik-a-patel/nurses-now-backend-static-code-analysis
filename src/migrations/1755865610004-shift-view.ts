import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShiftView1755865610004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE VIEW public.shift_dashboard_view
        AS
        SELECT s.id,
            s.shift_id AS shift_id,
            s.status AS status,
            get_shift_time_code(s.start_time, s.end_time, s.facility_id) AS shift_time_code,
            TO_CHAR(s.start_date, 'YYYY-MM-DD') AS start_date,
            TO_CHAR(s.end_date, 'YYYY-MM-DD') AS end_date,
            s.start_time AS start_time,
            s.end_time AS end_time,
            s.created_at AS created_at,
            p.id AS provider_id,
            (p.first_name::text || ' '::text) || p.last_name::text AS staff_name,
            f.id AS facility_id,
            c.id AS certificate_id,
            sp.id AS speciality_id,
            CASE
                      WHEN s.status IN ('scheduled', 'completed', 'ongoing', 'running_late') THEN p.first_name
                      ELSE NULL
                    END AS provider_first_name,
                    CASE
                        WHEN s.created_by_type = 'admin' THEN a.first_name
                        WHEN s.created_by_type = 'facility_user' THEN fu.first_name
                        WHEN s.created_by_type = 'facility' THEN f.name
                        ELSE NULL
                      END AS created_by_name,
                    CASE
                      WHEN fl.id IS NULL THEN '{}'::jsonb
                      ELSE jsonb_build_object(
                        'id', fl.id,
                        'name', fl.name
                      )
                    END AS floor,
                    CASE 
                      WHEN s.created_by_type::text IN ('facility', 'facility_user') THEN 'Facility Portal'
                      WHEN s.created_by_type::text = 'admin' THEN 'Master Admin'
                      ELSE s.created_by_type::text
                    END AS created_by_type,
                    CASE
                      WHEN s.status IN ('scheduled', 'completed', 'ongoing', 'running_late') THEN
                        jsonb_build_object(
                          'id', p.id,
                          'base_url', p.base_url,
                          'profile_image', p.profile_image,
                          'first_name', p.first_name,
                          'last_name', p.last_name
                        )
                      ELSE NULL
                    END AS provider,
                    jsonb_build_object(
                      'id', f.id,
                      'name', f.name,
                      'base_url', f.base_url,
                      'image', f.image,
                      'latitude', f.latitude,
                      'longitude', f.longitude
                    ) AS facility,
                    jsonb_build_object(
                      'id', fu.id,
                      'first_name', fu.first_name,
                      'last_name', fu.last_name,
                      'base_url', fu.base_url,
                      'image', fu.image
                    ) AS follower,
                    jsonb_build_object(
                      'id', c.id,
                      'name', c.name,
                      'abbreviation', c.abbreviation,
                      'text_color', c.text_color, 
                      'background_color', c.background_color
                    ) AS certificate,
                    jsonb_build_object(
                      'id', sp.id,
                      'name', sp.name,
                      'abbreviation', sp.abbreviation,
                      'text_color', sp.text_color, 
                      'background_color', sp.background_color
                    ) AS speciality,
                    COALESCE((
                      SELECT COUNT(*) 
                      FROM shift_request sr 
                      WHERE sr.shift_id = s.id AND deleted_at IS NULL
                    ), 0)::INTEGER AS total_requests,
                    (
                      COALESCE(
                        (
                          SELECT
                            COUNT(*)
                          FROM
                            shift_request sr
                          WHERE
                            sr.shift_id = s.id
                            AND sr.deleted_at IS NULL
                        ),
                        0
                      ) + COALESCE(
                        (
                          SELECT
                            COUNT(*)
                          FROM
                            shift_invitation si
                          WHERE
                            si.shift_id = s.id
                            AND si.deleted_at IS NULL
                        ),
                        0
                      )
                    )::INTEGER AS invite_requests_count,
                    CASE 
                      WHEN s.created_by_type = 'admin' THEN jsonb_build_object(
                        'id', a.id,
                        'base_url', a.base_url,
                        'image', a.image,
                        'first_name', a.first_name,
                        'last_name', a.last_name,
                        'type', 'admin'
                      )
                      WHEN s.created_by_type = 'facility_user' THEN jsonb_build_object(
                        'id', fu.id,
                        'base_url', fu.base_url,
                        'image', fu.image,
                        'first_name', fu.first_name,
                        'last_name', fu.last_name,
                        'type', 'facility_user'
                      )
                      ELSE NULL
                    END AS ordered_by,
            COALESCE((( SELECT count(*) AS count
                FROM shift_invitation si
                WHERE si.shift_id = s.id AND si.deleted_at IS NULL)) + (( SELECT count(*) AS count
                FROM shift_request sr
                WHERE sr.shift_id = s.id AND sr.deleted_at IS NULL)), 0::bigint)::integer AS total_invites
        FROM shift s
            LEFT JOIN provider p ON s.provider_id = p.id AND p.deleted_at IS NULL
            LEFT JOIN facility f ON s.facility_id = f.id AND f.deleted_at IS NULL
            LEFT JOIN certificate c ON s.certificate_id = c.id AND c.deleted_at IS NULL
            LEFT JOIN speciality sp ON s.speciality_id = sp.id AND sp.deleted_at IS NULL
            LEFT JOIN admin a ON s.created_by_id = a.id AND a.deleted_at IS NULL
            LEFT JOIN facility_user fu ON s.follower_id = fu.id AND fu.deleted_at IS NULL
            LEFT JOIN floor_detail fl ON s.floor_id = fl.id AND fl.deleted_at IS NULL
        WHERE s.deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP VIEW IF EXISTS public.shift_dashboard_view;
    `);
  }
}
