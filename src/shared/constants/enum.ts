export enum MARITAL_STATUS {
  married = 'married',
  unmarried = 'unmarried',
}

export enum DEFAULT_STATUS {
  active = 'active',
  in_active = 'in_active',
}

export enum CATEGORY_TYPES {
  agency = 'save_settings',
  clients = 'clients',
  provider = 'provider',
}

export enum VERIFICATION_STATUS {
  verified = 'verified',
  pending = 'pending',
  rejected = 'rejected',
}

export enum USER_STATUS {
  new = 'new',
  accepted = 'accepted',
  rejected = 'rejected',
  blocked = 'blocked',
  deleted = 'deleted',
}

export enum DEVICE_TYPE {
  all = 'all',
  web = 'web',
  android = 'android',
  ios = 'ios',
}

export enum TABLE {
  admin = 'admin',
  provider = 'provider',
  facility = 'facility',
  facility_user = 'facility_user',
}

export enum CHAT_TABLE {
  admin = 'admin',
  provider = 'provider',
  facility = 'facility',
  facility_user = 'facility_user',
  department = 'department',
}

export enum DEFAULT_IP_COLUMN {
  created_at_ip = 'created_at_ip',
  updated_at_ip = 'updated_at_ip',
  deleted_at_ip = 'deleted_at_ip',
}

export enum OTP_TYPE {
  signup = 'signup',
  login = 'login',
  forgot_password = 'forgot_password',
  change_number = 'change_number',
  account_delete = 'account_delete',
}

export enum ADDRESS_TYPE {
  default = 'default',
  temporary = 'temporary',
  assignment = 'assignment',
}

export enum USER_TYPE {
  provider = 'provider',
  facility = 'facility',
}

export enum MEDIA_FOLDER {
  default = 'default',
  provider = 'provider',
  facility = 'facility',
  facility_user = 'facility-user',
  admin = 'admin',
  timecard = 'timecard',
  signature = 'signature',
  credential = 'credential',
  chat = 'chat',
  documents = 'documents',
}

export enum DEFAULT_IMAGE {
  logo = 'default/logo.png',
}

export enum SHIFT_TYPE_LABEL {
  per_diem_shifts = 'Per Diem Shifts',
  local_contracts = 'Local Contracts',
  travel_assignments = 'Travel Assignments',
}

export enum SHIFT_PREFERENCE {
  days = 'D',
  evenings = 'E',
  nights = 'N',
}

export enum SHIFT_PREFERENCE_LABEL {
  D = 'D',
  E = 'E',
  N = 'N',
  A = 'A',
  P = 'P',
}
export enum ACCOUNT_STATUS {
  active = 'active',
  in_active = 'in_active',
}

export enum INVITATION_STATUS {
  invited = 'invited',
  accepted = 'accepted',
}

export enum ENTITY_STATUS {
  invited = 'invited',
  active = 'active',
  in_active = 'in_active',
}

export enum REFER_FRIEND_STATUS {
  invited = 'invited',
  active = 'active',
  in_active = 'in_active',
  onboarding = 'onboarding',
}
export enum EJS_FILES {
  verification = 'email-verification',
  email_otp_verification = 'email-otp-verification',
  reset_password = 'forgot-password',
  invitation = 'send-invitation',
  shift_invite_rejected = 'shift-invite-rejected',
  shift_scheduled = 'shift-scheduled',
  shift_canceled = 'shift-canceled',
  ai_recommendation = 'ai-recommendation',
  shift_open = 'shift-open',
  shift_requested = 'shift-requested',
  shift_request_rejected = 'shift-request-rejected',
  timecard_rejected = 'timecard-rejected',
  shift_voided = 'shift-voided',
  running_late_no_show = 'running-late-no-show',
  running_late = 'running-late',
  professional_reference_reminder = 'professional-reference-reminder',
  delete_account = 'delete-account',
  orientation_packet = 'orientation-packet',
  referral_invite = 'referral-invite',
  invoice_pdf = 'invoice-pdf',
  invoice = 'invoice',
  staff_credential = 'staff-credential',
}

