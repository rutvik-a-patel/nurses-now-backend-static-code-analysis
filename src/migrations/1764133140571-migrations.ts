import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1764133140571 implements MigrationInterface {
  name = 'Migrations1764133140571';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_sheets" ADD "ot_pay" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "overtime_pay_calculation" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "overtime" bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "overtime_payable_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "overtime_pay_rate" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "overtime_bill_rate" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "total_billable_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "total_billable_adjustment" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "billable_adjustment" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_bill_adjustment_status_enum" AS ENUM('pending', 'settled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "bill_adjustment_status" "public"."shift_bill_adjustment_status_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "bill_adjustment_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_bill_adjustment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "billable_adjustment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "total_billable_adjustment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "total_billable_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "overtime_bill_rate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "overtime_pay_rate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "overtime_payable_amount"`,
    );
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "overtime"`);
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "overtime_pay_calculation"`,
    );
    await queryRunner.query(`ALTER TABLE "rate_sheets" DROP COLUMN "ot_pay"`);
  }
}
