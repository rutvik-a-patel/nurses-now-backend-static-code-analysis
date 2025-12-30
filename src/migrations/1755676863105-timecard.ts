import { MigrationInterface, QueryRunner } from 'typeorm';

export class Timecard1755676863105 implements MigrationInterface {
  name = 'Timecard1755676863105';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_aee7a5c79ad76a473b613712c7d"`,
    );
    await queryRunner.query(
      `CREATE TABLE "time_sheets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "base_url" character varying, "image" character varying, "timecard_id" uuid, CONSTRAINT "PK_bcab34f5b9722b1fd4d077b7298" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."timecards_status_enum" AS ENUM('disputed', 'flagged', 'approved')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."timecards_approved_by_type_enum" AS ENUM('admin', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."timecards_rejected_by_type_enum" AS ENUM('admin', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "timecards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."timecards_status_enum" NOT NULL, "additional_details" text, "approved_date" TIMESTAMP WITH TIME ZONE, "approved_by_type" "public"."timecards_approved_by_type_enum", "rejection_description" text, "approved_by_id" uuid, "rejected_date" TIMESTAMP WITH TIME ZONE, "rejected_by_id" uuid, "rejected_by_type" "public"."timecards_rejected_by_type_enum", "provider_signature" character varying, "authority_signature" character varying, "timecard_reject_reason_id" uuid, "shift_id" uuid, CONSTRAINT "REL_fe8c3c42cbbdeb0ace9a9ff0fd" UNIQUE ("shift_id"), CONSTRAINT "PK_98f8fb8cea2c8a8be0b08a98d5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "timecard_rejected_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "timecard_rejected_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "timecard_approve_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "timecard_approve_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "timecard_approve_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_timecard_approve_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "timecard_reject_reason_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "timecard_status"`,
    );
    await queryRunner.query(`DROP TYPE "public"."shift_timecard_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "authority_signature"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "provider_signature"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "timecard_rejected_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_timecard_rejected_type_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "time_sheets"`);
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "additional_details"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "timecard_reject_reason_description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_sheets" ADD CONSTRAINT "FK_728a09f05a680404c90585c8f00" FOREIGN KEY ("timecard_id") REFERENCES "timecards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timecards" ADD CONSTRAINT "FK_4e9c6d42d58da581a3220f3ec83" FOREIGN KEY ("timecard_reject_reason_id") REFERENCES "timecard_reject_reason"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timecards" ADD CONSTRAINT "FK_fe8c3c42cbbdeb0ace9a9ff0fd0" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS timecard_list_view`);
    await queryRunner.query(
      `ALTER TABLE "timecards" DROP CONSTRAINT "FK_fe8c3c42cbbdeb0ace9a9ff0fd0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timecards" DROP CONSTRAINT "FK_4e9c6d42d58da581a3220f3ec83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_sheets" DROP CONSTRAINT "FK_728a09f05a680404c90585c8f00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "timecard_reject_reason_description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "additional_details" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "time_sheets" character varying array`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_timecard_rejected_type_enum" AS ENUM('admin', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "timecard_rejected_type" "public"."shift_timecard_rejected_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "provider_signature" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "authority_signature" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_timecard_status_enum" AS ENUM('pending', 'invoiced', 'disputed', 'resolved')`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "timecard_status" "public"."shift_timecard_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "timecard_reject_reason_id" uuid`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_timecard_approve_type_enum" AS ENUM('admin', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "timecard_approve_type" "public"."shift_timecard_approve_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "timecard_approve_by_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "timecard_approve_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "timecard_rejected_by_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "timecard_rejected_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`DROP TABLE "timecards"`);
    await queryRunner.query(
      `DROP TYPE "public"."timecards_rejected_by_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."timecards_approved_by_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."timecards_status_enum"`);
    await queryRunner.query(`DROP TABLE "time_sheets"`);
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_aee7a5c79ad76a473b613712c7d" FOREIGN KEY ("timecard_reject_reason_id") REFERENCES "timecard_reject_reason"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
