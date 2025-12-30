const SUCCESS = {
  DEFAULT: 'Record Found',
  FILE_UPLOADED: (file: string) => `${file} Uploaded Successfully`,
  FILE_UPDATED: (file: string) => `${file} Updated Successfully`,
  FILE_DELETED: (file: string) => `${file} Deleted Successfully`,
  SIGN_UP: 'Signup Successful',
  COMPLETE_VERIFICATION: (type: string) =>
    `OTP Sent to your contact, Please complete ${type} OTP verification`,
  COMPLETE_EMAIL_VERIFICATION:
    'Mail Sent to your email Address, Please complete Email verification',
  LOGIN: 'Login Successful',
  LOGOUT: 'Logout Successful',
  RECORD_ADDED: (record: string) => `${record} Added Successfully`,
  RECORD_CREATED: (record: string) => `${record} Created Successfully`,
  RECORD_UPDATED: (record: string) => `${record} Updated Successfully`,
  RECORD_DELETED: (record: string) => `${record} Deleted Successfully`,
  RECORD_FOUND: (record: string) => `${record} Found Successfully`,
  RECORD_NOT_FOUND: (record: string) => `${record} Not Found`,
  OTP_VERIFIED: 'OTP Verified Successfully',
  EMAIL_VERIFIED: 'Email Verified Successfully',
  PASSWORD_RESET: 'Your password was successfully updated.',
  SUCCESSFULLY: (record: string) => `${record} Successfully`,
  SHIFT_REQUEST_REJECTED: 'Shift Request Rejected',
  BREAK_STARTED: 'Your break has started.',
  BREAK_ENDED: 'Your break has ended.',
  CLOCK_IN: 'You have successfully clocked in.',
  CLOCK_OUT: 'You have successfully clocked out.',
  RE_OPENED: 'Shift have been re-opened successfully.',
  PROCESS_FAILED: (text: string) => `${text} process failed.`,
  NOTIFY: `We’ll notify you when new shifts are available in your area.`,
  WAITING_FOR_LATE_PROVIDER: 'Waiting for late staff to do check-in',
  ADDED_TO_CONTACTS: (name: string) => `Added ${name} to facility users.`,
  PASSWORD_SETUP: 'Password has been set successfully.',
  OTP_SENT: (name: string) =>
    `OTP sent on your '${name}'. Please check and verify to proceed.`,
  INVITATION_SENT: (text: string) => `${text} invitation sent successfully.`,
  DOWNLOAD_FILE: 'Downloading file.',
  ORIENTATION_SHIFT: 'Orientation shift created successfully.',
  ORIENTATION_REJECTED: (name: string) =>
    `Orientation request from ${name} is rejected.`,
  ORIENTATION_ASSIGNED: (action: string, name: string) =>
    `Orientation ${action} is assigned to ${name}`,
  ORIENTATION_COMPLETED: (name: string) =>
    `${name || 'Staff'} is added to staff list successfully.`,
  SENT: (text: string) => `${text} sent successfully.`,
  AUTO_CANCELLATION_REASON: `Facility marked as inactive – open shifts auto-cancelled processed.`,
  STAFF_WARNING: `This staff member has expired credentials.
      Their credential has expired — do you still want to proceed with booking this temp for the shift?`,
  SHIFT_REFUSED_BY_SYSTEM: `Booking not allowed.
      This staff member cannot be booked because their credential has expired. Please update or renew their credentials before scheduling.`,
};

