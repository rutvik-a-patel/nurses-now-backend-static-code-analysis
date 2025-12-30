import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShiftCalendarFunction1759750688712 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION public.get_shifts_calendar(
                p_facility_id      uuid,
                p_start_date       date,
                p_end_date         date,
                p_search           text      default null,
                p_certificate_ids  uuid[]    default null,
                p_speciality_ids   uuid[]    default null,
                p_statuses         text[]    default null
            ) returns jsonb
            language sql
            as $fn$
            with facility_or_default_settings as (
                select fss.time_code, fss.name as duration_name, fss.start_time, fss.end_time
                from facility_shift_setting fss
                where fss.facility_id = p_facility_id

                union all

                select fss.time_code, fss.name, fss.start_time, fss.end_time
                from facility_shift_setting fss
                where fss.facility_id is null
                and fss.is_default = true
                and not exists (
                        select 1 from facility_shift_setting fs2
                        where fs2.facility_id = p_facility_id
                    )
            ),
            settings as (
                select distinct on (time_code)
                    time_code, duration_name, start_time, end_time
                from facility_or_default_settings
            ),
            -- Compute time code first
            shifts_computed as (
                select
                    s.id,
                    s.created_at,
                    s.shift_id,
                    s.start_date,
                    s.end_date,
                    s.start_time,
                    s.end_time,
                    s.status,
                    s.facility_id,
                    s.provider_id,
                    s.is_orientation,
                    s.premium_rate,
                    s.certificate_id,
                    c.name          as certificate_name,
                    c.abbreviation  as certificate_abbreviation,
                    sp.id           as speciality_id,
                    sp.name         as speciality_name,
                    sp.abbreviation as speciality_abbreviation,
                    p.first_name,
                    p.last_name,
                    p.base_url,
                    p.profile_image,
                    public.get_shift_time_code(
                        s.start_time::time,
                        s.end_time::time,
                        s.facility_id::uuid
                    ) as computed_time_code
                from shift s
                join certificate c on c.id = s.certificate_id
                join speciality  sp on sp.id = s.speciality_id
                left join provider p on p.id = s.provider_id
                where s.facility_id = p_facility_id
                and s.start_date between p_start_date and p_end_date
                and s.deleted_at is null
            ),
            -- Apply settings membership + optional filters/search
            shifts as (
                select *
                from shifts_computed sh
                where exists (select 1 from settings st where st.time_code = sh.computed_time_code)
                and (
                        p_statuses is null
                    or coalesce(array_length(p_statuses, 1), 0) = 0
                    or sh.status::text = any (p_statuses)
                )
                and (
                        p_certificate_ids is null
                    or coalesce(array_length(p_certificate_ids, 1), 0) = 0
                    or sh.certificate_id = any (p_certificate_ids)
                )
                and (
                        p_speciality_ids is null
                    or coalesce(array_length(p_speciality_ids, 1), 0) = 0
                    or sh.speciality_id = any (p_speciality_ids)
                )
                and (
                        p_search is null
                    or btrim(p_search) = ''
                    or sh.shift_id ilike ('%' || p_search || '%')
                    or ((coalesce(sh.first_name,'') || ' ' || coalesce(sh.last_name,'')) ilike ('%' || p_search || '%'))
                )
            ),
            duration_rows as (
                select
                st.time_code,
                st.duration_name,
                st.start_time,
                st.end_time,
                case st.time_code
                    when 'D' then 1
                    when 'E' then 2
                    when 'N' then 3
                    when 'A' then 4
                    when 'P' then 5
                    else 6
                end as duration_order
                from settings st
            )
            select jsonb_agg(dur order by dur->>'_order') as result
            from (
            select jsonb_build_object(
                'shift_time_code', dr.time_code,
                'shift_duration',  dr.duration_name,
                'start_time',      dr.start_time,
                'end_time',        dr.end_time,
                '_order',          lpad(dr.duration_order::text, 2, '0'),
                'job_type',
                coalesce((
                -- One element per job type (certificate_abbreviation) under this duration
                select jsonb_agg(
                        jsonb_build_object(
                            'name', jt.certificate_abbreviation,
                            'shifts',
                            (
                                -- FLAT array of shifts (ordered by date, then time)
                                select coalesce(
                                        jsonb_agg(
                                            jsonb_build_object(
                                            'id',         sh.id,
                                            'shift_id',   sh.shift_id,
                                            'created_at', sh.created_at,
                                            'shift_status',
                                                case
                                                when sh.status::text in ('requested','auto_scheduling','invite_sent','open','cancelled') then 'open'
                                                when sh.status::text in ('completed','scheduled','ongoing','un_submitted','running_late') then 'filled'
                                                when sh.status::text = 'void' then 'void'
                                                else sh.status::text
                                                end,
                                            'provider',
                                                case when sh.provider_id is not null then
                                                jsonb_build_object(
                                                    'id',                        sh.provider_id,
                                                    'first_name',                sh.first_name,
                                                    'last_name',                 sh.last_name,
                                                    'base_url',                  sh.base_url,
                                                    'profile_image',             sh.profile_image,
                                                    'certificate_abbreviation',  sh.certificate_abbreviation,
                                                    'speciality_id',             sh.speciality_id,
                                                    'speciality_name',           sh.speciality_name,
                                                    'speciality_abbreviation',   sh.speciality_abbreviation
                                                )
                                                else null end,
                                            'start_date', sh.start_date,
                                            'end_date',   sh.end_date,
                                            'start_time', sh.start_time,
                                            'end_time',   sh.end_time,
                                            'certificate', jsonb_build_object(
                                                'id',           sh.certificate_id,
                                                'name',         sh.certificate_name,
                                                'abbreviation', sh.certificate_abbreviation
                                            ),
                                            'speciality', jsonb_build_object(
                                                'id',           sh.speciality_id,
                                                'name',         sh.speciality_name,
                                                'abbreviation', sh.speciality_abbreviation
                                            )
                                            )
                                            order by sh.start_date, sh.start_time
                                        ),
                                        '[]'::jsonb
                                        )
                                from shifts sh
                                where sh.computed_time_code = dr.time_code
                                and sh.certificate_abbreviation = jt.certificate_abbreviation
                            )
                        )
                        order by jt.certificate_abbreviation
                        )
                from (
                    select distinct sh.certificate_abbreviation
                    from shifts sh
                    where sh.computed_time_code = dr.time_code
                ) jt
                ), '[]'::jsonb)
            ) as dur
            from duration_rows dr
            ) j;
            $fn$;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS public.get_shifts_calendar;`,
    );
  }
}
