import { MigrationInterface, QueryRunner } from 'typeorm';

export class AccountingSetting1758106261150 implements MigrationInterface {
  name = 'AccountingSetting1758106261150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "accounting_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "billing_cycle" integer NOT NULL DEFAULT '15', "invoice_due" integer NOT NULL DEFAULT '15', "facility_id" uuid, CONSTRAINT "REL_7991bca05361b1ddb57ecdfd55" UNIQUE ("facility_id"), CONSTRAINT "PK_4c9e97fe0b2072a30b592bfe36e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7991bca05361b1ddb57ecdfd55" ON "accounting_setting" ("facility_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "time_entry_setting" DROP COLUMN "billing_cycle"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52dc0646a61c6656dfb58b3aad" ON "time_entry_setting" ("facility_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83408f293e2fdfc3b3f8d7a23b" ON "facility_portal_setting" ("facility_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c8c2458ef56c4cdaf691d3a762" ON "facility" ("admin_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b654fa4d1d642691739f1349b6" ON "facility" ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "accounting_setting" ADD CONSTRAINT "FK_7991bca05361b1ddb57ecdfd55c" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounting_setting" DROP CONSTRAINT "FK_7991bca05361b1ddb57ecdfd55c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b654fa4d1d642691739f1349b6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c8c2458ef56c4cdaf691d3a762"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_83408f293e2fdfc3b3f8d7a23b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52dc0646a61c6656dfb58b3aad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_entry_setting" ADD "billing_cycle" integer NOT NULL DEFAULT '15'`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7991bca05361b1ddb57ecdfd55"`,
    );
    await queryRunner.query(`DROP TABLE "accounting_setting"`);
  }
}
