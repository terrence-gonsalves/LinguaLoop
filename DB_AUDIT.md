# LinguaLoop Database Audit

- **Project:** `gspqgsdvpygdksjzvvep` (`https://gspqgsdvpygdksjzvvep.supabase.co`), the same project `.env` points to.
- **Date:** 2026-09-28
- **Method:** read-only Supabase MCP (`get_advisors`, `list_tables`, `list_edge_functions` and catalog queries run as `supabase_read_only_user`). Nothing was changed. All SQL in section 6 is proposed and has **not** been run.
- **Postgres:** `supabase-postgres-17.4.1.052`

### Limits of this audit

- Policies were read from `pg_policies`, not tested by signing in as different users (the read-only role can't switch roles). The conclusions follow from the policy definitions.
- The auth "Confirm email" setting can't be read over SQL. It was inferred from `auth.users` (see 4.4).
- `information_schema.role_table_grants` returns nothing for the read-only role, so grants were read from `pg_class.relacl`.
- `list_tables` shows `rows: 0` for every table because planner stats are stale. The exact counts below come from `count(*)`.

| Table | Rows |
|---|---|
| auth.users | 5 |
| profiles | 5 |
| languages | 10 |
| time_entries | 10 |
| follows | 6 |
| notification_settings | 3 |
| achievements | 1 |
| goals | 0 |
| master_languages | 44 |
| activities | 4 |
| quotes | 28 |
| quick_tips | 0 |
| feedback | 0 |
| storage.objects (avatars) | 3 |

---

## 1. Advisors

### Security (5 lint types)

| Level | Lint | Finding |
|---|---|---|
| WARN | [0028 anon_security_definer_function_executable](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) | `public.update_expired_goals()` is SECURITY DEFINER and callable by `anon` via `/rest/v1/rpc/update_expired_goals`. |
| WARN | [0029 authenticated_security_definer_function_executable](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) | Same function, callable by `authenticated`. |
| WARN | [vulnerable_postgres_version](https://supabase.com/docs/guides/platform/upgrading) | `supabase-postgres-17.4.1.052` has outstanding security patches. |
| WARN | [0026 pg_graphql_anon_table_exposed](https://supabase.com/docs/guides/database/database-linter?lint=0026_pg_graphql_anon_table_exposed) | 12 tables visible in the GraphQL schema to `anon`: achievements, activities, feedback, follows, goals, languages, master_languages, notification_settings, profiles, quick_tips, quotes, time_entries. |
| WARN | [0027 pg_graphql_authenticated_table_exposed](https://supabase.com/docs/guides/database/database-linter?lint=0027_pg_graphql_authenticated_table_exposed) | The same 12 tables are visible to `authenticated`. |

The GraphQL lints concern schema *discoverability*. Row access is still governed by RLS. The app doesn't use GraphQL.

### Performance (1 lint type, 10 findings)

| Level | Lint | Index |
|---|---|---|
| INFO | [0005 unused_index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index) | `idx_goals_language_id`, `idx_goals_user_id` (goals) |
| INFO | | `idx_time_entries_activity_id`, `idx_time_entries_associated_goal_id`, `idx_time_entries_language_id`, `idx_time_entries_user_id` (time_entries) |
| INFO | | `idx_notification_settings_user_id` (notification_settings) |
| INFO | | `idx_achievements_user_id` (achievements) |
| INFO | | `idx_follows_fk_following` (follows) |
| INFO | | `idx_languages_master_language_id` (languages) |

With about 10 rows per table the planner uses sequential scans, so "unused" is expected. These are foreign key and `user_id` indexes that will matter as data grows. **Keep them**, except `idx_notification_settings_user_id`, which duplicates the primary key `notification_settings_pkey (user_id)`.

---

## 2. Tables

The "Default" column lists only columns that have one. "FK" gives the target and the ON DELETE rule.

### profiles
Comment: "Stores additional user-specific data and links directly to the auth.users table". PK `id`.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | `auth.uid()` | FK → `auth.users(id)` ON DELETE CASCADE, ON UPDATE CASCADE |
| created_at | timestamptz | no | `now()` | |
| email | text | no | | UNIQUE |
| name | text | yes | | |
| user_name | text | yes | | UNIQUE |
| onboarding_completed | boolean | no | `false` | |
| native_language | text | yes | | Holds a `master_languages.id` as text. No FK. |
| avatar_url | text | yes | | |
| about_me | text | yes | | |

### languages
Comment: "Stores the specific languages a user wants to track". PK `id`. UNIQUE `(user_id, master_language_id)`.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | `gen_random_uuid()` | |
| user_id | uuid | no | `auth.uid()` | FK → `profiles(id)` ON DELETE CASCADE, ON UPDATE CASCADE |
| name | text | no | | Denormalized copy of `master_languages.name` |
| created_at | timestamptz | no | `now()` | |
| master_language_id | uuid | no | **`auth.uid()`** (wrong, see 6) | FK → `master_languages(id)` ON DELETE NO ACTION |
| proficiency_level | text | yes | | |

### master_languages
Comment: "List of available languages to track". PK `id`.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | `gen_random_uuid()` | |
| name | text | no | | UNIQUE |
| created_at | timestamptz | no | `now()` | |
| flag | text | yes | | |

### goals
PK `id`. Trigger `handle_updated_at_goals`.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | `gen_random_uuid()` | |
| user_id | uuid | no | | FK → `profiles(id)` ON DELETE CASCADE |
| language_id | uuid | yes | | FK → `languages(id)` ON DELETE **SET NULL** |
| title | text | no | | |
| description | text | yes | | |
| goal_type | `goal_type_enum` (daily_time, weekly_time, monthly_vocab, lessons_completed, skill_level, custom) | no | | |
| target_value_numeric | numeric | yes | | |
| target_value_text | text | yes | | |
| start_date | date | no | | |
| end_date | date | no | | |
| status | `goal_status_enum` (active, completed, failed, paused, archived) | no | `'active'` | |
| created_at | timestamptz | yes | `now()` | |
| updated_at | timestamptz | yes | `now()` | |

### time_entries
PK `id`. Trigger `handle_updated_at_time_entries`.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | `gen_random_uuid()` | |
| user_id | uuid | no | | FK → `profiles(id)` ON DELETE CASCADE, ON UPDATE CASCADE. **No default.** |
| language_id | uuid | no | | FK → `languages(id)` ON DELETE **NO ACTION** |
| activity_id | uuid | no | | FK → `activities(id)` ON DELETE NO ACTION |
| start_time | timestamptz | yes | | |
| end_time | timestamptz | yes | | |
| duration_seconds | bigint | no | | |
| notes | text | yes | | |
| created_at | timestamptz | no | `now()` | |
| updated_at | timestamptz | no | `now()` | |
| activity_date | timestamptz | yes | | |
| associated_goal_id | uuid | yes | | FK → `goals(id)` ON DELETE **NO ACTION** |

### activities
Comment: "Stores predefined activity types (Listening, Reading, Writing, Speaking)". PK `id`.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | `gen_random_uuid()` | |
| name | text | no | | UNIQUE |
| created_at | timestamptz | no | `now()` | |

### follows
PK `(follower_id, following_id)`. CHECK `no_self_follow (follower_id <> following_id)`.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| follower_id | uuid | no | | FK → `profiles(id)` ON DELETE CASCADE |
| following_id | uuid | no | | FK → `profiles(id)` ON DELETE CASCADE |
| created_at | timestamptz | yes | `now()` | |

### achievements
PK `id`. Trigger `handle_updated_at_achievements`.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | `gen_random_uuid()` | |
| user_id | uuid | no | | FK → `profiles(id)` ON DELETE CASCADE. **No default.** |
| type | `achievement_type_enum` (award, certificate, course, badge, other) | no | | |
| title | text | no | | |
| notes | text | yes | | |
| obtained_date | date | no | | |
| created_at | timestamptz | yes | `now()` | |
| updated_at | timestamptz | yes | `now()` | |

### notification_settings
PK `user_id`. Trigger `handle_updated_at_notification_settings`.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| user_id | uuid | no | `auth.uid()` | FK → `profiles(id)` ON DELETE CASCADE |
| study_reminder | boolean | no | `false` | |
| study_reminder_time | timetz | yes | | |
| news_promotions | boolean | no | `false` | |
| product_updates | boolean | no | `false` | |
| weekly_progress_reminder | boolean | no | `false` | |
| created_at | timestamptz | no | `now()` | |
| updated_at | timestamptz | yes | `now()` | |
| notifications_enabled | boolean | no | `false` | |
| user_notifications | boolean | no | `false` | |
| expo_push_token | text | yes | | |
| goal_notifications | boolean | yes | `false` | |

### quotes
Comment: "To store inspirational quotes and their authors." PK `id`. Columns: `id uuid default gen_random_uuid()`, `quote text`, `author text`, `created_at timestamptz default now()`. No FKs.

### quick_tips
PK `id`. Columns: `id uuid default gen_random_uuid()`, `tip text null`, `created_at timestamptz default now()`. No FKs. Empty and not in AUDIT.md.

### feedback
Comment: "Holds user submitted feedback". PK `id` (index named `"Feedback_pkey"`). Columns: `id uuid default gen_random_uuid()`, `user_name text`, `user_email text`, `feedback text`, `created_at timestamptz default now()`. **No `user_id` and no FKs.**

### Realtime publication
`supabase_realtime` publishes `achievements`, `follows`, `languages` and `time_entries`. It does not publish `goals`, `profiles` or `notification_settings`. Hooks that subscribe to changes on those tables will never receive events.

---

## 3. RLS and policies

RLS is **enabled on all 12 public tables**. FORCE RLS is off on all of them, which is normal. Every policy is PERMISSIVE.

Both `anon` and `authenticated` hold **full table privileges** (`arwdDxtm`) on every public table. That's the Supabase default, so RLS is the only thing protecting the data.

In the tables below, "own rows" means `user_id = auth.uid()` (or `id = auth.uid()` for profiles).

### profiles
| Policy | Roles | Cmd | USING | WITH CHECK |
|---|---|---|---|---|
| Enable read access for all users | authenticated | SELECT | `true` | |
| Allow authenticated insert | authenticated | INSERT | | `auth.uid() = id` |
| Authenticated user Updates | public | UPDATE | `auth.uid() = id` | *(none, so USING applies)* |
| Enable delete for users based on user_id | public | DELETE | `auth.uid() = id` | |

- **SELECT:** any signed-in user can read **every** profile, all columns, including `email`. Anon users can't read any.
- **INSERT:** a signed-in user can insert only a row whose `id` is their own uid.
- **UPDATE:** users can update only their own row and can't change `id` to someone else's. They *can* change their own `email`, which then no longer matches `auth.users`.
- **DELETE:** users can delete their own profile row. That cascades through all their data but leaves the `auth.users` row behind, so they can still sign in with no profile.

### languages
| Policy | Roles | Cmd | USING | WITH CHECK |
|---|---|---|---|---|
| Enable read access for all users | **public** | SELECT | `true` | |
| Allow authenticated users to insert their own languages | authenticated | INSERT | | `auth.uid() = user_id` |
| Enable update for users based on email | authenticated | UPDATE | `auth.uid() = user_id` | *(none, so USING applies)* |
| Enable delete for users based on user_id | authenticated | DELETE | `auth.uid() = user_id` | |

- **SELECT:** **anyone, including anonymous callers with only the anon key** (which ships in the app), can read every user's languages with `user_id`, `name` and `proficiency_level`.
- **INSERT, UPDATE and DELETE:** own rows only. The UPDATE policy's name mentions email, but it checks uid.

### goals, time_entries, achievements (the same four policies on each)
| Cmd | Roles | USING | WITH CHECK |
|---|---|---|---|
| SELECT | authenticated | `user_id = auth.uid()` | |
| INSERT | authenticated | | `user_id = auth.uid()` |
| UPDATE | authenticated | `user_id = auth.uid()` | `user_id = auth.uid()` |
| DELETE | authenticated | `user_id = auth.uid()` | |

Signed-in users can see, create, change and delete only their own rows. Anon users get nothing. Because SELECT is own-rows-only, **users can't read their connections' time entries**. `useActiveConnections.ts:40` queries a connection's `time_entries`, gets an empty result, and computes a streak of 0. `get_current_streak` is SECURITY INVOKER, so it has the same limit.

### notification_settings
SELECT, INSERT, UPDATE and DELETE are limited to own rows (`auth.uid() = user_id`) for authenticated users. UPDATE has a matching WITH CHECK. Nobody can read another user's `expo_push_token`.

### follows
| Policy | Roles | Cmd | Rule |
|---|---|---|---|
| Anyone can view follows | authenticated | SELECT | `true` |
| Users can follow others | authenticated | INSERT | `follower_id = auth.uid()` |
| Users can unfollow | authenticated | DELETE | `follower_id = auth.uid()` |

Every signed-in user can see the whole follow graph. Users can only create or remove follows where they are the follower. There is no UPDATE policy, so updates are blocked, which is fine.

### master_languages, activities, quotes, quick_tips
Each has one SELECT policy for `anon, authenticated` with `true`. Anyone can read them, and nobody except the service role can write to them. This is correct for reference data.

### feedback
Only one policy: INSERT for authenticated users, WITH CHECK `true`. Signed-in users can submit feedback and nobody can read it back, which is correct. `user_email` and `user_name` are free text supplied by the client and aren't tied to the caller.

---

## 4. Specific concerns from AUDIT.md section 5

### 4.1 Can a logged-in user read other users' `profiles.email`? **Yes.**
- The profiles SELECT policy is `true` for `authenticated`, and there are no column-level restrictions (`authenticated` has table-wide SELECT).
- Any signed-in user can run `supabase.from('profiles').select('email')` and get all 5 addresses.
- `AddConnectionModal.tsx:48` doesn't select `email`, but the policy doesn't stop anyone who does.
- Anon callers can't read profiles.

### 4.2 Can a user update or delete another user's goals, time_entries or languages by id? **No.**
- The UPDATE and DELETE policies on all three tables require `user_id = auth.uid()`. A request for someone else's row matches 0 rows and silently does nothing.
- goals and time_entries also have a WITH CHECK on UPDATE. languages has no WITH CHECK, but Postgres then applies the USING clause to the new row, so `user_id` can't be moved to another user either.
- The client code that filters only by `id` (`goals.tsx:64`, `goals/[id]/edit.tsx:90-102,119`, `activities.tsx:101-103`, `language-settings/index.tsx:86-88`) is therefore **safe**. Adding `.eq('user_id', …)` would be defense in depth only.
- One problem: those calls don't check how many rows were affected, so a blocked delete looks like a success.

### 4.3 Does `languages.user_id` default to `auth.uid()`? **Yes.** Which file is right? **`AddConnectionModal.tsx:60` matches the current policy. `language-settings/add.tsx:44` is buggy.**
- `user_id` defaults to `auth.uid()`, and the INSERT WITH CHECK requires it to equal `auth.uid()`. So the insert at `add.tsx:86-92`, which omits `user_id`, works.
- Reads are open to everyone (`true`, role `public`), so the query at `add.tsx:44` (`select('master_language_id')` with no `user_id` filter) returns **all 10 language rows across all users**.
- The "Add language" screen therefore hides every language that **any** user has added. For example, if another user tracks Spanish, you can't add Spanish.
- `AddConnectionModal.tsx:60` relies on that open read and works as intended.
- The right fix is in the app: add `.eq('user_id', session.user.id)` at `add.tsx:44`. If languages SELECT is later tightened (6.2), keep reads open to authenticated users so the modal still works.
- Related bug: `master_language_id` also defaults to `auth.uid()`, which is a copy-paste mistake. It's harmless today because the app always sends the value, and a missing value would fail the FK.

### 4.4 Does the profile insert at sign-up work under the current policies? **Yes, but only because email confirmation is off.**
- The insert at `auth-context.tsx:203-211` needs an `authenticated` session with `auth.uid() = id`. That holds only if `supabase.auth.signUp` returns a session, which happens only when "Confirm email" is disabled.
- Evidence it's disabled: all 5 `auth.users` rows have `email_confirmed_at` within about 60 ms of `created_at`, and `confirmation_sent_at` is null. Every user got a profile row 1.5–2 s later. There are 0 users without a profile.
- **Risk:** if "Confirm email" is turned on (which Play Store review often makes worth doing), `signUp` returns no session. The insert then runs as `anon` and fails with an RLS violation, leaving an auth user with no profile.
- The success toast already says "Please check your email to verify your account", which contradicts the current setting.
- The robust fix is a trigger on `auth.users` (6.2).

### 4.5 What happens to time_entries and goals when a language is deleted?
- **goals:** `fk_goal_language_id` is ON DELETE **SET NULL**. The goal survives with `language_id = null`.
- **time_entries:** `fk_language_id` is ON DELETE **NO ACTION**. **The delete fails** with error 23503 (foreign key violation) if the language has any time entries.
- 3 of the 10 languages have entries right now, so removing any of those fails with "Failed to remove language" (`language-settings/index.tsx:96`).
- The confirmation dialog promises that "All data related to this language will be removed", which isn't what happens.
- Related: `time_entries.associated_goal_id` → goals is also NO ACTION, so deleting a goal that has linked time entries fails too. `goals/[id]/edit.tsx:119` ignores that error and navigates away as if it worked.

### 4.6 `update_expired_goals`: does it exist, is it SECURITY DEFINER, and is anything scheduling it?
- **It exists:** `public.update_expired_goals() returns void`, plpgsql, owned by `postgres`, `search_path = ''`.
- **It is SECURITY DEFINER.**
- **`anon` and `authenticated` can EXECUTE it** (ACL `=X/postgres,anon=X,authenticated=X,…`). Anyone with the anon key can call it over `/rest/v1/rpc/update_expired_goals`, and it runs as `postgres`, bypassing RLS for every user.
- The damage is limited because it only touches goals that are already past `end_date`. It still shouldn't be public.
- **Logic issue:** it sets every expired active goal to `completed`, whether the target was met or not. `failed` is never used.
- **Nothing schedules it:**
  - `list_edge_functions` returns `[]`. The `check-and-update-goals` edge function in the repo was **never deployed**.
  - `pg_cron` and `pg_net` are **not installed** (no `cron` or `net` schema), so there are no cron jobs.
  - No trigger calls it.
- As a result, goals never expire automatically.

### 4.7 Is the avatars storage bucket public or private, and what are its policies? **Public.**
Bucket `avatars`: `public = true`, `file_size_limit = 512000` (500 KB), `allowed_mime_types = null`.

Policies on `storage.objects`:

| Policy | Roles | Cmd | Rule |
|---|---|---|---|
| Allow users to view others profile images | authenticated | SELECT | `bucket_id = 'avatars'` |
| Users can upload their own avatar | authenticated | INSERT | bucket is avatars, `owner = auth.uid()`, extension is jpg, jpeg or png |
| Users can update their own avatar | authenticated | UPDATE | bucket is avatars, `owner = auth.uid()` (USING and CHECK) |
| Users can delete their own avatar | authenticated | DELETE | bucket is avatars, `owner = auth.uid()` |

What this means:
- **Public bucket:** anyone can fetch `…/storage/v1/object/public/avatars/<userId>.jpg` **without signing in**. The SELECT policy only controls API listing and download. The signed URLs in `lib/supabase/storage.ts` add nothing, and they expire after 24 h, which breaks stored `avatar_url` values.
- **File names aren't tied to the uploader.** The INSERT policy checks `owner`, which storage sets to the uploader, but not the file name. User A can upload `<userB-id>.png` if that name isn't taken yet. B's later upsert of that name then fails the UPDATE policy because A owns the object.
- Existing objects: 2 of 3 are named after their owner, and 1 has `owner = null` (uploaded from the dashboard or with the service role). No user can replace or delete that one.
- `allowed_mime_types` is null. The extension check is the only content-type guard.

---

## 5. Functions, triggers and cron jobs

### Functions (schema `public`)
| Function | Security | search_path | EXECUTE granted to | Purpose |
|---|---|---|---|---|
| `update_expired_goals()` → void | **DEFINER** | `''` | PUBLIC, anon, authenticated, service_role | Sets `status='completed'` on active goals with `end_date` before today (UTC). |
| `get_current_streak(p_user_id uuid)` → int | INVOKER, STABLE | `''` | PUBLIC, anon, authenticated, service_role | Counts the current streak of consecutive UTC days with time entries. RLS limits it to the caller's own entries. |

There are no auth hooks and no `handle_new_user` function.

### Triggers
| Table | Trigger | When | Function |
|---|---|---|---|
| achievements | handle_updated_at_achievements | BEFORE UPDATE, each row | `extensions.moddatetime()` |
| goals | handle_updated_at_goals | BEFORE UPDATE, each row | `extensions.moddatetime()` |
| notification_settings | handle_updated_at_notification_settings | BEFORE UPDATE, each row | `extensions.moddatetime()` |
| time_entries | handle_updated_at_time_entries | BEFORE UPDATE, each row | `extensions.moddatetime()` |

- There are **no triggers on `auth.users`** and none on profiles or languages.
- **Unverified risk:** `pg_get_triggerdef` shows `moddatetime()` with no column argument. The extension expects exactly one argument (`moddatetime(updated_at)`) and raises an error otherwise. If so, every UPDATE on these four tables currently fails.
- There is conflicting evidence: 3 time_entries rows and 2 notification_settings rows have `updated_at` later than `created_at`, most recently on 2025-07-30. Either the triggers were added after those edits, or the app set `updated_at` itself.
- To confirm, edit a time entry in the app (`edit-activity/[id].tsx:208`).

### Cron jobs
None. `pg_cron` isn't installed.

### Extensions
`moddatetime`, `pg_graphql`, `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `supabase_vault`, `plpgsql`.

### Edge functions
None deployed.

---

## 6. Prioritized fix list

None of this SQL has been run. Run it in the SQL editor or as migrations, one block at a time, after checking the related app change.

### Critical

**6.1 Stop exposing every user's email to all signed-in users.**
The app never needs another user's email. The user's own email is in `session.user.email`. Option A is the cleanest.

Option A: drop the column. First change `lib/auth-context.tsx` to stop inserting `email`, and update any code that reads `profile.email` to use `session.user.email`.
```sql
alter table public.profiles drop column email;
```

Option B: keep the column and hide it with column privileges. This breaks every `select('*')` on profiles (`auth-context.tsx:126`, `profile/[id].tsx:65`, `edit-profile.tsx`), so those must list their columns explicitly.
```sql
revoke select on public.profiles from authenticated, anon;
grant select (id, created_at, name, user_name, onboarding_completed,
              native_language, avatar_url, about_me)
  on public.profiles to authenticated;
```

### Should fix

**6.2 Create profiles server-side at sign-up**, so sign-up keeps working if email confirmation is turned on. After this, remove the client insert at `auth-context.tsx:203-216` and just load the profile.
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, onboarding_completed)
  values (new.id, new.email, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```
If 6.1 option A is applied, drop `email` from the insert.

**6.3 Make language and goal deletes work.** Choose CASCADE for time entries, since the UI says related data is removed. If you'd rather keep history, use SET NULL and make `language_id` nullable instead. Also set the goal link on time entries to SET NULL.
```sql
alter table public.time_entries
  drop constraint fk_language_id,
  add constraint fk_language_id foreign key (language_id)
    references public.languages(id) on delete cascade;

alter table public.time_entries
  drop constraint time_entries_associated_goal_id_fkey,
  add constraint time_entries_associated_goal_id_fkey foreign key (associated_goal_id)
    references public.goals(id) on delete set null;
```

**6.4 Lock down `update_expired_goals` and schedule it.** Scheduling it with pg_cron inside the database removes the need for the edge function.
```sql
revoke execute on function public.update_expired_goals() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule(
  'update-expired-goals',
  '5 0 * * *',  -- 00:05 UTC daily
  $$select public.update_expired_goals()$$
);
```
Also decide whether an expired goal should become `completed` or `failed`, and update the function body to match.

**6.5 Restrict languages reads to signed-in users.** This keeps `AddConnectionModal` working. Also fix `language-settings/add.tsx:44` in the app by adding `.eq('user_id', session.user.id)`.
```sql
drop policy "Enable read access for all users" on public.languages;
create policy "Signed-in users can read languages"
  on public.languages for select to authenticated
  using (true);
```

**6.6 Make the avatars bucket private and tie file names to the uploader.** This matches the signed-URL code already in `lib/supabase/storage.ts`. Separately, stop saving 24 h signed URLs into `profiles.avatar_url`: store the path and sign it when reading.
```sql
update storage.buckets
  set public = false,
      allowed_mime_types = array['image/jpeg','image/png']
  where id = 'avatars';

drop policy "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '.', 1) = (select auth.uid())::text
    and storage.extension(name) in ('jpg','jpeg','png')
  );
```

**6.7 Show connections' streaks without opening up `time_entries`.** Add a definer function that returns only streak numbers, and only for users the caller follows. Then call `supabase.rpc('get_connection_streaks')` from `useActiveConnections.ts` instead of querying `time_entries`.
```sql
create or replace function public.get_connection_streaks()
returns table (user_id uuid, streak int)
language sql
stable
security definer
set search_path = ''
as $$
  -- same rule as get_current_streak: a run of consecutive UTC days ending today or yesterday
  with days as (
    select distinct te.user_id, (te.activity_date at time zone 'UTC')::date as d
    from public.time_entries te
    join public.follows f
      on f.following_id = te.user_id and f.follower_id = (select auth.uid())
    where te.activity_date is not null
  ),
  runs as (
    select user_id, d, d - (row_number() over (partition by user_id order by d))::int as grp
    from days
  ),
  islands as (
    select user_id, max(d) as last_day, count(*)::int as len
    from runs
    group by user_id, grp
  )
  select f.following_id,
         coalesce((select i.len from islands i
                   where i.user_id = f.following_id
                     and i.last_day >= (now() at time zone 'UTC')::date - 1), 0)
  from public.follows f
  where f.follower_id = (select auth.uid());
$$;

revoke execute on function public.get_connection_streaks() from public, anon;
grant execute on function public.get_connection_streaks() to authenticated;
```
Compare the results with `get_current_streak` on real data before shipping.

**6.8 Upgrade Postgres.** Dashboard → Settings → Infrastructure → Upgrade. There is no SQL for this.

**6.9 Check the `moddatetime` triggers (see section 5).** This could be critical, because if they're broken every update to time entries, goals, achievements and notification settings fails. Test by editing a time entry. If it fails with "A single argument was expected", recreate each trigger with the column argument:
```sql
drop trigger handle_updated_at_time_entries on public.time_entries;
create trigger handle_updated_at_time_entries
  before update on public.time_entries
  for each row execute function extensions.moddatetime(updated_at);
-- repeat for goals, achievements, notification_settings
```

### Minor

**6.10 Fix the wrong default on `languages.master_language_id`.**
```sql
alter table public.languages alter column master_language_id drop default;
```

**6.11 Add `user_id` defaults** so inserts don't depend on the client sending `user_id`.
```sql
alter table public.time_entries alter column user_id set default auth.uid();
alter table public.goals        alter column user_id set default auth.uid();
alter table public.achievements alter column user_id set default auth.uid();
```

**6.12 Tie feedback to the sender.**
```sql
alter table public.feedback
  add column user_id uuid default auth.uid() references public.profiles(id) on delete set null;
drop policy "Enable insert for authenticated users only" on public.feedback;
create policy "Users can submit their own feedback"
  on public.feedback for insert to authenticated
  with check (user_id = (select auth.uid()));
```

**6.13 Stop users deleting their own profile row while keeping the auth user.** Account deletion should go through a server-side function that deletes the `auth.users` row, and the cascade does the rest.
```sql
drop policy "Enable delete for users based on user_id" on public.profiles;
```

**6.14 Hide the GraphQL schema from anon.** The app doesn't use GraphQL.
```sql
revoke usage on schema graphql from anon;
-- or, if GraphQL will never be used:
-- drop extension pg_graphql;
```

**6.15 Tighten anon table privileges** as defense in depth. RLS already blocks anon on the user tables.
```sql
revoke all on public.profiles, public.languages, public.goals, public.time_entries,
              public.follows, public.achievements, public.notification_settings,
              public.feedback
  from anon;
revoke insert, update, delete, truncate on public.master_languages, public.activities,
              public.quotes, public.quick_tips
  from anon, authenticated;
```

**6.16 Add tables to Realtime** if the app subscribes to them. `goals` and `notification_settings` aren't published today.
```sql
alter publication supabase_realtime add table public.goals;
```

**6.17 Drop the duplicate index.** It duplicates the primary key.
```sql
drop index public.idx_notification_settings_user_id;
```

**6.18 Tidy policy names.** For example, the languages UPDATE policy "…based on email" checks uid.
```sql
alter policy "Enable update for users based on email" on public.languages
  rename to "Users can update their own languages";
```
