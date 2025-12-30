import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1766125202344 implements MigrationInterface {
  name = 'Migrations1766125202344';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "overtime_billable_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `DELETE FROM "facility_permission" WHERE name IN ('approve_reject_shift', 'approve_time_card')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "facility_permission" (id, name, description, created_at, updated_at) VALUES 
      ('b1a4f8e2-3c4d-4e5f-8a9b-0c1d2e3f4a5b', 'approve_reject_shift', 'Permission to approve or reject shifts', NOW(), NOW()),
      ('c2b5f9e3-4d5e-5f6g-9h0i-1d2e3f4a5b6c', 'approve_time_card', 'Permission to approve time cards', NOW(), NOW())`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "overtime_billable_amount"`,
    );
  }
}