export enum SHIFT_TYPE {
  per_diem_shifts = 'per_diem',
  long_term_shifts = 'long_term',
  travel_assignments = 'travel',
}

export enum ORIENTATION_TYPE {
  orientation_shift = 'orientation_shift',
  electronic_orientation_documents = 'electronic_orientation_documents',
  both = 'both',
}

export enum ORIENTATION_STATUS {
  orientation_requested = 'requested',
  orientation_completed = 'completed',
  orientation_approved = 'approved',
  packet_sent = 'packet_sent',
  orientation_scheduled = 'scheduled',
  not_interested = 'not_interested',
  orientation_rejected = 'rejected',
  orientation_cancelled = 'cancelled',
  void = 'void',
}

export enum OrientationAction {
  shift = 'shift',
  packet = 'packet',
  reject = 'reject',
  approve = 'approve',
}

export enum TEST_STATUS {
  passed = 'passed',
  failed = 'failed',
  pending = 'pending',
}

export enum CHECKLIST_STATUS {
  completed = 'completed',
  pending = 'pending',
}

export enum REPEAT_ON {
  same_day = 'same_day',
  consecutive_days = 'consecutive_days',
  consecutive_weeks = 'consecutive_weeks',
  specific_dates = 'specific_dates',
}

export enum SHIFT_STATUS {
  open = 'open',
  requested = 'requested',
  invite_sent = 'invite_sent',
  scheduled = 'scheduled',
  completed = 'completed',
  un_submitted = 'un_submitted',
  cancelled = 'cancelled',
  ongoing = 'ongoing',
  running_late = 'running_late',
  auto_scheduling = 'auto_scheduling',
  void = 'void',
}

export enum CALENDAR_SHIFT_STATUS {
  filled = 'filled',
  open = 'open',
  void = 'void',
}

export enum SHIFT_INVITATION_STATUS {
  withdrawn = 'withdrawn',
  accepted = 'accepted',
  invited = 'invited',
  unseen = 'unseen',
  rejected = 'rejected',
  cancelled = 'cancelled',
}

export enum SHIFT_REQUEST_STATUS {
  assigned = 'assigned',
  rejected = 'rejected',
  unassigned = 'unassigned',
  cancelled = 'cancelled',
}

export enum NotificationType {
  GENERAL = 'general',
  OFFER_UPDATE = 'offer_update',
  ORDER_UPDATE = 'order_update',
  LAB_REPORT = 'lab_report',
}

export enum NotificationFor {
  ALL_USER = 'all_user',
  ONE_USER = 'one_user',
}

export enum SHIFT {
  day = 'day',
  evening = 'evening',
  night = 'night',
  flexible = 'flexible',
}

export enum DAY {
  all = 'all',
  weekend = 'weekend',
  weekday = 'weekday',
}

export enum SEND_FORM_BY {
  sms = 'sms',
  email = 'email',
}

export enum FILTER_PROVIDER_BY {
  all = 'all',
  preferred = 'preferred',
  past = 'past',
  ai = 'ai',
  oriented = 'oriented',
}

export enum EMPLOYMENT_TYPE {
  both = 'both',
  employee = 'employee',
  sub_contractor = 'sub_contractor',
}

export enum VALIDATE_UPON {
  none = 'none',
  warn = 'warn',
  refuse = 'refuse',
}

export enum AUTO_ASSIGN {
  none = 'none',
  application_start = 'pre_hire',
  new_hire = 'post_hire',
}

export enum CREDENTIAL_STATUS {
  pending = 'pending',
  verified = 'verified',
  rejected = 'rejected',
}

export enum FACILITY_PROVIDER_FLAGS {
  preferred = 'preferred',
  dnr = 'dnr',
  self = 'self',
}

