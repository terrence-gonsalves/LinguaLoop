# LinguaLoop Audit

Audit date: 2026-09-28. Branch audited: `bugs` at `cd48b5d`.

How this was done: I read the code and ran `git`, `npx tsc --noEmit`, `npm run lint`, `npx expo-doctor` and `npm outdated`. `node_modules` was already present, so `npm ci` was not needed. Nothing was run on a device, emulator or web build, and I did not touch Supabase. **Every "Working" below means the code path is complete and wired to the database. It does not mean I saw it work at runtime.** Anything that depends on runtime or database state is marked "not verified".

---

## 1. Summary

The core loop is code-complete as of `5c34796` (2025-08-15): sign up, onboarding, add languages, log study time manually, edit and delete entries, dashboard, reports, goals, connections and achievements. That version of the app code type-checks with zero errors.

Today's commit `cd48b5d` ("commit all files before we run an audit") changed that. It added 180 leftover files from other templates (gluestack, tamagui, NativeWind, an old `src/` app, a `.js` auth flow) and pushed them to GitHub. Several of them are duplicate Expo Router routes (`app/_layout.js` next to `app/_layout.tsx`, `app/(auth)/login.js` next to `login.tsx`). Expo Router throws on those in development builds (`node_modules/expo-router/build/getRoutesCore.js:283` and `:326`). **As committed right now, the dev build should fail at startup** (reasoned from the router source; not verified by running it).

This is not a releasable v1. Blockers:
- `.env` is committed.
- Password reset is a non-functional button.
- There is no account deletion.
- Privacy policy, terms and help are Lorem ipsum.
- Login sessions very likely do not survive an app restart.
- RLS policies are unknown because the schema lives only in the Supabase dashboard.
- There is no start/stop timer.
- The project is 4 Expo SDKs behind.

Rough distance to a Play Store v1 is 3 to 5 weeks of part-time work. Most of it is S and M sized, and none of it needs a rewrite.

---

## 2. Git state

**Current branch:** `bugs`. It matches `origin/bugs`, with no uncommitted and no unpushed changes. It is 38 commits ahead of `origin/master` and 0 behind.

**Last 15 commits:**

| Date | Hash | Message |
|---|---|---|
| 2026-09-28 | cd48b5d | commit all files before we run an audit |
| 2025-08-15 | 5c34796 | Updated fonts size for screen titles, fixed layout issues buttons styling |
| 2025-08-10 | 3d058c2 | updating useDailyQuote to be random |
| 2025-07-31 | a1251e6 | Issue #86 - fixed structure for no profile and loading |
| 2025-07-31 | 9785751 | Fixed issue #53 with selected activity types and resetting them |
| 2025-07-30 | 7b33fd1 | Fixed issues with Achievements modal Save button being hidden |
| 2025-07-30 | 7582f1f | updated save/cancel button locations. Fixed data not updating on returning to lists screen |
| 2025-07-30 | 4ba89fe | updated Edit Activities screen |
| 2025-07-26 | 66d3828 | code cleanup |
| 2025-07-26 | 097d72f | updated large datasets from ScrollView to FlatList |
| 2025-07-25 | 06e21eb | added functionality for reviewing tracked activities and being able to create, edit and delete records |
| 2025-07-25 | e4e96de | Fixed the bottom of the scrollview margin/padding |
| 2025-07-25 | 860039a | fixed a storage issues with SecureStore and adding KeyboardAwareScrollView |
| 2025-07-24 | 3e57769 | building out the activites list screen |
| 2025-07-24 | 7aa6abb | Code cleanup and Splash screen adjustment |

