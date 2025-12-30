import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1763354078457 implements MigrationInterface {
  name = 'Migrations1763354078457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "time_adjustment" bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "break_duration" CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "break_duration" bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "total_worked" CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "total_worked" bigint NOT NULL DEFAULT '0'`,
    );
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
    await queryRunner.query(`
        CREATE OR REPLACE VIEW timecard_list_view AS
        SELECT
          s.id AS shift_id,
          s.shift_id AS shift_number,
          s.provider_id AS provider_id,
          p.first_name || ' ' || p.last_name AS name,
          p.base_url AS base_url,
          p.profile_image AS profile_image,
          p.country_code AS country_code,
          p.mobile_no AS mobile_no,
          f.id AS facility_id,
          f.name AS facility,
          f.base_url AS facility_base_url,
          f.image AS facility_image,
          s.clock_in_date AS start_date,
          s.clock_in AS start_time,
          s.clock_out_date AS end_date,
          s.clock_out AS end_time,
          s.break_duration AS break_duration,
          s.total_worked AS total_worked,
          fl.name AS floor_name,
          t.id AS timecard_id,
          t.status AS timecard_status,
          t.payment_status AS payment_status,
          t.created_at AS timecard_date
        FROM
          shift s
          LEFT JOIN provider p ON p.id = s.provider_id
          AND p.deleted_at IS NULL
          LEFT JOIN facility f ON f.id = s.facility_id
          AND f.deleted_at IS NULL
          LEFT JOIN floor_detail fl ON s.floor_id = fl.id
          AND fl.deleted_at IS NULL
          LEFT JOIN timecards t ON t.shift_id = s.id
          AND t.deleted_at IS NULL
        WHERE
          s.status = 'completed'
          AND s.deleted_at IS NULL
        ORDER BY
          t.created_at DESC NULLS LAST;
    `);
    await queryRunner.query(
      `CREATE OR REPLACE VIEW invoice_details AS
        SELECT
          i.id AS id,
          i.invoice_number,
          TO_CHAR(i.created_at, 'YYYY-MM-DD') AS issue_date,
          TO_CHAR(i.billed_date, 'YYYY-MM-DD') AS billed_date,
          TO_CHAR(i.billing_cycle_start_date, 'YYYY-MM-DD') AS billing_cycle_start_date,
          TO_CHAR(i.billing_cycle_end_date, 'YYYY-MM-DD') AS billing_cycle_end_date,
          i.total::DOUBLE PRECISION AS subtotal,
          i.tax::DOUBLE PRECISION AS tax,
          (i.total + i.tax)::DOUBLE PRECISION AS total,
          f.id AS facility_id,
          f.name AS facility_name,
          f.street_address,
          (select s.invoice_due from accounting_setting s where s.facility_id = i.facility_id) as payment_terms,
          f.house_no,
          f.zip_code,
          f.city,
          f.state,
          (
            SELECT
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id',
                  t.id,
                  'date',
                  s.start_date,
                  'staff',
                  CONCAT(p.first_name, ' ', p.last_name),
                  'certificate',
                  c.abbreviation,
                  'speciality',
                  sp.abbreviation,
                  'start_time',
                  s.start_time,
                  'end_time',
                  s.end_time,
                  'clock_in',
                  s.clock_in,
                  'clock_out',
                  s.clock_out,
                  'break_duration',
                  s.break_duration,
                  'rate',
                  s.bill_rate,
                  'hours',
                  s.total_worked,
                  'total',
                  s.total_billable_amount
                )
              )
            FROM
              invoice_timecards it
              JOIN timecards t ON t.id = it.timecard_id
              AND t.deleted_at IS NULL
              JOIN shift s ON s.id = t.shift_id
              AND s.deleted_at IS NULL
              JOIN provider p ON p.id = s.provider_id
              AND p.deleted_at IS NULL
              JOIN certificate c ON c.id = s.certificate_id
              AND c.deleted_at IS NULL
              JOIN speciality sp ON sp.id = s.speciality_id
              AND sp.deleted_at IS NULL
            WHERE
              it.invoice_id = i.id
              AND it.deleted_at IS NULL
          ) AS timecards
        FROM
          invoices i
          LEFT JOIN facility f ON f.id = i.facility_id
          AND f.deleted_at IS NULL
        WHERE
          i.deleted_at IS NULL;`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE VIEW timecard_details AS
        SELECT
            s.id AS id,
            s.shift_id AS shift_id,
            s.start_date AS start_date,
            s.clock_in AS clock_in,
            s.clock_out AS clock_out,
            s.break_duration AS break_duration,
            s.total_worked AS total_worked,
            s.pay_rate AS pay_rate,
            s.bill_rate AS bill_rate,
            s.time_adjustment AS adjustment,
            -- Provider
            JSONB_BUILD_OBJECT(
                'id',
                p.id,
                'first_name',
                p.first_name,
                'last_name',
                p.last_name,
                'base_url',
                p.base_url,
                'profile_image',
                p.profile_image
            ) AS provider,
            -- Facility
            JSONB_BUILD_OBJECT(
                'id',
                f.id,
                'name',
                f.name,
                'timezone',
                f.timezone
            ) AS facility,
            -- Floor
            JSONB_BUILD_OBJECT('id', fl.id, 'name', fl.name) AS floor,
            -- Time Card (with approved_by_id & rejected_by_id optimized)
            JSONB_BUILD_OBJECT(
                'id',
                tc.id,
                'created_at',
                tc.created_at,
                'status',
                tc.status,
                'additional_details',
                tc.additional_details,
                'approved_date',
                tc.approved_date,
                -- Approval Info
                'approved_by_type',
                tc.approved_by_type,
                'tc',
                CASE
                    WHEN tc.approved_by_type = 'admin' THEN (
                        SELECT
                            TO_JSONB(a)
                        FROM
                            (
                                SELECT
                                    id,
                                    first_name,
                                    last_name,
                                    base_url,
                                    image
                                FROM
                                    admin
                                WHERE
                                    admin.id = tc.approved_by_id
                            ) a
                    )
                    WHEN tc.approved_by_type = 'facility_user' THEN (
                        SELECT
                            TO_JSONB(fu)
                        FROM
                            (
                                SELECT
                                    id,
                                    first_name,
                                    last_name,
                                    base_url,
                                    image
                                FROM
                                    facility_user
                                WHERE
                                    facility_user.id = tc.approved_by_id
                            ) fu
                    )
                    ELSE NULL
                END,
                -- Disputed Info
                'disputed_date',
                tc.rejected_date,
                'disputed_by_type',
                tc.rejected_by_type,
                'disputed_by',
                CASE
                    WHEN tc.rejected_by_type = 'admin' THEN (
                        SELECT
                            TO_JSONB(a)
                        FROM
                            (
                                SELECT
                                    id,
                                    first_name,
                                    last_name,
                                    base_url,
                                    image
                                FROM
                                    admin
                                WHERE
                                    admin.id = tc.rejected_by_id
                            ) a
                    )
                    WHEN tc.rejected_by_type = 'facility_user' THEN (
                        SELECT
                            TO_JSONB(fu)
                        FROM
                            (
                                SELECT
                                    id,
                                    first_name,
                                    last_name,
                                    base_url,
                                    image
                                FROM
                                    facility_user
                                WHERE
                                    facility_user.id = tc.rejected_by_id
                            ) fu
                    )
                    WHEN tc.rejected_by_type = 'facility' THEN (
                        SELECT
                            TO_JSONB(f)
                        FROM
                            (
                                SELECT
                                    id,
                                    name,
                                    base_url,
                                    image
                                FROM
                                    facility
                                WHERE
                                    facility.id = tc.rejected_by_id
                            ) f
                    )
                    ELSE NULL
                END,
                'provider_signature',
                tc.provider_signature,
                'authority_signature',
                tc.authority_signature,
                -- Time sheets
                'time_sheets',
                (
                    SELECT
                        COALESCE(
                            JSONB_AGG(
                                JSONB_BUILD_OBJECT(
                                    'id',
                                    ts.id,
                                    'base_url',
                                    ts.base_url,
                                    'image',
                                    ts.image
                                )
                            ),
                            '[]'::JSONB
                        )
                    FROM
                        time_sheets ts
                    WHERE
                        ts.timecard_id = tc.id
                ),
                -- Reject reason
                'timecard_reject_reason',
                CASE
                    WHEN trr.id IS NOT NULL THEN JSONB_BUILD_OBJECT(
                        'id',
                        trr.id,
                        'reason',
                        trr.reason,
                        'description',
                        tc.rejection_description
                    )
                    ELSE NULL
                END
            ) AS time_card
        FROM
            shift s
            LEFT JOIN provider p ON p.id = s.provider_id
            AND p.deleted_at IS NULL
            LEFT JOIN facility f ON f.id = s.facility_id
            AND f.deleted_at IS NULL
            LEFT JOIN floor_detail fl ON fl.id = s.floor_id
            AND fl.deleted_at IS NULL
            LEFT JOIN timecards tc ON tc.shift_id = s.id
            AND tc.deleted_at IS NULL
            LEFT JOIN time_sheets ts ON ts.timecard_id = tc.id
            AND ts.deleted_at IS NULL
            LEFT JOIN timecard_reject_reason trr ON trr.id = tc.timecard_reject_reason_id
            AND trr.deleted_at IS NULL
        WHERE
            s.deleted_at IS NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS timecard_details`);
    await queryRunner.query(`DROP VIEW IF EXISTS invoice_details`);
    await queryRunner.query(`DROP VIEW IF EXISTS timecard_list_view`);
    await queryRunner.query(`DROP VIEW IF EXISTS invoice_timecards_view`);
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "total_worked"`);
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "total_worked" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "break_duration"`);
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "break_duration" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "time_adjustment"`,
    );
  }
}
