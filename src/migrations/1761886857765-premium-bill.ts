import { MigrationInterface, QueryRunner } from 'typeorm';

export class PremiumBill1761886857765 implements MigrationInterface {
  name = 'PremiumBill1761886857765';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" RENAME COLUMN "overtime_bill_type" TO "premium_bill"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."rate_groups_overtime_bill_type_enum" RENAME TO "rate_groups_premium_bill_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_sheets" ADD "premium_bill" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "premium_bill"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "premium_bill" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "premium_bill"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "premium_bill" "public"."rate_groups_premium_bill_enum" NOT NULL DEFAULT 'multiplier'`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_sheets" DROP COLUMN "premium_bill"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."rate_groups_premium_bill_enum" RENAME TO "rate_groups_overtime_bill_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" RENAME COLUMN "premium_bill" TO "overtime_bill_type"`,
    );
  }
}
