import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProviderLateShift1756363096608 implements MigrationInterface {
  name = 'ProviderLateShift1756363096608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "provider_late_shift" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "shift_id" uuid, "provider_id" uuid, CONSTRAINT "PK_6464e8e38aee742276de1330bef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_03c5807c38963cc51f51d0eb93" ON "provider_late_shift" ("shift_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d99aa863d89d4edfe999df5f9b" ON "provider_late_shift" ("provider_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_late_shift" ADD CONSTRAINT "FK_03c5807c38963cc51f51d0eb93b" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_late_shift" ADD CONSTRAINT "FK_d99aa863d89d4edfe999df5f9ba" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_late_shift" DROP CONSTRAINT "FK_d99aa863d89d4edfe999df5f9ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_late_shift" DROP CONSTRAINT "FK_03c5807c38963cc51f51d0eb93b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d99aa863d89d4edfe999df5f9b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_03c5807c38963cc51f51d0eb93"`,
    );
    await queryRunner.query(`DROP TABLE "provider_late_shift"`);
  }
}
