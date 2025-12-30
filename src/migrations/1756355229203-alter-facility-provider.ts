import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterFacilityProvider1756355229203 implements MigrationInterface {
  name = 'AlterFacilityProvider1756355229203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."facility_provider_flag_enum" RENAME TO "facility_provider_flag_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_provider_flag_enum" AS ENUM('preferred', 'dnr', 'self')`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ALTER COLUMN "flag" TYPE "public"."facility_provider_flag_enum" USING "flag"::"text"::"public"."facility_provider_flag_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."facility_provider_flag_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."facility_provider_flag_enum_old" AS ENUM('preferred', 'dnr')`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ALTER COLUMN "flag" TYPE "public"."facility_provider_flag_enum_old" USING "flag"::"text"::"public"."facility_provider_flag_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."facility_provider_flag_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."facility_provider_flag_enum_old" RENAME TO "facility_provider_flag_enum"`,
    );
  }
}
