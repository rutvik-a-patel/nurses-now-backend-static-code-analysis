import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterRejectReason1760507856949 implements MigrationInterface {
  name = 'AlterRejectReason1760507856949';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orientation_reject_reason" DROP CONSTRAINT "UQ_c31c158f9847da180a99f9ad179"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."provider_orientation_status_enum" RENAME TO "provider_orientation_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_orientation_status_enum" AS ENUM('requested', 'completed', 'approved', 'packet_sent', 'scheduled', 'not_interested', 'rejected', 'cancelled', 'void')`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ALTER COLUMN "status" TYPE "public"."provider_orientation_status_enum" USING "status"::"text"::"public"."provider_orientation_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ALTER COLUMN "status" SET DEFAULT 'requested'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_orientation_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."provider_orientation_status_enum_old" AS ENUM('requested', 'completed', 'approved', 'packet_sent', 'scheduled', 'not_interested', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ALTER COLUMN "status" TYPE "public"."provider_orientation_status_enum_old" USING "status"::"text"::"public"."provider_orientation_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ALTER COLUMN "status" SET DEFAULT 'requested'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_orientation_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."provider_orientation_status_enum_old" RENAME TO "provider_orientation_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orientation_reject_reason" ADD CONSTRAINT "UQ_c31c158f9847da180a99f9ad179" UNIQUE ("reason")`,
    );
  }
}
