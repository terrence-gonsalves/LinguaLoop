-- create the profiles row when a user signs up
--
-- what:
--   - adds public.handle_new_user(), which inserts (id, email) into
--     public.profiles for a new auth.users row. onboarding_completed takes its
--     column default (false).
--   - adds the on_auth_user_created trigger on auth.users (AFTER INSERT) that
--     calls it (DB_AUDIT 6.2)
--
-- why: the app inserted the profile from the client right after
-- supabase.auth.signUp (lib/auth-context.tsx). that only works while "Confirm
-- email" is off, because the insert needs the new user's session. with this
-- trigger the profile exists as soon as the auth user does, whatever the email
-- setting. the app now just loads the profile.
--
-- the function is SECURITY DEFINER so it can write to profiles regardless of
-- RLS, with search_path = '' so every name is schema-qualified. nobody but the
-- trigger needs to call it, so execute is revoked from public, anon and
-- authenticated.
--
-- on conflict do nothing keeps a sign-up from failing if a profile row already
-- exists for that id. all 5 current users already have a profile, so no
-- backfill is needed.
--
-- idempotent: create or replace function; drop trigger if exists, then create.

begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;

-- rollback (the app's client-side insert is gone, so rolling back also needs
-- that code restored, or sign-ups will have no profile)
-- begin;
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
-- commit;
