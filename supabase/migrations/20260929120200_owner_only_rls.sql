-- restrict profiles, languages and follows to their owners
--
-- what:
--   - profiles SELECT: own row only (was: every signed-in user, all columns
--     including email)
--   - languages SELECT: own rows only (was: everyone, including anon)
--   - follows SELECT: rows where the caller is the follower or the followed
--     user (was: the whole follow graph)
--   - drops the profiles DELETE policy, so users can't delete their profile
--     row and leave an orphaned auth.users row behind (DB_AUDIT 6.13)
--   - adds is_username_available(text), a SECURITY DEFINER check for
--     edit-profile.tsx, which can no longer query other users' profiles
--
-- why: connections is hidden for v1, so no user needs to read another user's
-- data (DB_AUDIT 4.1, 4.3). the one non-connections cross-user read was the
-- username uniqueness check at app/(stack)/edit-profile.tsx:110-115. under the
-- new policy that query would always find nothing, so it moves to a function
-- that only returns a boolean.
--
-- note: until the app calls is_username_available, the old client check
-- always passes. the UNIQUE constraint on profiles.user_name still rejects
-- duplicates (error 23505).
--
-- idempotent: drop policy if exists, then create; create or replace function.

begin;

-- profiles
drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Enable delete for users based on user_id" on public.profiles;

-- languages
drop policy if exists "Enable read access for all users" on public.languages;
drop policy if exists "Users can read their own languages" on public.languages;
create policy "Users can read their own languages"
  on public.languages for select to authenticated
  using ((select auth.uid()) = user_id);

-- follows
drop policy if exists "Anyone can view follows" on public.follows;
drop policy if exists "Users can view their own follows" on public.follows;
create policy "Users can view their own follows"
  on public.follows for select to authenticated
  using (
    follower_id = (select auth.uid())
    or following_id = (select auth.uid())
  );

-- username availability
-- matches the UNIQUE constraint (case-sensitive) and ignores the caller's own
-- row, so re-saving your current username counts as available
create or replace function public.is_username_available(p_user_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(btrim(p_user_name), '') <> ''
    and not exists (
      select 1
      from public.profiles p
      where p.user_name = p_user_name
        and p.id is distinct from (select auth.uid())
    );
$$;

revoke execute on function public.is_username_available(text) from public, anon;
grant execute on function public.is_username_available(text) to authenticated;

commit;

-- rollback (restores the original policies)
-- begin;
-- drop function if exists public.is_username_available(text);
--
-- drop policy if exists "Users can read their own profile" on public.profiles;
-- create policy "Enable read access for all users"
--   on public.profiles for select to authenticated using (true);
-- create policy "Enable delete for users based on user_id"
--   on public.profiles for delete to public using ((select auth.uid()) = id);
--
-- drop policy if exists "Users can read their own languages" on public.languages;
-- create policy "Enable read access for all users"
--   on public.languages for select to public using (true);
--
-- drop policy if exists "Users can view their own follows" on public.follows;
-- create policy "Anyone can view follows"
--   on public.follows for select to authenticated using (true);
-- commit;
