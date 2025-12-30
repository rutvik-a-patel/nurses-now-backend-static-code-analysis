import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1761804092280 implements MigrationInterface {
  name = 'Migrations1761804092280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin" ADD "hide_inactive_contacts" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_user" ADD "hide_inactive_contacts" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_user" DROP COLUMN "hide_inactive_contacts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" DROP COLUMN "hide_inactive_contacts"`,
    );
  }
}
