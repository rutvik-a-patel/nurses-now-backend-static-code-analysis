import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrientationDocuments1757582607595 implements MigrationInterface {
  name = 'OrientationDocuments1757582607595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."orientation_document_is_verified_enum" AS ENUM('pending', 'verified', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orientation_document" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying, "base_url" character varying, "filename" character varying, "original_filename" character varying, "issue_date" date, "completed_date" date, "verified_by_id" character varying, "verified_by_type" character varying, "credential_rejected_at" TIMESTAMP WITH TIME ZONE, "credential_approved_at" TIMESTAMP WITH TIME ZONE, "is_verified" "public"."orientation_document_is_verified_enum" NOT NULL DEFAULT 'pending', "orientation_notes" text, "reason_description" text, "facility_id" uuid, "provider_id" uuid, "reason_id" uuid, CONSTRAINT "PK_9feb549a4bf3b93de701ea0684f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_63b6ae9f5decfa3c9d601504db" ON "orientation_document" ("reason_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "orientation_document" ADD CONSTRAINT "FK_64c2dd4bc06d66c1da0cae6a9a6" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orientation_document" ADD CONSTRAINT "FK_f15f4f06b79db83f15bd06af65c" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orientation_document" ADD CONSTRAINT "FK_63b6ae9f5decfa3c9d601504db0" FOREIGN KEY ("reason_id") REFERENCES "provider_reject_reason"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orientation_document" DROP CONSTRAINT "FK_63b6ae9f5decfa3c9d601504db0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orientation_document" DROP CONSTRAINT "FK_f15f4f06b79db83f15bd06af65c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orientation_document" DROP CONSTRAINT "FK_64c2dd4bc06d66c1da0cae6a9a6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_63b6ae9f5decfa3c9d601504db"`,
    );
    await queryRunner.query(`DROP TABLE "orientation_document"`);
    await queryRunner.query(
      `DROP TYPE "public"."orientation_document_is_verified_enum"`,
    );
  }
}