const ERROR = {
  SOMETHING_WENT_WRONG: 'Something went wrong.',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  BAD_SYNTAX: 'The request cannot be fulfilled due to bad syntax',
  UNAUTHORIZED: 'Access denied.',
  UNAUTHENTICATED: 'Please log in to access.',
  INVALID_LOGIN:
    'It looks like you previously created an account using a social login',
  FORBIDDEN: 'You do not have permission to access this resource.',
  TOO_MANY_REQUESTS:
    'You have reached the limit. Please try again after sometime.',
  VALIDATION: 'Validation Error!',
  WRONG_CREDENTIALS: 'Incorrect email or password.',
  NOT_REGISTERED: 'Email is not registered. Try using another email.',
  PASSWORD_NOT_MATCH: 'Password & Confirm Password Not Match',
  INVALID_PASSWORD: 'Incorrect current password.',
  ALREADY_EXISTS: (text: string) => `${text} already exist`,
  OTP_NOT_VERIFIED: 'OTP is not verified',
  INVALID_OTP: 'Entered code is incorrect. Please enter valid code.',
  EMAIL_NOT_VERIFIED: 'Email is not verified',
  OTP_EXPIRED: 'This code is expired!',
  FILE_TOO_LARGE: (size: string) =>
    `File too large. Maximum file size allowed is ${size}.`,
  REQUIRED: (name: string) => `${name} must be required.`,
  ALLOWED_FILE_TYPE: 'Only JPG, JPEG, or PNG files are allowed!',
  ALLOWED_DOCUMENT_TYPE: 'Only PDF type is allowed!',
  EMAIL_ALREADY_EXIST: 'Email is already registered. Try sign in.',
  MOBILE_ALREADY_EXIST:
    'Phone number is already registered. Try using another number or sign in.',
  EMAIL_OR_MOBILE_ALREADY_EXIST: 'Email or Mobile Number already exist!',
  RECORD_NOT_FOUND: (text: string) => `${text} Not Found.`,
  ACCOUNT_IS_BLOCKED: 'Your account is blocked!',
  ACKNOWLEDGEMENT_ALREADY_SUBMITTED: 'Acknowledgement already submitted!',
  RESPONSE_ALREADY_SUBMITTED: (text: string) => `${text} already submitted!`,
  SHIFT_ALREADY_ASSIGNED:
    'This shift has already been assigned to another user!',
  PROVIDER_ALREADY_SCHEDULED:
    'Unable to assign shift. The staff is already booked.',
  INVALID_EMAIL: 'Please enter valid email',
  CANNOT_DELETE: (text: string) =>
    `The ${text} cannot be deleted because it is currently in use`,
  ATTEMPT_LIMIT_REACHED: 'Test attempt limit reached.',
  SHIFT_SLOT_NOT_AVAILABLE:
    'Shift cannot be scheduled as this slot is already booked for you.',
  INVITATION_ALREADY_ACCEPTED: 'Invitation already accepted',
  INVITATION_ALREADY_REJECTED: 'Invitation already rejected',
  INVITATION_WITHDRAWN: 'This invitation has been withdrawn',
  INVITATION_EXPIRED: 'Invitation expired',
  URL_EXPIRED: 'Url expired',
  CANCELLED_BY_FACILITY: 'This shift is cancelled by Facility.',
  TASK_ASSIGNMENT_CLOSED:
    'This order is no longer open for assignment as its start date has already passed',
  SAME_NUMBER: 'The number you entered is same as your current number',
  EARLY_CLOCK_IN: 'You cannot clock in before the scheduled shift time.',
  BREAK_LIMIT_REACHED:
    'You are not permitted to take additional breaks at this time.',
  RECORD_NOT_AVAILABLE: (text: string) => `${text} is not available.`,
  JOIN_ROOM: 'An error occurred while joining room!',
  LEAVE_ROOM: 'An error occurred while leaving room!',
  TYPING: 'An error occurred while typing!',
  SENDING_MESSAGE: 'An error occurred while sending message!',
  FACILITY_ORIENTATION_PENDING:
    'Facility orientation is currently pending. Please complete the required steps to proceed.',
  FACILITY_CONTACT_ALREADY_EXIST: (facility: string) =>
    `This contact is already assign to ${facility}`,
  SHIFT_LIST_PROFILE_INCOMPLETE:
    'Please complete your profile to access the shift list.',
  PROFILE_INCOMPLETE:
    'You need to complete your profile to access shift booking.',
  ACCOUNT_SUSPENDED:
    'Your account has been suspended. Please try again after 15 minutes.',
  MOBILE_NOT_REGISTERED:
    'Phone number is not registered. Try using another number or sign up.',
  PROVIDER_NOT_REGISTERED: 'Email is not registered. Try sign up.',
  INCOMPLETE_PROFILE: 'Please complete your profile.',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  FACILITY_CANCEL: (duration: number) =>
    `You can only cancel the shift at least ${duration} hour(s) before the start time.`,
  PROFESSIONAL_REFERENCE_SELF:
    'You cannot add yourself as a professional reference.',
  REFERENCE_FORM_NOT_FOUND:
    'Reference form not available. Please contact to admin.',
  PROFESSIONAL_REFERENCE_ALREADY_EXISTS:
    'You have already added this user for reference.',
  CANNOT_DELETE_ACTIVE_RECORD: (text: string) =>
    `The ${text} cannot be deleted because it is active.`,
  CANNOT_UPDATE_INUSE_RECORD: (text: string) =>
    `The ${text} cannot be updated to inactive because it is in use.`,
  ACCOUNT_INACTIVE:
    'Your account is currently inactive. Please contact your facility admin for access.',
  FACILITY_INACTIVE:
    'Facility status is inactive. Please contact your administrator.',
  RESPONSE_ALREADY_DECLINED: 'Response already declined.',
  PASSWORD_NOT_SET: `No password found. Reset via 'Forgot Password'.`,
  ALREADY_PRIMARY_CONTACT: (text: string) =>
    `This user is already a primary contact of ${text} facility.`,
  NOT_ALLOWED_TO: (text: string) => `You are not allowed to ${text}.`,
  INVALID_ACTION: (action: string, status: string) =>
    `${action} is not in ${status} state'`,
  MATCH_UP_NOT_FOUND: `This user does not match up with your orientation certificate/speciality.`,
  MISSING: (text: string) => `${text} is missing in system`,
  FACILITY_NOT_SETUP:
    'Please complete the facility setup before creating a shift.',
  ACCOUNT_DISABLED: (text: string) =>
    `The ${text} has deactivated their account.`,
  NEVER_WORKED: `You need to do at least 1 shift for this facility to avail for this option.`,
  PROFILE_NOT_VERIFIED_TO_ACCEPT_INVITATION:
    'Profile is not yet verified, contact support team to verify profile.',
  STAFF_PROFILE_UNVERIFIED: `Profile is unverified. Contact Support team to verify profile.`,
  PACKET_VALIDATION:
    'Orientation document can only be assigned for requested orientation',
  CREDENTIALS_EXPIRED: 'One or more credentials have expired.',
  CREDENTIALS_NOT_APPROVED: 'One or more credentials approval is pending.',
  CREDENTIALS_REJECTED: 'One or more credentials have been rejected.',
  YET_TO_WORK: (text: string) => `${text} has yet to work at facility.`,
  OVERDUE_INVOICE:
    'Cannot create shift. There are overdue invoices for this facility.',
  CANNOT_DELETE_RATE_SHEETS:
    'License Rate cannot be deleted because it is currently active.',
  PROFILE_REJECTED: 'Your profile has been rejected. Please contact admin.',
};

