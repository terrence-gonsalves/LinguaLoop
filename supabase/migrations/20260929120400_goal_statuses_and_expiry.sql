-- goal statuses and automatic expiry
--
-- what:
--   1. replaces goal_status_enum (active, completed, failed, paused, archived)
--      with (active, completed, missed). guarded: raises an error if
--      public.goals has any rows, so no status value is silently remapped.
--   2. rewrites update_expired_goals() to mark active goals past end_date as
--      'missed' (it used to mark them 'completed' whether or not they were met)
--   3. enables pg_cron and runs update_expired_goals() daily at 00:05 UTC
--
-- why: the app stores only active, completed and missed. "not started" and
-- "in progress" are derived from dates in the app. nothing scheduled the
-- function before (DB_AUDIT 4.6), so goals never expired.
--
-- depends on 20260929120000_fix_updated_at_triggers.sql: the job UPDATEs goals,
-- which fires handle_updated_at_goals. the trigger sets updated_at, so the
-- function no longer sets it itself.
--
-- idempotent: the enum swap is skipped if the enum already has the new values;
-- create or replace function; create extension if not exists; cron.schedule
-- with a job name updates the existing job instead of adding a second one.

begin;

-- 1. replace goal_status_enum
do $$
declare
  current_labels text[];
begin
  select array_agg(e.enumlabel::text order by e.enumsortorder)
    into current_labels
  from pg_enum e
  where e.enumtypid = 'public.goal_status_enum'::regtype;

  if current_labels = array['active', 'completed', 'missed'] then
    raise notice 'goal_status_enum already is (active, completed, missed), skipping';
    return;
  end if;

  if exists (select 1 from public.goals) then
    raise exception 'public.goals has % row(s). Map their status values before replacing goal_status_enum.',
      (select count(*) from public.goals);
  end if;

  alter table public.goals alter column status drop default;
  alter type public.goal_status_enum rename to goal_status_enum_old;
  create type public.goal_status_enum as enum ('active', 'completed', 'missed');
  alter table public.goals
    alter column status type public.goal_status_enum
    using status::text::public.goal_status_enum;
  alter table public.goals alter column status set default 'active';
  drop type public.goal_status_enum_old;
end $$;

-- 2. expire active goals whose end date has passed
create or replace function public.update_expired_goals()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- a goal still active after its end date wasn't completed in time
  update public.goals
  set status = 'missed'
  where status = 'active'
    and end_date < (now() at time zone 'UTC')::date;
end;
$$;

-- create or replace keeps the existing ACL, but restate it in case this file
-- runs before 20260929120100_revoke_public_privileges.sql
revoke execute on function public.update_expired_goals() from public, anon, authenticated;

-- 3. schedule it
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'update-expired-goals',
  '5 0 * * *',  -- 00:05 UTC daily
  $job$select public.update_expired_goals()$job$
);

commit;

-- rollback
-- note: the enum rollback maps 'missed' to 'failed'. pg_cron is left
-- installed; add "drop extension pg_cron;" if nothing else uses it.
--
-- begin;
-- select cron.unschedule('update-expired-goals')
-- where exists (select 1 from cron.job where jobname = 'update-expired-goals');
--
-- create or replace function public.update_expired_goals()
-- returns void
-- language plpgsql
-- security definer
-- set search_path = ''
-- as $$
-- begin
--   update public.goals
--   set status = 'completed',
--       updated_at = now() at time zone 'UTC'
--   where status = 'active'
--     and end_date < (now() at time zone 'UTC')::date;
-- end;
-- $$;
--
-- alter table public.goals alter column status drop default;
-- alter type public.goal_status_enum rename to goal_status_enum_new;
-- create type public.goal_status_enum as enum ('active', 'completed', 'failed', 'paused', 'archived');
-- alter table public.goals
--   alter column status type public.goal_status_enum
--   using (case status::text when 'missed' then 'failed' else status::text end)::public.goal_status_enum;
-- alter table public.goals alter column status set default 'active';
-- drop type public.goal_status_enum_new;
-- commit;
