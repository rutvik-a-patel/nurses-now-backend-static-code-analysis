export const ShiftTableColumns = [
  { columnKey: 'shift_id', visible: true, order: 1 },
  { columnKey: 'shift_type', visible: true, order: 2 },
  { columnKey: 'start_time', visible: true, order: 3 },
  { columnKey: 'end_time', visible: true, order: 4 },
  { columnKey: 'start_date', visible: true, order: 5 },
  { columnKey: 'end_date', visible: true, order: 6 },
  { columnKey: 'status', visible: true, order: 7 },
  { columnKey: 'created_at', visible: true, order: 8 },
  { columnKey: 'created_by_type', visible: false, order: 9 },
  { columnKey: 'provider', visible: true, order: 10 },
  { columnKey: 'facility', visible: true, order: 11 },
  { columnKey: 'certificate', visible: true, order: 12 },
  { columnKey: 'speciality', visible: true, order: 13 },
  { columnKey: 'total_requests', visible: false, order: 14 },
  { columnKey: 'total_invites', visible: true, order: 15 },
  { columnKey: 'ordered_by', visible: false, order: 16 },
  { columnKey: 'premium_rate', visible: false, order: 17 },
  { columnKey: 'description', visible: false, order: 18 },
  { columnKey: 'follower', visible: false, order: 19 },
  { columnKey: 'floor', visible: false, order: 20 },
];

export const StaffTableColumns = [
  { columnKey: 'first_name', visible: true, order: 1 },
  { columnKey: 'email', visible: true, order: 2 },
  { columnKey: 'city', visible: true, order: 3 },
  { columnKey: 'state', visible: true, order: 4 },
  { columnKey: 'zip_code', visible: true, order: 5 },
  { columnKey: 'certificate_name', visible: true, order: 6 },
  { columnKey: 'speciality_name', visible: true, order: 7 },
  { columnKey: 'status', visible: true, order: 8 },
  { columnKey: 'verification_status', visible: true, order: 9 },
  { columnKey: 'last_login', visible: true, order: 10 },
  { columnKey: 'created_at', visible: true, order: 11 },
  { columnKey: 'updated_at', visible: true, order: 12 },
  { columnKey: 'first_work_date', visible: true, order: 13 },
  { columnKey: 'last_paid_date', visible: true, order: 14 },
];

export const ShiftManagerTableColumns = [
  { columnKey: 'start_date', visible: true, order: 1 },
  { columnKey: 'start_time', visible: true, order: 2 },
  { columnKey: 'certificate', visible: true, order: 3 },
  { columnKey: 'speciality', visible: true, order: 4 },
  { columnKey: 'status', visible: true, order: 5 },
  { columnKey: 'facility', visible: true, order: 6 },
  { columnKey: 'total_invites', visible: true, order: 7 },
  { columnKey: 'created_at', visible: true, order: 8 },
  { columnKey: 'staff_name', visible: true, order: 9 },
];

export const TableTypesColumns = {
  shift: ShiftTableColumns,
  staff: StaffTableColumns,
  shift_manager: ShiftManagerTableColumns,
};
