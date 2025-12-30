import { Request } from 'express';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  EJS_FILES,
  FILTERABLE_ACTIVITY_FIELD_BY_ID,
  SHIFT_PREFERENCE_LABEL,
  SHIFT_STATUS,
  TABLE,
} from './enum';
import { Shift } from '@/shift/entities/shift.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { JwtPayload } from 'jsonwebtoken';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { LineOfBusiness } from '@/line-of-business/entities/line-of-business.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Admin } from '@/admin/entities/admin.entity';

export type AUTH_TABLE = 'admin' | 'provider' | 'facility_user' | 'facility';
export type SHIFT_CANCEL_TABLE =
  | 'admin'
  | 'provider'
  | 'facility_user'
  | 'facility';
export type SHIFT_TABLE = 'admin' | 'facility_user' | 'facility';
export type AUTH_COLUMN =
  | 'admin_id'
  | 'provider_id'
  | 'facility_user_id'
  | 'facility_id';

export type SEND_EMAIL = {
  name?: string;
  email: string | string[];
  cc_email?: string[];
  email_type: EJS_FILES;
  otp?: number;
  shiftData?: Shift;
  subject: string;
  redirectUrl?: string;
  supportEmail?: string;
  authority?: string;
  minutes?: number;
  hours?: number;
  data?: any;
  attachments?: {
    filename?: string | false | undefined;
    content?: string | Buffer | undefined;
    path?: string | undefined;
    folder?: string | undefined;
    contentType?: string | undefined;
  }[];
};

export type SHIFT_NOTIFICATION = {
  title: string;
  text: string;
  email: string;
  cc_mail?: string[];
  emailType: EJS_FILES;
  shiftData: Shift;
  subject: string;
  role: TABLE;
  userId: string;
  shiftStatus: SHIFT_STATUS;
  redirectUrl?: string;
  unsubscribeUrl?: string;
  push_type?: string;
};

export type SEND_SMS = {
  otp: number;
  contactNumber: string;
};

export interface IRequest extends Request {
  user: any;
  social_user?: any;
}

export type ORDER_BY = {
  [key: string]: 'ASC' | 'DESC';
};

export type DATE_FILTER = {
  [key: string]: {
    from_date: string;
    to_date: string;
  };
};

export type AVAILABILITY_STATUS = {
  [key: string]: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
};

export type EMAIL_OR_MOBILE = {
  email?: string;
  country_code?: string;
  mobile_no?: string;
};

export type CREATE_USER_TOKEN = {
  provider_id?: string;
  admin_id?: string;
  facility_id?: string;
  facility_user_id?: string;
  jwt: string;
  refresh_jwt?: string;
  remember_me?: boolean;
  firebase?: string;
  device_id: string;
  device_name: string;
  device_type: string;
  created_at_ip: string;
  updated_at_ip: string;
};

export interface IACTIVITY {
  action_by_type: TABLE;
  action_by_id: string;
  shift: Shift;
  activity_type: ACTIVITY_TYPE;
  message: Record<string, any>;
  entity_id: string;
  comment?: string;
  action_for?: ACTION_TABLES;
}

export interface FormattedMessage {
  [key: string]: any;
  shift_date?: string;
  shift_time?: string;
}

export interface WarnStaffMessage {
  status: string;
  staff: string;
  credential: string;
}

export interface IFilterDropdownOptions {
  facilities?: Facility[];
  certificates?: Certificate[];
  specialities?: Speciality[];
  facility_type?: LineOfBusiness[];
  status?: StatusSetting[];
  provider?: Provider[];
  facility_user?: FacilityUser[];
  admin?: Admin[];
}

export interface AuthPayload extends JwtPayload {
  id: string;
  column: AUTH_COLUMN;
  table: AUTH_TABLE;
}

export interface TransformedActivity {
  id: string;
  activity_type: string;
  action_by_type: string;
  createdAt: string;
  title: string;
  sub_title: string;
  description: string | string[];
  shift_time: string;
  shift_date: string;
  certificate?: string;
  speciality?: string;
  facility?: string;
  image?: string;
}

export interface GroupedActivity {
  date: string;
  activities: TransformedActivity[];
}

export type SHIFT_PREFERENCE = {
  [key in SHIFT_PREFERENCE_LABEL]: boolean;
};

export interface FilterProviderCredentialForAdmin {
  pending: number;
  expired: number;
  expiring_soon: number;
  rejected: number;
  approved: number;
}

export interface FilterDateQueryParams {
  start_date?: string;
  end_date?: string;
}

// ── PROFILE + GLOBAL (derived in SQL) ──────────────────────────────────────
export type ProfileRow = {
  name: string;
  provider_id: string;
  d: string; // 'YYYY-MM-DD'
  time_code: 'A' | 'D' | 'E' | 'N' | 'P';
  global_ok: boolean;
  profile_ok: boolean;
  profile_source:
    | 'TEMP'
    | 'PERM'
    | 'PROFILE_PROGRESS_INCOMPLETE'
    | 'DNR'
    | 'SELF'
    | 'DNR_BOTH'
    | 'NONE';
  profile_reason: string;
  orientation_ok: boolean;
  orientation_status: string;
};

export type ConflictRow = {
  provider_id: string;
  start_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  facility_id: string;
};

export type CredentialCheckResult = {
  provider_id: string;
  is_available: boolean;
  status_text: string | null;
  status_code: string;
  affected_credentials: any[];
};

export type ProviderListResult = {
  id: string;
  first_name: string;
  last_name: string;
  base_url: string;
  profile_image: string | null;
  status: any;
  certificate: any;
  credentials: any[];
  availability: 'available' | 'unavailable';
  booked_shift: any[];
  reason: string | null;
};

export type CreateEmployee = {
  first_name: string;
  last_name: string;
  email_address?: string;
  phone_number?: string;
  type: 'HOURLY' | 'SALARY';
};

export type CreateDisbursement = {
  amount: number;
  external_id: string;
  type: 'PAYCHECK';
  display_header_label?: string;
  description: string;
  retry: boolean;
};

export type ActivityFilterableKeys = Partial<
  Record<FILTERABLE_ACTIVITY_FIELD_BY_ID, string | string[]>
>;
