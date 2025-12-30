import { MigrationInterface, QueryRunner } from 'typeorm';

export class HolidayAlter1756203725724 implements MigrationInterface {
  name = 'HolidayAlter1756203725724';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "holiday_group" RENAME COLUMN "is_active" TO "status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" RENAME COLUMN "is_active" TO "status"`,
    );
    await queryRunner.query(`ALTER TABLE "holiday_group" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."holiday_group_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ADD "status" "public"."holiday_group_status_enum" NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_holiday_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" ADD "status" "public"."facility_holiday_status_enum" NOT NULL DEFAULT 'active'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."facility_holiday_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" ADD "status" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`ALTER TABLE "holiday_group" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."holiday_group_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "holiday_group" ADD "status" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" RENAME COLUMN "status" TO "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "holiday_group" RENAME COLUMN "status" TO "is_active"`,
    );
  }
}
