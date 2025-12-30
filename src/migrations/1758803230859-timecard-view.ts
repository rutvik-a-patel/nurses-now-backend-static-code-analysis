import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimecardView1758803230859 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE VIEW invoice_timecards_view AS
        SELECT
            t.id,
            t.status,
            t.additional_details,
            t.base_url,
            t.provider_signature,
            t.authority_signature,
            t.rejected_date,
            fu.first_name || ' ' || fu.last_name AS rejected_by_name,
            fu.base_url || fu.image AS rejected_by_image,
            t.created_at,
            p.id AS provider_id,
            p.first_name || ' ' || p.last_name AS staff_name,
            p.base_url || p.profile_image AS staff_profile_image,
            s.id AS shift_id,
            s.clock_in,
            s.clock_out,
            s.total_worked,
            s.break_duration,
            f.name AS floor_name,
            s.pay_rate,
            s.bill_rate,
            s.time_adjustment AS adjustment,
            s.total_billable_amount,
            s.total_payable_amount,
            COALESCE(
                JSON_AGG(ts.base_url || ts.image) FILTER (
                    WHERE
                        ts.id IS NOT NULL
                ),
                '[]'
            ) AS timesheets
        FROM
            timecards t
            LEFT JOIN shift s ON s.id = t.shift_id
            AND s.deleted_at IS NULL
            LEFT JOIN time_sheets ts ON ts.timecard_id = t.id
            AND ts.deleted_at IS NULL
            LEFT JOIN provider p ON p.id = s.provider_id
            AND p.deleted_at IS NULL
            LEFT JOIN floor_detail f ON f.id = s.floor_id
            AND f.deleted_at IS NULL
            LEFT JOIN facility_user fu ON fu.id = t.rejected_by_id
            AND fu.deleted_at IS NULL
        GROUP BY
            t.id,
            fu.id,
            p.id,
            s.id,
            f.id;

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS invoice_timecards_view;`);
  }
}
