import {
  PushNotificationType,
  SHIFT_INVITATION_STATUS,
  SHIFT_STATUS,
} from './enum';

export const defaultLimit = '10';
export const defaultOffset = '0';
export const masterAdminTitle = 'Master Admin';
export const dummyPassword = 'hashedPassword';
export const dummyToken = 'newToken';
export const dummyEmail = 'test@example.com';
export const dummyLogout = 'logged out';
export const salt = 10;
export const allowedTables = ['admin', 'provider', 'facility', 'facility_user'];
export const total_attempts = 3;

export const totalBreaks = 'total_breaks';
export const uploadSheets = 'upload_time_sheets';
export const accountingRole = 'accounting';

export const preferred = 'Preferred';
export const dnr = 'DNR';
export const prospect = 'Prospect';
export const applicant = 'Applicant';
export const active = 'Active';
export const in_active = 'Inactive';
export const shift_updated = 'shift_updated';

export const show_cancelled_shifts = 'show_cancelled_shifts_in_calendar';
export const show_cancellation_notes = 'display_cancellation_notes';

export const facilityAdminPermission = 'admin';

export const maxLoginAttemptsAllowed = 5;

export const ShiftEditIncludeKeys = [
  'facility',
  'certificate',
  'speciality',
  'start_date',
  'end_date',
  'floor',
  'start_time',
  'end_time',
  'follower',
  'premium_rate',
  'description',
];

// to track which is updated in contact user
export const ContactUserIncludedKeys = [
  'email',
  'first_name',
  'last_name',
  'mobile_no',
  'country_code',
  'image',
  'base_url',
  'role',
  'status',
];

// to track which is updated in contact user
export const RoleIncludedKeys = [
  'name',
  'description',
  'status',
  'role_section_permission',
];

export const TimecardIncludedKeys = [
  'additional_details',
  'break_duration',
  'approved_by_id',
  'clock_in',
  'clock_out',
  'status',
  'floor',
  'total_worked',
];

export const facilityShiftTime = { D: 1, E: 2, N: 3, A: 4, P: 5 };

export const colorCombination = [
  {
    name: 'green',
    backGround: '#F4FBF7',
    color: '#28714D',
  },
  {
    name: 'Deep Purple',
    backGround: '#F2F0FE',
    color: '#220EB1',
  },
  {
    name: 'Yellow',
    backGround: '#FFF8F0',
    color: '#FB8600',
  },
  {
    name: 'Red',
    backGround: '#FDF4F5',
    color: '#D1293D',
  },
  {
    name: 'Gray',
    backGround: '#F7F7F8',
    color: '#494A4C',
  },
  {
    name: 'Purple',
    backGround: '#F7F1FE',
    color: '#6111B9',
  },
  {
    name: 'Cyan',
    backGround: '#F7FDFE',
    color: '#0C90B6',
  },
  {
    name: 'Pink',
    backGround: '#FEF1F8',
    color: '#D11575',
  },
  {
    name: 'Orange',
    backGround: '#FFF5F0',
    color: '#FF6C2D',
  },
  {
    name: 'Violet',
    backGround: '#FCF1FE',
    color: '#B710D2',
  },
  {
    name: 'Indigo',
    backGround: '#F4F5FB',
    color: '#1A237E',
  },
  {
    name: 'Blue',
    backGround: '#ECF6FE',
    color: '#0D47A1',
  },
  {
    name: 'Light Blue',
    backGround: '#EBF8FE',
    color: '#01579B',
  },
  {
    name: 'Teal',
    backGround: '#F1F9F9',
    color: '#006064',
  },
  {
    name: 'Light Green',
    backGround: '#F5FAF0',
    color: '#1B5E20',
  },
  {
    name: 'Lime',
    backGround: '#FBFCEE',
    color: '#33691E',
  },
  {
    name: 'Amber',
    backGround: '#FFFAEB',
    color: '#827717',
  },
  {
    name: 'Indigo',
    backGround: '#F4F5FB',
    color: '#1A237E',
  },
  {
    name: 'Deep Orange',
    backGround: '#FDF3F2',
    color: '#BF360C',
  },
  {
    name: 'Brown',
    backGround: '#F4F2F0',
    color: '#3E2723',
  },
  {
    name: 'Metal Grey',
    backGround: '#F3F5F6',
    color: '#263238',
  },
  {
    name: 'Sandy Brown',
    backGround: '#FEF4EC',
    color: '#793906',
  },
  {
    name: 'Deep Sea',
    backGround: '#EBFFFA',
    color: '#008060',
  },
  {
    name: 'Congress Blue',
    backGround: '#EBF5FF',
    color: '#004080',
  },
  {
    name: 'Persian Indigo',
    backGround: '#F0EBFF',
    color: '#200080',
  },
  {
    name: 'Dark Cerulean',
    backGround: '#E8F5FC',
    color: '#0E4D71',
  },
  {
    name: 'Violin Brown',
    backGround: '#FFFAE5',
    color: '#665200',
  },
  {
    name: 'Arsenic ',
    backGround: '#F1F3F2',
    color: '#3B4540',
  },
  {
    name: 'Dark Slate Gray',
    backGround: '#EFF5F5',
    color: '#314E4E',
  },
  {
    name: 'Arsenic 2',
    backGround: '#F0F1F4',
    color: '#363B4A',
  },
  {
    name: 'Metallic Green',
    backGround: '#F3FFEB',
    color: '#338000',
  },
];

