import { MigrationInterface, QueryRunner } from 'typeorm';

export class Webhook1759985277897 implements MigrationInterface {
  name = 'Webhook1759985277897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "webhook_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "event_id" uuid NOT NULL, "event" character varying NOT NULL, "client_type" character varying NOT NULL, "client_id" integer NOT NULL, "data" text NOT NULL, "employee_id" uuid NOT NULL, "active_type" character varying NOT NULL, "time_emitted" character varying NOT NULL, "response" json NOT NULL, CONSTRAINT "UQ_93755923e11645aaa25b6ee4940" UNIQUE ("event_id"), CONSTRAINT "PK_24ba82df4f81de9f1452afb17c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_93755923e11645aaa25b6ee494" ON "webhook_responses" ("event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_81b8b6dcb0d95e92c5587ccf17" ON "webhook_responses" ("employee_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_81b8b6dcb0d95e92c5587ccf17"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_93755923e11645aaa25b6ee494"`,
    );
    await queryRunner.query(`DROP TABLE "webhook_responses"`);
  }
}
