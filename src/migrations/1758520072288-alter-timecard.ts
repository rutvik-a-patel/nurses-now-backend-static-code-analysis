import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTimecard1758520072288 implements MigrationInterface {
  name = 'AlterTimecard1758520072288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "timecards" ADD "base_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "timecards" DROP COLUMN "base_url"`);
  }
}
