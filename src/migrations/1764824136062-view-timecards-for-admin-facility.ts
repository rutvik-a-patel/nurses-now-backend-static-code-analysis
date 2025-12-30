import { MigrationInterface, QueryRunner } from 'typeorm';

export class ViewTimecardsForAdminFacility1764824136062
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE VIEW public.timecard_list_view_for_admin_facility
                AS
                SELECT s.id AS shift_id,
                    s.shift_id AS shift_number,
                    s.provider_id,
                    (p.first_name::text || ' '::text) || p.last_name::text AS name,
                    p.base_url,
                    p.profile_image,
                    p.country_code,
                    p.mobile_no,
                    f.id AS facility_id,
                    f.name AS facility,
                    s.clock_in_date AS start_date,
                    s.clock_in AS start_time,
                    s.clock_out_date AS end_date,
                    s.clock_out AS end_time,
                    s.break_duration,
                    s.total_worked,
                    fl.name AS floor_name,
                    t.id AS timecard_id,
                    t.status AS timecard_status,
                    t.payment_status AS payment_status,
                    CASE WHEN t.status = 'invoiced'
                        THEN 'approved'::timecards_status_enum
                        ELSE t.status
                    END AS status,
                    t.created_at AS timecard_date
                FROM shift s
                    LEFT JOIN provider p ON p.id = s.provider_id AND p.deleted_at IS NULL
                    LEFT JOIN facility f ON f.id = s.facility_id AND f.deleted_at IS NULL
                    LEFT JOIN floor_detail fl ON s.floor_id = fl.id AND fl.deleted_at IS NULL
                    LEFT JOIN timecards t ON t.shift_id = s.id AND t.deleted_at IS NULL
                WHERE s.status = 'completed'::shift_status_enum AND s.deleted_at IS NULL
                ORDER BY t.created_at DESC NULLS LAST;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP VIEW IF EXISTS public.timecard_list_view_for_admin_facility;
        `);
  }
}
