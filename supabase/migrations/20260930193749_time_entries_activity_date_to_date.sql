-- time_entries.activity_date as a calendar day
--
-- what:
--   1. changes public.time_entries.activity_date from timestamptz to date.
--      existing rows keep the calendar day they had in America/Toronto.
--   2. drops public.get_current_streak(uuid)
--
-- why: the app's date picker only chooses a day, but the column stored an
-- instant, so the day depended on the reader's time zone. the dashboard week
-- strip dropped Sunday entries and get_current_streak bucketed days in UTC.
-- a date column matches goals.start_date and goals.end_date, which the app
-- writes with toDateString() and reads with parseDateOnly() (lib/goals.ts).
-- nothing calls get_current_streak (no rpc in the app, edge functions or cron),
-- and it would need a rewrite for the new column type, so it is dropped.
--
-- data at the time of writing: 10 rows from 2 test users, all logged between
-- 02:15 and 05:41 UTC. converted with America/Toronto (UTC-4 in summer):
--   92e1a3e8: 06-13 02:30 -> 2025-06-12, 06-14 04:53 -> 2025-06-14,
--             06-15 05:30 (x2) -> 2025-06-15, 06-16 05:41 -> 2025-06-16
--   525da1bd: 07-22 to 07-26 (02:15 to 03:58) -> 2025-07-21 to 2025-07-25
-- the time of day is lost. no index, view or constraint uses the column.
--
-- ship with the app build that writes toDateString(): an older build sends a
-- full timestamp, which postgres cuts to its UTC date.
--
-- idempotent: the column change is skipped if activity_date is already a date;
-- drop function if exists.

begin;

-- 1. activity_date to date
do $$
begin
  if (
    select data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'time_entries'
      and column_name = 'activity_date'
  ) = 'date' then
    raise notice 'time_entries.activity_date is already a date, skipping';
    return;
  end if;

  alter table public.time_entries
    alter column activity_date type date
    using (activity_date at time zone 'America/Toronto')::date;
end $$;

-- 2. unused streak function
drop function if exists public.get_current_streak(uuid);

commit;

-- rollback
-- note: rows come back as midnight America/Toronto. the original time of day
-- is not restored. the function is restored as it was before this migration,
-- including its UTC bucketing, which doesn't match a timestamptz written from
-- another zone.
--
-- begin;
-- alter table public.time_entries
--   alter column activity_date type timestamptz
--   using (activity_date::timestamp at time zone 'America/Toronto');
--
-- create or replace function public.get_current_streak(p_user_id uuid)
-- returns integer
-- language plpgsql
-- stable
-- set search_path to ''
-- as $function$
-- declare
--     current_streak integer := 0;
--     last_activity_date date;
--     activity_dates date[];
--     i integer;
-- begin
--     select array_agg(distinct (activity_date at time zone 'UTC')::date order by (activity_date at time zone 'UTC')::date desc)
--     into activity_dates
--     from public.time_entries
--     where user_id = p_user_id;
--
--     if activity_dates is null or array_length(activity_dates, 1) = 0 then
--         return 0;
--     end if;
--
--     last_activity_date := activity_dates[1];
--
--     if last_activity_date < (now() at time zone 'UTC')::date - interval '1 day' then
--         return 0;
--     end if;
--
--     if last_activity_date = (now() at time zone 'UTC')::date then
--         current_streak := 1;
--     elsif last_activity_date = (now() at time zone 'UTC')::date - interval '1 day' then
--         current_streak := 1;
--     end if;
--
--     for i in 2..array_length(activity_dates, 1) loop
--         if activity_dates[i] = activity_dates[i-1] - interval '1 day' then
--             current_streak := current_streak + 1;
--         else
--             exit;
--         end if;
--     end loop;
--
--     return current_streak;
-- end;
-- $function$;
--
-- -- it had execute for public, anon, authenticated and service_role
-- grant execute on function public.get_current_streak(uuid) to public, anon, authenticated, service_role;
-- commit;
