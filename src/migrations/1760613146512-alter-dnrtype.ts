import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterDnrtype1760613146512 implements MigrationInterface {
  name = 'AlterDnrtype1760613146512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."facility_provider_dnr_type_enum" RENAME TO "facility_provider_dnr_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_provider_dnr_type_enum" AS ENUM('clinical', 'professional', 'self')`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ALTER COLUMN "dnr_type" TYPE "public"."facility_provider_dnr_type_enum" USING "dnr_type"::"text"::"public"."facility_provider_dnr_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."facility_provider_dnr_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."dnr_reason_reason_type_enum" RENAME TO "dnr_reason_reason_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."dnr_reason_reason_type_enum" AS ENUM('clinical', 'professional', 'self')`,
    );
    await queryRunner.query(
      `ALTER TABLE "dnr_reason" ALTER COLUMN "reason_type" TYPE "public"."dnr_reason_reason_type_enum" USING "reason_type"::"text"::"public"."dnr_reason_reason_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."dnr_reason_reason_type_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."dnr_reason_reason_type_enum_old" AS ENUM('clinical', 'professional')`,
    );
    await queryRunner.query(
      `ALTER TABLE "dnr_reason" ALTER COLUMN "reason_type" TYPE "public"."dnr_reason_reason_type_enum_old" USING "reason_type"::"text"::"public"."dnr_reason_reason_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."dnr_reason_reason_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."dnr_reason_reason_type_enum_old" RENAME TO "dnr_reason_reason_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_provider_dnr_type_enum_old" AS ENUM('clinical', 'professional')`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ALTER COLUMN "dnr_type" TYPE "public"."facility_provider_dnr_type_enum_old" USING "dnr_type"::"text"::"public"."facility_provider_dnr_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."facility_provider_dnr_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."facility_provider_dnr_type_enum_old" RENAME TO "facility_provider_dnr_type_enum"`,
    );
  }
}
