import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1765342952652 implements MigrationInterface {
  name = 'Migrations1765342952652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_token_provider_login" ON "token" ("provider_id", "login_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_address_provider_type" ON "provider_address" ("provider_id", "type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_address_state" ON "provider_address" ("state") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_address_city" ON "provider_address" ("city") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_address_zip" ON "provider_address" ("zip_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_provider_country_mobile" ON "provider" ("country_code", "mobile_no") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_provider_updated_at" ON "provider" ("updated_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_provider_created_at" ON "provider" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_provider_verification_status" ON "provider" ("verification_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_provider_status" ON "provider" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_provider_name_search" ON "provider" ("first_name", "middle_name", "last_name", "nick_name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_provider_name_search"`);
    await queryRunner.query(`DROP INDEX "public"."idx_provider_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_provider_verification_status"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_provider_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_provider_updated_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_provider_country_mobile"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_address_zip"`);
    await queryRunner.query(`DROP INDEX "public"."idx_address_city"`);
    await queryRunner.query(`DROP INDEX "public"."idx_address_state"`);
    await queryRunner.query(`DROP INDEX "public"."idx_address_provider_type"`);
    await queryRunner.query(`DROP INDEX "public"."idx_token_provider_login"`);
  }
}
