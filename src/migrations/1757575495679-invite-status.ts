import { MigrationInterface, QueryRunner } from 'typeorm';

export class InviteStatus1757575495679 implements MigrationInterface {
  name = 'InviteStatus1757575495679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS get_calendar_shift_data(UUID, DATE, DATE);
    `);
    await queryRunner.query(`DROP VIEW view_calendar_shift_raw;`);
    await queryRunner.query(
      `ALTER TYPE "public"."shift_invitation_status_enum" RENAME TO "shift_invitation_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_invitation_status_enum" AS ENUM('withdrawn', 'accepted', 'invited', 'unseen', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_invitation" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_invitation" ALTER COLUMN "status" TYPE "public"."shift_invitation_status_enum" USING "status"::"text"::"public"."shift_invitation_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_invitation" ALTER COLUMN "status" SET DEFAULT 'unseen'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_invitation_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."shift_request_status_enum" RENAME TO "shift_request_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_request_status_enum" AS ENUM('assigned', 'rejected', 'unassigned', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_request" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_request" ALTER COLUMN "status" TYPE "public"."shift_request_status_enum" USING "status"::"text"::"public"."shift_request_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_request" ALTER COLUMN "status" SET DEFAULT 'unassigned'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_request_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE VIEW view_calendar_shift_raw AS
            SELECT
            s.id AS shift_id_uuid,
            s.shift_id,
            s.start_date,
            TO_CHAR(s.start_time, 'HH12:MI AM') || ' - ' || TO_CHAR(s.end_time, 'HH12:MI AM') AS shift_duration,
            get_shift_time_code(s.start_time, s.end_time, s.facility_id) AS shift_time_code,
            s.start_time,
            s.end_time,
            s.status,
            s.facility_id,
            -- Provider
            p.id AS provider_id,
            p.first_name,
            p.last_name,
            p.base_url,
            p.profile_image,
            -- Certificate
            c.id AS certificate_id,
            c.name AS certificate_name,
            c.abbreviation AS certificate_abbreviation,
            -- Speciality
            sp.id AS speciality_id,
            sp.name AS speciality_name,
            sp.abbreviation AS speciality_abbreviation,
            -- Counts
            (
                    SELECT COUNT(*) FROM shift_request sr
                    WHERE sr.shift_id = s.id AND sr.status NOT IN ('rejected', 'assigned') AND sr.deleted_at IS NULL
            ) AS request_count,
            (
                    SELECT COUNT(*) FROM shift_invitation si
                    WHERE si.shift_id = s.id AND si.status NOT IN ('rejected', 'withdrawn', 'accepted') AND si.deleted_at IS NULL
            ) AS invite_count
            FROM shift s
            LEFT JOIN provider p ON p.id = s.provider_id
            LEFT JOIN certificate c ON c.id = s.certificate_id
            LEFT JOIN speciality sp ON sp.id = s.speciality_id
            WHERE s.deleted_at IS NULL;`,
    );
    await queryRunner.query(`
		CREATE OR REPLACE FUNCTION public.get_calendar_shift_data(
			p_facility uuid,
			p_startDate date,
			p_endDate date
		)
		RETURNS TABLE(
			shift_duration text,
			shift_time_code text,
			start_time time without time zone,
			job_type json
		)
		LANGUAGE 'plpgsql'
		COST 100
		VOLATILE PARALLEL UNSAFE
		AS $BODY$
		BEGIN
			RETURN QUERY
				SELECT
					job_group.shift_duration,
					job_group.shift_time_code,
					job_group.start_time,
					json_agg(
						json_build_object(
							'name', job_group.certificate_abbreviation,
							'shifts', job_group.shifts
						) ORDER BY job_group.certificate_abbreviation
					) AS job_type
				FROM (
					SELECT
						inner_group.shift_duration,
						inner_group.shift_time_code,
						inner_group.certificate_abbreviation,
						MIN(inner_group.start_time) as start_time,
						json_agg(
							json_build_object(
								'id', inner_group.shift_id_uuid,
								'shift_id', inner_group.shift_id,
								'start_time', inner_group.start_time,
								'end_time', inner_group.end_time,
								'date', inner_group.start_date,
								'shift_status',
									(CASE
									WHEN inner_group.status IN ('requested', 'auto_scheduling', 'invite_sent', 'open', 'cancelled') THEN 'open'
									WHEN inner_group.status IN ('completed', 'scheduled', 'ongoing', 'un_submitted', 'running_late') THEN 'filled'
									WHEN inner_group.status = 'void' THEN 'void'
									ELSE inner_group.status::text
									END)::text,
								'provider_id', inner_group.provider_id,
								'first_name', inner_group.first_name,
								'last_name', inner_group.last_name,
								'base_url', inner_group.base_url,
								'profile_image', inner_group.profile_image,
								'certificate_id', inner_group.certificate_id,
								'certificate_name', inner_group.certificate_name,
								'certificate_abbreviation', inner_group.certificate_abbreviation,
								'speciality_id', inner_group.speciality_id,
								'speciality_name', inner_group.speciality_name,
								'speciality_abbreviation', inner_group.speciality_abbreviation,
								'request_count', inner_group.request_count,
								'invite_count', inner_group.invite_count
							)
							ORDER BY inner_group.start_time ASC
						) AS shifts
					FROM view_calendar_shift_raw inner_group
					WHERE inner_group.facility_id = p_facility
						AND inner_group.start_date BETWEEN p_startDate AND p_endDate
						AND inner_group.provider_id IS NOT NULL
					GROUP BY inner_group.shift_duration, inner_group.shift_time_code, inner_group.certificate_abbreviation
				) job_group
				GROUP BY job_group.shift_duration, job_group.shift_time_code, job_group.start_time
				ORDER BY job_group.start_time ASC;
		END;
		$BODY$;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."shift_request_status_enum_old" AS ENUM('assigned', 'rejected', 'unassigned')`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_request" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_request" ALTER COLUMN "status" TYPE "public"."shift_request_status_enum_old" USING "status"::"text"::"public"."shift_request_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_request" ALTER COLUMN "status" SET DEFAULT 'unassigned'`,
    );
    await queryRunner.query(`DROP TYPE "public"."shift_request_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."shift_request_status_enum_old" RENAME TO "shift_request_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_invitation_status_enum_old" AS ENUM('withdrawn', 'accepted', 'invited', 'unseen', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_invitation" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_invitation" ALTER COLUMN "status" TYPE "public"."shift_invitation_status_enum_old" USING "status"::"text"::"public"."shift_invitation_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_invitation" ALTER COLUMN "status" SET DEFAULT 'unseen'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_invitation_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."shift_invitation_status_enum_old" RENAME TO "shift_invitation_status_enum"`,
    );
  }
}
