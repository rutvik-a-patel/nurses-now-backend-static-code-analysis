import { MigrationInterface, QueryRunner } from 'typeorm';

export class LocationMapDetails1761306573198 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_entity_details(
                entity_id UUID,
                entity_type TEXT,
                arg_start_date DATE DEFAULT NULL,
                arg_end_date DATE DEFAULT NULL
            )
            RETURNS JSONB AS $$
            DECLARE
                result JSONB;
            BEGIN
                IF entity_type = 'provider' THEN
                    SELECT JSONB_BUILD_OBJECT(
                        'id', p.id,
                        'first_name', p.first_name,
                        'middle_name', p.middle_name,
                        'last_name', p.last_name,
                        'base_url', p.base_url,
                        'image', p.profile_image,
                        'mobile_no', p.mobile_no,
                        'email', p.email,
                        'status', JSONB_BUILD_OBJECT(
                            'id', ss.id,
                            'name', ss.name,
                            'background_color', ss.background_color,
                            'text_color', ss.text_color
                        ),
                        'certificate', JSONB_BUILD_OBJECT(
                            'id', c.id,
                            'name', c.name,
                            'abbreviation', c.abbreviation
                        ),
                        'speciality', JSONB_BUILD_OBJECT(
                            'id', s.id,
                            'name', s.name,
                            'abbreviation', s.abbreviation
                        ),
                        'address', (
                            SELECT JSONB_AGG(
                                JSONB_BUILD_OBJECT(
                                    'street', a.street,
                                    'apartment', a.apartment,
                                    'city', a.city,
                                    'state', a.state,
                                    'zip_code', a.zip_code,
                                    'country', a.country
                                )
                            )
                            FROM provider_address a
                            WHERE a.provider_id = p.id
                        ),
                        'shifts', JSONB_BUILD_OBJECT(
                            'total_shifts', (
                                SELECT COUNT(*) 
                                FROM shift s
                                WHERE s.provider_id = p.id
                                AND (arg_start_date IS NULL OR s.start_date >= arg_start_date)
                                AND (arg_end_date IS NULL OR s.end_date <= arg_end_date)
                            ),
                            'total_cancelled', (
                                SELECT COUNT(*) 
                                FROM shift s
                                WHERE s.provider_id = p.id
                                AND s.status = 'cancelled'
                                AND (arg_start_date IS NULL OR s.start_date >= arg_start_date)
                                AND (arg_end_date IS NULL OR s.end_date <= arg_end_date)
                            ),
                            'last_scheduled_shift', (
                                SELECT MAX(s.start_date)::TEXT
                                FROM shift s
                                WHERE s.provider_id = p.id
								AND s.status IN ('un_submitted', 'completed')
                            ),
                            'next_scheduled_shift', (
                                SELECT MIN(TO_CHAR(s.start_date, 'YYYY-MM-DD'))
						        FROM shift s
						        WHERE s.provider_id = p.id
						        AND s.status = 'scheduled'
                            )
                        )
                    )
                    INTO result
                    FROM provider p
                    LEFT JOIN certificate c ON c.id = p.certificate_id
                    LEFT JOIN speciality s ON s.id = p.speciality_id
                    LEFT JOIN status_setting ss ON ss.id = p.status
                    WHERE p.id = entity_id;

                ELSIF entity_type = 'facility' THEN
                    SELECT JSONB_BUILD_OBJECT(
                        'id', f.id,
                        'name', f.name,
                        'mobile_no', f.mobile_no,
                        'total_beds', f.total_beds,
                        'base_url', f.base_url,
                        'image', f.image,
                        'website', f.website,
                        'address', JSONB_BUILD_OBJECT(
                            'street', f.street_address,
                            'house_no', f.house_no,
                            'city', f.city,
                            'state', f.state,
                            'country', f.country,
                            'zip_code', f.zip_code,
                            'latitude', f.latitude,
                            'longitude', f.longitude
                        ),
                        'status', JSONB_BUILD_OBJECT(
                            'id', ss.id,
                            'name', ss.name,
                            'background_color', ss.background_color,
                            'text_color', ss.text_color
                        ),
                        'facility_type', JSONB_BUILD_OBJECT(
                            'id', lob.id,
                            'name', lob.name
                        ),
                        'shifts', JSONB_BUILD_OBJECT(
                            'open', (
                                SELECT COUNT(*)
                                FROM shift s
                                WHERE s.facility_id = f.id
                                AND s.status = 'open'
                                AND (arg_start_date IS NULL OR s.start_date >= arg_start_date)
                                AND (arg_end_date IS NULL OR s.end_date <= arg_end_date)
                            ),
                            'scheduled', (
                                SELECT COUNT(*)
                                FROM shift s
                                WHERE s.facility_id = f.id
                                AND s.status = 'scheduled'
                                AND (arg_start_date IS NULL OR s.start_date >= arg_start_date)
                                AND (arg_end_date IS NULL OR s.end_date <= arg_end_date)
                            ),
                            'completed', (
                                SELECT COUNT(*)
                                FROM shift s
                                WHERE s.facility_id = f.id
                                AND s.status = 'completed'
                                AND (arg_start_date IS NULL OR s.start_date >= arg_start_date)
                                AND (arg_end_date IS NULL OR s.end_date <= arg_end_date)
                            ),
                            'auto_scheduling', (
                                SELECT COUNT(*)
                                FROM shift s
                                WHERE s.facility_id = f.id
                                AND s.status = 'auto_scheduling'
                                AND (arg_start_date IS NULL OR s.start_date >= arg_start_date)
                                AND (arg_end_date IS NULL OR s.end_date <= arg_end_date)
                            ),
                            'last_scheduled_shift', (
                                SELECT MAX(s.start_date)::TEXT
                                FROM shift s
                                WHERE s.facility_id = f.id
							    AND s.status = 'completed'
                            ),
                            'next_scheduled_shift', (
   								SELECT MIN(TO_CHAR(s.start_date, 'YYYY-MM-DD'))
                                FROM shift s
                                WHERE s.facility_id = f.id
								AND s.status = 'scheduled'
                            )
                        ),
                        'certificates', (
                            SELECT JSONB_AGG(
                                JSONB_BUILD_OBJECT('name', c.name, 'abbreviation', c.abbreviation)
                            )
                            FROM certificate c
                            WHERE c.id = ANY(f.certificate)
                        )
                    )
                    INTO result
                    FROM facility f
                    LEFT JOIN status_setting ss ON ss.id = f.status
                    LEFT JOIN line_of_business lob ON lob.id = f.facility_type_id
                    WHERE f.id = entity_id;

                ELSE
                    RAISE EXCEPTION 'Invalid entity_type. Must be "provider" or "facility"';
                END IF;

                RETURN result;
            END;
            $$ LANGUAGE plpgsql;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS get_entity_details(UUID, TEXT);
        `);
  }
}
