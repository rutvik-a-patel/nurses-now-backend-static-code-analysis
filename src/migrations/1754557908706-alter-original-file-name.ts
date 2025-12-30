import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterOriginalFileName1754557908706 implements MigrationInterface {
  name = 'AlterOriginalFileName1754557908706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility" ADD "original_filename" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "e_doc_response" ADD "original_filename" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "e_doc_response" DROP COLUMN "original_filename"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" DROP COLUMN "original_filename"`,
    );
  }
}
