import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProviderNotes1755850665845 implements MigrationInterface {
  name = 'AlterProviderNotes1755850665845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "provider" ADD "notes" text`);
    await queryRunner.query(
      `CREATE INDEX "IDX_7afe0a50ebf7aa82436599140b" ON "provider" ("first_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2a0fd4d41a71a92aa161208470" ON "provider" ("last_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92771edc46a8f06892ed72cdf4" ON "provider" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1468f2787966d2b0ace19ca337" ON "provider" ("country_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f4edd3b6e6b69df4e73f64061b" ON "provider" ("mobile_no") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8bde3a0f682aa2b877d2660d87" ON "provider" ("certificate_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97052556f1729ee19e583ae751" ON "provider" ("additional_certification") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d106ef9c23f15be27e35d12e03" ON "provider" ("speciality_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9c730d6f14f1581ac9c0f0a68d" ON "provider" ("additional_speciality") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_902efff2582f1c4250a9c06325" ON "provider" ("shift_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b0cf43e7ce397a79f14d2c07e" ON "provider" ("status") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3b0cf43e7ce397a79f14d2c07e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_902efff2582f1c4250a9c06325"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9c730d6f14f1581ac9c0f0a68d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d106ef9c23f15be27e35d12e03"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97052556f1729ee19e583ae751"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8bde3a0f682aa2b877d2660d87"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f4edd3b6e6b69df4e73f64061b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1468f2787966d2b0ace19ca337"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92771edc46a8f06892ed72cdf4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2a0fd4d41a71a92aa161208470"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7afe0a50ebf7aa82436599140b"`,
    );
    await queryRunner.query(`ALTER TABLE "provider" DROP COLUMN "notes"`);
  }
}
