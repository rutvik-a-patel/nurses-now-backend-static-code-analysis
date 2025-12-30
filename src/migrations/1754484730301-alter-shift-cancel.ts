import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterShiftCancel1754484730301 implements MigrationInterface {
  name = 'AlterShiftCancel1754484730301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."shift_cancelled_request_from_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD "cancelled_request_from" "public"."shift_cancelled_request_from_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shift" DROP COLUMN "cancelled_request_from"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_cancelled_request_from_enum"`,
    );
  }
}
