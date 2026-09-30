# Manual test checklist: batch 2 (app code)

Batch 2 was written without a device build, so none of it has run yet. Every change passed `npx tsc --noEmit` and `npm run lint` (0 errors). Run this list on the first build.

Use a **development or preview EAS build** on a real Android phone. Notifications and background behavior don't work in Expo Go.

## 0. Before you build

- [ ] Push the three batch 2 migrations. Set `SUPABASE_DB_PASSWORD` first, then run `supabase db push`. They apply in this order:
  1. `20260930011951_handle_new_user.sql`: the trigger that creates a profile at sign-up
  2. `20260930012153_fix_avatar_urls.sql`: rewrites 2 stored signed avatar URLs to public URLs
  3. `20260930013148_goal_notifications_default_on.sql`: goal reminders on by default, and on for the 3 existing settings rows
- [ ] In the SQL editor, check that no signed URLs are left. This should return 0:
  `select count(*) from profiles where avatar_url like '%/object/sign/%';`
- [ ] Check that the trigger exists. This should return 1 row:
  `select tgname from pg_trigger where tgname = 'on_auth_user_created';`
- [ ] Build from the `batch2-app` branch. `android/` is gitignored, so EAS runs prebuild and picks up `userInterfaceStyle: "light"` from `app.config.js`.

## 1. Connections are hidden

- [ ] Profile tab: there's no "Active Connections" section and no "Add Connection" button.
- [ ] Settings > Notifications: with the main toggle on, there's no "User Notifications / Messages and follows" row.
- [ ] Deep link `lingualoop://connections` goes back to the Profile tab. Run it with `adb shell am start -a android.intent.action.VIEW -d "lingualoop://connections"`.
- [ ] Deep link `lingualoop://profile/<any-uuid>` also goes back to the Profile tab.
- [ ] In the Supabase dashboard, open Logs > API while using the Profile tab. There are no requests to `follows`, and no `profiles` requests for other users.

## 2. Session persistence

- [ ] Sign in, then kill the app from the recents screen and reopen it. You land on the dashboard without signing in again.
- [ ] Reboot the phone and reopen the app. You're still signed in.
- [ ] Leave the app in the background for more than 1 hour (longer than the access token lifetime), then reopen it. Pull data, for example open Reports. It loads with no auth errors and no sign-out.
- [ ] Sign out, kill the app and reopen it. You land on the login screen.
- [ ] Sign in with a wrong password. You get the error toast and stay on login.
- [ ] Right after a normal sign-in, you land on the dashboard once, with no double navigation or flicker.

## 3. Profile created at sign-up

- [ ] Create a new account with a fresh email. The toast says "Account created! Let's set up your profile." and doesn't mention checking your email.
- [ ] You land on onboarding once. Pressing back doesn't show a second onboarding screen.
- [ ] Finish onboarding. The profile saves and you reach the dashboard.
- [ ] In the dashboard's `profiles` table, the new row has the right `id` and `email`, and `onboarding_completed` is true after onboarding.
- [ ] Kill and reopen the app. You're still signed in and don't see onboarding again.

## 4. Avatars

- [ ] Existing users with a photo, after the migration: the avatar shows on the dashboard, the Profile tab and Settings.
- [ ] Settings > Edit profile: pick a new photo. The toast says "Profile Photo Updated" and the new photo shows everywhere, not the old cached one.
- [ ] The saved `profiles.avatar_url` looks like `.../storage/v1/object/public/avatars/<your-user-id>.jpg?v=<number>`.
- [ ] Wait more than 24 hours (or check the next day). The avatar still loads.
- [ ] Remove the photo. The toast says "Profile Photo Removed", the default avatar shows, and `avatar_url` is null.
- [ ] Remove the photo again when there isn't one, if the UI lets you. You get the error toast, not a silent success.

## 5. Deletes

For each delete, check that the row is gone and the list refreshes. To test the failure path, turn on airplane mode before confirming. You should get an error toast, and the item should not disappear or navigate away.

- [ ] Activities (time entries): delete an entry.
- [ ] Goals list: delete a goal.
- [ ] Goal edit screen: Delete Goal. On success it returns to the goals list. On failure it stays on the edit screen with a toast.
- [ ] Language settings: the dialog says "Remove <language>? All time entries and goals for <language> will be permanently deleted. This can't be undone."
- [ ] Delete a language that has time entries and goals. It succeeds, and its time entries and goals are gone from Activities, Goals, the dashboard and Reports.
- [ ] Delete a language with airplane mode on. You get the error toast and the language stays.

## 6. Goals

### Statuses

- [ ] Create a goal starting tomorrow. The list shows **Not started**.
- [ ] Create a goal covering today. The list shows **In progress**.
- [ ] Tap **Mark as completed** on it. The toast says "Goal completed", the badge shows **Completed** and the button disappears.
- [ ] A goal whose end date has passed shows **Missed**, and after 00:05 UTC the nightly job stores it as `missed`. It still has **Mark as completed**, and tapping it makes it **Completed**.
- [ ] The goal edit screen shows "Status: ..." with the same button for active and missed goals.

### Dates (the old UTC bug)

- [ ] After 6 pm local time, create a goal for today to next Sunday. The list shows exactly those dates.
- [ ] Open Edit. The date pickers show the same dates, not a day earlier.
- [ ] In the dashboard's `goals` table, `start_date` and `end_date` match what you picked.

### Time progress

