# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LinguaLoop is a goal-driven language-learning tracker built with Expo SDK 53 (React Native 0.79, React 19, New Architecture enabled), Expo Router 5 and Supabase. The app is portrait and light-theme only. Dark theme is stubbed but not implemented.

## Commands

- `npm install` installs dependencies. `.npmrc` is present.
- `npx expo start` (or `npm start`) runs the dev server. The project uses `expo-dev-client`, so native features such as notifications and background tasks need a dev build, not Expo Go.
- `npm run android` / `npm run ios` build and run natively (`expo run:*`). `npm run web` runs the web build.
- `npm run lint` runs ESLint through `expo lint` (flat config, `eslint-config-expo`). It caches results between runs, so use `npx expo lint --no-cache` if the output looks empty or stale.
- `npx tsc --noEmit` type-checks (strict mode).
- `eas build --profile development|preview|production` builds with EAS (`eas.json`). OTA updates use `expo-updates` channels `preview` and `production`.
- There is no test runner configured.

## Configuration

- `app.config.js` (not `app.json`) is the real Expo config. It loads `.env` through `dotenv` and exposes `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `EAS_PROJECT_ID` via `extra`. `lib/supabase.ts` reads them from `Constants.expoConfig.extra` and throws at import time if they are missing. See `.env-example`.
- App version is set in `app.config.js` (`version`). `runtimeVersion` is pinned to `exposdk:53.0.0`.
- Path alias: `@/*` maps to the repo root (for example `@/lib/supabase`, `@/hooks/useActivities`).
- `types/expo-router.d.ts` declares its own `expo-router` module with only `router` and `useLocalSearchParams`, so other exports such as `Redirect` don't type-check. Redirect with `router.replace` in an effect (see `components/common/FeatureOffRedirect.tsx`).
- Feature flags live in `config/features.ts`. `FEATURES.connections` is `false` for v1: the connections code stays in the repo, but the Profile tab hides its sections, `connections` and `profile/[id]` redirect to the Profile tab before their hooks run, `AddConnectionModal` renders nothing, and `useActiveConnections` runs no queries or Realtime channel. RLS only lets users read their own profiles, languages and follows, so connections can't work until cross-user reads are designed.

## Database and migrations

- Schema changes are migrations in `supabase/migrations/`. Create one with `supabase migration new <name>`, then write the SQL.
- **Claude never applies DB changes.** The owner runs `supabase db push` with `SUPABASE_DB_PASSWORD` set. Read-only queries through the Supabase MCP are fine for checking data.
- Migrations follow the style of the existing ones: a header comment with what, why and the data at the time of writing, a `begin; ... commit;` body that is safe to run twice, and a commented rollback.
- `DB_AUDIT.md` describes the database. Batch 1 migrations made profiles, languages and follows owner-only, cascade language deletes to their time entries and goals, and schedule the nightly goal expiry. `scripts/*.sql` are old one-off scripts from before migrations.

## Architecture

### Routing (`app/`, Expo Router, typed routes enabled)
- `app/_layout.tsx` is the root layout. It holds the splash screen, then renders `ThemeProvider` → `AuthProvider` → `KeyboardProvider` → a headerless `Stack` with three groups:
  - `(auth)`: login, create-account and forgot-password. Redirects to `/(tabs)` when a session exists.
  - `(tabs)`: the bottom tabs: index (dashboard), track, reports, profile and settings. This layout is the auth guard: it redirects to `/(auth)/login` when there is no session and to `/onboarding` when `profile.onboarding_completed` is false. It also syncs goal reminders on app start and opens a goal when its reminder is tapped.
  - `(stack)`: all pushed or detail screens: goals, activities, connections, achievements, language settings, profile/[id], onboarding, static pages and so on. Every screen must be registered in `app/(stack)/_layout.tsx` to get a title or custom presentation.

### Auth and session (`lib/auth-context.tsx`)
- `useAuth()` exposes `session`, `profile`, `isLoading`, `signIn`, `signUp`, `signOut` and `reloadProfile`. `providers/auth-provider.tsx` is a thin wrapper around it.
- The session is persisted by supabase-js itself: `lib/supabase.ts` passes AsyncStorage as the auth storage (`persistSession`, `autoRefreshToken`, `detectSessionInUrl: false`) and an AppState listener starts and stops token auto-refresh. `AuthProvider` restores it with `getSession()` on mount.
- Don't await supabase calls inside the `onAuthStateChange` callback (they can deadlock). Defer them with `setTimeout`, as `SIGNED_IN` does for `loadProfile`.
- `loadProfile` also handles navigation after sign-in: incomplete onboarding goes to `/(stack)/onboarding`, complete onboarding goes to `/(tabs)`. Use `reloadProfile()` (which skips navigation) after editing profile data.
- The `profiles` row is created by the `on_auth_user_created` trigger on `auth.users` (`handle_new_user()`). `signUp` doesn't insert it. The `SIGNED_IN` listener loads it and routes to onboarding.
- `signOut` clears this device's goal reminders before signing out.

### Data layer
- No state library or query cache is used. Each screen uses custom hooks in `hooks/` (`useUserLanguages`, `useActivities`, `useStudyStats`, `useReportSummary` and others). They call `supabase` directly and return `{ data, isLoading, error }`-style state.
- Many hooks subscribe to Supabase Realtime (`supabase.channel(...).on('postgres_changes', ...)`) and refetch on change. They use an `isMounted` guard and unsubscribe on cleanup. Follow this pattern when adding hooks.
- The `supabase_realtime` publication only includes `achievements`, `follows`, `languages` and `time_entries`. Subscriptions to any other table never fire. For goals, screens refetch on focus instead (`useFocusEffect`, and `useStudyStats().refresh`).
- Every delete calls `.select()` and checks that a row came back, then shows `showErrorToast` if not. A delete blocked by RLS returns no error, so checking `error` alone isn't enough.
- Main tables: `time_entries` (logged study time), `languages` (user languages, linked to `master_languages`), `goals`, `activities`, `profiles`, `follows` (connections), `achievements`, `notification_settings`, `quotes` and `feedback`. Avatars live in the public `avatars` storage bucket as `<user_id>.jpg`. `lib/supabase/storage.ts` uploads them and saves the public URL plus a `?v=<timestamp>` cache-buster in `profiles.avatar_url`. Don't use signed URLs.
- Goal dates (`start_date`, `end_date`) are `date` columns. Write them with `toDateString()` and read them with `parseDateOnly()` from `lib/goals.ts`, never `toISOString()` or `new Date('YYYY-MM-DD')`, which shift the day west of UTC.

### Goals
- `goals.status` stores only `active`, `completed` or `missed`. The nightly `update_expired_goals` cron job (00:05 UTC) sets active goals past `end_date` to `missed`. Users can mark active or missed goals as completed.
- The app derives the labels it shows with `getGoalDisplayStatus()` in `lib/goals.ts`:
  - completed: Completed
  - missed: Missed
  - active, `start_date` after today: Not started
  - active, today within the dates: In progress
  - active, `end_date` before today: Missed (before the job has run)
- `daily_time` and `weekly_time` goals (target in minutes) show minutes logged from `time_entries` for the goal's language: today, or the current Monday to Sunday week (`fetchTimeGoalProgress()`).
- `lib/goal-notifications.ts` schedules a local reminder at 09:00 on the day after `end_date` ("Your goal <title> ended. Did you hit it?"). It's scheduled on create, rescheduled on edit, cancelled on delete, on complete and on sign out, and rebuilt on app start. The goalId -> notificationId map lives in AsyncStorage. Reminders need `notification_settings.goal_notifications` to be on (a missing row counts as on) and permission already granted. Permission is only requested after creating a goal.

### Backend
- `supabase/functions/check-and-update-goals/index.ts` is a Deno Edge Function. It uses the service-role key to call the Postgres RPC `update_expired_goals`.

### Notifications
- `lib/notifications.ts` handles Expo push tokens, permissions and the foreground notification handler, backed by the `notification_settings` table. Goal reminders are in `lib/goal-notifications.ts` (see Goals). The goal reminder switch in Settings > Notifications sits outside the main push toggle, because the reminders are local. See `NOTIFICATION_SETUP.md`, `PUSH_TOKEN_EXPLANATION.md` and `FIREBASE_SETUP_GUIDE.md`.

### UI conventions
- Styling uses `StyleSheet.create` with colors from `constants/Colors.ts` (`Colors.light.*`) or `useTheme()`/`Colors` from `providers/theme-provider.tsx`. Font sizes come from `constants/Fonts.ts`. The brand palette is: rust accent `#D97D54`, primary `#324755`, background `#F0F3F4`.
- User feedback uses `showSuccessToast` / `showErrorToast` from `lib/toast.ts`. These are ToastAndroid on Android and an Alert on iOS.
- Components are grouped by feature under `components/` (`dashboard/`, `reports/`, `profile/`, `forms/`, `settings/` and others). Charts use `react-native-chart-kit`.
- Comments are lowercase-first sentences, for example `// load the user's languages`.

### Testing
- There are no automated tests. `TESTING.md` is the manual checklist for changes that need a device build (session persistence, notifications, deletes).
- Docs and code comments don't use em-dashes.
