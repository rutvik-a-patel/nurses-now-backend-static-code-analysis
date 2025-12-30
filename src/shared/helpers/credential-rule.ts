import * as moment from 'moment-timezone';
import {
  CREDENTIAL_STATUS,
  VALIDATE_UPON,
  VERIFICATION_STATUS,
} from '@/shared/constants/enum';
import { active } from '../constants/constant';

export interface CredentialRuleResult {
  ok: boolean;
  blocker?: 'credentials';
  reason?: string;
}

export function validateCredentials(
  provider: any,
  timezone: any,
  req: any,
): CredentialRuleResult {
  const { status, verification_status, credentials } = provider;
  const isActive = status?.name === active;

  // Rule #1: Profile active but no credentials → allowed
  if (isActive && (!credentials || credentials.length === 0)) {
    return { ok: true };
  }

  // Rule #2: If inactive OR no credentials at all
  if (!isActive || !credentials || credentials.length === 0) {
    return {
      ok: false,
      blocker: 'credentials',
      reason: 'Missing credentials',
    };
  }

  // Rule #3: Ensure credential expiry is checked
  for (const cred of credentials) {
    // All credentials valid and not pending
    if (
      cred.is_verified === CREDENTIAL_STATUS.pending &&
      cred.validate === VALIDATE_UPON.refuse
    ) {
      return {
        ok: false,
        blocker: 'credentials',
        reason: 'Pending verification',
      };
    }

    if (!cred.expiry_date) continue;

    const expiry = moment
      .tz(cred.expiry_date, 'YYYY-MM-DD', timezone)
      .format('YYYY-MM-DD');
    const today = moment.tz(timezone).format('YYYY-MM-DD');

    if (expiry < today) {
      // approval required & validation type
      switch (cred.validate) {
        case VALIDATE_UPON.none:
        case VALIDATE_UPON.warn:
          if (req.user.role === 'admin') {
            return {
              ok: true,
              blocker: 'credentials',
              reason: 'Warning: Expired credentials - admin booking possible',
            };
          }
          return {
            ok: false,
            blocker: 'credentials',
            reason:
              'Warning: Expired credentials - facility restricted booking',
          };

        case VALIDATE_UPON.refuse:
          return {
            ok: false,
            blocker: 'credentials',
            reason: 'Refuse: Expired credentials — booking blocked',
          };

        default:
          return {
            ok: false,
            blocker: 'credentials',
          };
      }
    }
  }

  // All credentials valid and not pending
  if (verification_status !== VERIFICATION_STATUS.pending) {
    return { ok: true };
  }

  // Pending verification handling
  return {
    ok: true, // allow working but warn
    reason: 'Pending verification',
  };
}
