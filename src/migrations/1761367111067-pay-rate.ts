import { MigrationInterface, QueryRunner } from 'typeorm';

export class PayRate1761367111067 implements MigrationInterface {
  name = 'PayRate1761367111067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "pay_rate" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "bill_rate" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ALTER COLUMN "start_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ALTER COLUMN "end_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ALTER COLUMN "start_time" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ALTER COLUMN "end_time" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ALTER COLUMN "end_time" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ALTER COLUMN "start_time" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ALTER COLUMN "end_date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ALTER COLUMN "start_date" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "bill_rate"`);
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "pay_rate"`);
  }
}
