import { MigrationInterface, QueryRunner } from 'typeorm';

export class Evaluations1754376292223 implements MigrationInterface {
  name = 'Evaluations1754376292223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."evaluation_response_type_enum" AS ENUM('clinical_competence', 'attitude_cooperation', 'attendance_punctuality', 'good_communication_skills')`,
    );
    await queryRunner.query(
      `CREATE TABLE "evaluation_response" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "type" "public"."evaluation_response_type_enum" NOT NULL, "value" smallint NOT NULL, "provider_evaluation_id" uuid, CONSTRAINT "PK_0da5a99ee61b210d4456497d258" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_586457c83c8ad25097f9e78982" ON "evaluation_response" ("provider_evaluation_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_evaluation_evaluated_by_enum" AS ENUM('admin', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_evaluation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "evaluated_by" "public"."provider_evaluation_evaluated_by_enum" NOT NULL, "evaluated_by_id" uuid NOT NULL, "provider_id" uuid, "facility_id" uuid, CONSTRAINT "PK_af6c23d39d06de58c73dcafd7ec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_44f84ef9ee15b6f198af619196" ON "provider_evaluation" ("provider_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99d2da391a561311835b9a8aed" ON "provider_evaluation" ("facility_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83ada183ed8f6050b7c905ebeb" ON "provider_evaluation" ("evaluated_by_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_response" ADD CONSTRAINT "FK_586457c83c8ad25097f9e78982c" FOREIGN KEY ("provider_evaluation_id") REFERENCES "provider_evaluation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_evaluation" ADD CONSTRAINT "FK_44f84ef9ee15b6f198af619196c" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_evaluation" ADD CONSTRAINT "FK_99d2da391a561311835b9a8aed5" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_evaluation" DROP CONSTRAINT "FK_99d2da391a561311835b9a8aed5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_evaluation" DROP CONSTRAINT "FK_44f84ef9ee15b6f198af619196c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_response" DROP CONSTRAINT "FK_586457c83c8ad25097f9e78982c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_83ada183ed8f6050b7c905ebeb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99d2da391a561311835b9a8aed"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_44f84ef9ee15b6f198af619196"`,
    );
    await queryRunner.query(`DROP TABLE "provider_evaluation"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_evaluation_evaluated_by_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_586457c83c8ad25097f9e78982"`,
    );
    await queryRunner.query(`DROP TABLE "evaluation_response"`);
    await queryRunner.query(
      `DROP TYPE "public"."evaluation_response_type_enum"`,
    );
  }
}
