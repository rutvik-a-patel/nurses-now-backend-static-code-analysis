import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterActivityAndReferenceResponse1766401258908
  implements MigrationInterface
{
  name = 'AlterActivityAndReferenceResponse1766401258908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."provider_professional_reference_status_enum" RENAME TO "provider_professional_reference_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_professional_reference_status_enum" AS ENUM('awaiting_response', 'no_response', 'decline', 'awaiting_approval', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" ALTER COLUMN "status" TYPE "public"."provider_professional_reference_status_enum" USING "status"::"text"::"public"."provider_professional_reference_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" ALTER COLUMN "status" SET DEFAULT 'awaiting_response'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_professional_reference_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."activity_activity_type_enum" RENAME TO "activity_activity_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_activity_type_enum" AS ENUM('shift_created', 'shift_updated', 'shift_invited', 'shift_assigned', 'shift_cancelled', 'shift_completed', 'accepted_shift_invitation', 'rejected_shift_invitation', 'provider_accepted_shift_request', 'provider_rejected_shift_request', 'request_withdrawn', 'invite_again', 'provider_cancelled_shift', 'facility_reject_request', 'facility_accept_request', 'provider_request_shift', 'shift_started', 'clock_in', 'clock_out', 'break', 'provider_cancelled', 'no_response', 'no_invites', 'running_late', 'OPEN_ORDER', 'shift_voided', 'marked_running_late', 'distance_running_late', 'replace_running_late', 'no_replace_running_late', 'contact_user_created', 'contact_user_updated', 'contact_user_deleted', 'contact_resend_invitation', 'contact_activated', 'contact_deactivated', 'contact_reactivated', 'contact_detail_updated', 'contact_role_updated', 'role_created', 'role_updated', 'role_deleted', 'role_deactivated', 'role_reactivated', 'role_permission_updated', 'timecard_generated', 'timecard_flagged', 'timecard_disputed', 'timecard_disputed_resolved', 'timecard_edited', 'timecard_invoiced', 'staff_profile_approved', 'staff_profile_updated', 'staff_status_changed', 'staff_credential_assigned', 'staff_credential_approved', 'staff_credential_rejected', 'all_staff_credential_rejected', 'orientation_request_received', 'orientation_approved', 'orientation_rejected', 'orientation_document_assigned', 'orientation_shift_scheduled', 'orientation_completed', 'invoice_auto_generated', 'invoice_manually_billed', 'invoice_auto_billed', 'invoice_sent', 'invoice_re_sent', 'payment_recorded', 'payment_partially_allocated', 'corporate_client_added', 'corporate_client_updated', 'facility_added', 'facility_details_updated', 'facility_document_added', 'facility_accounting_updated', 'facility_note_added', 'facility_note_deleted', 'facility_settings_updated', 'competency_test_reassigned')`,
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
      `CREATE TYPE "public"."activity_activity_type_enum_old" AS ENUM('OPEN_ORDER', 'accepted_shift_invitation', 'all_staff_credential_rejected', 'break', 'clock_in', 'clock_out', 'contact_activated', 'contact_deactivated', 'contact_detail_updated', 'contact_reactivated', 'contact_resend_invitation', 'contact_role_updated', 'contact_user_created', 'contact_user_deleted', 'contact_user_updated', 'corporate_client_added', 'corporate_client_updated', 'distance_running_late', 'facility_accept_request', 'facility_accounting_updated', 'facility_added', 'facility_details_updated', 'facility_document_added', 'facility_note_added', 'facility_note_deleted', 'facility_reject_request', 'facility_settings_updated', 'invite_again', 'invoice_auto_billed', 'invoice_auto_generated', 'invoice_manually_billed', 'invoice_re_sent', 'invoice_sent', 'marked_running_late', 'no_invites', 'no_replace_running_late', 'no_response', 'orientation_approved', 'orientation_completed', 'orientation_document_assigned', 'orientation_rejected', 'orientation_request_received', 'orientation_shift_scheduled', 'payment_partially_allocated', 'payment_recorded', 'provider_accepted_shift_request', 'provider_cancelled', 'provider_cancelled_shift', 'provider_rejected_shift_request', 'provider_request_shift', 'rejected_shift_invitation', 'replace_running_late', 'request_withdrawn', 'role_created', 'role_deactivated', 'role_deleted', 'role_permission_updated', 'role_reactivated', 'role_updated', 'running_late', 'shift_assigned', 'shift_cancelled', 'shift_completed', 'shift_created', 'shift_invited', 'shift_started', 'shift_updated', 'shift_voided', 'staff_credential_approved', 'staff_credential_assigned', 'staff_credential_rejected', 'staff_profile_approved', 'staff_profile_updated', 'staff_status_changed', 'timecard_disputed', 'timecard_disputed_resolved', 'timecard_edited', 'timecard_flagged', 'timecard_generated', 'timecard_invoiced')`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ALTER COLUMN "activity_type" TYPE "public"."activity_activity_type_enum_old" USING "activity_type"::"text"::"public"."activity_activity_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."activity_activity_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."activity_activity_type_enum_old" RENAME TO "activity_activity_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_professional_reference_status_enum_old" AS ENUM('approved', 'awaiting_approval', 'awaiting_response', 'decline', 'no_response')`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" ALTER COLUMN "status" TYPE "public"."provider_professional_reference_status_enum_old" USING "status"::"text"::"public"."provider_professional_reference_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" ALTER COLUMN "status" SET DEFAULT 'awaiting_response'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_professional_reference_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."provider_professional_reference_status_enum_old" RENAME TO "provider_professional_reference_status_enum"`,
    );
  }
}