- [ ] Create a **Daily Time** goal of 30 min for a language, covering today. Log 20 min for that language today. The list shows "20 of 30 min today" with a bar, and the dashboard ring shows 67%.
- [ ] Log time for a different language. The daily goal doesn't change.
- [ ] Create a **Weekly Time** goal of 120 min. The list shows the minutes logged since Monday, as "... min this week".
- [ ] Return from the Track tab to the dashboard. The goal ring updates without restarting the app.

### End-of-goal notification

Use Settings > Notifications to check that the "Goal ended reminders" switch is on. It should default to on.

- [ ] Fresh install, first goal: the Android notification permission prompt appears after you tap Save Goal, not at app start.
- [ ] Deny it. The goal still saves. Create another goal: no second prompt.
- [ ] Allow it (reinstall, or grant it in system settings). Create a goal with an end date of today.
- [ ] Move the phone's clock to tomorrow at 08:59 and wait a minute. At 09:00 you get "Goal ended: Your goal <title> ended. Did you hit it?".
- [ ] **App killed:** tap the notification. The app opens on that goal's edit screen, after the normal sign-in restore.
- [ ] **App in the background:** repeat with another goal. Tapping opens that goal's edit screen.
- [ ] **App open:** the notification still shows as a banner.
- [ ] **Edit reschedules:** create a goal ending today, edit its end date to tomorrow, then move the clock to tomorrow at 09:00. No notification. At 09:00 the day after, there is one.
- [ ] **Delete cancels:** create a goal ending today, delete it, then move the clock forward. No notification.
- [ ] **Complete cancels:** same, but Mark as completed instead of deleting. No notification.
- [ ] **Setting off:** turn "Goal ended reminders" off and tap Save. Goals ending today don't notify. Turn it back on and save, and they do again.
- [ ] **Reinstall:** create a goal ending today, uninstall and reinstall, sign in, and open the app once. Move the clock forward. The notification still arrives, because it's rebuilt on app start.
- [ ] **Sign out:** create a goal ending today, sign out, move the clock forward. No notification.
- [ ] Set the clock back to automatic when you're done.

## 7. Fake UI removed

- [ ] Login screen: there are no Google or Facebook buttons and no "Continue with" divider.
- [ ] Reports tab: there's no Key Insights card, and the other cards still render.
- [ ] Settings > Notifications: there's no "Coming soon" text, and the goal switch can be toggled.
- [ ] Put the phone in dark mode. The app stays light, and the status bar and navigation bar are readable.

## 8. Realtime and refresh

- [ ] Log time on the Track tab, then go to the dashboard. Total study time and goal progress update (time_entries is still live).
- [ ] Create, edit, complete or delete a goal, then go back to the dashboard. The Study Goal card updates.
- [ ] Create a goal from the goals list. The list shows it as soon as you're back on it.
- [ ] In the dashboard's Realtime inspector, there are no channels on `goals` or `activities`.

## 9. Batch 2 follow-ups

### Username check

Both screens now call the `is_username_available` RPC, because RLS hides other users' profiles from a direct query. You need a second account whose username you know.

- [ ] Settings > Edit profile: enter the other account's username and save. The field shows "This username is already taken" and nothing is saved.
- [ ] Save again with your own current username unchanged. It saves.
- [ ] Change to a new, unused username. It saves, and `profiles.user_name` shows the new value.
- [ ] Onboarding (new account): enter the other account's username and finish. The field shows "This username is already taken" and you stay on onboarding.
- [ ] Onboarding with an unused username, or with the username left blank. It saves and you reach the dashboard.
- [ ] Turn on airplane mode and save Edit profile with a changed username. You get the error toast, not "already taken".

### Activity and achievement dates

Apply `20260930193749_time_entries_activity_date_to_date.sql` first and use a build with these changes. An older build would save the UTC date. Do the logging steps after 8 pm local time, when the UTC date is already tomorrow.

- [ ] Before logging anything, check the converted rows in the dashboard's `time_entries` table: `activity_date` is a plain date (for example `2025-06-12` for the 2025-06-13 02:30 UTC row), and `get_current_streak` no longer exists under Database > Functions.
- [ ] Track: log an activity for today. In `time_entries`, `activity_date` is today's local date, not tomorrow.
- [ ] Activities: the new entry shows today's date.
- [ ] Edit activity: the date picker shows today. Change it to yesterday and save. The list and the table both show yesterday.
- [ ] Track: log an activity dated this Sunday (or last Sunday if today is Sunday and it's the current week). The dashboard week strip marks that Sunday as tracked. It used to drop Sunday.
- [ ] Dashboard week strip: every day you logged this week is marked, and no other days.
- [ ] Reports: the average session compares today's entries with yesterday's by the dates you picked.
- [ ] Reports weekly chart: log an entry dated two weeks ago. It adds to that week's bar, not the current week's.
- [ ] Goals: a daily or weekly time goal counts the entry you logged today, and doesn't count one dated before the goal's week.
- [ ] Profile > Add achievement: pick today and save. In `achievements`, `obtained_date` is today, and the Profile tab and Achievements screen both show today, not yesterday.
- [ ] The existing achievement dated 2025-06-11 shows June 11, 2025 on the Profile tab and Achievements screen. It used to show June 10 west of UTC.

## Regression pass

- [ ] Onboarding, Track (manual entry), Edit activity, Reports, Achievements, Feedback and About still work as before.
- [ ] Settings > Notifications > Test Notification still shows a notification.
