import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTimecard1759140387452 implements MigrationInterface {
  name = 'AlterTimecard1759140387452';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."timecards_payment_status_enum" AS ENUM('paid', 'unpaid')`,
    );
    await queryRunner.query(
      `ALTER TABLE "timecards" ADD "payment_status" "public"."timecards_payment_status_enum" NOT NULL DEFAULT 'unpaid'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "timecards" DROP COLUMN "payment_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."timecards_payment_status_enum"`,
    );
  }
}
