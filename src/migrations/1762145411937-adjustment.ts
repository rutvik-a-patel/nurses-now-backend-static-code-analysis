import { MigrationInterface, QueryRunner } from 'typeorm';

export class Adjustment1762145411937 implements MigrationInterface {
  name = 'Adjustment1762145411937';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "adjustment" numeric(10,2) NOT NULL DEFAULT '0'`,
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
            s.total_payable_amount,
	        s.total_billable_amount,
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
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "adjustment"`);
  }
}