export enum DNR_TYPE {
  clinical = 'clinical',
  professional = 'professional',
  self = 'self',
}

export enum TIMECARD_STATUS {
  disputed = 'disputed',
  flagged = 'flagged',
  approved = 'approved',
  invoiced = 'invoiced',
}

export enum TIMECARD_PAYMENT_STATUS {
  paid = 'paid',
  unpaid = 'unpaid',
}

export enum TIMECARD_FILTER_TYPE {
  disputed = 'disputed',
  flagged = 'flagged',
  today = 'today',
}

export enum FILTER_PROVIDER_REVIEW {
  most_recent = 'most_recent',
  positive_reviews = 'positive_reviews',
  critical_reviews = 'critical_reviews',
  top_reviews = 'top_reviews',
}

export enum SCHEDULING_WARNINGS {
  overtime = 'overtime',
  double_shift = 'double_shift',
}

export enum TIMECARD_ROUNDING_DIRECTION {
  standard = 'standard',
  round_up = 'round_up',
  round_down = 'round_down',
}

export enum TIME_APPROVAL_METHOD {
  signed_timecard = 'signed_timecard',
  esignature = 'esignature',
  facility = 'facility',
}

export enum ALLOWED_ENTRIES {
  regular = 'regular',
  meal_break = 'meal_break',
  other_break = 'other_break',
  callback = 'callback',
  on_call = 'on_call',
}

export enum EXPIRATION_DURATION_TYPE {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export enum OPTION_TYPE {
  multiple_choice = 'multiple_choice',
  dropdown = 'dropdown',
  textarea = 'textarea',
}

export enum INVITE_STATUS {
  pending = 'pending',
  accepted = 'accepted',
  expired = 'expired',
}

export enum SCHEDULE_REQUEST_TYPE {
  schedule = 'schedule',
  shift = 'shift',
}

export enum FACILITY_GENERAL_SETTING_TYPE {
  schedule = 'schedule',
  report = 'report',
  chat = 'chat',
  time_attendance = 'time_attendance',
  billing = 'billing',
}

export enum FACILITY_PROFILE_SECTION {
  contact_details = 'contact_details',
  general_instructions = 'general_instructions',
  infrastructure = 'infrastructure',
}

export enum LINK_TYPE {
  forgot_password = 'forgot_password',
  invitation = 'invitation',
}

export enum ACTIVITY_TYPE {
  SHIFT_CREATED = 'shift_created',
  SHIFT_UPDATED = 'shift_updated',
  SHIFT_INVITED = 'shift_invited',
  SHIFT_ASSIGNED = 'shift_assigned',
  SHIFT_CANCELLED = 'shift_cancelled',
  SHIFT_COMPLETED = 'shift_completed',
  ACCEPTED_SHIFT_INVITATION = 'accepted_shift_invitation',
  REJECTED_SHIFT_INVITATION = 'rejected_shift_invitation',
  PROVIDER_ACCEPTED_SHIFT_REQUEST = 'provider_accepted_shift_request',
  PROVIDER_REJECTED_SHIFT_REQUEST = 'provider_rejected_shift_request',
  REQUEST_WITHDRAWN = 'request_withdrawn',
  INVITE_AGAIN = 'invite_again',
  PROVIDER_CANCELLED_SHIFT = 'provider_cancelled_shift',
  FACILITY_REJECT_REQUEST = 'facility_reject_request',
  FACILITY_ACCEPT_REQUEST = 'facility_accept_request',
  PROVIDER_REQUEST_SHIFT = 'provider_request_shift',
  SHIFT_STARTED = 'shift_started',
  CLOCK_IN = 'clock_in',
  CLOCK_OUT = 'clock_out',
  BREAK = 'break',
  AUTO_SCHEDULING_PROVIDER_CANCELLED = 'provider_cancelled',
  AUTO_SCHEDULING_NO_RESPONSE = 'no_response',
  AUTO_SCHEDULING_NO_INVITES = 'no_invites',
  AUTO_SCHEDULING_PROVIDER_LATE = 'running_late',
  OPEN_ORDER = 'OPEN_ORDER',
  SHIFT_VOIDED = 'shift_voided',
  MARKED_RUNNING_LATE = 'marked_running_late',
  DISTANCE_RUNNING_LATE = 'distance_running_late',
  REPLACE_RUNNING_LATE = 'replace_running_late',
  NO_REPLACE_RUNNING_LATE = 'no_replace_running_late',

