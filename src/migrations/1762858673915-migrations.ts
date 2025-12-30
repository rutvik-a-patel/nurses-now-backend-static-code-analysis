import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1762858673915 implements MigrationInterface {
  name = 'Migrations1762858673915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "overtime_bill_after_hours"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "overtime_bill_after_hours" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "overtime_bill_after_hours"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "overtime_bill_after_hours" integer NOT NULL DEFAULT '0'`,
    );
  }
}
