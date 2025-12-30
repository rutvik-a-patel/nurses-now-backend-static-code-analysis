import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterActivitySchema1765352800587 implements MigrationInterface {
  name = 'AlterActivitySchema1765352800587';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "action_by_id"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_action_for_enum" AS ENUM('accounting_setting', 'activity', 'admin', 'admin_document', 'certificate', 'chat', 'credential_reject_reason', 'credentials', 'credentials_category', 'corporate_client', 'department', 'disbursements', 'dnr_reason', 'documents', 'evaluation_response', 'facility', 'facility_holiday', 'facility_note', 'facility_permission', 'facility_provider', 'facility_user', 'facility_user_permission', 'flag_setting', 'floor_detail', 'holiday_group', 'invite', 'invoice_timecards', 'invoices', 'line_of_business', 'notification', 'orientation_reject_reason', 'payment_invoices', 'payments', 'provider', 'provider_credential', 'provider_education_history', 'provider_evaluation', 'provider_orientation', 'provider_professional_reference', 'provider_reject_reason', 'rate_groups', 'refer_facility', 'refer_friend', 'role', 'role_section_permission', 'shift', 'shift_cancel_reason', 'shift_invitation', 'shift_note', 'shift_request', 'speciality', 'state', 'status_setting', 'tag', 'time_sheets', 'timecard_reject_reason', 'timecards', 'token', 'user_notification')`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "action_for" "public"."activity_action_for_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "activity" ADD "admin_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "facility_user_id" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "activity" ADD "provider_id" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_3bc26c63676200aa51cb1b4f92" ON "activity" ("admin_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f75485909be933bf9c29aaa0d" ON "activity" ("facility_user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ee206d132cf7e23f965260dea9" ON "activity" ("provider_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e59aa6dc607aced6f7a7a2a4b3" ON "activity" ("shift_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_678281c99a36ba76bbcd4baa82" ON "activity" ("activity_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ddf4bf2ab3813d18c29a1bb5bf" ON "activity" ("message") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8036a3283d6dfb7e9e036ffd80" ON "activity" ("action_for") `,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_3bc26c63676200aa51cb1b4f92d" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_6f75485909be933bf9c29aaa0da" FOREIGN KEY ("facility_user_id") REFERENCES "facility_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_ee206d132cf7e23f965260dea98" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_ee206d132cf7e23f965260dea98"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_6f75485909be933bf9c29aaa0da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_3bc26c63676200aa51cb1b4f92d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8036a3283d6dfb7e9e036ffd80"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ddf4bf2ab3813d18c29a1bb5bf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_678281c99a36ba76bbcd4baa82"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e59aa6dc607aced6f7a7a2a4b3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee206d132cf7e23f965260dea9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f75485909be933bf9c29aaa0d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3bc26c63676200aa51cb1b4f92"`,
    );
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "provider_id"`);
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "facility_user_id"`,
    );
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "admin_id"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "action_for"`);
    await queryRunner.query(`DROP TYPE "public"."activity_action_for_enum"`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "action_by_id" uuid`);
  }
}
