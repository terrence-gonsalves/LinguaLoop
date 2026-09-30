-- goals: one grace day before the nightly job marks them missed
--
-- what: update_expired_goals() marks an active goal missed only when its
-- end_date is more than 1 day before the current UTC date (it used to be any
-- end_date before the current UTC date). the cron job 'update-expired-goals'
-- keeps its schedule, 00:05 UTC daily.
--
-- why: the app schedules a local reminder at 09:00 on the day after end_date
-- ("Did you hit it?", lib/goal-notifications.ts). with the old rule the job
-- could mark the goal missed before that reminder fired: at 00:05 UTC on the
-- day after end_date, which is the evening of end_date itself in the
-- Americas. now a goal ending on day E is marked missed at 00:05 UTC on E + 2,
-- and 09:00 local on E + 1 comes before that in every time zone from UTC-12
-- to UTC+14. the app still shows the goal as Missed from the day after
-- end_date (getGoalDisplayStatus in lib/goals.ts), so users see no change.
--
-- data at the time of writing: public.goals has no rows, so nothing changes
-- right away. the next run skips goals that ended yesterday (UTC) and marks
-- them missed a day later.
--
-- idempotent: create or replace function. execute stays limited to postgres
-- and service_role (20260929120100_revoke_public_privileges.sql), restated
-- below.

begin;

create or replace function public.update_expired_goals()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- a goal still active more than a day after its end date wasn't completed
  -- in time. the extra day lets the day-after reminder fire first.
  update public.goals
  set status = 'missed'
  where status = 'active'
    and end_date < (now() at time zone 'UTC')::date - 1;
end;
$$;

revoke execute on function public.update_expired_goals() from public, anon, authenticated;

commit;

-- rollback
--
-- begin;
-- create or replace function public.update_expired_goals()
-- returns void
-- language plpgsql
-- security definer
-- set search_path = ''
-- as $$
-- begin
--   -- a goal still active after its end date wasn't completed in time
--   update public.goals
--   set status = 'missed'
--   where status = 'active'
--     and end_date < (now() at time zone 'UTC')::date;
-- end;
-- $$;
--
-- revoke execute on function public.update_expired_goals() from public, anon, authenticated;
-- commit;
