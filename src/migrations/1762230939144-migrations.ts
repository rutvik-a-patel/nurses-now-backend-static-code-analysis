import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1762230939144 implements MigrationInterface {
  name = 'Migrations1762230939144';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider" ADD "is_payment_setup_completed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD "hide_inactive_users" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider" DROP COLUMN "is_payment_setup_completed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" DROP COLUMN "hide_inactive_users"`,
    );
  }
}
