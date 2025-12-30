import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterRateGroup1761729172292 implements MigrationInterface {
  name = 'AlterRateGroup1761729172292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" ADD "allow_overtime" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_groups" DROP COLUMN "allow_overtime"`,
    );
  }
}
