import { MigrationInterface, QueryRunner } from 'typeorm';

export class LocationMapNearBy1761291597872 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS find_nearby_at_centroid;
           CREATE OR REPLACE FUNCTION find_nearby_at_centroid(
                lat DOUBLE PRECISION DEFAULT NULL,
                lng DOUBLE PRECISION DEFAULT NULL,
                radius DOUBLE PRECISION DEFAULT NULL,
                status_ids UUID[] DEFAULT NULL,
                certificate_ids UUID[] DEFAULT NULL,
                facility_status_ids UUID[] DEFAULT NULL
            )
            RETURNS JSON AS
            $$
            DECLARE
                result JSON;
            BEGIN
                WITH

                -- Detect if location filtering must be skipped
                location_disabled AS (
                    SELECT (lat IS NULL OR lng IS NULL OR radius IS NULL) AS disabled
                ),

                ref_point AS (
                    SELECT
                        geography(ST_MakePoint(lng, lat)) AS gp,
                        (COALESCE(radius, 25) * 1609.0) AS meters
                    WHERE lat IS NOT NULL AND lng IS NOT NULL
                ),

                providers_cte AS (
                    SELECT
                        p.id,
                        p.first_name,
                        p.last_name,
                        p.base_url,
                        p.profile_image,
                        p.status AS status_id,
                        p.latitude AS latitude,
                        p.longitude AS longitude,
                        p.certificate_id AS certificate_id,
                        CASE
                            WHEN (SELECT disabled FROM location_disabled) THEN NULL
                            ELSE ST_Distance(
                                geography(ST_MakePoint(p.longitude, p.latitude)),
                                (SELECT gp FROM ref_point)
                            ) / 1609.0
                        END AS distance_in_miles
                    FROM provider p
                    WHERE
                        (
                            (SELECT disabled FROM location_disabled)
                            OR (
                                ST_DWithin(
                                    geography(ST_MakePoint(p.longitude, p.latitude)),
                                    (SELECT gp FROM ref_point),
                                    (SELECT meters FROM ref_point)
                                )
                            )
                        )
                    AND (status_ids IS NULL OR p.status = ANY(status_ids))
                    AND (certificate_ids IS NULL OR p.certificate_id = ANY(certificate_ids))
                    ORDER BY distance_in_miles NULLS LAST
                ),

                facilities_cte AS (
                    SELECT
                        f.id,
                        f.name,
                        f.status AS status_id,
                        f.base_url,
                        f.image,
                        f.zip_code,
                        f.latitude,
                        f.longitude,
                        CASE
                            WHEN (SELECT disabled FROM location_disabled) THEN NULL
                            ELSE ST_Distance(
                                geography(ST_MakePoint(f.longitude, f.latitude)),
                                (SELECT gp FROM ref_point)
                            ) / 1609.0
                        END AS distance_in_miles
                    FROM facility f
                    WHERE
                        f.is_corporate_client = FALSE
                        AND (
                            (SELECT disabled FROM location_disabled)
                            OR (
                                ST_DWithin(
                                    geography(ST_MakePoint(f.longitude, f.latitude)),
                                    (SELECT gp FROM ref_point),
                                    (SELECT meters FROM ref_point)
                                )
                            )
                        )
                        AND (facility_status_ids IS NULL OR f.status = ANY(facility_status_ids))
                    ORDER BY distance_in_miles NULLS LAST
                )

                SELECT JSON_BUILD_OBJECT(
                    'providers',
                        COALESCE(
                            (
                                SELECT JSON_AGG(
                                    JSON_BUILD_OBJECT(
                                        'id', id,
                                        'first_name', first_name,
                                        'last_name', last_name,
                                        'base_url', base_url,
                                        'profile_image', profile_image,
                                        'status_id', status_id,
                                        'certificate_id', certificate_id,
                                        'latitude', latitude,
                                        'longitude', longitude,
                                        'distance_in_miles', distance_in_miles,
                                        'type', 'provider'
                                    )
                                    ORDER BY distance_in_miles
                                ) FROM providers_ctE
                            ),
                            '[]'::json
                        ),
                    'facilities',
                        COALESCE(
                            (
                                SELECT JSON_AGG(
                                    JSON_BUILD_OBJECT(
                                        'id', id,
                                        'name', name,
                                        'status_id', status_id,
                                        'base_url', base_url,
                                        'image', image,
                                        'zip_code', zip_code,
                                        'latitude', latitude,
                                        'longitude', longitude,
                                        'distance_in_miles', distance_in_miles,
                                        'type', 'facility'
                                    )
                                    ORDER BY distance_in_miles
                                ) FROM facilities_cte
                            ),
                            '[]'::json
                        )
                ) INTO result;

                RETURN result;
            END;
            $$ LANGUAGE plpgsql STABLE;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS find_nearby_at_centroid;
        `);
  }
}
