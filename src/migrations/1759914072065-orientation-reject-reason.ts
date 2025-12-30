import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrientationRejectReason1759914072065
  implements MigrationInterface
{
  name = 'OrientationRejectReason1759914072065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."orientation_reject_reason_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orientation_reject_reason" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "reason" character varying NOT NULL, "description" character varying, "status" "public"."orientation_reject_reason_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "UQ_c31c158f9847da180a99f9ad179" UNIQUE ("reason"), CONSTRAINT "PK_15295e8687ba427587962d049f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ADD "is_read" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ADD "reason_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."provider_orientation_status_enum" RENAME TO "provider_orientation_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_orientation_status_enum" AS ENUM('requested', 'completed', 'approved', 'packet_sent', 'scheduled', 'not_interested', 'rejected', 'cancelled')`,
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
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ADD CONSTRAINT "FK_6ad5f8e83587bbf9e34d4b56d46" FOREIGN KEY ("reason_id") REFERENCES "orientation_reject_reason"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" DROP CONSTRAINT "FK_6ad5f8e83587bbf9e34d4b56d46"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_orientation_status_enum_old" AS ENUM('requested', 'completed', 'approved', 'packet_sent', 'not_interested', 'rejected', 'cancelled')`,
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
      `ALTER TABLE "provider_orientation" DROP COLUMN "reason_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" DROP COLUMN "is_read"`,
    );
    await queryRunner.query(`DROP TABLE "orientation_reject_reason"`);
    await queryRunner.query(
      `DROP TYPE "public"."orientation_reject_reason_status_enum"`,
    );
  }
}
