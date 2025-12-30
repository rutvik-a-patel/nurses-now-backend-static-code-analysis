import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProviderOrientation1756818225900
  implements MigrationInterface
{
  name = 'AlterProviderOrientation1756818225900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ADD "shift_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ADD CONSTRAINT "UQ_d92f194b856d33699968f076d44" UNIQUE ("shift_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "is_orientation" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ADD CONSTRAINT "FK_d92f194b856d33699968f076d44" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" DROP CONSTRAINT "FK_d92f194b856d33699968f076d44"`,
    );
    await queryRunner.query(`ALTER TABLE "shift" DROP COLUMN "is_orientation"`);
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" DROP CONSTRAINT "UQ_d92f194b856d33699968f076d44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" DROP COLUMN "shift_id"`,
    );
  }
}
