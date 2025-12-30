export async function getTimeCode(
  startTime: string,
  endTime: string,
  facility_id: string,
  repository: any, // or your specific repository type
): Promise<'A' | 'P' | 'D' | 'E' | 'N'> {
  const query = `
      SELECT get_shift_time_code($1, $2, $3) AS shift_time_code
    `;
  const result = await repository.query(query, [
    startTime,
    endTime,
    facility_id,
  ]);
  return result[0]?.shift_time_code || null;
}
