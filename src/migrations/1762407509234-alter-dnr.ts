import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterDnr1762407509234 implements MigrationInterface {
  name = 'AlterDnr1762407509234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD "dnr_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD "created_by_id" uuid`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_provider_created_by_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD "created_by_type" "public"."facility_provider_created_by_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD "updated_by_id" uuid`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_provider_updated_by_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD "updated_by_type" "public"."facility_provider_updated_by_type_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP COLUMN "updated_by_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."facility_provider_updated_by_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP COLUMN "updated_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP COLUMN "created_by_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."facility_provider_created_by_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP COLUMN "created_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP COLUMN "dnr_at"`,
    );
  }
}
