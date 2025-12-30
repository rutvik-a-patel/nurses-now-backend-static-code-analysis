import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimeLabelSetting1754549391970 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // insert default time label settings
    await queryRunner.query(`
			INSERT INTO
				TIME_LABEL_SETTING (
					ID,
					CREATED_AT,
					UPDATED_AT,
					TIME_CODE,
					LABEL,
					IS_ACTIVE
				)
			VALUES
				(
					GEN_RANDOM_UUID (),
					NOW(),
					NOW(),
					'D',
					'8 Hr Day',
					TRUE
				),
				(
					GEN_RANDOM_UUID (),
					NOW(),
					NOW(),
					'E',
					'8 Hr Evening',
					TRUE
				),
				(
					GEN_RANDOM_UUID (),
					NOW(),
					NOW(),
					'N',
					'8 Hr Night',
					TRUE
				),
				(
					GEN_RANDOM_UUID (),
					NOW(),
					NOW(),
					'A',
					'12 Hr Day',
					TRUE
				),
				(
					GEN_RANDOM_UUID (),
					NOW(),
					NOW(),
					'P',
					'12 Hr Night',
					TRUE
				);
	`);

    await queryRunner.query(`
			INSERT INTO
					PROVIDER_AVAILABILITY (
						ID,
						AVAILABILITY_TYPE,
						STATUS,
						DAY,
						SHIFT_TIME,
						"order"
					)
				VALUES
					(
						GEN_RANDOM_UUID (),
						'permanent',
						'active',
						'sunday',
						'{
							"A": true,
							"D": true,
							"E": true,
							"N": true,
							"P": true
						}'::JSONB,
						1
					),
					(
						GEN_RANDOM_UUID (),
						'permanent',
						'active',
						'monday',
						'{
							"A": true,
							"D": true,
							"E": true,
							"N": true,
							"P": true
						}'::JSONB,
						2
					),
					(
						GEN_RANDOM_UUID (),
						'permanent',
						'active',
						'tuesday',
						'{
							"A": true,
							"D": true,
							"E": true,
							"N": true,
							"P": true
						}'::JSONB,
						3
					),
					(
						GEN_RANDOM_UUID (),
						'permanent',
						'active',
						'wednesday',
						'{
							"A": true,
							"D": true,
							"E": true,
							"N": true,
							"P": true
						}'::JSONB,
						4
					),
					(
						GEN_RANDOM_UUID (),
						'permanent',
						'active',
						'thursday',
						'{
							"A": true,
							"D": true,
							"E": true,
							"N": true,
							"P": true
						}'::JSONB,
						5
					),
					(
						GEN_RANDOM_UUID (),
						'permanent',
						'active',
						'friday',
						'{
							"A": true,
							"D": true,
							"E": true,
							"N": true,
							"P": true
						}'::JSONB,
						6
					),
					(
						GEN_RANDOM_UUID (),
						'permanent',
						'active',
						'saturday',
						'{
							"A": true,
							"D": true,
							"E": true,
							"N": true,
							"P": true
						}'::JSONB,
						7
					);
			`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // remove time label settings
    await queryRunner.query(`
            DELETE FROM
                TIME_LABEL_SETTING
            WHERE
                TIME_CODE IN ('D', 'E', 'N', 'A', 'P');
    `);
  }
}
