import { MigrationInterface, QueryRunner } from 'typeorm';

export class FacilityNoteTags1753075982029 implements MigrationInterface {
  name = 'FacilityNoteTags1753075982029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility" RENAME COLUMN "client_type" TO "is_corporate_client"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tag_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "description" character varying, "status" "public"."tag_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_note_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "date" date NOT NULL, "status" "public"."facility_note_status_enum" NOT NULL DEFAULT 'active', "tags" uuid array, "description" character varying, "relates_to" uuid array, "created_by_id" uuid, CONSTRAINT "PK_1df8589f3d01cc1f239e2cfc52f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" DROP COLUMN "is_corporate_client"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ADD "is_corporate_client" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "provider" DROP COLUMN "mobile_no"`);
    await queryRunner.query(
      `ALTER TABLE "provider" ADD "mobile_no" character varying(25)`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_note" ADD CONSTRAINT "FK_41df48298431cb82a720214cd0d" FOREIGN KEY ("created_by_id") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_note" DROP CONSTRAINT "FK_41df48298431cb82a720214cd0d"`,
    );
    await queryRunner.query(`ALTER TABLE "provider" DROP COLUMN "mobile_no"`);
    await queryRunner.query(
      `ALTER TABLE "provider" ADD "mobile_no" character varying(15)`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" DROP COLUMN "is_corporate_client"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ADD "is_corporate_client" character varying`,
    );
    await queryRunner.query(`DROP TABLE "facility_note"`);
    await queryRunner.query(`DROP TYPE "public"."facility_note_status_enum"`);
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TYPE "public"."tag_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "facility" RENAME COLUMN "is_corporate_client" TO "client_type"`,
    );
  }
}
