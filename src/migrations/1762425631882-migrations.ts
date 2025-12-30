import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1762425631882 implements MigrationInterface {
  name = 'Migrations1762425631882';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."payments_type_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."payments_payment_type_enum" AS ENUM('payment', 'adjustment')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "payment_type" "public"."payments_payment_type_enum" NOT NULL DEFAULT 'payment'`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "unallocated_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "total_adjustment" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_adjustment_status_enum" AS ENUM('pending', 'settled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "adjustment_status" "public"."shift_adjustment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "total_payable_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "total_payable_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "adjustment_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_adjustment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "total_adjustment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "unallocated_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "payment_type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payments_payment_type_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."payments_type_enum" AS ENUM('payment', 'adjustment')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "type" "public"."payments_type_enum" NOT NULL DEFAULT 'payment'`,
    );
  }
}
