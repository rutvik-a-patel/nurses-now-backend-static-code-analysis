import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterOrientationRejectRelatation1760338081040
  implements MigrationInterface
{
  name = 'AlterOrientationRejectRelatation1760338081040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orientation_document" DROP CONSTRAINT "FK_63b6ae9f5decfa3c9d601504db0"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd084fa30dc38a76d2b2b21b44" ON "orientation_document" ("base_url") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_47112855c81b6c72c5e0be0934" ON "orientation_document" ("filename") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f789803b3fd8b0512ff08535a4" ON "orientation_document" ("original_filename") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fcf45c30dd22c3834a3d893e7b" ON "orientation_document" ("verified_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28bb540611824d6ff5cd1ec28d" ON "orientation_document" ("verified_by_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64c2dd4bc06d66c1da0cae6a9a" ON "orientation_document" ("facility_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f15f4f06b79db83f15bd06af65" ON "orientation_document" ("provider_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "orientation_document" ADD CONSTRAINT "FK_63b6ae9f5decfa3c9d601504db0" FOREIGN KEY ("reason_id") REFERENCES "orientation_reject_reason"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orientation_document" DROP CONSTRAINT "FK_63b6ae9f5decfa3c9d601504db0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f15f4f06b79db83f15bd06af65"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64c2dd4bc06d66c1da0cae6a9a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_28bb540611824d6ff5cd1ec28d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fcf45c30dd22c3834a3d893e7b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f789803b3fd8b0512ff08535a4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_47112855c81b6c72c5e0be0934"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fd084fa30dc38a76d2b2b21b44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orientation_document" ADD CONSTRAINT "FK_63b6ae9f5decfa3c9d601504db0" FOREIGN KEY ("reason_id") REFERENCES "provider_reject_reason"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
