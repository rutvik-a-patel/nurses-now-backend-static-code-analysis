import { MigrationInterface, QueryRunner } from 'typeorm';

export class Payments1758255434624 implements MigrationInterface {
  name = 'Payments1758255434624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE SEQUENCE IF NOT EXISTS public.payment_id_seq
            INCREMENT 1
            START 1
            MINVALUE 1
            MAXVALUE 9223372036854775807
            CACHE 1;
    `);
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION public.generate_unique_payment_id()
            RETURNS text
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE PARALLEL UNSAFE
        AS $BODY$
        DECLARE
            timestamp_part TEXT;
            random_part TEXT;
            new_payment_id TEXT;
        BEGIN
            LOOP
                -- Generate payment ID
                timestamp_part := to_char(CURRENT_TIMESTAMP, 'MMYY');
                random_part := nextval('payment_id_seq')::TEXT;
                -- Apply padding only if the sequence number is less than 1000
                IF CAST(random_part AS INTEGER) < 1000 THEN
                    random_part := LPAD(random_part, 4, '0');
                END IF;
                new_payment_id := random_part;

                -- Check if the generated number already exists in the table
                EXIT WHEN NOT EXISTS (
                    SELECT 1 FROM payments WHERE payment_id::text = new_payment_id::text
                );
            END LOOP;

            RETURN new_payment_id;
        END;
        $BODY$;
    `);
    await queryRunner.query(
      `CREATE TYPE "public"."payments_type_enum" AS ENUM('payment', 'adjustment')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "payment_id" character varying NOT NULL DEFAULT generate_unique_payment_id(), "payment_date" date NOT NULL, "transaction_number" character varying NOT NULL, "payment_method" character varying NOT NULL, "amount" numeric(10,2) NOT NULL DEFAULT '0', "outstanding" numeric(10,2) NOT NULL DEFAULT '0', "notes" text, "base_url" character varying, "filename" character varying, "type" "public"."payments_type_enum" NOT NULL DEFAULT 'payment', "facility_id" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_25c295758bb08072832ce6aa5a" ON "payments" ("facility_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8866a3cfff96b8e17c2b204aae" ON "payments" ("payment_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "invoice_id" uuid, "payment_id" uuid, CONSTRAINT "PK_41d5ecc2ca516ca9c179f0f0065" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_05aeae035543b064e7639d9f29" ON "payment_invoices" ("invoice_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83872917e8f68c0964099417f2" ON "payment_invoices" ("payment_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_25c295758bb08072832ce6aa5ad" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_invoices" ADD CONSTRAINT "FK_05aeae035543b064e7639d9f29c" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_invoices" ADD CONSTRAINT "FK_83872917e8f68c0964099417f22" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE VIEW payment_list AS
        SELECT
          p.id,
          p.payment_id,
          p.payment_type::CHARACTER VARYING,
          TO_CHAR(p.created_at, 'YYYY-MM-DD') AS created_at,
          to_char(p.payment_date, 'YYYY-MM-DD'::text) AS payment_date,
          f.id AS facility_id,
          f.name AS facility,
          f.base_url AS facility_base_url,
          f.image AS facility_image,
          p.amount::DOUBLE PRECISION,
          p.outstanding::DOUBLE PRECISION,
          COALESCE(
            (
              SELECT
                SUM(i.outstanding)::DOUBLE PRECISION
              FROM
                invoices i
              WHERE
                i.facility_id = p.facility_id
                AND i.invoice_status IN ('unpaid', 'partially_paid')
                AND i.status IN ('billed', 'received')
                AND i.deleted_at IS NULL
            ),
            0
          ) AS running_balance
        FROM
          payments p
          LEFT JOIN facility f ON f.id = p.facility_id
          AND f.deleted_at IS NULL
        WHERE
          p.deleted_at IS NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP VIEW IF EXISTS payment_list;
    `);
    await queryRunner.query(
      `ALTER TABLE "payment_invoices" DROP CONSTRAINT "FK_83872917e8f68c0964099417f22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_invoices" DROP CONSTRAINT "FK_05aeae035543b064e7639d9f29c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_25c295758bb08072832ce6aa5ad"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_83872917e8f68c0964099417f2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05aeae035543b064e7639d9f29"`,
    );
    await queryRunner.query(`DROP TABLE "payment_invoices"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8866a3cfff96b8e17c2b204aae"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_25c295758bb08072832ce6aa5a"`,
    );
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_type_enum"`);
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS public.generate_unique_payment_id();
    `);
    await queryRunner.query(`
        DROP SEQUENCE IF EXISTS public.payment_id_seq;
    `);
  }
}
