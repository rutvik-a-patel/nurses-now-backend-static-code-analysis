import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCredentials1754475985521 implements MigrationInterface {
  name = 'AlterCredentials1754475985521';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD "base_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP COLUMN "base_url"`,
    );
  }
}
