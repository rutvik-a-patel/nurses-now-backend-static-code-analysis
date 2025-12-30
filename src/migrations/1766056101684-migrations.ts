import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1766056101684 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO sub_section (id, name, section_id) values ('b4d60911-3942-4a57-8f8e-5795f57ea7e9', 'staff_reject_reasons', 'a7fc5bcc-092d-426e-a7a6-e6cd3c2c2705')
    `);
    await queryRunner.query(`
        INSERT INTO role_section_permission (section_id, sub_section_id, permission_id, role_id, has_access, is_default)
        VALUES
            ('a7fc5bcc-092d-426e-a7a6-e6cd3c2c2705', 'b4d60911-3942-4a57-8f8e-5795f57ea7e9', '140454c4-efd9-4f70-a6ff-762d857e725b', '27a879f5-c044-4074-96c0-34ee3d209f17', TRUE, TRUE
            ),
            ('a7fc5bcc-092d-426e-a7a6-e6cd3c2c2705', 'b4d60911-3942-4a57-8f8e-5795f57ea7e9', 'f8b6f0a6-eee8-4dc9-9d89-bb7637ba1209', '27a879f5-c044-4074-96c0-34ee3d209f17', TRUE,TRUE
            ),
            ('a7fc5bcc-092d-426e-a7a6-e6cd3c2c2705', 'b4d60911-3942-4a57-8f8e-5795f57ea7e9', 'bbcda016-0536-4685-ac9d-a5257f0027a2', '27a879f5-c044-4074-96c0-34ee3d209f17', TRUE,TRUE
            ),
            ('a7fc5bcc-092d-426e-a7a6-e6cd3c2c2705', 'b4d60911-3942-4a57-8f8e-5795f57ea7e9', '62726506-7026-4e4c-b31d-acde20fba844', '27a879f5-c044-4074-96c0-34ee3d209f17', TRUE,TRUE)
    `);
    await queryRunner.query(`
        DELETE FROM role_section_permission
        WHERE
            id IN (
                SELECT
                    id
                FROM
                    role_section_permission
                WHERE
                    section_id = '7e53257e-4b86-46d6-a4ee-7e0ea44d0bde'
                    AND sub_section_id = 'a95e6153-9052-4af5-9dbd-511f54ce807f'
                    AND permission_id = 'a5d8fd28-5e0d-49d1-afa6-5790c4e5dfd5'
	    )
    `);
    await queryRunner.query(`
        DELETE FROM role_section_permission
        WHERE
            id IN (
                SELECT
                    id
                FROM
                    role_section_permission
                WHERE
                    section_id = 'a7fc5bcc-092d-426e-a7a6-e6cd3c2c2705'
                    AND sub_section_id = '346523c9-bded-4a6b-aec6-b37d68fdf643'
                    AND permission_id IN (
                        'f8b6f0a6-eee8-4dc9-9d89-bb7637ba1209',
                        '62726506-7026-4e4c-b31d-acde20fba844'
                    )
	    )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM sub_section WHERE name = 'staff_reject_reasons`,
    );
  }
}
