import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterOrientationType1762262143578 implements MigrationInterface {
  name = 'AlterOrientationType1762262143578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility" ADD "orientation_enabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."facility_orientation_process_enum" RENAME TO "facility_orientation_process_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_orientation_process_enum" AS ENUM('orientation_shift', 'electronic_orientation_documents', 'both')`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ALTER COLUMN "orientation_process" TYPE "public"."facility_orientation_process_enum" USING "orientation_process"::"text"::"public"."facility_orientation_process_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."facility_orientation_process_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."facility_orientation_process_enum_old" AS ENUM('orientation_shift', 'electronic_orientation_documents', 'other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ALTER COLUMN "orientation_process" TYPE "public"."facility_orientation_process_enum_old" USING "orientation_process"::"text"::"public"."facility_orientation_process_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."facility_orientation_process_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."facility_orientation_process_enum_old" RENAME TO "facility_orientation_process_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" DROP COLUMN "orientation_enabled"`,
    );
  }
}
