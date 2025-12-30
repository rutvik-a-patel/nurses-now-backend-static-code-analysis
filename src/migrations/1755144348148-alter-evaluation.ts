import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterEvaluation1755144348148 implements MigrationInterface {
  name = 'AlterEvaluation1755144348148';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_evaluation" ADD "comment" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_evaluation" DROP COLUMN "comment"`,
    );
  }
}
