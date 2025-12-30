import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterFacilityHoliday1757078425715 implements MigrationInterface {
  name = 'AlterFacilityHoliday1757078425715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" ADD "name" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" DROP COLUMN "name"`,
    );
  }
}
