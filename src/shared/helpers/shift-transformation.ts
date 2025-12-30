export function transformShiftDataToJobTypes(groupedShiftData: any[]) {
  return groupedShiftData.map((group) => {
    const jobTypeMap = new Map<string, { name: string; shifts: any[] }>();

    for (const shift of group.shift_data) {
      const certName = shift.certificate_name;

      if (!jobTypeMap.has(certName)) {
        jobTypeMap.set(certName, {
          name: certName,
          shifts: [],
        });
      }

      jobTypeMap.get(certName)!.shifts.push(shift);
    }

    return {
      shift_duration: group.shift_duration,
      shift_time_code: group.shift_time_code,
      date: group.start_date, // optionally rename this field
      Job_type: Array.from(jobTypeMap.values()),
    };
  });
}
