import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1763633256850 implements MigrationInterface {
  name = 'Migrations1763633256850';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "billing_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "invoice_terms"`,
    );
    await queryRunner.query(`ALTER TABLE "shift" ADD "break_start_date" date`);
    await queryRunner.query(`ALTER TABLE "shift" ADD "break_end_date" date`);
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "break_start_time"`,
    );
    await queryRunner.query(`ALTER TABLE "shift" ADD "break_start_time" TIME`);
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "break_end_time"`);
    await queryRunner.query(`ALTER TABLE "shift" ADD "break_end_time" TIME`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "break_end_time"`);
    await queryRunner.query(`ALTER TABLE "shift" ADD "break_end_time" bigint`);
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "break_start_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "break_start_time" bigint`,
    );
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "break_end_date"`);
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "break_start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "invoice_terms" smallint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "billing_period" smallint NOT NULL DEFAULT '0'`,
    );
  }
}
