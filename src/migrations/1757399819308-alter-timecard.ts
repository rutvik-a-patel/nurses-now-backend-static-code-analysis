import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTimecard1757399819308 implements MigrationInterface {
  name = 'AlterTimecard1757399819308';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS "timecard_list_view"`);
    await queryRunner.query(
      `ALTER TYPE "public"."timecards_status_enum" RENAME TO "timecards_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."timecards_status_enum" AS ENUM('disputed', 'flagged', 'approved', 'invoiced')`,
    );
    await queryRunner.query(
      `ALTER TABLE "timecards" ALTER COLUMN "status" TYPE "public"."timecards_status_enum" USING "status"::"text"::"public"."timecards_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."timecards_status_enum_old"`);
    await queryRunner.query(
      `CREATE OR REPLACE VIEW timecard_list_view AS
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
          t.created_at DESC NULLS LAST;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS "timecard_list_view"`);
    await queryRunner.query(
      `CREATE TYPE "public"."timecards_status_enum_old" AS ENUM('disputed', 'flagged', 'approved')`,
    );
    await queryRunner.query(
      `ALTER TABLE "timecards" ALTER COLUMN "status" TYPE "public"."timecards_status_enum_old" USING "status"::"text"::"public"."timecards_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."timecards_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."timecards_status_enum_old" RENAME TO "timecards_status_enum"`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE VIEW timecard_list_view AS
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
          t.created_at DESC NULLS LAST;`,
    );
  }
}