const VALIDATION = {
  MIN_LENGTH: (field: string, length: string) =>
    `${field} must be of minimum length ${length}.`,
  REQUIRED: (text: string) => `${text} is required`,
  PASSWORD_PATTERN:
    'Password must have a capital, small, and special character.',
  COUNTRY_CODE:
    'Country code must start with a plus sign (+) and only contain digits',
  CONTACT_FORMAT: 'Invalid contact number format.',
  IMAGE_PATTERN:
    'Image format not allowed. Allowed name pattern: uuidv4.jpg | uuidv4.jpeg | uuidv4.png | user.png',
  DATE: 'Please enter valid date (YYYY-MM-DD)',
  TIME: 'Please enter valid time (hh:mm:ss) in 24 hours format',
  EXPIRED_CREDENTIAL: (text: string) =>
    `Due to expired credentials - '${text}'`,
  PENDING_OR_EXPIRED: 'Due to approval pending or expired credentials',
  SHIFT_BOOKED: 'Due to booked shifts',
  PENDING_VERIFICATION: 'Due to pending verification',
  MISSING_CREDENTIAL: 'Due to missing credential',
  SHIFT_TIME_PREFERENCE_MISMATCH: (name: string) =>
    `Staff ${name} is unavailable due to time preference mismatch.`,
  PROVIDER_UNAVAILABLE: (name: string) =>
    `Staff ${name} is unavailable for the shifts.`,
  PARTIAL_AVAILABLE: (name: string, unavailable: any, available: any) =>
    `Staff ${name} is unavailable on ${unavailable.join(', ')} and available on ${available.join(', ')}`,
  ALREADY_SCHEDULED: 'Already scheduled for a different shift',
  MISMATCH_CERT_SPEC:
    'Staff does not have the required certificate or speciality.',
  // for personalized message
  STAFF_PREFERENCE_NOT_MATCH: (name: string) =>
    `${name}’s shift time preferences do not match the requested shift time.`,
  // for personalized message with date while posting the shift
  PREFERENCE_NOT_MATCH: (name: string, date: string) =>
    `${name}’s shift time preferences do not match the requested shift time on ${date}.`,
  SHIFT_OVERLAP:
    'Requested shift timing overlaps with an existing shift assigned to the Staff.',
  UPDATE_PREFERENCE: `This shift doesn't match your time preferences. Update your availability to do more requests.`,
  ALREADY_HAVE_SHIFT_SLOT: `Already have a booked slot, please select different shift`,
  ORIENTATION_PENDING: `Orientation is pending!`,
  ALREADY_STARTED_AUTO_SCHEDULING:
    'AI has already sent an auto-scheduling request for this shift.',
  ALREADY_AI_RUNNING: 'Staff search request has already been triggered.',
  ALREADY_REQUESTED: `You have already requested for facility. Please wait for the response.`,
  REJECTED: `Your orientation request was rejected. Please contact the Admin`,
  ALREADY_RESPONDED: `Response already submitted for this facility.`,
  ONGOING_SHIFT:
    'Please complete your ongoing shift before clocking into a new shift.',
  ENTER_PASSWORD: 'Please enter your password to proceed.',
  STAFF_TEMP_PERM_AVAILABILITY: (temp: string, perm: string) =>
    `Unavailable due to preferences: temporary (${temp}), and permanent (${perm}).`,
  STAFF_TEMP_AVAILABILITY: (temp: string) =>
    `Unavailable due to temporary availability settings on ${temp}.`,
  STAFF_PERM_AVAILABILITY: (perm: string) =>
    `Unavailable due to permanent day preferences on ${perm}.`,
  OVERLAP_SHIFT: (shifts: any) => `Already scheduled on: ${shifts}.`,
  CLOCKIN_RADIUS: `Clock-in is not allowed outside the facility location.`,
  CLOCKOUT_RADIUS: `Clock-out is not allowed outside the facility location.`,
  PROFESSIONAL_REFERENCE_PENDING: (text: string) =>
    `Cannot verify profile as professional reference is still in ${text} status.`,
  EXPIRED_PENDING_CREDENTIAL: `Uploaded credentials are expired.`,
  ALREADY_DONE: (text: string, action: string) =>
    `${text} is already ${action}.`,
  ALREADY_HAVE_ORIENTATION: (name: string) =>
    `${name} already has an orientation scheduled.`,
  DOCUMENT_NOT_SUBMITTED: (action: string, name: string) =>
    `${action} not submitted by ${name}.`,
  SHIFT_CONFLICT: (names: string) =>
    `${names} have shifts booked on the selected dates/times.`,
  USER_RESTRICTED: `Your account is inactive. Please contact the administrator.`,
  STAFF_FACILITY_DNR: 'Staff mark as DNR by facility.',
  STAFF_SELF_DNR: 'Staff mark as DNR by self.',
  STAFF_BOTH_DNR: 'Staff mark as DNR by facility and self.',
};