  // CONTACT ACTIVITIES TYPE - ADMIN USER /FACILITY USER
  CONTACT_USER_CREATED = 'contact_user_created',
  CONTACT_USER_UPDATED = 'contact_user_updated',
  CONTACT_USER_DELETED = 'contact_user_deleted',
  CONTACT_RESEND_INVITATION = 'contact_resend_invitation',
  CONTACT_ACTIVATED = 'contact_activated',
  CONTACT_DEACTIVATED = 'contact_deactivated',
  CONTACT_REACTIVATED = 'contact_reactivated',
  CONTACT_DETAIL_UPDATED = 'contact_detail_updated',
  CONTACT_ROLE_UPDATED = 'contact_role_updated',

  // ROLE ACTIVITIES TYPE
  ROLE_CREATED = 'role_created',
  ROLE_UPDATED = 'role_updated',
  ROLE_DELETED = 'role_deleted',
  ROLE_DEACTIVATED = 'role_deactivated',
  ROLE_REACTIVATED = 'role_reactivated',
  ROLE_PERMISSION_UPDATED = 'role_permission_updated',

  // TIMECARD ACTIVITIES TYPE
  TIMECARD_GENERATED = 'timecard_generated',
  TIMECARD_FLAGGED = 'timecard_flagged',
  TIMECARD_DISPUTED = 'timecard_disputed',
  TIMECARD_DISPUTED_RESOLVED = 'timecard_disputed_resolved',
  TIMECARD_EDITED = 'timecard_edited',
  TIMECARD_INVOICED = 'timecard_invoiced',

  // STAFF PROFILE ACTIVITIES TYPE
  STAFF_PROFILE_APPROVED = 'staff_profile_approved',
  STAFF_PROFILE_UPDATED = 'staff_profile_updated',
  STAFF_STATUS_CHANGED = 'staff_status_changed',

  // STAFF CREDENTIAL ACTIVITIES TYPE
  STAFF_CREDENTIAL_ASSIGNED = 'staff_credential_assigned',
  STAFF_CREDENTIAL_APPROVED = 'staff_credential_approved',
  STAFF_CREDENTIAL_REJECTED = 'staff_credential_rejected',
  ALL_STAFF_CREDENTIAL_REJECTED = 'all_staff_credential_rejected',

  // ORIENTATION ACTIVITIES TYPE
  ORIENTATION_REQUEST_RECEIVED = 'orientation_request_received',
  ORIENTATION_APPROVED = 'orientation_approved',
  ORIENTATION_REJECTED = 'orientation_rejected',
  ORIENTATION_DOCUMENT_ASSIGNED = 'orientation_document_assigned',
  ORIENTATION_SHIFT_SCHEDULED = 'orientation_shift_scheduled',
  ORIENTATION_COMPLETED = 'orientation_completed',

  // INVOICE ACTIVITIES TYPE
  INVOICE_AUTO_GENERATED = 'invoice_auto_generated',
  INVOICE_MANUALLY_BILLED = 'invoice_manually_billed',
  INVOICE_AUTO_BILLED = 'invoice_auto_billed',
  INVOICE_SENT = 'invoice_sent',
  INVOICE_RE_SENT = 'invoice_re_sent',

  // PAYMENT ACTIVITIES TYPE
  PAYMENT_RECORDED = 'payment_recorded',
  PAYMENT_PARTIALLY_ALLOCATED = 'payment_partially_allocated',

