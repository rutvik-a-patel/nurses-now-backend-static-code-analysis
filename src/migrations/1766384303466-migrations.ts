import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1766384303466 implements MigrationInterface {
  name = 'Migrations1766384303466';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_fd32421f2d93414e46a8fcfd86b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_fd32421f2d93414e46a8fcfd86b" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_fd32421f2d93414e46a8fcfd86b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_fd32421f2d93414e46a8fcfd86b" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
