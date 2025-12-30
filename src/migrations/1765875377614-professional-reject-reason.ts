import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProfessionalRejectReason1765875377614
  implements MigrationInterface
{
  name = 'ProfessionalRejectReason1765875377614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."professional_reference_reject_reason_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "professional_reference_reject_reason" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "reason" character varying NOT NULL, "description" text, "status" "public"."professional_reference_reject_reason_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_9d6d39789a3e6b411f563215e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" ADD "reason_description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" ADD "reason_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" ADD CONSTRAINT "FK_5518b0750a78ce78fe2034cca84" FOREIGN KEY ("reason_id") REFERENCES "professional_reference_reject_reason"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" DROP CONSTRAINT "FK_5518b0750a78ce78fe2034cca84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" DROP COLUMN "reason_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" DROP COLUMN "reason_description"`,
    );
    await queryRunner.query(
      `DROP TABLE "professional_reference_reject_reason"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."professional_reference_reject_reason_status_enum"`,
    );
  }
}