const EMAIL = {
  CONTACT_US: 'Contact Us | NursesNow',
  FORGOT_PASSWORD: 'Password Reset Request | NursesNow',
  VERIFICATION_SUBJECT: 'Your NursesNow Verification',
  SENT: 'Email sent successfully.',
  ACCEPT_INVITE: `Complete Your Registration – Set Your Password`,
  SHIFT_INVITE_REJECTED: `Shift Invitation Rejected | NursesNow`,
  SHIFT_SCHEDULED: 'Your Created Shift Has Been Scheduled | NursesNow',
  SHIFT_CANCELLED: 'Your Created Shift Has Been Cancelled By Temp | NursesNow',
  SHIFT_REQUESTED: 'A Temp Has Requested Your Shift | NursesNow',
  SHIFT_REQUEST_REJECTED:
    'Your Rejection of Temp Request for Shift is Confirmed | NursesNow',
  AI_LOOKING_FOR_RECOMMENDATIONS:
    'No Response from Temp, AI is Searching for Temp | NursesNow',
  AI_OPEN_STATUS_NOTIFICATION:
    'No Response from Temp, Shift is Now Open for All | NursesNow',
  TIMECARD_REJECTION: 'A Timecard Has Been Rejected | NursesNow',
  SHIFT_VOIDED: (shift_id: string) =>
    `Shift [${shift_id}] - No Temp Showed Up, Shift Voided`,
  RUNNING_LATE_NO_SHOW: (shift_id: string) =>
    `Shift [${shift_id}] - Temp Not Present, AI Searching for Replacement`,
  RUNNING_LATE: (shift_id: string) =>
    `Shift [${shift_id}] - Your Staff is Running Late ⏳`,
  PROFESSIONAL_REFERENCE_REMINDER:
    'Reminder: Professional Reference Submission | NursesNow',
  ACCOUNT_DELETION: 'Account Deletion Request | NursesNow',
  ORIENTATION_PACKET_SUBJECT: (facility: string) =>
    `Orientation Packet for ${facility} | NursesNow`,
  REFERRAL_INVITE_SUBJECT: (name: string) =>
    `Invitation to Join NursesNow from ${name} | NursesNow`,
  INVOICE_GENERATED: (billing_period: string) =>
    `Invoice for ${billing_period} | NursesNow`,
  STAFF_CREDENTIAL: 'Staff Credential Received | NursesNow',
};

