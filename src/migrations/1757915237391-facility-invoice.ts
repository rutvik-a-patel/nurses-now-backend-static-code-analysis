import { MigrationInterface, QueryRunner } from 'typeorm';

export class FacilityInvoice1757915237391 implements MigrationInterface {
  name = 'FacilityInvoice1757915237391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_8cab41f81fdc5629bfc92f1bdaf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8cab41f81fdc5629bfc92f1bda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" RENAME COLUMN "provider_id" TO "facility_id"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bee6a47b9984ac0e7c91623fcf" ON "invoices" ("facility_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_bee6a47b9984ac0e7c91623fcff" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "billed_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "received" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "tax" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "billing_cycle_start_date" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "billing_cycle_end_date" date`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE VIEW unbilled_invoice AS
      SELECT
        i.id,
        i.invoice_number,
        TO_CHAR(i.created_at, 'YYYY-MM-DD') AS created_at,
        i.total::DOUBLE PRECISION,
        f.id AS facility_id,
        f.name AS facility_name,
        f.base_url AS facility_base_url,
        f.image AS facility_image,
        (
          SELECT
            COUNT(*)::INTEGER
          FROM
            invoice_timecards it
          WHERE
            it.invoice_id = i.id
        ) AS timecards_count
      FROM
        invoices i
        LEFT JOIN facility f ON f.id = i.facility_id
        AND f.deleted_at IS NULL
      WHERE
        i.status = 'generated'
        AND i.deleted_at IS NULL;`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE VIEW billed_invoices AS
        SELECT
          i.id,
          i.invoice_number,
          TO_CHAR(i.created_at, 'YYYY-MM-DD') AS created_at,
          TO_CHAR(i.billed_date, 'YYYY-MM-DD') AS billed_date,
          f.id AS facility_id,
          f.name AS facility_name,
          f.base_url AS facility_base_url,
          f.image AS facility_image,
          i.total::DOUBLE PRECISION AS total,
          i.outstanding::DOUBLE PRECISION AS outstanding,
          i.received::double precision AS received,
          i.invoice_status AS invoice_status,
          CASE
            WHEN i.invoice_status = 'paid' THEN i.aging
            ELSE current_date - i.billed_date::date
          END AS aging
        FROM
          invoices i
          LEFT JOIN facility f ON f.id = i.facility_id
          AND f.deleted_at IS NULL
        WHERE
          i.status != 'generated'
          AND i.deleted_at IS NULL;`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE VIEW invoice_details AS
        SELECT
          i.id AS id,
          i.invoice_number,
          TO_CHAR(i.created_at, 'YYYY-MM-DD') AS issue_date,
          TO_CHAR(i.billed_date, 'YYYY-MM-DD') AS billed_date,
          TO_CHAR(i.billing_cycle_start_date, 'YYYY-MM-DD') AS billing_cycle_start_date,
          TO_CHAR(i.billing_cycle_end_date, 'YYYY-MM-DD') AS billing_cycle_end_date,
          i.total::DOUBLE PRECISION AS subtotal,
          i.tax::DOUBLE PRECISION AS tax,
          (i.total + i.tax)::DOUBLE PRECISION AS total,
          f.id AS facility_id,
          f.name AS facility_name,
          f.base_url AS facility_base_url,
          f.image AS facility_image,
          f.street_address,
          (select s.invoice_due from accounting_setting s where s.facility_id = i.facility_id) as payment_terms,
          f.house_no,
          f.zip_code,
          f.city,
          f.state,
          (
            SELECT
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id',
                  t.id,
                  'date',
                  s.start_date,
                  'staff',
                  CONCAT(p.first_name, ' ', p.last_name),
                  'certificate',
                  c.abbreviation,
                  'speciality',
                  sp.abbreviation,
                  'start_time',
                  s.start_time,
                  'end_time',
                  s.end_time,
                  'clock_in',
                  s.clock_in,
                  'clock_out',
                  s.clock_out,
                  'break_duration',
                  s.break_duration,
                  'rate',
                  s.bill_rate,
                  'hours',
                  s.total_worked,
                  'total',
                  ROUND(
                    s.total_billable_amount::NUMERIC,
                    2
                  )::DOUBLE PRECISION
                )
              )
            FROM
              invoice_timecards it
              JOIN timecards t ON t.id = it.timecard_id
              AND t.deleted_at IS NULL
              JOIN shift s ON s.id = t.shift_id
              AND s.deleted_at IS NULL
              JOIN provider p ON p.id = s.provider_id
              AND p.deleted_at IS NULL
              JOIN certificate c ON c.id = s.certificate_id
              AND c.deleted_at IS NULL
              JOIN speciality sp ON sp.id = s.speciality_id
              AND sp.deleted_at IS NULL
            WHERE
              it.invoice_id = i.id
              AND it.deleted_at IS NULL
          ) AS timecards
        FROM
          invoices i
          LEFT JOIN facility f ON f.id = i.facility_id
          AND f.deleted_at IS NULL
        WHERE
          i.deleted_at IS NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS invoice_details`);
    await queryRunner.query(`DROP VIEW IF EXISTS billed_invoices`);
    await queryRunner.query(`DROP VIEW IF EXISTS unbilled_invoice`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "billing_cycle_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "billing_cycle_start_date"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "tax"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "received"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "billed_date"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_bee6a47b9984ac0e7c91623fcff"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bee6a47b9984ac0e7c91623fcf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" RENAME COLUMN "facility_id" TO "provider_id"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8cab41f81fdc5629bfc92f1bda" ON "invoices" ("provider_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_8cab41f81fdc5629bfc92f1bdaf" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