export interface ColumnConfig {
  columnKey: string;
  visible: boolean;
  order: number;
}

export const SHIFT_STATUS_DESCRIPTIONS: Partial<
  Record<
    | SHIFT_STATUS
    | Exclude<SHIFT_INVITATION_STATUS, 'cancelled'>
    | PushNotificationType,
    (args: { date_time: string; location: string; name?: string }) => string
  >
> = {
  // OPEN
  [SHIFT_STATUS.open]: ({ date_time, location }) =>
    `AI was unable to find a temp for your shift on [b]${date_time}[/b] at [b]${location}[/b]. The shift is now open for available providers to apply. You will be notified once a provider picks it up.`,

  // REQUESTED
  [SHIFT_STATUS.requested]: ({ name, date_time, location }) =>
    `${name} has requested the open shift on [b]${date_time}[/b] at [b]${location}[/b]. Please review and approve or decline the request.`,

  // REQUESTED
  [SHIFT_INVITATION_STATUS.rejected]: ({ name, date_time, location }) =>
    `[b]${name || 'The provider'}[/b] has rejected your shift invitations for [b]${date_time}[/b] at [b]${location}[/b].`,

  // SCHEDULED
  [SHIFT_STATUS.scheduled as SHIFT_STATUS]: ({ date_time, location }) =>
    `Your shift is confirmed for [b]${date_time}[/b] at [b]${location}[/b]. See shift details.`,

  // SHIFT UPDATED
  [PushNotificationType.shift_updated]: ({ location }) =>
    `The shift at [b]${location}[/b] has been updated. Review the latest details now.`,

  // COMPLETED
  [SHIFT_STATUS.completed as SHIFT_STATUS]: ({ date_time, location }) =>
    `The shift on [b]${date_time}[/b] at [b]${location}[/b] has been completed. Please review any pending actions like timecard submission.`,

  // CANCELLED By Provider
  [SHIFT_STATUS.cancelled]: ({ date_time, location, name }) =>
    `The provider [b]${name}[/b] has canceled their shift on [b]${date_time}[/b] at [b]${location}[/b]. AI has started searching for a replacement.`,

  // RUNNING LATE
  [SHIFT_STATUS.running_late as SHIFT_STATUS]: ({
    date_time,
    location,
    name,
  }) =>
    `The provider [b]${name}[/b] for the shift on [b]${date_time}[/b] at [b]${location}[/b]  is running late. "Put reason here" Do you want AI to find another temp? [Yes] [No]`,
};
