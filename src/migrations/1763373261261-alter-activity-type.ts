import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterActivityType1763373261261 implements MigrationInterface {
  name = 'AlterActivityType1763373261261';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."activity_activity_type_enum" RENAME TO "activity_activity_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_activity_type_enum" AS ENUM('shift_created', 'shift_updated', 'shift_invited', 'shift_assigned', 'shift_cancelled', 'shift_completed', 'accepted_shift_invitation', 'rejected_shift_invitation', 'provider_accepted_shift_request', 'provider_rejected_shift_request', 'request_withdrawn', 'invite_again', 'provider_cancelled_shift', 'facility_reject_request', 'facility_accept_request', 'provider_request_shift', 'shift_started', 'clock_in', 'clock_out', 'break', 'provider_cancelled', 'no_response', 'no_invites', 'running_late', 'OPEN_ORDER', 'shift_voided', 'marked_running_late', 'distance_running_late', 'replace_running_late', 'no_replace_running_late', 'contact_user_created', 'contact_user_updated', 'contact_user_deleted', 'contact_resend_invitation', 'contact_activated', 'contact_deactivated', 'contact_reactivated', 'contact_detail_updated', 'contact_role_updated', 'role_created', 'role_updated', 'role_deleted', 'role_deactivated', 'role_reactivated', 'role_permission_updated', 'timecard_generated', 'timecard_flagged', 'timecard_disputed', 'timecard_disputed_resolved', 'timecard_edited', 'timecard_invoiced', 'staff_profile_approved', 'staff_profile_updated', 'staff_status_changed', 'staff_credential_assigned', 'staff_credential_approved', 'staff_credential_rejected', 'all_staff_credential_rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "activity_type" TYPE "public"."activity_activity_type_enum" USING "activity_type"::"text"::"public"."activity_activity_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."activity_activity_type_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."activity_activity_type_enum_old" AS ENUM('shift_created', 'shift_updated', 'shift_invited', 'shift_assigned', 'shift_cancelled', 'shift_completed', 'accepted_shift_invitation', 'rejected_shift_invitation', 'provider_accepted_shift_request', 'provider_rejected_shift_request', 'request_withdrawn', 'invite_again', 'provider_cancelled_shift', 'facility_reject_request', 'facility_accept_request', 'provider_request_shift', 'shift_started', 'clock_in', 'clock_out', 'break', 'provider_cancelled', 'no_response', 'no_invites', 'running_late', 'OPEN_ORDER', 'shift_voided', 'marked_running_late', 'distance_running_late', 'replace_running_late', 'no_replace_running_late')`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "activity_type" TYPE "public"."activity_activity_type_enum_old" USING "activity_type"::"text"::"public"."activity_activity_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."activity_activity_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."activity_activity_type_enum_old" RENAME TO "activity_activity_type_enum"`,
    );
  }
}
