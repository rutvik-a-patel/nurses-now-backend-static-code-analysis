import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocuments1763639544431 implements MigrationInterface {
  name = 'CreateDocuments1763639544431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."documents_is_verified_enum" AS ENUM('pending', 'verified', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."documents_uploaded_by_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."documents_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying, "base_url" character varying, "filename" character varying, "original_filename" character varying, "issue_date" date, "completed_date" date, "verified_by_id" character varying, "verified_by_type" character varying, "credential_rejected_at" TIMESTAMP WITH TIME ZONE, "credential_approved_at" TIMESTAMP WITH TIME ZONE, "uploaded_at" TIMESTAMP WITH TIME ZONE, "is_verified" "public"."documents_is_verified_enum" NOT NULL DEFAULT 'pending', "document_notes" text, "reason_description" text, "uploaded_by_id" character varying, "uploaded_by_type" "public"."documents_uploaded_by_type_enum", "status" "public"."documents_status_enum" NOT NULL DEFAULT 'active', "facility_id" uuid, "provider_id" uuid, "reason_id" uuid, "admin_document_category_id" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c495d234a2bd70d95a7ed57a75" ON "documents" ("base_url") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_82e5679ba55008bf3bcb4e7c99" ON "documents" ("filename") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4593a993a9ba3cca8322b229d9" ON "documents" ("original_filename") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b0ffc32e72dfcfcd4955f3c14a" ON "documents" ("verified_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_126b9d3132139da193b8e84713" ON "documents" ("verified_by_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_abe9e8e0fdd64047e0a740632f" ON "documents" ("facility_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_afdd409a42a5c40125e52c9d8c" ON "documents" ("provider_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fdd76e50215cc8b5a739102e08" ON "documents" ("reason_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_02306fdd7023e63532159eefb3" ON "documents" ("uploaded_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b68ff2033a9c4ed52f5bd30bf" ON "documents" ("uploaded_by_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46bbbd41c65ed4bc31f113a11e" ON "documents" ("admin_document_category_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_abe9e8e0fdd64047e0a740632f5" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_afdd409a42a5c40125e52c9d8ce" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_fdd76e50215cc8b5a739102e08c" FOREIGN KEY ("reason_id") REFERENCES "orientation_reject_reason"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_46bbbd41c65ed4bc31f113a11e7" FOREIGN KEY ("admin_document_category_id") REFERENCES "admin_document"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_46bbbd41c65ed4bc31f113a11e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_fdd76e50215cc8b5a739102e08c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_afdd409a42a5c40125e52c9d8ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_abe9e8e0fdd64047e0a740632f5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46bbbd41c65ed4bc31f113a11e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3b68ff2033a9c4ed52f5bd30bf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_02306fdd7023e63532159eefb3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fdd76e50215cc8b5a739102e08"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_afdd409a42a5c40125e52c9d8c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_abe9e8e0fdd64047e0a740632f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_126b9d3132139da193b8e84713"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b0ffc32e72dfcfcd4955f3c14a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4593a993a9ba3cca8322b229d9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_82e5679ba55008bf3bcb4e7c99"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c495d234a2bd70d95a7ed57a75"`,
    );
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TYPE "public"."documents_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."documents_uploaded_by_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."documents_is_verified_enum"`);
  }
}
