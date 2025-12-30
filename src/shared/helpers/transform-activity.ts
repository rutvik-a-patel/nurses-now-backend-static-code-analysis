import { ACTIVITY_TYPE } from '../constants/enum';
import { GroupedActivity, TransformedActivity } from '../constants/types';
import * as moment from 'moment';

// for simplifying the provider names into a readable and avoid [Object,object] as some response are array while inviting
function getProviderNames(providerField: any): string {
  if (Array.isArray(providerField)) {
    return providerField
      .map((p) => p?.name)
      .filter(Boolean)
      .join(', ');
  } else if (typeof providerField === 'string') {
    return providerField;
  } else {
    return 'Staff';
  }
}

export function transformAndGroupActivities(
  activities: any[],
): GroupedActivity[] {
  const transformedActivities: TransformedActivity[] = activities.map(
    (activity) => {
      const { action_by_user, message } = activity || {};

      const {
        name: actionByName,
        image: actionByImage,
        base_url: actionByBaseUrl,
      } = action_by_user ?? {};

      const {
        shift_date: shiftDate,
        shift_time: shiftStartTime,
        speciality,
        certificate,
        from_status,
        to_status,
        clock_in_time,
        clock_out_time,
        location,
      } = message ?? {};

      const facilityName =
        activity?.message?.facility_name ||
        activity?.shift?.facility?.name ||
        activity?.facility?.name;
      const shiftTime = activity?.message?.shift_time;
      const providerName = getProviderNames(activity?.message?.provider);
      const cancelReason = activity?.message?.cancel_title;

      const formattedShiftDate = shiftDate
        ? moment(shiftDate).format('MM-DD-YYYY')
        : '';

      let name = '';
      let action = '';
      let title = '';
      let dropdownTop = '';
      let dropdownBottom: string | string[] = '';
      let contact_user = {};
      let role = {};

      switch (activity.activity_type) {
        case ACTIVITY_TYPE.SHIFT_CREATED:
          name = actionByName;
          action = 'Shift Created.';
          title = `created this shift.`;
          dropdownBottom = `Details: ${certificate}/${speciality} | ${formattedShiftDate}, ${shiftTime}`;
          break;

        case ACTIVITY_TYPE.SHIFT_UPDATED:
          name = actionByName;
          action = 'Shift Details Edited';
          title = ` updated shift details.`;
          dropdownBottom = activity.message?.changes || [];
          break;

        case ACTIVITY_TYPE.SHIFT_INVITED:
          name = actionByName;
          action = `Provider Invited`;
          title = `invited ${providerName}.`;
          dropdownBottom = `Details: ${certificate}/${speciality} | ${formattedShiftDate}, ${shiftTime}`;
          break;

        case ACTIVITY_TYPE.SHIFT_ASSIGNED:
          name = actionByName;
          action = 'Assigned this shift.';
          title = `${actionByName} assigned this shift.`;
          dropdownTop = `Shift assigned by ${actionByName}.`;
          dropdownBottom = `Shift assigned to ${certificate} at ${facilityName} on ${formattedShiftDate}.`;
          break;

        case ACTIVITY_TYPE.ACCEPTED_SHIFT_INVITATION:
          name = providerName;
          action = 'Shift Invitation Accepted';
          title = `accepted this shift.`;
          dropdownBottom = `Details: ${formattedShiftDate}, ${shiftTime}`;
          break;

        case ACTIVITY_TYPE.REJECTED_SHIFT_INVITATION:
          name = providerName;
          action = 'Shift Invitation Rejected';
          title = `rejected this shift.`;
          dropdownBottom = `Details: ${formattedShiftDate}, ${shiftTime}`;
          break;

        case ACTIVITY_TYPE.PROVIDER_ACCEPTED_SHIFT_REQUEST:
          name = actionByName;
          action = 'Accepted the shift request.';
          title = `${actionByName} accepted the shift request.`;
          dropdownBottom = `Shift request accepted for ${certificate} at ${facilityName}.`;
          break;

        case ACTIVITY_TYPE.PROVIDER_REJECTED_SHIFT_REQUEST:
          name = actionByName;
          action = 'Rejected the shift request.';
          title = `${actionByName} rejected the shift request.`;
          dropdownBottom = `Shift request rejected for ${certificate} at ${facilityName}.`;
          break;

        case ACTIVITY_TYPE.REQUEST_WITHDRAWN:
          name = actionByName;
          action = `Request Withdrawn`;
          title = `withdrew the invitation for ${providerName}.`;
          dropdownBottom = `Details: ${formattedShiftDate}, ${shiftTime}`;
          break;

        case ACTIVITY_TYPE.INVITE_AGAIN:
          name = actionByName;
          action = `Invite Again`;
          title = `re-invited ${providerName}.`;
          dropdownBottom = `Details: ${formattedShiftDate}, ${shiftTime}`;
          break;

        case ACTIVITY_TYPE.SHIFT_CANCELLED:
          name = actionByName;
          action = 'Shift Cancelled';
          title = `cancelled this shift.`;
          dropdownBottom = `Reason: ${cancelReason}`;
          break;

        case ACTIVITY_TYPE.PROVIDER_CANCELLED_SHIFT:
          name = providerName;
          action = 'Shift Cancelled';
          title = `cancelled this shift.`;
          dropdownBottom = `Reason: ${cancelReason}`;
          break;

        case ACTIVITY_TYPE.FACILITY_ACCEPT_REQUEST:
          name = actionByName;
          action = 'Shift Request Accepted';
          title = `accepted a shift request.`;
          dropdownBottom = `Details: ${certificate} | ${formattedShiftDate} | ${shiftTime}`;
          break;

        case ACTIVITY_TYPE.FACILITY_REJECT_REQUEST:
          name = actionByName;
          action = 'Shift Request Rejected';
          title = `rejected a shift request.`;
          dropdownBottom = `Details: ${certificate} | ${formattedShiftDate} | ${shiftTime}`;
          break;

        case ACTIVITY_TYPE.PROVIDER_REQUEST_SHIFT:
          name = providerName;
          action = 'Status Change';
          dropdownBottom = `Shift request received from staff`;
          break;

        case ACTIVITY_TYPE.CLOCK_IN:
          name = actionByName;
          action = 'Staff Clocked';
          dropdownBottom = `Shift started on ${clock_in_time} at ${facilityName}.`;
          break;

        case ACTIVITY_TYPE.SHIFT_STARTED:
          name = actionByName;
          action = 'Shift started';
          title = `Shift started by ${actionByName}.`;
          break;

        case ACTIVITY_TYPE.CLOCK_OUT:
          name = actionByName;
          action = `${actionByName} clocked out`;
          dropdownBottom = `Clock-out at ${clock_out_time} from ${facilityName}.`;
          break;

        case ACTIVITY_TYPE.SHIFT_COMPLETED:
          name = actionByName;
          action = 'Shift completed';
          dropdownBottom = `Shift completed by ${actionByName} after clock-out.`;
          break;

        case ACTIVITY_TYPE.BREAK:
          name = actionByName;
          action = 'Took a break.';
          title = `${actionByName} took a break.`;
          dropdownTop = `Break taken by ${actionByName}.`;
          dropdownBottom = `Break recorded.`;
          break;

        case ACTIVITY_TYPE.AUTO_SCHEDULING_PROVIDER_CANCELLED:
          name = actionByName;
          action = `AI triggered after provider cancelled shift`;
          title = `AI triggered to reschedule shift after provider cancellation.`;
          break;

        case ACTIVITY_TYPE.AUTO_SCHEDULING_NO_RESPONSE:
          name = actionByName;
          action = `AI triggered due to no provider response`;
          title = `AI started auto-scheduling due to no response from invited providers`;
          break;

        case ACTIVITY_TYPE.AUTO_SCHEDULING_NO_INVITES:
          name = actionByName;
          action = `AI triggered after shift posted without invites`;
          title = `AI started finding provider as no invites were sent on shift creation.`;
          break;

        case ACTIVITY_TYPE.SHIFT_VOIDED:
          name = actionByName;
          action = `Status Change`;
          title = `Shift marked as Void due to no scheduled provider.`;
          break;

        case ACTIVITY_TYPE.OPEN_ORDER:
          name = actionByName;
          action = `Status Change`;
          title = `Shift posted to Open Order by AI due to no provider found.`;
          break;

        case ACTIVITY_TYPE.PROVIDER_REQUEST_SHIFT:
          name = actionByName;
          action = `Status Change`;
          title = `Shift request received from provider.`;
          break;

        case ACTIVITY_TYPE.MARKED_RUNNING_LATE:
          name = actionByName;
          action = `AI triggered due to provider running late`;
          title = `AI triggered due to provider running late, replacement requested.`;
          break;

        case ACTIVITY_TYPE.DISTANCE_RUNNING_LATE:
          name = actionByName;
          action = `Status Change`;
          title = `Shift marked as Running Late due to provider\’s distance.`;
          break;

        case ACTIVITY_TYPE.REPLACE_RUNNING_LATE:
          name = actionByName;
          action = `${actionByName} requested AI to find replacement`;
          title = `Facility requested AI to find a replacement provider`;
          break;

        case ACTIVITY_TYPE.NO_REPLACE_RUNNING_LATE:
          name = actionByName;
          action = `${actionByName} opted to wait for assigned provider`;
          title = `Facility opted to wait for the assigned provider`;
          break;

        // Contact User Activities
        case ACTIVITY_TYPE.CONTACT_USER_CREATED:
          name = actionByName;
          action = `New user created (invited).`;
          title = `User invited`;
          contact_user = {
            invited_user: `${activity.message?.contact_user}`,
            invited_user_email: `${activity.message?.contact_user_email}`,
            assigned_role: `${activity.message?.assigned_role}`,
          };
          break;

        case ACTIVITY_TYPE.CONTACT_USER_UPDATED:
          name = actionByName;
          action = 'User details updated.';
          title = `User Details Updated`;
          dropdownBottom = activity.message?.changes || [];
          contact_user = {
            invited_user: `${activity.message?.contact_user}`,
          };
          break;

        case ACTIVITY_TYPE.CONTACT_ROLE_UPDATED:
          name = actionByName;
          action = 'User role changed.';
          title = `User Role Updated`;
          dropdownBottom = activity.message?.changes || [];
          contact_user = {
            invited_user: `${activity.message?.contact_user}`,
          };
          break;

        case ACTIVITY_TYPE.CONTACT_ACTIVATED:
          name = actionByName;
          action = 'User accepted invitation / onboarded successfully.';
          title = `User Activated`;
          contact_user = {
            invited_user: `${activity.message?.contact_user}`,
          };
          break;

        case ACTIVITY_TYPE.CONTACT_RESEND_INVITATION:
          name = actionByName;
          action = 'User re-invited (resend invitation).';
          title = `User Re-Invited`;
          contact_user = {
            invited_user: `${activity.message?.contact_user}`,
            invited_user_email: `${activity.message?.contact_user_email}`,
          };
          break;

        case ACTIVITY_TYPE.CONTACT_REACTIVATED:
          name = actionByName;
          action = 'User reactivated.';
          title = `User Reactivated`;
          contact_user = {
            invited_user: `${activity.message?.contact_user}`,
          };
          break;

        case ACTIVITY_TYPE.CONTACT_DEACTIVATED:
          name = actionByName;
          action = 'User deactivated.';
          title = `User Deactivated`;
          contact_user = {
            invited_user: `${activity.message?.contact_user}`,
          };
          break;

        // Role Activities
        case ACTIVITY_TYPE.ROLE_CREATED:
          name = actionByName;
          action = 'New role created.';
          title = `Role Created`;
          role = {
            name: `${activity.message?.role}`,
            description: `${activity.message?.description}`,
          };
          break;

        case ACTIVITY_TYPE.ROLE_DEACTIVATED:
          name = actionByName;
          action = 'Role deactivated.';
          title = `Role Deactivated`;
          dropdownBottom = activity.message?.changes || [];
          break;

        case ACTIVITY_TYPE.ROLE_REACTIVATED:
          name = actionByName;
          action = 'Role reactivated.';
          title = `Role Reactivated`;
          dropdownBottom = activity.message?.changes || [];
          break;

        case ACTIVITY_TYPE.ROLE_UPDATED:
          name = actionByName;
          action = 'Role details updated.';
          title = `Role Details Updated`;
          dropdownBottom = activity.message?.changes || [];
          break;

        case ACTIVITY_TYPE.ROLE_PERMISSION_UPDATED:
          name = actionByName;
          action = 'Role updated (permissions changed).';
          title = `Role Updated`;
          dropdownBottom = activity.message?.changes || [];
          break;

        case ACTIVITY_TYPE.ROLE_DELETED:
          name = actionByName;
          action = 'Role deleted.';
          title = `Role Deleted`;
          role = { name: activity.message?.role || null };
          break;

        // TIMECARD ACTIVITIES

        case ACTIVITY_TYPE.TIMECARD_GENERATED:
          name = actionByName;
          action = 'Timecard Generated';
          title = 'Timecard Generated';
          dropdownBottom = `Timecard generated for  ${providerName} - ${formattedShiftDate}, ${shiftStartTime}.`;
          break;

        case ACTIVITY_TYPE.TIMECARD_FLAGGED:
          name = actionByName;
          action = 'Timecard Flagged';
          title = 'Timecard Flagged';
          dropdownBottom = `Timecard flagged by system for  ${providerName} - ${formattedShiftDate}, ${shiftStartTime}. Payment paused until resolved.`;
          break;

        case ACTIVITY_TYPE.TIMECARD_DISPUTED:
          name = actionByName;
          action = 'Timecard Disputed';
          title = 'Timecard Disputed';
          dropdownBottom = `${facilityName} disputed timecard for ${providerName} - ${formattedShiftDate}, ${shiftStartTime}. Reason: ${activity.message?.reason || 'N/A'}.`;
          break;

        case ACTIVITY_TYPE.TIMECARD_DISPUTED_RESOLVED:
          name = actionByName;
          action = 'Timecard Disputed Resolved';
          title = 'Timecard Disputed Resolved';
          dropdownBottom = `${actionByName} resolved dispute for ${providerName} - ${formattedShiftDate}, ${shiftStartTime}. Outcome: ${activity.message?.changes || []}.`;
          break;

        case ACTIVITY_TYPE.TIMECARD_EDITED:
          name = actionByName;
          action = 'Timecard Edited';
          title = `Timecard Edited`;
          dropdownBottom = `${actionByName} updated timecard for ${providerName} - ${formattedShiftDate}, ${shiftStartTime}. Changes: ${activity.message?.changes || []}`;
          break;

        // STAFF ACTIVITIES
        case ACTIVITY_TYPE.STAFF_PROFILE_APPROVED:
          name = actionByName;
          action = 'Staff Profile Approved';
          title = `Staff Profile Approved`;
          dropdownBottom = `${actionByName} approved ${providerName} profile. Status updated to ${to_status}.`;
          break;

        case ACTIVITY_TYPE.STAFF_CREDENTIAL_REJECTED:
          name = actionByName;
          action = 'Credentials Rejected';
          title = `Credentials Rejected`;
          dropdownBottom = `${actionByName} rejected credentials for ${providerName}: ${activity.message?.credential}.`;
          break;

        case ACTIVITY_TYPE.STAFF_CREDENTIAL_APPROVED:
          name = actionByName;
          action = 'Credentials Approved';
          title = `Credentials Approved`;
          dropdownBottom = `${actionByName} approved credentials for ${providerName}: ${activity.message?.credential}.`;
          break;

        case ACTIVITY_TYPE.STAFF_PROFILE_UPDATED:
          name = actionByName;
          action = 'Staff Profile Updated';
          title = `Staff Profile Updated`;
          dropdownBottom = `${actionByName} updated ${providerName} profile details. (Fields updated: ${activity.message?.changes || []}).`;
          break;

        case ACTIVITY_TYPE.STAFF_STATUS_CHANGED:
          name = actionByName;
          action = 'Staff Status Changed';
          title = `Staff Status Changed`;
          dropdownBottom = `${actionByName} changed ${providerName} status from ${from_status} to ${to_status}.`;
          break;

        case ACTIVITY_TYPE.STAFF_CREDENTIAL_ASSIGNED:
          name = actionByName;
          action = 'Credentials Assigned';
          title = `Credentials Assigned`;
          dropdownBottom = `${actionByName} assigned credentials to ${providerName}: ${activity.message?.credential}.`;
          break;

        // ORIENTATION ACTIVITIES
        case ACTIVITY_TYPE.ORIENTATION_REQUEST_RECEIVED:
          name = actionByName;
          action = 'Orientation Request Received';
          title = `Orientation Request Received`;
          dropdownBottom = `Orientation request received from ${actionByName} ${activity.message?.changes.license || ''}/${activity.message?.changes.speciality || ''}.`;
          break;

        case ACTIVITY_TYPE.ORIENTATION_APPROVED:
          name = actionByName;
          action = 'Orientation Request Approved';
          title = `Orientation Request Approved`;
          dropdownBottom = `${actionByName} approved orientation request for ${providerName}.`;
          break;

        case ACTIVITY_TYPE.ORIENTATION_REJECTED:
          name = actionByName;
          action = 'Orientation Request Rejected';
          title = `Orientation Request Rejected`;
          dropdownBottom = `${actionByName} rejected orientation request for ${providerName}.`;
          break;
        case ACTIVITY_TYPE.ORIENTATION_DOCUMENT_ASSIGNED:
          name = actionByName;
          action = 'Orientation Document Assigned';
          title = `Orientation Document Assigned`;
          dropdownBottom = `${actionByName} assigned orientation document package to ${providerName}.`;
          break;

        case ACTIVITY_TYPE.ORIENTATION_SHIFT_SCHEDULED:
          name = actionByName;
          action = 'Orientation Shift Scheduled';
          title = `Orientation Shift Scheduled`;
          dropdownBottom = `${actionByName} scheduled orientation shift for ${providerName}. (Details: ${formattedShiftDate}, ${shiftTime})`;
          break;

        case ACTIVITY_TYPE.ORIENTATION_COMPLETED:
          name = actionByName;
          action = 'Orientation Completed';
          title = `Orientation Completed`;
          dropdownBottom = `Orientation completed for ${providerName}. Process: ${activity.message?.orientation_process || ''}.`;
          break;

        // CORPORATE CLIENT ACTIVITIES
        case ACTIVITY_TYPE.CORPORATE_CLIENT_ADDED:
          name = actionByName;
          action = 'Corporate Client Added';
          title = `Corporate Client Added`;
          dropdownBottom = `${actionByName} added Corporate Client: ${activity.message?.name || ''}.`;
          break;

        case ACTIVITY_TYPE.CORPORATE_CLIENT_UPDATED:
          name = actionByName;
          action = 'Corporate Client Updated';
          title = `Corporate Client Updated`;
          dropdownBottom = `${actionByName} updated details of Corporate Client: ${activity.message?.facility_name || 'N/A'}. (Changed Fields: ${activity.message?.changes || []}).`;
          break;

        // FACILITY ACTIVITIES
        case ACTIVITY_TYPE.FACILITY_ADDED:
          name = actionByName;
          action = 'Facility Added';
          title = `Facility Added`;
          dropdownBottom = `${actionByName} added Facility: ${activity.message?.name || 'N/A'}.`;
          break;

        case ACTIVITY_TYPE.FACILITY_DETAILS_UPDATED:
          name = actionByName;
          action = 'Facility Details Updated';
          title = `Facility Details Updated`;
          dropdownBottom = `${actionByName} updated details of Facility: ${activity.message?.facility_name || 'N/A'}. (Changed Fields: ${activity.message?.changes || []}).`;
          break;

        // DOCUMENT ACTIVITIES
        case ACTIVITY_TYPE.FACILITY_DOCUMENT_ADDED:
          name = actionByName;
          action = 'Facility Document Added';
          title = `Facility Document Added`;
          dropdownBottom = `${actionByName} uploaded document: ${activity.message?.document_name || 'N/A'} for Facility: ${activity.message?.facility_name || 'N/A'}.`;
          break;

        // SETTING ACTIVITIES
        case ACTIVITY_TYPE.FACILITY_SETTINGS_UPDATED:
          name = actionByName;
          action = 'Facility Settings Updated';
          title = `Facility Settings Updated`;
          dropdownBottom = `${actionByName} updated settings for Facility: ${activity.message?.facility_name || 'N/A'}. (Changed Fields: ${activity.message?.changes || []}).`;
          break;

        // FACILITY NOTE ACTIVITIES
        case ACTIVITY_TYPE.FACILITY_NOTE_ADDED: {
          name = actionByName;
          action = 'Note added';
          title = 'Facility Note Added';

          const related = activity.message?.related || {};
          const labels: string[] = [];
          if (related.facilities?.length) {
            labels.push(`Facility: ${related.facilities.join(', ')}`);
          }
          if (related.facility_users?.length) {
            labels.push(`Contact: ${related.facility_users.join(', ')}`);
          }
          if (related.providers?.length) {
            labels.push(`Staff: ${related.providers.join(', ')}`);
          }
          dropdownBottom = `${actionByName} added note for ${
            labels.join(' | ') || 'N/A'
          }. Note: ${activity.message?.note || 'N/A'}.`;

          break;
        }

        case ACTIVITY_TYPE.FACILITY_NOTE_DELETED: {
          name = actionByName;
          action = 'Note deleted';
          title = 'Facility Note Deleted';

          const related = activity.message?.related || {};
          const labels: string[] = [];
          if (related.facilities?.length) {
            labels.push(`Facility: ${related.facilities.join(', ')}`);
          }
          if (related.facility_users?.length) {
            labels.push(`Contact: ${related.facility_users.join(', ')}`);
          }
          if (related.providers?.length) {
            labels.push(`Provider: ${related.providers.join(', ')}`);
          }
          dropdownBottom = `${actionByName} deleted a note for ${
            labels.join(' | ') || 'N/A'
          }.`;
          break;
        }
        // INVOICE ACTIVITIES
        case ACTIVITY_TYPE.INVOICE_AUTO_GENERATED:
          name = actionByName;
          action = 'Invoice Generated';
          title = `Invoice Generated`;
          dropdownBottom = `System generated Invoice #${message.invoice_number} for ${message.facility_name}. (Billing Period: ${message.billing_cycle_start_date} – ${message.billing_cycle_end_date}, Total: ${message.total}).`;
          break;

        case ACTIVITY_TYPE.INVOICE_MANUALLY_BILLED:
          name = actionByName;
          action = 'Invoice Generated';
          title = `Invoice Generated`;
          dropdownBottom = `${actionByName} billed Invoice #${message.invoice_number} for ${message.facility_name} before cycle end.`;
          break;

        case ACTIVITY_TYPE.INVOICE_AUTO_BILLED:
          name = actionByName;
          action = 'Invoice Generated';
          title = `Invoice Generated`;
          dropdownBottom = `System billed Invoice #${message.invoice_number} for ${message.facility_name} at cycle close. (Billing Period: ${message.billing_cycle_start_date} – ${message.billing_cycle_end_date}).`;
          break;

        case ACTIVITY_TYPE.INVOICE_SENT:
          name = actionByName;
          action = 'Invoice Generated';
          title = `Invoice Generated`;
          dropdownBottom = `Invoice #${message.invoice_number} sent to ${message.facility_name} (${message.billing_emails}).`;
          break;

        case ACTIVITY_TYPE.INVOICE_RE_SENT:
          name = actionByName;
          action = 'Invoice Generated';
          title = `Invoice Generated`;
          dropdownBottom = `${actionByName} re-sent Invoice #${message.invoice_number} to ${message.facility_name} (${message.billing_emails}).`;
          break;

        // PAYMENT ACTIVITIES
        case ACTIVITY_TYPE.PAYMENT_RECORDED:
          name = actionByName;
          action = 'Admin records new payment';
          title = `Payment Recorded`;
          dropdownBottom = `${actionByName} recorded payment of ${message.amount} from ${message.payer_name} (Type: ${message.type}, Ref#: ${message.transaction_number}).`;
          break;

        case ACTIVITY_TYPE.PAYMENT_PARTIALLY_ALLOCATED:
          name = actionByName;
          action = 'Payment partially allocated, leaving unallocated credit.';
          title = `Payment Partially Allocated`;
          dropdownBottom = `${actionByName} allocated ${message.amount} to Invoice #${message.invoice_number}. Remaining ${message.unallocated_amount} kept as credit.`;
          break;

        default:
          name = actionByName;
          action = 'Performed an action.';
          title = `${actionByName} performed an action.`;
          dropdownBottom = '';
          break;
      }

      return {
        id: activity.id,
        activity_type: activity.activity_type,
        action_by_type: activity.action_by_type,
        createdAt: activity?.created_at,
        name,
        action,
        title,
        sub_title: dropdownTop,
        description: dropdownBottom,
        shift_time: shiftTime,
        shift_date: formattedShiftDate,
        certificate,
        speciality,
        facility: facilityName,
        image: actionByImage ? `${actionByBaseUrl}${actionByImage}` : null,
        from_status,
        to_status,
        clock_in_time,
        location,
        contact_user,
        role,
      };
    },
  );

  // Group by date
  const grouped: { [key: string]: TransformedActivity[] } = {};

  transformedActivities.forEach((activity) => {
    const dateOnly = new Date(activity.createdAt).toISOString().split('T')[0];
    if (!grouped[dateOnly]) {
      grouped[dateOnly] = [];
    }
    grouped[dateOnly].push(activity);
  });

  return Object.entries(grouped).map(([date, activities]) => ({
    date,
    activities,
  }));
}
