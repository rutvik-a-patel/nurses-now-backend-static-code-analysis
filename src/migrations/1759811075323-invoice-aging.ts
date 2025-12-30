import { MigrationInterface, QueryRunner } from 'typeorm';

export class InvoiceAging1759811075323 implements MigrationInterface {
  name = 'InvoiceAging1759811075323';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "aging" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "aging"`);
  }
}