  // CORPORATE CLIENT ACTIVITIES TYPE
  CORPORATE_CLIENT_ADDED = 'corporate_client_added',
  CORPORATE_CLIENT_UPDATED = 'corporate_client_updated',

  // FACILITY ACTIVITIES TYPE
  FACILITY_ADDED = 'facility_added',
  FACILITY_DETAILS_UPDATED = 'facility_details_updated',
  FACILITY_DOCUMENT_ADDED = 'facility_document_added',
  FACILITY_ACCOUNTING_UPDATED = 'facility_accounting_updated',
  FACILITY_NOTE_ADDED = 'facility_note_added',
  FACILITY_NOTE_DELETED = 'facility_note_deleted',
  FACILITY_SETTINGS_UPDATED = 'facility_settings_updated',

  // COMPETENCY TEST ACTIVITIES TYPE
  COMPETENCY_TEST_REASSIGNED = 'competency_test_reassigned',
}

export enum AVAILABILITY_STATUS {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  PARTIAL = 'partial',
}

export enum PushNotificationType {
  auto_scheduling = 'auto_scheduling',
  open_order = 'open_order',
  scheduled = 'scheduled',
  completed = 'completed',
  running_late = 'running_late',
  shift_void = 'shift_void',
  shift_cancelled = 'shift_cancelled',
  shift_requested = 'shift_requested',
  shift_updated = 'shift_updated',
  cancelled_by_provider = 'cancelled_by_provider',
  timecard_accepted = 'timecard_accepted',
  timecard_rejected = 'timecard_rejected',
  invited = 'invited',
  invitation_rejected = 'invitation_rejected',
  request_received = 'request_received',
  request_accepted = 'request_accepted',
  request_rejected = 'request_rejected',
  nearby_notify = 'nearby_notify',
  new_facility = 'new_facility',
  orientation_packet = 'orientation_packet',
  clock_in = 'clock_in',
  on_break = 'on_break',
  end_break = 'end_break',
  notify = 'notify',
  professional_reference_approved = 'professional_reference_approved',
  professional_reference_rejected = 'professional_reference_rejected',
}

export enum ProfessionalReferenceStatus {
  awaiting_response = 'awaiting_response',
  no_response = 'no_response',
  decline = 'decline',
  awaiting_approval = 'awaiting_approval',
  approved = 'approved',
  rejected = 'rejected',
}

export enum PROVIDER_NOTIFICATION_TYPE {
  shift = 'shift',
  account = 'account',
}

export enum EvaluationType {
  clinical_competence = 'clinical_competence',
  attitude_cooperation = 'attitude_cooperation',
  attendance_punctuality = 'attendance_punctuality',
  good_communication_skills = 'good_communication_skills',
}

export enum DAYS {
  sunday = 'sunday',
  monday = 'monday',
  tuesday = 'tuesday',
  wednesday = 'wednesday',
  thursday = 'thursday',
  friday = 'friday',
  saturday = 'saturday',
}

export enum AVAILABLE_TYPE {
  permanent = 'permanent',
  temporary = 'temporary',
}

export enum FILTER_SHIFT_TYPE {
  urgent = 'urgent',
  running_late = 'running_late',
  open = 'open',
  cancelled = 'cancelled',
}

export enum INVOICE_STATUS {
  paid = 'paid',
  unpaid = 'unpaid',
  partially_paid = 'partially_paid',
}

export enum INVOICE_STATE {
  generated = 'generated',
  billed = 'billed',
  received = 'received',
}

export enum PAYMENT_TYPE {
  payment = 'payment',
  adjustment = 'adjustment',
}

export enum DAYS_OF_WEEK {
  sunday = 'sunday',
  monday = 'monday',
  tuesday = 'tuesday',
  wednesday = 'wednesday',
  thursday = 'thursday',
  friday = 'friday',
  saturday = 'saturday',
}

export enum SHIFT_TIME_CODE {
  D = 'D',
  E = 'E',
  N = 'N',
  A = 'A',
  P = 'P',
}

export enum DAY_TYPE {
  weekend = 'weekend',
  weekday = 'weekday',
}

export enum DISBURSEMENT_STATUS {
  pending = 'PENDING',
  scheduled = 'SCHEDULED',
  completed = 'COMPLETED',
  failed = 'FAILED',
  cancelled = 'CANCELLED',
  skipped = 'SKIPPED',
}

export enum ADJUSTMENT_STATUS {
  pending = 'pending',
  settled = 'settled',
}

export enum PERMISSIONS {
  view = 'view',
  add = 'add',
  edit = 'edit',
  delete = 'delete',
  cancel = 'cancel',
  can_approve = 'can_approve',
  can_reject = 'can_reject',
  bill = 'bill',
  email = 'email',
  edit_settings = 'edit_settings',
  edit_accounting = 'edit_accounting',
  share = 'share',
  repost = 're-post',
  download = 'download',
  print = 'print',
  add_payment = 'add_payment',
  export = 'export',
}

export enum SECTIONS {
  dashboard = 'dashboard',
  shifts = 'shifts',
  map = 'map',
  staff = 'staff',
  credentials = 'credentials',
  facilities = 'facilities',
  invoices = 'invoices',
  timecards = 'timecards',
  reports = 'reports',
  staff_app_settings = 'staff_app_settings',
  facility_portal_settings = 'facility_portal_settings',
  admin_portal_settings = 'admin_portal_settings',
}

export enum FACILITY_CONTACT_PERMISSIONS {
  add_shift = 'add_shift',
  admin = 'admin',
  approve_reject_shift = 'approve_reject_shift',
  approve_time_card = 'approve_time_card',
  cancel_shift = 'cancel_shift',
  can_chat = 'can_chat',
  can_evaluate_staff = 'can_evaluate_staff',
  can_flag_staff_as_preferred_and_dnr = 'can_flag_staff_as_preferred_and_dnr',
  can_manage_billing = 'can_manage_billing',
  can_see_billing_summary = 'can_see_billing_summary',
  can_view_staff_email_or_phone_number = 'can_view_staff_email_or_phone_number',
  manage_team = 'manage_team',
  view_download_staff_credentials = 'view_download_staff_credentials',
}

export enum SUB_SECTION {
  dashboard = 'dashboard',
  map = 'map',
  shift = 'shift',
  staff = 'staff',
  applicant = 'applicant',
  facilities = 'facilities',
  corporate_clients = 'corporate_clients',
  credentials = 'credentials',
  invoices = 'invoices',
  reports = 'reports',
  timecards = 'timecards',
  competency_test = 'competency_test',
  skill_checklist = 'skill_checklist',
  shift_cancel_reasons = 'shift_cancel_reasons',
  staff_profile = 'staff_profile',
  schedule_and_requests = 'schedule_and_requests',
  time_entry_approval = 'time_entry_approval',
  general_settings = 'general_settings',
  edoc_settings = 'edoc_settings',
  facility_general_settings = 'facility_general_settings',
  shifts = 'shifts',
  staff_dnr_settings = 'staff_dnr_settings',
  dispute_timecard_reasons = 'dispute_timecard_reasons',
  orientation_reject_reasons = 'orientation_reject_reasons',
  license = 'license',
  specialities = 'specialities',
  credential_reject_reasons = 'credential_reject_reasons',
  document_categories = 'document_categories',
  status_options = 'status_options',
  compliance_manager = 'compliance_manager',
  users = 'users',
  shift_auto_schedule_settings = 'shift_auto-schedule_settings',
  reference_form_settings = 'reference_form_settings',
  facility_type = 'facility_type',
  tag_settings = 'tag_settings',
  rate_groups = 'rate_groups',
  holiday_groups = 'holiday_groups',
  staff_reject_reasons = 'staff_reject_reasons',
  professional_reference_reasons = 'professional_reference_reasons',
}

export enum ACTION_TABLES {
  ACCOUNTING_SETTING = 'accounting_setting',
  ACTIVITY = 'activity',
  ADMIN = 'admin',
  ADMIN_DOCUMENT = 'admin_document',
  CERTIFICATE = 'certificate',
  CHAT = 'chat',
  CREDENTIAL_REJECT_REASON = 'credential_reject_reason',
  CREDENTIALS = 'credentials',
  CREDENTIALS_CATEGORY = 'credentials_category',
  CORPORATE_CLIENT = 'corporate_client',
  DEPARTMENT = 'department',
  DISBURSEMENTS = 'disbursements',
  DNR_REASON = 'dnr_reason',
  DOCUMENTS = 'documents',
  EVALUATION_RESPONSE = 'evaluation_response',
  FACILITY = 'facility',
  FACILITY_HOLIDAY = 'facility_holiday',
  FACILITY_NOTE = 'facility_note',
  FACILITY_PERMISSION = 'facility_permission',
  FACILITY_PROVIDER = 'facility_provider',
  FACILITY_USER = 'facility_user',
  FACILITY_USER_PERMISSION = 'facility_user_permission',
  FLAG_SETTING = 'flag_setting',
  FLOOR_DETAIL = 'floor_detail',
  HOLIDAY_GROUP = 'holiday_group',
  INVITE = 'invite',
  INVOICE_TIMECARDS = 'invoice_timecards',
  INVOICES = 'invoices',
  LINE_OF_BUSINESS = 'line_of_business',
  NOTIFICATION = 'notification',
  ORIENTATION_REJECT_REASON = 'orientation_reject_reason',
  PAYMENT_INVOICES = 'payment_invoices',
  PAYMENTS = 'payments',
  PROVIDER = 'provider',
  PROVIDER_CREDENTIAL = 'provider_credential',
  PROVIDER_EDUCATION_HISTORY = 'provider_education_history',
  PROVIDER_EVALUATION = 'provider_evaluation',
  PROVIDER_ORIENTATION = 'provider_orientation',
  PROVIDER_PROFESSIONAL_REFERENCE = 'provider_professional_reference',
  PROVIDER_REJECT_REASON = 'provider_reject_reason',
  RATE_GROUPS = 'rate_groups',
  REFER_FACILITY = 'refer_facility',
  REFER_FRIEND = 'refer_friend',
  ROLE = 'role',
  ROLE_SECTION_PERMISSION = 'role_section_permission',
  SHIFT = 'shift',
  SHIFT_CANCEL_REASON = 'shift_cancel_reason',
  SHIFT_INVITATION = 'shift_invitation',
  SHIFT_NOTE = 'shift_note',
  SHIFT_REQUEST = 'shift_request',
  SPECIALITY = 'speciality',
  STATE = 'state',
  STATUS_SETTING = 'status_setting',
  TAG = 'tag',
  TIME_SHEETS = 'time_sheets',
  TIMECARD_REJECT_REASON = 'timecard_reject_reason',
  TIMECARDS = 'timecards',
  TOKEN = 'token',
  USER_NOTIFICATION = 'user_notification',
}

export enum CLIENT_TYPE {
  facility = 'Facility',
  corporate_client = 'Corporate Client',
}

export enum FILTERABLE_ACTIVITY_FIELD_BY_ID {
  SHIFT_ID = 'shift_id',
  ADMIN_ID = 'admin_id',
  FACILITY_USER_ID = 'facility_user_id',
  PROVIDER_ID = 'provider_id',
  TIMECARD_ID = 'timecard_id',
  FACILITY_ID = 'facility_id',
  INVOICE_ID = 'invoice_id',
  FACILITY_NOTE_ID = 'facility_note_id',
  FACILITY_PROVIDER_ID = 'facility_provider_id',
}
