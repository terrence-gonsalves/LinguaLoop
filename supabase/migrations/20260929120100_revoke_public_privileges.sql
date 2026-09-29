-- revoke privileges that anon and authenticated don't need
--
-- what:
--   1. stops public, anon and authenticated from calling update_expired_goals()
--   2. hides the graphql schema from anon
--   3. removes anon's table privileges on user tables, and removes write
--      privileges on reference tables from anon and authenticated (DB_AUDIT 6.15)
--
-- why: update_expired_goals is SECURITY DEFINER and anyone holding the anon key
-- could call it over /rest/v1/rpc and run it as postgres (DB_AUDIT 4.6). the app
-- doesn't use GraphQL (6.14). anon should have no path to user data even if an
-- RLS policy is later written too loosely (6.15). service_role keeps its grants,
-- so the scheduled job and edge function still work.
--
-- idempotent: revoking a privilege that isn't held is a no-op.

begin;

-- 1. update_expired_goals is only for the scheduler and service_role
revoke execute on function public.update_expired_goals() from public, anon, authenticated;

-- 2. graphql
revoke usage on schema graphql from anon;

-- 3. anon table privileges
revoke all on
  public.profiles,
  public.languages,
  public.goals,
  public.time_entries,
  public.follows,
  public.achievements,
  public.notification_settings,
  public.feedback
from anon;

-- reference tables stay readable but nobody except service_role writes to them
revoke insert, update, delete, truncate on
  public.master_languages,
  public.activities,
  public.quotes,
  public.quick_tips
from anon, authenticated;

commit;

-- rollback
-- begin;
-- grant execute on function public.update_expired_goals() to public, anon, authenticated;
-- grant usage on schema graphql to anon;
-- grant all on
--   public.profiles, public.languages, public.goals, public.time_entries,
--   public.follows, public.achievements, public.notification_settings, public.feedback
-- to anon;
-- grant insert, update, delete, truncate on
--   public.master_languages, public.activities, public.quotes, public.quick_tips
-- to anon, authenticated;
-- commit;
