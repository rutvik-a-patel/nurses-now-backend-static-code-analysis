import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterHolidayGroup1757503050174 implements MigrationInterface {
  name = 'AlterHolidayGroup1757503050174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ADD "start_date" date`,
    );
    await queryRunner.query(`ALTER TABLE "holiday_group" ADD "end_date" date`);
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ADD "start_time" TIME`,
    );
    await queryRunner.query(`ALTER TABLE "holiday_group" ADD "end_time" TIME`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "holiday_group" DROP COLUMN "end_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" DROP COLUMN "start_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" DROP COLUMN "end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" DROP COLUMN "start_date"`,
    );
  }
}
