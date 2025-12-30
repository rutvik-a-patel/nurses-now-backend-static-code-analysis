import { SetMetadata } from '@nestjs/common';
import {
  FACILITY_CONTACT_PERMISSIONS,
  PERMISSIONS,
  SECTIONS,
  SUB_SECTION,
} from '../constants/enum';

export const Permission = (permission: PERMISSIONS) =>
  SetMetadata('permission', permission);

export const Section = (section: SECTIONS, subsection: SUB_SECTION) =>
  SetMetadata('section', { section, subsection });

// FACILITY CONTACT DECORATORS
export const FacilityContactPermission = (
  facility_contact_permissions: FACILITY_CONTACT_PERMISSIONS[],
) => SetMetadata('facilityContactPermission', facility_contact_permissions);
