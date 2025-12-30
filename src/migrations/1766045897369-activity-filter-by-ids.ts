import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityFilterByIds1766045897369 implements MigrationInterface {
  name = 'ActivityFilterByIds1766045897369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity" ADD "entity_id" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_ae8895d1732201c8184c61a24e" ON "activity" ("entity_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae8895d1732201c8184c61a24e"`,
    );
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "entity_id"`);
  }
}
