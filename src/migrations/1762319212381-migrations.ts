import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1762319212381 implements MigrationInterface {
  name = 'Migrations1762319212381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "billing_period" smallint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "invoice_terms" smallint NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "invoice_terms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "billing_period"`,
    );
  }
}