const NOTIFICATION = {
  ASSIGN_SHIFT_TITLE: 'Shift Confirmed',
  ASSIGN_SHIFT_TEXT: (
    date: string,
    start_time: string,
    end_time: string,
    facility: string,
  ) =>
    `Your shift is confirmed for ${date}, ${start_time} to ${end_time} at ${facility}. See shift details.`,
  CANCELLED_BY_CREATOR_TITLE: 'Shift Cancelled',
  CANCELLED_BY_CREATOR_TEXT: (date: string, facility: string) =>
    `Your shift on ${date} at ${facility} has been canceled. We'll keep you updated on new opportunities!`,
  CANCELLED_BY_CREATOR_DESCRIPTION:
    'Your shift on ${date_time} at ${location} has been cancelled by facility',
  CANCELLED_BY_ASSIGNEE_TITLE: 'Your Shift Has Been Canceled by Staff',
  CANCELLED_BY_ASSIGNEE_TEXT: (
    provider: string,
    date: string,
    time: string,
    facility: string,
  ) =>
    `The staff ${provider} has canceled their shift on ${date}, ${time} at ${facility}. AI has started searching for a replacement.`,
  ASSIGN_SHIFT_DESCRIPTION:
    'Your shift is confirmed for ${date_time} at ${location}. See shift details',
  SHIFT_INVITATION_TITLE: 'New Shift Invitation',
  SHIFT_INVITATION_REJECTED: 'Shift Invitation Rejected',
  SHIFT_INVITATION_TEXT: (
    date: string,
    start_time: string,
    end_time: string,
    facility: string,
  ) =>
    `You’ve been invited to work a shift on ${date}, ${start_time} to ${end_time} at ${facility}. Tap to accept or decline.`,
  SHIFT_INVITATION_REJECTED_TEXT: (date: string, facility: string) =>
    `You have rejected this shift on ${date} at ${facility}. We hope to see you again accepting`,
  SHIFT_INVITATION_DESCRIPTION:
    'You are invited on ${date_time} at ${location} to join a new shift. Please review the details and confirm your availability',
  SHIFT_POSTED_TITLE: 'Shift Posted Successfully!',
  SHIFT_POSTED_TEXT:
    'Your shift has been posted successfully. Please review the details and ensure everything is correct.',
  SHIFT_REQUEST_TITLE: 'New Shift Request Received',
  SHIFT_REQUEST_TEXT: (
    provider_name: string,
    date: string,
    time: string,
    facility: string,
  ) =>
    `${provider_name} has requested the open shift on ${date}, ${time} at ${facility}. Please review and approve or decline the request.`,
  SHIFT_SCHEDULED_TITLE: 'Shift Successfully Scheduled',
  SHIFT_SCHEDULED_TEXT: (date: string, name: string) =>
    `The shift you created on ${date} at ${name} has been successfully confirmed. Please review the details and ensure everything is correct.`,
  SHIFT_REQUEST_REJECTED_TITLE: 'Shift Request Rejected',
  SHIFT_REQUEST_ACTION_TEXT: (action: string, date: string, name: string) =>
    `The facility has ${action} the temp's request for the shift on ${date} at ${name}. View details in the app.`,
  SHIFT_REQUEST_REJECTED_TEXT:
    'Your request to take the shift has been rejected by the facility. Please check for other available shifts in the app.',
  SHIFT_REQUEST_REJECTED_DESCRIPTION:
    'Your request to take the shift on ${date_time} at ${location} has been rejected by the facility. Please check for other available shifts in the app',
  AI_LOOKING_FOR_RECOMMENDATIONS_TITLE: 'AI Searching for Temps',
  AI_LOOKING_FOR_RECOMMENDATIONS_TEXT:
    'No responses from temps for your shift. AI is now searching for suitable temps.',
  TIMECARD_REJECTION_TITLE: 'Timecard Rejected',
  TIMECARD_REJECTION_TEXT:
    'Your submitted timecard has been rejected. Please review the details and make necessary corrections.',
  TIMECARD_REJECTION_DESCRIPTION:
    'Your timecard for ${date_time} at ${location} has been rejected by the facility. Please make the necessary corrections and resubmit it for approval',
  TIMECARD_REJECTION_ADMIN_NOTIFICATION: (
    user_name: string,
    date_time: string,
    location: string,
  ) =>
    `A timecard for ${user_name} has been rejected for the shift on ${date_time} at ${location}. Please review the rejection and take necessary action.`,
  OPEN_SHIFT_DESCRIPTION: (date: string, time: string, facility: string) =>
    `AI was unable to find a temp for your shift on [b]${date}[/b], [b]${time}[/b] at [/b]${facility}[/b]. The shift is now open for available Staffs to apply. You will be notified once a Staff picks it up.`,
  VOIDED_SHIFT_TITLE: 'Shift Could Not Be Filled',
  VOIDED_SHIFT_TEXT: (date: string, time: string, facility: string) =>
    `Unfortunately, no Staff were available for the shift on ${date}, ${time} at ${facility}. The shift is now void. Please consider reposting or adjusting the details.`,
  RUNNING_LATE_NO_TEMP_TITLE: 'Temp Not Present - AI Searching for Replacement',
  RUNNING_LATE_NO_TEMP_TEXT:
    'The temp for your scheduled shift did not show up. AI is searching for a replacement to ensure your shift is covered.',
  PROVIDER_RUNNING_LATE_TITLE: 'Your Staff is Running Late',
  RUNNING_LATE_TITLE: 'Running Late Alert',
  RUNNING_LATE_TEXT: (
    provider: string,
    date: string,
    time: string,
    facility: string,
  ) =>
    `${provider} for the shift on ${date}, ${time} at ${facility} is running late. "Put reason here" Do you want AI to find another temp? [Yes] [No]`,
  PROVIDER_RUNNING_LATE: (date: string, facility: string) =>
    `You may be running late for your shift starting at ${date} today at ${facility}. Please check-in ASAP.`,

  PROVIDER_RUNNING_LATE_DESCRIPTION:
    'You may be running late for your shift starting at ${date_time} today at ${location} Please check-in ASAP.',

  SHIFT_UPDATED: 'Shift Details Updated',
  SHIFT_UPDATED_TEXT: (facility: string) =>
    `The shift at ${facility} has been updated. Review the latest details now.`,
  SHIFT_UPDATE_DESCRIPTION: 'Shift have been updated, please check the details',
  SHIFT_COMPLETED_TITLE: 'Shift Completed',
  SHIFT_COMPLETED_TEXT: (facility: string) =>
    `Well done! Your shift at ${facility} is completed. Review your payment details.`,
  SHIFT_COMPLETED_DESCRIPTION:
    'Well done! Your shift at ${facility} is completed. Review your payment details.',
  SHIFT_REQUEST_UPDATE_TITLE: 'Update on Your Shift Request',
  SHIFT_REQUEST_UPDATE_TEXT: (date: string, time: string, facility: string) =>
    `Thanks for your interest! The Shift for ${date}, ${time} at ${facility} is no longer available.   Don’t worry – More shifts are available for you to explore!`,
  SHIFT_REQUEST_UPDATE_DESCRIPTION:
    'Thanks for your interest! This shift at ${location} has been assigned to another staff. Don’t worry — more shifts are available for you to explore!',
  YOU_ARE_LATE: 'You are late for your shift',
  YOU_ARE_LATE_TEXT: (date: string, time: string, facility: string) =>
    `You may be running late for your shift starting today on ${time} at ${facility}. Please check-in ASAP.`,
  YOU_ARE_LATE_DESCRIPTION:
    'You may be running late for your shift on today ${date_time} at ${location}Please check-in ASAP.',
  FACILITY_FIND_REPLACEMENT:
    'Unfortunately, your scheduled shift has been reassigned.😔',
  FACILITY_FIND_REPLACEMENT_TEXT: `Since your arrival was delayed, the facility has reassigned this shift to another staff to ensure timely coverage. We appreciate your understanding and commitment.
  Stay available for upcoming shift opportunities!`,
  FACILITY_FIND_REPLACEMENT_DESCRIPTION: `Since your arrival was delayed, the facility has reassigned this shift to another staff to ensure timely coverage. We appreciate your understanding and commitment.
Stay available for upcoming shift opportunities!`,

  NEARBY_SHIFT: 'New Shifts Found Near You',
  NEARBY_SHIFT_TEXT: `Great news! We found shifts available in your area. Check them out now.`,
  NEW_FACILITY: 'New Facility Alert!',
  NEW_FACILITY_TEXT: (facility: string) =>
    `A facility near your area ${facility} is now on NursesNow. Tap here to view details.`,
  NEW_FACILITY_TEXT_DESCRIPTION:
    'A facility near your area ${location} is now on NursesNow. Tap here to view details.',
  ORIENTATION_REJECTED: 'Orientation Request Rejected',
  ORIENTATION_REJECTED_TEXT: (facility: string) =>
    `Your orientation request for ${facility} has been rejected. Please contact support for more information.`,
  ORIENTATION_PACKET: (facility: string) =>
    `Orientation Packet for ${facility}`,
  ORIENTATION_PACKET_TEXT: (facility: string) =>
    `The document for orientation at ${facility} has been assigned. Click to open it.`,
  ORIENTATION_COMPLETED: 'Orientation Completed',
  ORIENTATION_COMPLETED_TEXT: (facility: string) =>
    `Congratulations! You have successfully completed your orientation for ${facility}. You are now eligible for shift assignments.`,
  ORIENTATION_SHIFT: 'Orientation Shift Assigned',
  ORIENTATION_SHIFT_TEXT: (facility: string) =>
    `Congratulations! You have been assigned to a shift following your orientation at ${facility}. Please check your schedule for details.`,
  CLOCK_IN_OR_BREAK: `Total hours worked 👉🏻`,
  CLOCK_IN_TEXT: (time: string) => `Clocked in for the shift at ${time}`,
  ON_BREAK: 'You are on break.',
  CLOCK_IN_DESCRIPTION: 'You are now clocked in! Have a great shift!',
  BREAK_STARTED_DESCRIPTION: 'You are now on a break. Relax and recharge!',
  BREAK_ENDED_DESCRIPTION: 'Your break has ended. Hope you feel refreshed!',

  // Professional Reference Notifications
  PROFESSIONAL_REFERENCE_NO_RESPONSE_TITLE:
    'Professional Reference No Response',
  PROFESSIONAL_REFERENCE_NO_RESPONSE_TEXT: (provider: string) =>
    `${provider} has not responded to your professional reference request.`,
  PROFESSIONAL_REFERENCE_NO_RESPONSE_DESCRIPTION: (provider: string) =>
    `${provider} has not responded to your professional reference request.`,

  PROFESSIONAL_REFERENCE_DECLINED_TITLE: 'Professional Reference Declined',
  PROFESSIONAL_REFERENCE_DECLINED_TEXT: (provider: string) =>
    `${provider} has declined to be your professional reference.`,
  PROFESSIONAL_REFERENCE_DECLINED_DESCRIPTION: (provider: string) =>
    `${provider} has declined to be your professional reference.`,

  PROFESSIONAL_REFERENCE_SUBMITTED_TITLE: 'Professional Reference Submitted',
  PROFESSIONAL_REFERENCE_SUBMITTED_TEXT: (provider: string) =>
    `${provider} has submitted the professional reference.`,
  PROFESSIONAL_REFERENCE_SUBMITTED_DESCRIPTION: (provider: string) =>
    `${provider} has submitted the professional reference.`,

  PROFESSIONAL_REFERENCE_APPROVED_TITLE: 'Professional Reference Approved',
  PROFESSIONAL_REFERENCE_APPROVED_TEXT: (provider: string) =>
    `Your professional reference from ${provider} has been approved.`,
  PROFESSIONAL_REFERENCE_APPROVED_DESCRIPTION: (provider: string) =>
    `Your professional reference from ${provider} has been approved.`,

  PROFESSIONAL_REFERENCE_DECLINED_BY_ADMIN_TITLE:
    'Professional Reference Declined by Admin',
  PROFESSIONAL_REFERENCE_DECLINED_BY_ADMIN_TEXT: (provider: string) =>
    `Your professional reference from ${provider} has been declined by admin.`,
  PROFESSIONAL_REFERENCE_DECLINED_BY_ADMIN_DESCRIPTION: (provider: string) =>
    `Your professional reference from ${provider} has been declined by admin.`,

  // Profile Approved
  PROFILE_APPROVED_TITLE: 'Profile Approved',
  PROFILE_APPROVED_TEXT:
    'Your profile has been approved. You can now request shifts.',
  PROFILE_APPROVED_DESCRIPTION:
    'Your profile has been approved. You can now request shifts.',
  TEST_REASSIGN_TITLE: 'Competency Test Reassigned',
  TEST_REASSIGN_TEXT:
    'Your competency test has been reassigned. Please check and complete it.',
  TEST_REASSIGN_DESCRIPTION:
    'Your competency test has been reassigned. Please check and complete it.',

  // Profile Rejected
  PROFILE_REJECTED_TITLE: 'Profile Rejected',
  PROFILE_REJECTED_TEXT:
    'Your profile has been rejected. Please contact support.',
  PROFILE_REJECTED_DESCRIPTION:
    'Your profile has been rejected. Please contact support.',

  // Credential Approved
  CREDENTIAL_REJECTED_TITLE: 'Credential Rejected',
  CREDENTIAL_REJECTED_TEXT: 'Your credential has been rejected.',
  CREDENTIAL_REJECTED_DESCRIPTION: 'Your credential has been rejected.',
};

export const CONSTANT = {
  SUCCESS: SUCCESS,
  VALIDATION: VALIDATION,
  NOTIFICATION: NOTIFICATION,
  ERROR: ERROR,
  EMAIL: EMAIL,
};
