-- fix the updated_at triggers
--
-- what: recreates the four handle_updated_at_* triggers so they call
-- extensions.moddatetime(updated_at) instead of extensions.moddatetime().
--
-- why: moddatetime requires exactly one argument (the column to stamp). the
-- current triggers were created with none (pg_trigger.tgnargs = 0), so any
-- UPDATE on achievements, goals, notification_settings or time_entries fails
-- with "A single argument was expected". this runs first because the goals
-- migration schedules a job that updates goals.
--
-- idempotent: drop trigger if exists, then create.

begin;

drop trigger if exists handle_updated_at_achievements on public.achievements;
create trigger handle_updated_at_achievements
  before update on public.achievements
  for each row execute function extensions.moddatetime(updated_at);

drop trigger if exists handle_updated_at_goals on public.goals;
create trigger handle_updated_at_goals
  before update on public.goals
  for each row execute function extensions.moddatetime(updated_at);

drop trigger if exists handle_updated_at_notification_settings on public.notification_settings;
create trigger handle_updated_at_notification_settings
  before update on public.notification_settings
  for each row execute function extensions.moddatetime(updated_at);

drop trigger if exists handle_updated_at_time_entries on public.time_entries;
create trigger handle_updated_at_time_entries
  before update on public.time_entries
  for each row execute function extensions.moddatetime(updated_at);

commit;

-- rollback (restores the previous, broken definitions without the argument)
-- begin;
-- drop trigger if exists handle_updated_at_achievements on public.achievements;
-- create trigger handle_updated_at_achievements before update on public.achievements
--   for each row execute function extensions.moddatetime();
-- drop trigger if exists handle_updated_at_goals on public.goals;
-- create trigger handle_updated_at_goals before update on public.goals
--   for each row execute function extensions.moddatetime();
-- drop trigger if exists handle_updated_at_notification_settings on public.notification_settings;
-- create trigger handle_updated_at_notification_settings before update on public.notification_settings
--   for each row execute function extensions.moddatetime();
-- drop trigger if exists handle_updated_at_time_entries on public.time_entries;
-- create trigger handle_updated_at_time_entries before update on public.time_entries
--   for each row execute function extensions.moddatetime();
-- commit;
