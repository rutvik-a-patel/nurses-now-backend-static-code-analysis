import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProviderCredential1755686711216
  implements MigrationInterface
{
  name = 'AlterProviderCredential1755686711216';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD "credential_rejected_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD "credential_approved_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD "reason_description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD "reason_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f56d91260cb1d48fd1b8d95723" ON "provider_credential" ("reason_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD CONSTRAINT "FK_f56d91260cb1d48fd1b8d957235" FOREIGN KEY ("reason_id") REFERENCES "provider_reject_reason"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP CONSTRAINT "FK_f56d91260cb1d48fd1b8d957235"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f56d91260cb1d48fd1b8d95723"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP COLUMN "reason_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP COLUMN "reason_description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP COLUMN "credential_approved_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP COLUMN "credential_rejected_at"`,
    );
  }
}
