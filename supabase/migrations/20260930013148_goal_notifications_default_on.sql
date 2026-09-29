-- turn goal notifications on by default
--
-- what:
--   - notification_settings.goal_notifications defaults to true (was false)
--   - sets goal_notifications = true on existing rows where it is false or null
--
-- why: the app now schedules a local "your goal ended" reminder for each goal,
-- but only when goal_notifications is on (lib/goal-notifications.ts). until
-- this batch the toggle in the notifications screen was disabled and marked
-- "Coming soon", so no user could have turned it on or chosen to leave it off.
-- the false values are just the old column default. users can still turn it
-- off in Settings > Notifications. the app already treats a missing row or a
-- null as on.
--
-- data when written (2026-09-29): 3 rows, all false. all 3 become true.
--
-- idempotent: set default can be repeated, and the update only matches rows
-- that aren't already true.

begin;

alter table public.notification_settings
  alter column goal_notifications set default true;

update public.notification_settings
set goal_notifications = true
where goal_notifications is distinct from true;

commit;

-- rollback (the update can't be told apart from later user choices, so this
-- only restores the default)
-- begin;
-- alter table public.notification_settings
--   alter column goal_notifications set default false;
-- commit;
