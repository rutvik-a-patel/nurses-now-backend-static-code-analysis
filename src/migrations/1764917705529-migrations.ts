import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1764917705529 implements MigrationInterface {
  name = 'Migrations1764917705529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP CONSTRAINT "FK_f56d91260cb1d48fd1b8d957235"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_shift_provider_facility_date_time"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."credential_reject_reason_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "credential_reject_reason" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "reason" character varying NOT NULL, "description" text, "status" "public"."credential_reject_reason_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_1ba0b38be81a771259b6dc60feb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shift_provider_facility_date_time" ON "shift" ("facility_id", "provider_id", "start_date", "end_date", "start_time", "end_time") `,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD CONSTRAINT "FK_f56d91260cb1d48fd1b8d957235" FOREIGN KEY ("reason_id") REFERENCES "credential_reject_reason"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP CONSTRAINT "FK_f56d91260cb1d48fd1b8d957235"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_shift_provider_facility_date_time"`,
    );
    await queryRunner.query(`DROP TABLE "credential_reject_reason"`);
    await queryRunner.query(
      `DROP TYPE "public"."credential_reject_reason_status_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shift_provider_facility_date_time" ON "shift" ("end_date", "end_time", "provider_id", "start_date", "start_time") `,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD CONSTRAINT "FK_f56d91260cb1d48fd1b8d957235" FOREIGN KEY ("reason_id") REFERENCES "provider_reject_reason"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
