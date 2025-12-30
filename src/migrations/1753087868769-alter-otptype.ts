import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterOtptype1753087868769 implements MigrationInterface {
  name = 'AlterOtptype1753087868769';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."otp_type_enum" RENAME TO "otp_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."otp_type_enum" AS ENUM('signup', 'login', 'forgot_password', 'change_number', 'account_delete')`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "type" TYPE "public"."otp_type_enum" USING "type"::"text"::"public"."otp_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."otp_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."otp_type_enum_old" AS ENUM('signup', 'login', 'forgot_password', 'change_number')`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "type" TYPE "public"."otp_type_enum_old" USING "type"::"text"::"public"."otp_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."otp_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."otp_type_enum_old" RENAME TO "otp_type_enum"`,
    );
  }
}