**Other branches:** 27 local `feature/*` and `enhancement/*` branches, all pushed to origin.
- All of them are merged into `bugs` except `feature/analytics`, `feature/new-dashboard` and `feature/progress`. Those three are old experiments; `feature/analytics` is where `src/utils/supabaseConfig.js` came from.
- There is also a remote-only `origin/dev`.
- `origin/master` was last updated 2025-07-11 (merge of PR #71).
- Local `master` is 121 commits behind `origin/master`, so it is stale and should not be trusted.

**Uncommitted or unpushed:** none. Today's commit swept up everything that was untracked, including the in-progress work.

**What you were working on when you stopped:** an "unfollow" feature for connections. The pre-commit working tree had these changes:
- `components/ConnectionCard.tsx`: an unfollow button with a confirm alert that deletes from `follows`.
- `app/(stack)/connections.tsx`: `refresh`, `onRefresh` and an `onUnfollow` callback.
- `components/profile/ProfileConnectionCard.tsx`.

The branch name `bugs` and the last few commits suggest a bug-fix and polish pass across screens.

---

## 3. Stack and versions

| Thing | Version / choice |
|---|---|
| Expo SDK | 53.0.19 (latest is 57, so **4 SDKs behind**) |
| React Native | 0.79.5 (latest 0.87.1) |
| React | 19.0.0 |
| New Architecture | enabled (`app.config.js`) |
| Navigation | Expo Router 5.1.3 on React Navigation 7. `@react-navigation/stack`, `react-native-shared-element` and `react-navigation-shared-element` are also installed but only referenced in commented-out code (`app/_layout.tsx:9-17`). |
| State management | None. Per-screen custom hooks call Supabase directly, with Realtime subscriptions. |
| Backend | Supabase (`@supabase/supabase-js` 2.52.0, latest 2.117.2) |
| Charts | `react-native-chart-kit` 6.12 (effectively unmaintained) |
| Animation | `react-native-reanimated` 3.17.5 (latest 4.7) |
| Other notable | expo-notifications, expo-background-task, expo-secure-store, expo-updates, react-native-keyboard-controller, NetInfo, AsyncStorage |

### expo-doctor (6 checks failed)

1. `app.json` schema error: `android/adaptiveIcon` has an invalid `resizeMode`. `app.json` is also ignored entirely because `app.config.js` doesn't use it. It is a leftover and should be deleted.
2. Support packages don't match SDK 53: `@expo/config-plugins@10.0.2` (want ~10.1.1), `@expo/prebuild-config@7.0.8/7.0.6` (want ~9.0.0), `@expo/metro-config@0.20.17` (want ~0.20.18).
3. Native `android/` folder is present, so EAS will **not** sync `orientation`, `icon`, `scheme`, `userInterfaceStyle`, `splash`, `android`, `plugins` from `app.config.js`. Edits to those in `app.config.js` do nothing for Android builds right now.
4. `react-navigation-shared-element` has no React Native Directory metadata.
5. 10 packages behind their SDK 53 patch version: expo 53.0.27, expo-constants, expo-image 2.4.1, expo-notifications, expo-router 5.1.11, expo-secure-store, expo-system-ui, expo-updates, react-native 0.79.6, and @react-navigation/native-stack.
6. The same drift is reported as "Found outdated dependencies".

### npm outdated highlights

- Every `expo-*` package is on its SDK 53 version; latest are 57.x.
- `react-native` 0.79.5 to 0.87.1, `react-native-reanimated` 3 to 4, `react-native-gesture-handler` 2 to 3.
- `@supabase/supabase-js` 2.52 to 2.117 (same major, low risk).
- `typescript` 5.8 to 7.0, `eslint` 9 to 10, `eslint-config-expo` 9 to 57.
- `react-native-chart-kit` 6 to 7, `react-native-url-polyfill` 2 to 4, `@react-native-async-storage/async-storage` 2 to 3.

### Upgrade pain estimate: Medium to Large

Why it hurts:
- Four SDK jumps. Expo recommends going one SDK at a time, and each jump brings RN breaking changes.
- Reanimated 4 requires the New Architecture (already on, which helps) and changes some APIs. Gesture Handler 3 also changes.
- `lib/supabase/storage.ts:1` uses the legacy `expo-file-system` API (`readAsStringAsync`, `EncodingType`). That API moved to `expo-file-system/legacy` in later SDKs. `expo-file-system` is also **not in package.json**; it only resolves transitively.
- The committed `android/` folder is stale. It has three `MainActivity`/`MainApplication` copies under `com/bloopa`, `com/terrence` and `com/terrence/gonsalves`, and `versionName "0.6.5"` vs `0.6.10` in config. It will need regenerating with prebuild, not patching.
- `react-native-chart-kit` is unmaintained and may break on newer RN or react-native-svg.
- The 180 template leftover files pull in packages and configs (NativeWind patch in `patches/`, `metro.config.js` Node polyfills) that must go first or they will make every upgrade step noisier.

Why it's not worse: the real app is small (about 30 screens, 19 hooks), uses few native modules, and has no custom native code of its own.

---

## 4. Feature status

"Working" = code complete and wired to Supabase, **not run**.

| Area | Status | Evidence (files) | What's left |
|---|---|---|---|
| Auth: sign up | Working | `lib/auth-context.tsx:186-232`, `app/(auth)/create-account.tsx` | Profile row is inserted from the client (`auth-context.tsx:203`). If email confirmation is enabled in Supabase there's no session at that point and the insert likely fails under RLS (not verified). Better done with a DB trigger. `create-account.tsx:23,64` has unused `setLoading`/`isFormValid`, so form validation may not actually gate submit. |
| Auth: login | Working | `app/(auth)/login.tsx`, `auth-context.tsx:167` | Google and Apple buttons at `login.tsx:120-127` have no `onPress`. Remove or implement. |
| Auth: logout | Working | `app/(tabs)/settings.tsx:17-33`, `auth-context.tsx:234` | Nothing. |
| Auth: password reset | **Stub** | `app/(auth)/forgot-password.tsx:41` button has no handler. No `resetPasswordForEmail` or `updateUser({ password })` anywhere in the repo. | Full flow: send email, deep link back (`lingualoop://` scheme exists), new-password screen. |
| Auth: session persistence | **Likely broken** (not verified) | `lib/supabase.ts:13` creates the client with no `storage` option. On React Native, supabase-js then keeps the session in memory only. `auth-context.tsx:40-50` "reconstructs" by calling `supabase.auth.getSession()`, which will be empty after a cold start. The refresh token saved to SecureStore (`auth-context.tsx:66`) is never read back. | Pass a SecureStore- or AsyncStorage-backed `storage` to `createClient`. Expect users to be logged out every time the app is killed until this is fixed. |
| Onboarding | Working | `app/(stack)/onboarding.tsx:139-160` | Nothing obvious. |
| Dashboard | Working | `app/(tabs)/index.tsx`, `hooks/useStudyStats.ts`, `useWeeklyStreak.ts`, `useDailyQuote.ts`, `useActivities.ts` | "Quick tips" commented out (`index.tsx:251-263`). |
| Time tracking: start/stop timer | **Missing** | No timer code anywhere (no `setInterval`, no timer state). | Build it: running timer, survives backgrounding, saves to `time_entries`. |
| Time tracking: manual entry | Working | `app/(tabs)/track.tsx:124-185` | `activity_date` is sent as a JS `Date` (`track.tsx:175`), so near midnight it may land on the wrong day depending on column type and timezone (not verified). |
| Time tracking: edit | Working | `app/(stack)/edit-activity/[id].tsx:208-218` | Stray stub `app/(stack)/edit-activity.tsx` (40 lines) should be deleted. |
| Time tracking: delete | Working | `app/(stack)/activities.tsx:101-103` | Deletes by `id` only, with no `user_id` filter, so safety depends entirely on RLS. |
| Languages: add | Working, but suspect | `app/(stack)/language-settings/add.tsx:43-45,86-92` | Line 44 reads `languages` with **no user filter**, and line 86 inserts **without `user_id`**. It only works if RLS limits SELECT to own rows and `user_id` defaults to `auth.uid()`. But `components/profile/AddConnectionModal.tsx:60` reads everyone's languages, which needs the opposite policy. One of these two screens is wrong (not verified which). |
| Languages: edit | Partial | Only proficiency level is editable: `components/language-level/SetLevelModal.tsx:66-71`. Two duplicate screens: `app/(stack)/language-level.tsx` and `app/(stack)/language-level/index.tsx`. | Delete one duplicate. |
| Languages: remove | Working | `app/(stack)/language-settings/index.tsx:86-88` | Deletes by `id` only (RLS dependent). What happens to that language's `time_entries` and `goals` (cascade or orphan) is not verified. |
| Skill categories (reading, writing, listening, speaking) | Working | Rows in the `activities` table, loaded by `hooks/useActivities.ts`. The names are **also hardcoded** in `track.tsx:255-283`, `edit-activity/[id].tsx:301-329`, `(tabs)/index.tsx:23-26`, `hooks/useInputOutputAnalysis.ts:46-47` | The name to id lookup is done by capitalizing a string (`track.tsx:152`). Fragile but works if the DB names match exactly. |
| Analytics / Reports | Partial | `app/(tabs)/reports.tsx` plus 7 hooks, all wired to real data | `components/reports/KeyInsightsCard.tsx:22-42` is fully hardcoded text. `reports.tsx:46` has unused `comparisonItems2`. `StudyProgressCard.tsx:9` has a dead hardcoded dataset. |
| Goals | Working | `app/(stack)/create-goal.tsx`, `goals.tsx`, `goals/[id]/edit.tsx`, `supabase/functions/check-and-update-goals/index.ts` | Goal expiry relies on the edge function calling RPC `update_expired_goals`. Whether it is deployed or scheduled is not verified. Stray stub `app/(stack)/edit-goal.tsx`. |
| Settings | Partial | `app/(tabs)/settings.tsx` | Privacy link commented out (`settings.tsx:79-83`). Two stray duplicate settings routes (see section 6). |
| Edit profile / avatar | Working, with a bug | `app/(stack)/edit-profile.tsx`, `lib/supabase/storage.ts` | `uploadAvatar` returns a **24-hour signed URL** that gets saved into `profiles.avatar_url` (`edit-profile.tsx:171`). Your own avatar is re-signed on load (`auth-context.tsx:137`), but other users see your stored URL, which breaks after 24h (connections, profile pages). |
| Notifications | Partial (not verified) | `lib/notifications.ts`, `app/(stack)/notifications.tsx` | One toggle is disabled "Coming soon" (`notifications.tsx:316-320`). `expo-background-task` is installed and configured as a plugin but no task is defined. The EAS projectId is hardcoded (`lib/notifications.ts:30`). Requires a dev build to test. |
| Connections (follow/unfollow, public profiles) | Working (unfollow is new, untested) | `app/(stack)/connections.tsx`, `components/ConnectionCard.tsx`, `components/profile/AddConnectionModal.tsx`, `app/(stack)/profile/[id].tsx` | `AddConnectionModal.tsx:46-80` downloads **every** profile and **every** language row, then filters on the device. Fine for 20 users, not for 2,000. |
| Achievements | Working | `hooks/useAchievements.ts`, `components/profile/AddAchievementModal.tsx`, `app/(stack)/achievements.tsx` | Nothing obvious. |
| Feedback | Working | `app/(stack)/feedback.tsx` (with offline queue in AsyncStorage) | Nothing obvious. |
| Help / Terms / Privacy | **Stub** | `app/(stack)/help.tsx`, `terms.tsx`, `privacy.tsx` are all Lorem ipsum. Privacy shows "Last Updated: today's date" (`privacy.tsx:20`). | Real content. Required for the Play Store. |
| About | Working | `app/(stack)/about.tsx` (reads version from config) | Nothing. |
| Account deletion | **Missing** | No code. | Required by Google Play (see section 8). |
| OTA updates | Configured, not verified | `app.config.js` `updates.url`, `eas.json` channels | Not verified. |

---

## 5. Data layer

### Where the schema comes from

**Hand-built in the Supabase dashboard.** There is no `supabase/migrations/`, no schema dump and no generated types. The only SQL in the repo is `scripts/*.sql`, which are one-off "run this in the SQL editor" scripts using `IF NOT EXISTS` guards. One of them (`scripts/fix-proficiency-level-enum.sql`) drops constraints blindly. That is a clear sign the schema drifted by hand. Everything below is **inferred from the queries in the code** and is not verified against the real database.

### Tables (inferred)

| Table | Columns seen in code | Relationships |
|---|---|---|
| `profiles` | `id`, `created_at`, `email`, `name`, `user_name`, `onboarding_completed`, `native_language`, `about_me`, `avatar_url` (`lib/supabase.ts:15-25`) | `id` = `auth.users.id`. `native_language` holds a `master_languages.id`, not a name (`profile/[id].tsx:91-93`). |
| `languages` (a user's target languages) | `id`, `user_id`, `name`, `master_language_id`, `proficiency_level` (text), `created_at` | `user_id` to profiles/auth.users, `master_language_id` to `master_languages` (joined as `master_languages(...)`). |
| `master_languages` (reference list) | `id`, `name`, `flag` | Referenced by `languages` and `profiles.native_language`. |
| `activities` (skill categories) | `id`, `name` ('Reading', 'Writing', 'Listening', 'Speaking') | Referenced by `time_entries.activity_id`. |
| `time_entries` | `id`, `user_id`, `language_id`, `activity_id`, `duration_seconds`, `notes`, `activity_date`, `associated_goal_id` | FKs to `languages`, `activities` and `goals` (joined in `edit-activity/[id].tsx:104-113`). |
| `goals` | `id`, `user_id`, `language_id`, `title`, `description`, `goal_type` (`daily_time`, `weekly_time`, `monthly_vocab`, `lessons_completed`, `skill_level`, `custom`), `target_value_numeric`, `target_value_text`, `start_date`, `end_date`, `status`, `created_at` | `language_id` to `languages` (joined in `goals.tsx:49`). |
| `follows` | `follower_id`, `following_id` | Both reference `profiles` (`useActiveConnections.ts:111` uses `profiles!following_id`). |
| `achievements` | `id`, `user_id`, `type`, `title`, `notes`, `obtained_date`, `created_at` | `user_id`. |
| `notification_settings` | `user_id` (unique), `notifications_enabled`, `study_reminder`, `study_reminder_time`, `news_promotions`, `product_updates`, `user_notifications`, `goal_notifications`, `expo_push_token` | `user_id` to `auth.users` (`scripts/migrate-notification-settings.sql:33`). |
| `quotes` | `id`, `quote`, `author` | None. |
| `feedback` | `feedback`, `user_name`, `user_email` (no `user_id` sent) | None. |
| Storage bucket `avatars` | files named `<userId>.<ext>` | Served through signed URLs (`lib/supabase/storage.ts`). |
| RPC `update_expired_goals` | SECURITY DEFINER per the comment in the edge function | Called by `supabase/functions/check-and-update-goals/index.ts`. |

### RLS status

**Not verified for any table.** Nothing in the repo shows the policies. What the code implies:

- **`profiles`:** readable across users. `profile/[id].tsx:65` does `select('*')` on another user's row, and `AddConnectionModal.tsx:48` lists all profiles. If that works in production, **any logged-in user can read every other user's email address**, because `email` is a column on `profiles`. This is a privacy problem regardless of intent.
- **`time_entries`:** readable across users. `useActiveConnections.ts:40-45` computes streaks from a connection's entries. Whether that is intended to be limited to followers is unknown.
- **`languages`:** contradictory. `AddConnectionModal.tsx:60` needs to read all users' rows, while `language-settings/add.tsx:44` assumes it only sees its own. If RLS allows reading all rows, the "Add language" screen hides every language that *any* user has added.
- **Writes filtered by `id` only, with no `user_id` check in the query:**
  - `goals.tsx:64` (delete)
  - `goals/[id]/edit.tsx:90-102` (update, and it overwrites `user_id` with the current user)
  - `goals/[id]/edit.tsx:119` (delete)
  - `activities.tsx:101-103` (delete time entry)
  - `language-settings/index.tsx:86-88` (delete language)

  **If RLS is off or permissive on these tables, any user who knows a row id can edit or delete another user's data.**
- **Inserts relying on DB defaults:** `language-settings/add.tsx:86-92` inserts `languages` with no `user_id`.
- **`profiles` insert from the client** at sign-up (`auth-context.tsx:203`) requires an INSERT policy permissive enough to allow it.

**Could a user read or write another user's data?** Reading: very likely yes for `profiles` (including email), `time_entries` and `languages`, because the features depend on it. Writing: unknown, and it depends entirely on policies I can't see. This must be checked in the dashboard before release.

### Supabase client setup and env vars

- `lib/supabase.ts:6-13` builds the client from `Constants.expoConfig.extra.supabaseUrl` / `supabaseAnonKey`, and throws at import time if they are missing.
- `app.config.js:1` loads `.env` through `dotenv/config` and maps `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `EAS_PROJECT_ID` into `extra` (`app.config.js:31-38`).
- **No auth storage adapter is passed**, which is the session-persistence problem in section 4. `expo-secure-store` is used separately in `auth-context.tsx` to stash token metadata that is never used to restore the session.
- `.env-example` lists only `SUPABASE_URL` and `SUPABASE_ANON_KEY`. `EAS_PROJECT_ID` is missing, and without it `updates.url` becomes `https://u.expo.dev/undefined`.
- Three dead alternative clients exist (`utils/supabase.js`, `utils/supabaseConfig.js`, `src/utils/supabaseConfig.js`). One of them hardcodes credentials (section 7).

---

## 6. Code health

### TypeScript: 271 errors

All of the application code that existed at `5c34796` type-checks clean. The 271 errors come from:
- **Files added in today's `cd48b5d`.** The bulk are `components/ui/**` (78 gluestack files), `src/**`, `app/(tabs)/(settings)/styles.ts`, `app/(tabs)/styles.ts`, `app/(tabs)/progress.tsx:118`, `app/(tabs)/settings/test.tsx:3` (imports a module that doesn't exist), `components/Collapsible.tsx:7`, `components/DividerLine.tsx:3`, `components/ExternalLink.tsx:1`, `config/gluestack-ui.config.ts:2` (`@gluestack-ui/themed` not installed), and `hooks/useThemeColor.ts:8`.
- **`supabase/functions/check-and-update-goals/index.ts`** (5 errors). This is a Deno file being checked by the Node tsconfig because `tsconfig.json` includes `**/*.ts`. It's a config problem, not a code bug. Exclude `supabase/functions` from the tsconfig.
- **`app-example/`** (6 errors). It is gitignored and local only, but still picked up by `tsc`.

Worst ones that matter: none in real app code. The ones that would actually bite are the leftovers imported by nothing, and they should just be deleted.

### Lint: 345 problems (245 errors, 100 warnings)

By rule:
- 143 `import/no-unresolved`
- 83 `react/display-name`
- 70 `@typescript-eslint/no-unused-vars`
- 18 `react-hooks/exhaustive-deps`
- 11 `react/no-unescaped-entities`
- 8 `import/no-duplicates`
- 7 `no-undef`
- 5 other

About 290 of these are in `components/ui/`, `src/` and other leftovers.

In real app code (about 55 issues):
- **Unescaped quotes (errors):** `app/(auth)/forgot-password.tsx:25`, `app/(auth)/login.tsx:132`, `app/(stack)/feedback.tsx:166`, `app/(stack)/onboarding.tsx:187`, `app/(tabs)/index.tsx:244`. Cosmetic.
- **Missing hook dependencies:** `activities.tsx:51,59`, `create-goal.tsx:100`, `edit-activity/[id].tsx:95`, `feedback.tsx:37`, `goals.tsx:39`, `goals/[id]/edit.tsx:26`, `language-settings/index.tsx:38,68`, `notifications.tsx:43`, `profile/[id].tsx:58`, `(tabs)/profile.tsx:46`, `AddConnectionModal.tsx:41`. Mostly harmless "fetch on mount" patterns, but a real source of stale-data bugs.
- **Unused variables:** swallowed `err` variables in `catch` blocks (`track.tsx:160,182`, `goals/[id]/edit.tsx:66,106`, `login.tsx:54`), which means errors are silently hidden. Also unused loading states and `ProfileConnectionCard.tsx:35` `profile`, which is part of the in-progress unfollow work.

### Tests

None. No test runner is configured. `components/__tests__/ThemedText-test.tsx` and `src/components/__tests__/StyledText-test.js` are template leftovers that import `react-test-renderer`, which isn't installed.

### TODO / FIXME / HACK

None in source files. The only "coming soon" marker is `app/(stack)/notifications.tsx:316`.

### Duplicate and conflicting routes (all added to git in `cd48b5d`)

| Files | Problem |
|---|---|
| `app/_layout.js` + `app/_layout.tsx` | Two root layouts. Expo Router throws "layouts conflict" in dev. `_layout.js` redirects to a non-existent `/(app)` group. |
| `app/(auth)/_layout.js` + `app/(auth)/_layout.tsx` | Same, for the auth group. |
| `app/(auth)/login.js` + `app/(auth)/login.tsx` | Expo Router throws "route files conflict" in dev. |
| `app/index.tsx`, `app/old-index.tsx` + `app/(tabs)/index.tsx` | Template "Edit app/index.tsx" screen competes for `/`. |
| `app/(tabs)/settings.tsx` + `app/(tabs)/settings/_layout.tsx` + `settings/index.tsx` + `settings/test.tsx` + `app/(tabs)/(settings)/index.tsx` | Three competing settings screens. Likely a duplicate `settings` screen in the tab navigator (not verified). |
| `app/(tabs)/language.tsx`, `progress.tsx`, `tracking.tsx`, `styles.ts` | Unregistered files in the Tabs group. Expo Router adds them as extra tabs automatically. `styles.ts` has no default export and will warn. |
| `app/components/navigation/TabBarIcons.tsx` | Component inside `app/`, so it gets treated as a route. The real one is `components/navigation/TabBarIcons.tsx`. |
| `app/(stack)/language-level.tsx` + `app/(stack)/language-level/index.tsx` | Near-identical copies. Both lint the same warnings. |
| `app/(stack)/edit-activity.tsx`, `app/(stack)/edit-goal.tsx` | Placeholder stubs next to the real `edit-activity/[id].tsx` and `goals/[id]/edit.tsx`. |

### Dead code

- **Whole directories:** `src/` (an older JS version of the app, 30+ files), `components/ui/` (78 gluestack files), `config/`, `patches/react-native-css-interop+0.0.36.patch`.
- **Root files:** `App.js`, `index.js` (unused because `package.json` `main` is `expo-router/entry`), `app.json`, `tamagui.config`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`, `gluestack-ui.config.json`, `scripts/reset-project.js`. `metro.config.js` adds Node polyfills (`stream-http`, `https-browserify`) that nothing in the real app needs.
- **Supabase client duplicates:** `utils/supabase.js`, `utils/supabaseConfig.js`, `src/utils/supabaseConfig.js`. Only `lib/supabase.ts` is real.
- **Stray edge function copy:** `supabase/functions/check-update-goals.js`, a copy of the real function.
- **Unused hooks:** `hooks/useAllUsers.ts`, `hooks/useUserStreak.ts`, `hooks/useColorScheme.ts`, `hooks/useColorScheme.web.ts`, `hooks/useThemeColor.ts`.
- **Unused components:** `components/Avatar.tsx`, `Collapsible.tsx`, `DividerLine.tsx`, `ExternalLink.tsx`, `HelloWave.tsx`, `ParallaxScrollView.tsx`, `SplashScreen.tsx`, `ThemedText.tsx`/`ThemedView.tsx` (only used by other leftovers), `useColorScheme.ts`, `common/VersionDisplay.tsx`, `dashboard/InsightCard.tsx`, `dashboard/ProgressCard.tsx`, `dashboard/StreakCard.tsx`, `navigation/TabBarIcon.tsx`, `settings/SettingsItem.tsx`.
- **Unused packages:** `@react-navigation/stack`, `react-native-shared-element`, `react-navigation-shared-element`, `expo-background-task`/`expo-task-manager` (no task defined), `dotenv` is fine (used by config).

### Duplicated logic

- **Activity name to id lookup** by capitalizing a string: `track.tsx:149-157` and `edit-activity/[id].tsx:195-200`.
- **Track form** (date, language, activity type, duration, notes) is copy-pasted between `app/(tabs)/track.tsx` and `app/(stack)/edit-activity/[id].tsx`.
- **Native-language name lookup** from `master_languages`: `app/(tabs)/profile.tsx:51`, `app/(stack)/profile/[id].tsx:91`, `AddConnectionModal.tsx:55`, `useActiveConnections.ts:137`.
- **Streak calculation:** `hooks/useActiveConnections.ts:35-90`, `hooks/useUserStreak.ts` (unused), `hooks/useWeeklyStreak.ts`.
- **`validateUsername`** and the profile form: `onboarding.tsx:52` and `edit-profile.tsx:54`.
- **Language fetch plus flag mapping:** repeated in `create-goal.tsx:68`, `goals/[id]/edit.tsx:35`, `language-settings/index.tsx:43`, both `language-level` files, and `useUserLanguages.ts`.

### Large files

Real app files over 450 lines:
- `app/(stack)/edit-activity/[id].tsx` (627)
- `app/(tabs)/track.tsx` (579)
- `app/(tabs)/index.tsx` (564)
- `app/(stack)/profile/[id].tsx` (513)
- `app/(stack)/notifications.tsx` (499)
- `components/forms/LanguageDropdown.tsx` (481)

Much of each is `StyleSheet` code, so they are not outrageous. The first two are large mainly because they duplicate each other. The biggest files in the repo overall are the leftovers `components/ui/icon/index.tsx` and `index.web.tsx` (1,635 lines each).

---

## 7. Security

| Issue | Severity | Evidence |
|---|---|---|
| `.env` committed and pushed | High (hygiene) | Tracked since `0e4bf84` (2025-06-28), pushed to `github.com/terrence-gonsalves/LinguaLoop`. Contains `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `EAS_PROJECT_ID`. `.gitignore` only ignores `.env*.local`, not `.env`. |
| Hardcoded Supabase URL and anon key | Medium | `src/utils/supabaseConfig.js:6-7`. On origin since `17610c5` (2025-05-29). |
| Is the key a service role key? | No | I decoded the JWT payload of both keys: `"role":"anon"`. The anon key ships inside every app build anyway, so its exposure alone is not a breach. **The real risk is that it gives anyone direct API access to your tables, so RLS is the only thing protecting user data.** |
| Service role key in client | No | Only used via `Deno.env` in `supabase/functions/check-and-update-goals/index.ts:6` and its stray copy `supabase/functions/check-update-goals.js`. |
| Edge function authorization | Low | `check-and-update-goals` accepts any POST that passes Supabase's default JWT check, so the public anon key is enough to trigger it. It only expires goals, so the impact is low. |
| Missing or unknown RLS | **High until verified** | See section 5. Id-only deletes and updates, and cross-user reads of `profiles.email`. |
| Email exposure | Medium (not verified) | `profiles.email` readable by other users if the profile reads in section 5 work as coded. |
| Other hardcoded values | Low | EAS projectId hardcoded in `lib/notifications.ts:30` (not a secret, but should come from config). Tab colors hardcoded in `app/(tabs)/_layout.tsx:11-18`. |
| Debug keystore / signing | Medium for release | `android/app/debug.keystore` is committed, and `android/app/build.gradle:108-113` signs **release** builds with the debug config. EAS remote credentials normally override this (not verified). |
| Repo visibility | Unknown | I didn't check whether the GitHub repo is public. If it is, treat the anon key as public (it already effectively is) and prioritize RLS. |

Recommendation: rotating the anon key is optional, since it is public by design. The real fix is to verify RLS, untrack `.env`, add `.env` to `.gitignore`, and delete `src/`.

---

## 8. Play Store readiness

| Item | Status | Evidence |
|---|---|---|
| Package name | `com.bloopa.LinguaLoop` | `app.config.js` `android.package`, `android/app/build.gradle:90-92`. Stale Kotlin copies under `com/terrence/...` also exist. |
| Version | 0.6.10 in config, but **0.6.5** in `android/app/build.gradle:96` | Mismatch caused by the committed `android/` folder not being synced. |
| versionCode | `1` in config and gradle | `eas.json` has `appVersionSource: "remote"` and `autoIncrement: true`, so EAS manages it remotely. Fine. |
| Icon | 1024x1024 PNG | `assets/images/icon.png`. Adaptive icon is 1024x1024 `assets/images/adaptive-icon.png`, also used as `monochromeImage`. A full-color image makes a poor monochrome (themed) icon. |
| Splash | Configured | Uses the app icon with `resizeMode: "cover"` on `#F0F3F4` (`app.config.js` `splash` and plugin). `cover` on a square icon may crop (not verified visually). |
| Permissions (config) | NOTIFICATIONS, VIBRATE, RECEIVE_BOOT_COMPLETED | `app.config.js` `android.permissions` |
| Permissions (actual native manifest) | Adds RECORD_AUDIO, SYSTEM_ALERT_WINDOW, READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE | `android/app/src/main/AndroidManifest.xml:2-9`. None of these are needed. RECORD_AUDIO and SYSTEM_ALERT_WINDOW will draw Play review questions and need Data safety declarations. |
| `userInterfaceStyle` | `automatic` | The app is light-only, so dark-mode devices may get a dark status or navigation bar with light content. Set it to `light`. |
| eas.json | Exists and is mostly configured | `development` (debug APK), `preview` (APK, channel `preview`), `production` (app-bundle, channel `production`, autoIncrement). `submit.production` is empty: no service account key and no track set. |
| In-app account deletion | **No** | No code anywhere. Google Play requires in-app deletion **and** a web link for deletion requests for any app that creates accounts. |
| Privacy policy link in app | **No (effectively)** | `app/(stack)/privacy.tsx` exists but is Lorem ipsum. The Settings entry is commented out (`settings.tsx:79-83`). It is reachable only from `create-account.tsx:139` and `about.tsx:86`. Play also needs a **hosted URL**. |
| Other blockers | | Data safety form (you collect email, name, study data, photos, push tokens). Dead Google/Apple login buttons (`login.tsx:120-127`) look broken to reviewers. Lorem ipsum Terms and Help. The route-conflict crash in dev builds. The Android target SDK must meet Play's current minimum, which may need a newer Expo SDK (not verified for SDK 53). |

---

## 9. CLAUDE.md accuracy

**Wrong or outdated:**
- **"Working tree caveat"** says the leftovers are untracked and git-tracked files are the source of truth. As of `cd48b5d` they **are** tracked, so that rule no longer separates real from junk. Use `5c34796`'s file list as the source of truth until the cleanup lands.
- **"Every screen must be registered in `app/(stack)/_layout.tsx` to get a title or custom presentation."** Not true. `create-goal`, `goals/[id]/edit`, `edit-activity/[id]`, `language-level`, `languages` and `profile/[id]` are not registered and set their own titles with an inline `<Stack.Screen options>`.
- **"Session metadata is saved in expo-secure-store. The Supabase client is created without a custom storage adapter."** Accurate, but it omits the consequence: the session is in-memory only, and the SecureStore data is never used to restore it.
- **"See `.env-example`"**: that file is missing `EAS_PROJECT_ID`, which `app.config.js` requires.
- **"`npx tsc --noEmit` type-checks (strict mode)"**: true, but it currently reports 271 errors, including the Deno edge function, because `tsconfig.json` includes everything.

**Missing:**
- The committed native `android/` folder and what that means (config native fields are ignored by EAS; prebuild is needed after config changes).
- `.env` is committed.
- `expo-file-system` is used (`lib/supabase/storage.ts`) but is not a declared dependency.
- The tab bar uses hardcoded colors (`#E86C00` active tint in `app/(tabs)/_layout.tsx:13`), not the rust brand color `#D97D54`.
- Avatar URLs stored in `profiles.avatar_url` are 24h signed URLs.
- Skill category names are hardcoded in several screens and must match the `activities` table exactly.

**Correct:** the stack and versions, commands, the provider order in the root layout, the `(auth)`/`(tabs)`/`(stack)` structure and guards, the `useAuth()` API, the hooks-plus-Realtime pattern with `isMounted` guards, the table list, toasts, the path alias, and the comment style.

---

## 10. Recommended next steps

Ordered so the smallest shippable v1 comes first. The AI feature and paid subscriptions are deliberately left out.

| # | Step | Size | Priority |
|---|---|---|---|
| 1 | **Undo the junk from `cd48b5d`.** Delete the leftovers (`src/`, `components/ui/`, `config/`, `patches/`, `App.js`, `index.js`, `app.json`, tamagui/gluestack/tailwind/nativewind files, `metro.config.js`, `utils/`, duplicate routes in section 6, `app/components/`, stub `edit-activity.tsx`/`edit-goal.tsx`, one of the two `language-level` screens, stray `check-update-goals.js`). Keep the connection/unfollow changes, `CLAUDE.md`, and the `scripts/*.sql`/docs you want. Then confirm `tsc` and lint are near zero and the dev build boots. | S | Must-have for v1 |
| 2 | **Secrets hygiene.** `git rm --cached .env`, add `.env` to `.gitignore`, and add `EAS_PROJECT_ID` to `.env-example`. Optionally rotate the anon key. | S | Must-have for v1 |
| 3 | **Fix session persistence.** Give `createClient` a storage adapter (AsyncStorage, or SecureStore with chunking), remove the half-built SecureStore logic in `auth-context.tsx`, and verify on a device that a killed app stays logged in. | S | Must-have for v1 |
| 4 | **Capture and lock down the database.** Dump the current schema and policies into `supabase/migrations/` (Supabase CLI `db pull`). Review RLS on every table: own-row writes only, and decide exactly what connections may read. Stop exposing `profiles.email` to other users (a view or column grants). Fix the `languages` read contradiction (`add.tsx:44` vs `AddConnectionModal.tsx:60`). Add `user_id` filters to the id-only deletes and updates as defense in depth. Move profile creation to a DB trigger. | M | Must-have for v1 |
| 5 | **Password reset.** `resetPasswordForEmail` with a `lingualoop://` redirect, a reset screen that calls `updateUser`, and deep link handling. | M | Must-have for v1 |
| 6 | **Account deletion.** A settings entry, a confirm step, and an edge function using the service role to delete the auth user, their data and their avatar. Plus a simple web page or form for deletion requests, as Play requires. | M | Must-have for v1 |
| 7 | **Real legal and help content.** Write a privacy policy and terms, host them (GitHub Pages is fine), link them from Settings and sign-up, and replace the Lorem ipsum in `help.tsx`. | S | Must-have for v1 |
| 8 | **Store avatar paths, not signed URLs.** Save the storage path in `profiles.avatar_url` and sign on read (or make the bucket public-read). | S | Must-have for v1 |
| 9 | **Remove fake UI.** Remove the Google/Apple buttons, the "Coming soon" toggle and the hardcoded `KeyInsightsCard` (or hide it until it's real). Set `userInterfaceStyle: "light"`. | S | Must-have for v1 |
| 10 | **Fix the Android native setup.** Pick CNG: delete `android/`, let EAS prebuild, and trim permissions to what's needed. Confirm release signing uses EAS-managed credentials. Replace the monochrome icon with a single-color asset. | M | Must-have for v1 |
| 11 | **Patch-align SDK 53.** Run `npx expo install --check`, fix the expo-doctor findings, add `expo-file-system` as an explicit dependency, and remove unused navigation/shared-element packages. Then do a `preview` EAS build and a manual smoke test of every row in section 4. | S | Must-have for v1 |
| 12 | **Play Console setup.** Listing, screenshots, Data safety form, content rating, and an internal testing track. Fill `eas.json` `submit.production`. Check the target SDK requirement against SDK 53. | M | Must-have for v1 |
| 13 | **Start/stop timer** on the Track screen, persisting across backgrounding. You listed it, so decide whether v1 needs it. Manual entry already covers the core use. | M | Can wait (your call) |
| 14 | **Upgrade Expo SDK 53 to 57**, one SDK at a time, after the cleanup. Includes Reanimated 4, the expo-file-system API change and a chart library check. | L | Can wait (do soon after v1, or before step 12 if the Play target SDK requires it) |
| 15 | **Add a test runner** (jest-expo) with a few tests on hooks and date math, plus CI running `tsc` and lint. | M | Can wait |
| 16 | **Consolidate duplicated logic.** A shared activity form for track and edit, one streak helper, one language-fetch hook, and a shared `validateUsername`. Fix the swallowed `catch (err)` blocks and the missing hook dependencies. | M | Can wait |
| 17 | **Make connections scale.** Server-side search and pagination in `AddConnectionModal`, instead of fetching every profile and language. | M | Can wait |
| 18 | **Update CLAUDE.md** with the corrections in section 9 once the cleanup is done. | S | Can wait |
