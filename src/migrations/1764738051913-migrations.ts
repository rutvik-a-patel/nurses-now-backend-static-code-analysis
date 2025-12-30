import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1764738051913 implements MigrationInterface {
  name = 'Migrations1764738051913';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "weekend_pay_rate" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "weekend_bill_rate" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "holiday_pay_multiplier" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "holiday_bill_multiplier" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "holiday_bill_multiplier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "holiday_pay_multiplier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "weekend_bill_rate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "weekend_pay_rate"`,
    );
  }
}
