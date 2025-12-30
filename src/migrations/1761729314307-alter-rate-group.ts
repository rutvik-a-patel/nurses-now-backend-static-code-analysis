import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterRateGroup1761729314307 implements MigrationInterface {
  name = 'AlterRateGroup1761729314307';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "premium_pay_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."rate_groups_premium_pay_type_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."rate_groups_premium_pay_type_enum" AS ENUM('multiplier', 'additional_amount')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "premium_pay_type" "public"."rate_groups_premium_pay_type_enum" NOT NULL DEFAULT 'multiplier'`,
    );
  }
}
