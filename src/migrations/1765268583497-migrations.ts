import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1765268583497 implements MigrationInterface {
  name = 'Migrations1765268583497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin" ADD "phone_no" character varying(15)`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD "extension" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_user" ADD "phone_no" character varying(15)`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_user" ADD "extension" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_user" DROP COLUMN "extension"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_user" DROP COLUMN "phone_no"`,
    );
    await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "extension"`);
    await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "phone_no"`);
  }
}
