import { MigrationInterface, QueryRunner } from 'typeorm';

export class Invoice1756807803422 implements MigrationInterface {
  name = 'Invoice1756807803422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq
            INCREMENT 1
            START 1
            MINVALUE 1
            MAXVALUE 9223372036854775807
            CACHE 1;
    `);
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION public.generate_unique_invoice_number()
            RETURNS text
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE PARALLEL UNSAFE
        AS $BODY$
        DECLARE
            timestamp_part TEXT;
            random_part TEXT;
            new_invoice_number TEXT;
        BEGIN
            LOOP
                -- Generate invoice number
                timestamp_part := to_char(CURRENT_TIMESTAMP, 'MMYY');
                random_part := nextval('invoice_number_seq')::TEXT;
                -- Apply padding only if the sequence number is less than 1000
                IF CAST(random_part AS INTEGER) < 1000 THEN
                    random_part := LPAD(random_part, 4, '0');
                END IF;
                new_invoice_number := random_part;

                -- Check if the generated number already exists in the table
                EXIT WHEN NOT EXISTS (
                    SELECT 1 FROM invoices WHERE invoice_number::text = new_invoice_number::text
                );
            END LOOP;

            RETURN new_invoice_number;
        END;
        $BODY$;
    `);
    await queryRunner.query(
      `CREATE TYPE "public"."invoices_invoice_status_enum" AS ENUM('paid', 'unpaid', 'partially_paid')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invoices_status_enum" AS ENUM('generated', 'billed', 'received')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "invoice_number" character varying NOT NULL DEFAULT generate_unique_invoice_number(), "total" numeric(10,2) NOT NULL DEFAULT '0', "outstanding" numeric(10,2) NOT NULL DEFAULT '0', "invoice_status" "public"."invoices_invoice_status_enum" NOT NULL DEFAULT 'unpaid', "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'generated', "provider_id" uuid, CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d8f8d3788694e1b3f96c42c36f" ON "invoices" ("invoice_number") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8cab41f81fdc5629bfc92f1bda" ON "invoices" ("provider_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "invoice_timecards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "invoice_id" uuid, "timecard_id" uuid, CONSTRAINT "REL_92ad09bf1c818c0a63b3a1210b" UNIQUE ("timecard_id"), CONSTRAINT "PK_71ffadfba6f0d39dbfad39ccf23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0f56c00c34341791a2637e10d6" ON "invoice_timecards" ("invoice_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92ad09bf1c818c0a63b3a1210b" ON "invoice_timecards" ("timecard_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "time_entry_setting" ADD "billing_cycle" integer NOT NULL DEFAULT '15'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe8c3c42cbbdeb0ace9a9ff0fd" ON "timecards" ("shift_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_8cab41f81fdc5629bfc92f1bdaf" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_timecards" ADD CONSTRAINT "FK_0f56c00c34341791a2637e10d61" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_timecards" ADD CONSTRAINT "FK_92ad09bf1c818c0a63b3a1210b2" FOREIGN KEY ("timecard_id") REFERENCES "timecards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ADD "active_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ADD "last_billing_date" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility" DROP COLUMN "last_billing_date"`,
    );
    await queryRunner.query(`ALTER TABLE "facility" DROP COLUMN "active_date"`);
    await queryRunner.query(
      `ALTER TABLE "invoice_timecards" DROP CONSTRAINT "FK_92ad09bf1c818c0a63b3a1210b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_timecards" DROP CONSTRAINT "FK_0f56c00c34341791a2637e10d61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_8cab41f81fdc5629bfc92f1bdaf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe8c3c42cbbdeb0ace9a9ff0fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_entry_setting" DROP COLUMN "billing_cycle"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92ad09bf1c818c0a63b3a1210b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0f56c00c34341791a2637e10d6"`,
    );
    await queryRunner.query(`DROP TABLE "invoice_timecards"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8cab41f81fdc5629bfc92f1bda"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d8f8d3788694e1b3f96c42c36f"`,
    );
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."invoices_invoice_status_enum"`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS public.generate_unique_invoice_number()`,
    );
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public.invoice_number_seq`,
    );
  }
}
