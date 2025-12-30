import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProviderAnalytics1757491745823 implements MigrationInterface {
  name = 'ProviderAnalytics1757491745823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_analytics" ADD "late_shift" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_late_shift" ADD CONSTRAINT "provider_late_shift_unique" UNIQUE ("shift_id", "provider_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ALTER COLUMN "license" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ALTER COLUMN "license" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_late_shift" DROP CONSTRAINT "provider_late_shift_unique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_analytics" DROP COLUMN "late_shift"`,
    );
  }
}
