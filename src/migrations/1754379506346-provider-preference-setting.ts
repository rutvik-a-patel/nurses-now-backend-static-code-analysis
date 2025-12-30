import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProviderPreferenceSetting1754379506346
  implements MigrationInterface
{
  name = 'ProviderPreferenceSetting1754379506346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."provider_availability_availability_type_enum" AS ENUM('permanent', 'temporary')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_availability_day_enum" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_availability_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_availability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "availability_type" "public"."provider_availability_availability_type_enum" NOT NULL DEFAULT 'permanent', "day" "public"."provider_availability_day_enum", "date" date, "status" "public"."provider_availability_status_enum" NOT NULL DEFAULT 'active', "shift_time" jsonb, "order" integer, "provider_id" uuid, CONSTRAINT "PK_b71cd0a5d4be0a7c6851c51a7b3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d60be36a0bfa87bd223620fe26" ON "provider_availability" ("provider_id") `,
    );
    await queryRunner.query(`ALTER TABLE "provider" DROP COLUMN "shift_time"`);
    await queryRunner.query(`DROP TYPE "public"."provider_shift_time_enum"`);
    await queryRunner.query(
      `ALTER TABLE "provider" ADD "shift_time" jsonb DEFAULT '{"D":true,"E":true,"N":true,"A":true,"P":true}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_availability" ADD CONSTRAINT "FK_d60be36a0bfa87bd223620fe260" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_availability" DROP CONSTRAINT "FK_d60be36a0bfa87bd223620fe260"`,
    );
    await queryRunner.query(`ALTER TABLE "provider" DROP COLUMN "shift_time"`);
    await queryRunner.query(
      `CREATE TYPE "public"."provider_shift_time_enum" AS ENUM('Days', 'Evenings', 'Nights')`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" ADD "shift_time" "public"."provider_shift_time_enum" array NOT NULL DEFAULT '{Days,Evenings,Nights}'`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d60be36a0bfa87bd223620fe26"`,
    );
    await queryRunner.query(`DROP TABLE "provider_availability"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_availability_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_availability_day_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_availability_availability_type_enum"`,
    );
  }
}
