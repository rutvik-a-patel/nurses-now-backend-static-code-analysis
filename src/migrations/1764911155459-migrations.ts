import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1764911155459 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION public.get_payment_details (
            in_provider_id UUID,
            in_start_date date,
            in_end_date date
        ) RETURNS TABLE (
            id UUID,
            provider_id UUID,
            facility_id UUID,
            facility CHARACTER VARYING,
            start_date TEXT,
            total DOUBLE PRECISION,
            total_worked INTEGER,
            total_amount DOUBLE PRECISION,
            adjustment DOUBLE PRECISION,
            status TEXT
        ) LANGUAGE plpgsql AS $$
        BEGIN
            RETURN QUERY
        SELECT
			s.id,
            s.provider_id,
            f.id AS facility_id,
            f.name AS facility,
            s.start_date::TEXT,
			s.pay_rate::DOUBLE PRECISION AS total,
			s.total_worked::INTEGER,
			s.total_payable_amount::DOUBLE PRECISION AS total_amount,
			s.total_adjustment::DOUBLE PRECISION AS adjustment,
			(
                        CASE
                            WHEN EXISTS (
                                SELECT
                                    1
                                FROM
                                    disbursements d
                                WHERE
                                    d.shift_id = s.id
                            ) THEN 'paid'
                            ELSE 'pending'
                        END
                    ) AS status
        FROM
            shift s
            LEFT JOIN facility f ON f.id = s.facility_id
            AND f.deleted_at IS NULL
        WHERE
            s.provider_id = in_provider_id
            AND s.status = 'completed'
            AND s.start_date BETWEEN in_start_date AND in_end_date
            AND s.deleted_at IS NULL;
        END;
        $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS public.get_payment_details (
            UUID,
            date,
            date
        );
    `);
  }
}
