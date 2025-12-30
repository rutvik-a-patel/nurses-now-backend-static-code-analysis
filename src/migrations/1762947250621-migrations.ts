import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1762947250621 implements MigrationInterface {
  name = 'Migrations1762947250621';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD "self_dnr" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD "self_dnr_reason" uuid array`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD "self_dnr_description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD "self_dnr_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP COLUMN "self_dnr_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP COLUMN "self_dnr_description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP COLUMN "self_dnr_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP COLUMN "self_dnr"`,
    );
  }
}
