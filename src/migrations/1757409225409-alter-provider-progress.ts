import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProviderProgress1757409225409 implements MigrationInterface {
  name = 'AlterProviderProgress1757409225409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider" ADD "profile_progress" numeric NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider" DROP COLUMN "profile_progress"`,
    );
  }
}
