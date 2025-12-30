import { MigrationInterface, QueryRunner } from 'typeorm';

export class RateGroups1760429640994 implements MigrationInterface {
  name = 'RateGroups1760429640994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."rate_sheets_day_type_enum" AS ENUM('weekend', 'weekday')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rate_sheets_shift_time_enum" AS ENUM('D', 'E', 'N', 'A', 'P')`,
    );
    await queryRunner.query(
      `CREATE TABLE "rate_sheets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "day_type" "public"."rate_sheets_day_type_enum" NOT NULL, "shift_time" "public"."rate_sheets_shift_time_enum" NOT NULL, "reg_pay" numeric(10,2) NOT NULL DEFAULT '0', "reg_bill" numeric(10,2) NOT NULL DEFAULT '0', "ot_bill" numeric(10,2) NOT NULL DEFAULT '0', "premium_pay" numeric(10,2) NOT NULL DEFAULT '0', "rate_group_id" uuid, "certificate_id" uuid, CONSTRAINT "PK_cd87c932266aa4f1e4d5dd8dfff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3393218199ab4c5f200c4f2f7" ON "rate_sheets" ("rate_group_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_67b23aadae850393803ed807d6" ON "rate_sheets" ("certificate_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rate_groups_weekend_pay_start_day_enum" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rate_groups_weekend_pay_end_day_enum" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rate_groups_weekend_bill_start_day_enum" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rate_groups_weekend_bill_end_day_enum" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rate_groups_overtime_bill_type_enum" AS ENUM('multiplier', 'additional_amount')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rate_groups_premium_pay_type_enum" AS ENUM('multiplier', 'additional_amount')`,
    );
    await queryRunner.query(
      `CREATE TABLE "rate_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "holiday_pay" numeric(10,2) NOT NULL DEFAULT '0', "holiday_bill" numeric(10,2) NOT NULL DEFAULT '0', "weekend_pay_start_day" "public"."rate_groups_weekend_pay_start_day_enum" NOT NULL DEFAULT 'friday', "weekend_pay_start_time" TIME NOT NULL DEFAULT '00:00:00', "weekend_pay_end_day" "public"."rate_groups_weekend_pay_end_day_enum" NOT NULL DEFAULT 'sunday', "weekend_pay_end_time" TIME NOT NULL DEFAULT '00:00:00', "weekend_bill_start_day" "public"."rate_groups_weekend_bill_start_day_enum" NOT NULL DEFAULT 'friday', "weekend_bill_start_time" TIME NOT NULL DEFAULT '00:00:00', "weekend_bill_end_day" "public"."rate_groups_weekend_bill_end_day_enum" NOT NULL DEFAULT 'friday', "weekend_bill_end_time" TIME NOT NULL DEFAULT '00:00:00', "overtime_bill_after_hours" integer NOT NULL DEFAULT '0', "overtime_bill_calculation" numeric(10,2) NOT NULL DEFAULT '0', "overtime_bill_type" "public"."rate_groups_overtime_bill_type_enum" NOT NULL DEFAULT 'multiplier', "premium_pay" numeric(10,2) NOT NULL DEFAULT '0', "premium_pay_type" "public"."rate_groups_premium_pay_type_enum" NOT NULL DEFAULT 'multiplier', "facility_id" uuid, CONSTRAINT "REL_212ba036be27858a471deed5a8" UNIQUE ("facility_id"), CONSTRAINT "PK_913e4d25317841e362d526423c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_212ba036be27858a471deed5a8" ON "rate_groups" ("facility_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_sheets" ADD CONSTRAINT "FK_a3393218199ab4c5f200c4f2f7a" FOREIGN KEY ("rate_group_id") REFERENCES "rate_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_sheets" ADD CONSTRAINT "FK_67b23aadae850393803ed807d60" FOREIGN KEY ("certificate_id") REFERENCES "certificate"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD CONSTRAINT "FK_212ba036be27858a471deed5a83" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE VIEW rate_list AS
        SELECT
          r.rate_group_id AS id,
          c.id AS certificate_id,
          c.abbreviation AS certificate_name,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',
              r.id,
              'day_type',
              r.day_type,
              'shift_time',
              r.shift_time,
              'reg_pay',
              r.reg_pay,
              'reg_bill',
              r.reg_bill,
              'ot_bill',
              r.ot_bill,
              'ot_pay',
              r.ot_pay,
              'premium_pay',
              r.premium_pay,
              'premium_bill',
              r.premium_bill
            )
          ) AS rate_sheet
        FROM
          rate_sheets r
          LEFT JOIN certificate c ON c.id = r.certificate_id
          AND c.deleted_at IS NULL
        WHERE
          r.deleted_at IS NULL
        GROUP BY
          c.id,
          r.rate_group_id;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP CONSTRAINT "FK_212ba036be27858a471deed5a83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_sheets" DROP CONSTRAINT "FK_67b23aadae850393803ed807d60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_sheets" DROP CONSTRAINT "FK_a3393218199ab4c5f200c4f2f7a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_212ba036be27858a471deed5a8"`,
    );
    await queryRunner.query(`DROP TABLE "rate_groups"`);
    await queryRunner.query(
      `DROP TYPE "public"."rate_groups_premium_pay_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."rate_groups_overtime_bill_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."rate_groups_weekend_bill_end_day_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."rate_groups_weekend_bill_start_day_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."rate_groups_weekend_pay_end_day_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."rate_groups_weekend_pay_start_day_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_67b23aadae850393803ed807d6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3393218199ab4c5f200c4f2f7"`,
    );
    await queryRunner.query(`DROP TABLE "rate_sheets"`);
    await queryRunner.query(`DROP TYPE "public"."rate_sheets_shift_time_enum"`);
    await queryRunner.query(`DROP TYPE "public"."rate_sheets_day_type_enum"`);
  }
}
