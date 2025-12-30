import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1764758073403 implements MigrationInterface {
  name = 'Migrations1764758073403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_shift_provider_status" ON "shift" ("provider_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shift_facility_date" ON "shift" ("provider_id", "start_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shift_provider_date" ON "shift" ("provider_id", "start_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shift_published_status" ON "shift" ("is_publish", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shift_provider_facility_date_time" ON "shift" ("provider_id", "provider_id", "start_date", "end_date", "start_time", "end_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shift_facility_speciality_certificate" ON "shift" ("facility_id", "speciality_id", "certificate_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_shift_facility_speciality_certificate"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_shift_provider_facility_date_time"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_shift_published_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_shift_provider_date"`);
    await queryRunner.query(`DROP INDEX "public"."idx_shift_facility_date"`);
    await queryRunner.query(`DROP INDEX "public"."idx_shift_provider_status"`);
  }
}
