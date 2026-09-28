# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LinguaLoop is a goal-driven language-learning tracker built with Expo SDK 53 (React Native 0.79, React 19, New Architecture enabled), Expo Router 5 and Supabase. The app is portrait and light-theme only. Dark theme is stubbed but not implemented.

## Commands

- `npm install` installs dependencies. `.npmrc` is present.
- `npx expo start` (or `npm start`) runs the dev server. The project uses `expo-dev-client`, so native features such as notifications and background tasks need a dev build, not Expo Go.
- `npm run android` / `npm run ios` build and run natively (`expo run:*`). `npm run web` runs the web build.
- `npm run lint` runs ESLint through `expo lint` (flat config, `eslint-config-expo`).
- `npx tsc --noEmit` type-checks (strict mode).
- `eas build --profile development|preview|production` builds with EAS (`eas.json`). OTA updates use `expo-updates` channels `preview` and `production`.
- There is no test runner configured.

## Configuration

- `app.config.js` (not `app.json`) is the real Expo config. It loads `.env` through `dotenv` and exposes `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `EAS_PROJECT_ID` via `extra`. `lib/supabase.ts` reads them from `Constants.expoConfig.extra` and throws at import time if they are missing. See `.env-example`.
- App version is set in `app.config.js` (`version`). `runtimeVersion` is pinned to `exposdk:53.0.0`.
- Path alias: `@/*` maps to the repo root (for example `@/lib/supabase`, `@/hooks/useActivities`).

## Architecture

### Routing (`app/`, Expo Router, typed routes enabled)
- `app/_layout.tsx` is the root layout. It holds the splash screen, then renders `ThemeProvider` → `AuthProvider` → `KeyboardProvider` → a headerless `Stack` with three groups:
  - `(auth)` — login, create-account and forgot-password. Redirects to `/(tabs)` when a session exists.
  - `(tabs)` — the bottom tabs: index (dashboard), track, reports, profile and settings. This layout is the auth guard: it redirects to `/(auth)/login` when there is no session and to `/onboarding` when `profile.onboarding_completed` is false.
  - `(stack)` — all pushed or detail screens: goals, activities, connections, achievements, language settings, profile/[id], onboarding, static pages and so on. Every screen must be registered in `app/(stack)/_layout.tsx` to get a title or custom presentation.

### Auth and session (`lib/auth-context.tsx`)
- `useAuth()` exposes `session`, `profile`, `isLoading`, `signIn`, `signUp`, `signOut` and `reloadProfile`. `providers/auth-provider.tsx` is a thin wrapper around it.
- Session metadata is saved in `expo-secure-store`. The Supabase client is created without a custom storage adapter.
- `loadProfile` also handles navigation after sign-in: incomplete onboarding goes to `/(stack)/onboarding`, complete onboarding goes to `/(tabs)`. Use `reloadProfile()` (which skips navigation) after editing profile data.
- `signUp` inserts the `profiles` row from the client.

### Data layer
- No state library or query cache is used. Each screen uses custom hooks in `hooks/` (`useUserLanguages`, `useActivities`, `useStudyStats`, `useReportSummary` and others). They call `supabase` directly and return `{ data, isLoading, error }`-style state.
- Many hooks subscribe to Supabase Realtime (`supabase.channel(...).on('postgres_changes', ...)`) and refetch on change. They use an `isMounted` guard and unsubscribe on cleanup. Follow this pattern when adding hooks.
- Main tables: `time_entries` (logged study time), `languages` (user languages, linked to `master_languages`), `goals`, `activities`, `profiles`, `follows` (connections), `achievements`, `notification_settings`, `quotes` and `feedback`. Avatars live in the `avatars` storage bucket and are served through signed URLs from `lib/supabase/storage.ts`.
- The database schema and migrations are not in the repo. `scripts/*.sql` holds one-off SQL to run in the Supabase SQL editor.

### Backend
- `supabase/functions/check-and-update-goals/index.ts` is a Deno Edge Function. It uses the service-role key to call the Postgres RPC `update_expired_goals`.

### Notifications
- `lib/notifications.ts` handles Expo push tokens, permissions and scheduled study reminders, backed by the `notification_settings` table. See `NOTIFICATION_SETUP.md`, `PUSH_TOKEN_EXPLANATION.md` and `FIREBASE_SETUP_GUIDE.md`.

### UI conventions
- Styling uses `StyleSheet.create` with colors from `constants/Colors.ts` (`Colors.light.*`) or `useTheme()`/`Colors` from `providers/theme-provider.tsx`. Font sizes come from `constants/Fonts.ts`. The brand palette is: rust accent `#D97D54`, primary `#324755`, background `#F0F3F4`.
- User feedback uses `showSuccessToast` / `showErrorToast` from `lib/toast.ts`. These are ToastAndroid on Android and an Alert on iOS.
- Components are grouped by feature under `components/` (`dashboard/`, `reports/`, `profile/`, `forms/`, `settings/` and others). Charts use `react-native-chart-kit`.
- Comments are lowercase-first sentences, for example `// load the user's languages`.

### Working tree caveat
The working tree has many untracked files that are not part of the app. They look like leftovers from other templates: `App.js`, `app/_layout.js`, `app/(auth)/*.js`, `app/(tabs)/tracking.tsx`, `app-example/`, `src/`, `tamagui.config`, gluestack and NativeWind config, `components/ui/` and others. Some of them create duplicate Expo Router routes. Treat git-tracked files as the source of truth and don't build on the untracked ones unless asked.
