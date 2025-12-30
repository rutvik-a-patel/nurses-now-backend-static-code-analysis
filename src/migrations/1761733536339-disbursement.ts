import { MigrationInterface, QueryRunner } from 'typeorm';

export class Disbursement1761733536339 implements MigrationInterface {
  name = 'Disbursement1761733536339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."disbursements_status_enum" AS ENUM('PENDING', 'SCHEDULED', 'COMPLETED', 'FAILED', 'CANCELLED', 'SKIPPED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "disbursements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "amount" numeric(10,2) NOT NULL DEFAULT '0', "status" "public"."disbursements_status_enum" NOT NULL DEFAULT 'PENDING', "description" character varying(255) NOT NULL, "retry" boolean NOT NULL DEFAULT true, "provider_id" uuid, "shift_id" uuid, CONSTRAINT "REL_378b5a4e8e23456f7d86e23161" UNIQUE ("shift_id"), CONSTRAINT "PK_2f9ea0e5b8382113aaa3e51cdfa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "disbursements" ADD CONSTRAINT "FK_057a9d1bfcb52d4774c5089f4a0" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disbursements" ADD CONSTRAINT "FK_378b5a4e8e23456f7d86e231614" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "disbursements" DROP CONSTRAINT "FK_378b5a4e8e23456f7d86e231614"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disbursements" DROP CONSTRAINT "FK_057a9d1bfcb52d4774c5089f4a0"`,
    );
    await queryRunner.query(`DROP TABLE "disbursements"`);
    await queryRunner.query(`DROP TYPE "public"."disbursements_status_enum"`);
  }
}
