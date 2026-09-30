-- schema cleanup: defaults, duplicate index, policy names
--
-- what:
--   - drops the auth.uid() default on languages.master_language_id (DB_AUDIT 6.10)
--   - defaults user_id to auth.uid() on time_entries, goals and achievements (6.11)
--   - drops idx_notification_settings_user_id, which duplicates the primary
--     key notification_settings_pkey (user_id) (6.17)
--   - renames vague or misleading policies (6.18). renames only; no policy's
--     rule changes.
--
-- why: master_language_id defaulting to the caller's uid was a copy-paste
-- mistake. user_id defaults mean inserts don't rely on the client sending the
-- right id, and the insert policies still require user_id = auth.uid(). the
-- duplicate index costs writes for nothing.
--
-- idempotent: set/drop default can be repeated; drop index if exists; each
-- rename runs only if the old name still exists.

begin;

-- 6.10
alter table public.languages alter column master_language_id drop default;

-- 6.11
alter table public.time_entries alter column user_id set default auth.uid();
alter table public.goals        alter column user_id set default auth.uid();
alter table public.achievements alter column user_id set default auth.uid();

-- 6.17
drop index if exists public.idx_notification_settings_user_id;

-- 6.18
do $$
begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'languages'
             and policyname = 'Enable update for users based on email') then
    alter policy "Enable update for users based on email" on public.languages
      rename to "Users can update their own languages";
  end if;

  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'languages'
             and policyname = 'Enable delete for users based on user_id') then
    alter policy "Enable delete for users based on user_id" on public.languages
      rename to "Users can delete their own languages";
  end if;

  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles'
             and policyname = 'Authenticated user Updates') then
    alter policy "Authenticated user Updates" on public.profiles
      rename to "Users can update their own profile";
  end if;

  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles'
             and policyname = 'Allow authenticated insert') then
    alter policy "Allow authenticated insert" on public.profiles
      rename to "Users can insert their own profile";
  end if;
end $$;

commit;

-- rollback
-- begin;
-- alter table public.languages alter column master_language_id set default auth.uid();
-- alter table public.time_entries alter column user_id drop default;
-- alter table public.goals        alter column user_id drop default;
-- alter table public.achievements alter column user_id drop default;
-- create index if not exists idx_notification_settings_user_id
--   on public.notification_settings using btree (user_id);
-- alter policy "Users can update their own languages" on public.languages
--   rename to "Enable update for users based on email";
-- alter policy "Users can delete their own languages" on public.languages
--   rename to "Enable delete for users based on user_id";
-- alter policy "Users can update their own profile" on public.profiles
--   rename to "Authenticated user Updates";
-- alter policy "Users can insert their own profile" on public.profiles
--   rename to "Allow authenticated insert";
-- commit;
