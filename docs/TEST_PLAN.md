# LinguaLoop manual regression test plan

Priorities:

- **P1**: core. Must pass for release.
- **P2**: important. Fix before release if possible.
- **P3**: minor. Can ship with a known issue.

## Source of this plan

The app's source code is not in this repository (this repo is the promo website). This plan is built from what the site documents about the app: the feature list, the how-it-works steps, the FAQ, and the privacy, terms and delete-account pages. Where a test depends on an exact label, limit or rule that the site does not state, the expected result says "per spec" or "confirm". Tighten those lines against the app repo or the build the first time you run the plan.

## Setup

**Test accounts** (use real inboxes you control):

- **Account A**: fully set up, with data. Three languages at different levels, 30 or more entries across all four skills over several weeks, one active daily goal, one active weekly goal, one finished goal, and three achievements. Profile photo set.
- **Account B**: a different email address. Used for data isolation tests. Give it two languages and a handful of entries so you can tell its data from A's.
- **Fresh account**: create a new one inside the tests for onboarding and empty states. Delete it or reuse it for the delete-account test.

**Build to test on:**

- A release-mode Android build (the production APK or AAB from the Play internal test track), not a dev or Expo Go build. Notifications, photo access and update behaviour differ in dev builds.
- At least one physical Android device on the lowest supported Android version, and one on the latest. Include one small-screen device or a large font setting.
- Network control: you need to switch airplane mode on and off.
- Keep a second device or an email inbox ready to receive the account emails.

**Before each full run:** note the build number, device model and Android version at the top of your results.

---

## 1. Auth and onboarding

- [ ] **AUTH-01 (P1)** Sign up with a new email and a valid password. Expected: account is created and you land in first-time setup (or the email confirmation step, if the build requires it).
- [ ] **AUTH-02 (P1)** Sign in with Account A. Expected: you land on the dashboard with A's data.
- [ ] **AUTH-03 (P1)** Sign out, then sign in again. Expected: you return to the sign-in screen after sign out, and the data is intact after sign in.
- [ ] **AUTH-04 (P1)** Complete first-time setup on the fresh account (profile, native language, first language and level). Expected: setup finishes, you reach the dashboard, and the app does not show setup again on the next launch.
- [ ] **AUTH-05 (P1)** Kill the app mid-setup and reopen. Expected: you resume setup or restart it cleanly, with no crash and no duplicate profile.
- [ ] **AUTH-06 (P1)** Kill and reopen the app while signed in. Expected: you stay signed in and land on the dashboard.
- [ ] **AUTH-07 (P1)** Sign in with a wrong password. Expected: a clear error, no crash, and you stay on the sign-in screen.
- [ ] **AUTH-08 (P2)** Sign in with an email that has no account. Expected: a clear error that does not crash the app.
- [ ] **AUTH-09 (P2)** Sign up with an email that already has an account. Expected: a clear error or message, and no second account.
- [ ] **AUTH-10 (P2)** Sign up with an invalid email format, an empty email, an empty password and a too-short password. Expected: inline validation for each, and no request is sent.
- [ ] **AUTH-11 (P2)** Reset the password if the build has a reset flow. Expected: the email arrives, the link works, and the new password signs in.
- [ ] **AUTH-12 (P2)** Sign up or sign in with no network. Expected: a clear offline message, no infinite spinner.
- [ ] **AUTH-13 (P2)** Rotate the device and background the app during sign in. Expected: form text is kept and the flow continues.
- [ ] **AUTH-14 (P3)** Paste a password, then toggle show and hide on the password field if present. Expected: the text shows and hides correctly.
- [ ] **AUTH-15 (P3)** Enter a very long email (200 characters) and a very long password. Expected: validation or a clean error, no layout break.
- [ ] **AUTH-16 (P2)** Use the sign-in screen's links to the terms and privacy policy if present. Expected: they open the correct pages.

## 2. Dashboard

- [ ] **DASH-01 (P1)** Open the dashboard on Account A. Expected: total study time, the week at a glance and progress on the current goal all show, and they match the data.
- [ ] **DASH-02 (P1)** Add an entry, return to the dashboard. Expected: total and week values update without a manual refresh.
- [ ] **DASH-03 (P1)** Edit and delete an entry, return to the dashboard. Expected: totals update to match.
- [ ] **DASH-04 (P1)** Open the dashboard on the fresh account with no data. Expected: a helpful empty state with a clear next step (add a language or log time), no zeros that look broken, no crash.
- [ ] **DASH-05 (P2)** Account with languages but no entries. Expected: totals show zero cleanly and the week view is empty but intact.
- [ ] **DASH-06 (P2)** Account with entries but no goal. Expected: goal area shows an empty state or prompt, not an error.
- [ ] **DASH-07 (P2)** Complete a goal's target by logging time. Expected: goal progress reaches its target and the display reflects it.
- [ ] **DASH-08 (P2)** Check week boundaries: add entries on the first and last day of the week. Expected: each lands in the right week, and the week start day is consistent with Reports.
- [ ] **DASH-09 (P2)** Open the dashboard with no network after it has loaded once. Expected: no crash, and either cached data or a clear offline message.
- [ ] **DASH-10 (P3)** Set a large system font size and a small screen. Expected: no clipped or overlapping text.
- [ ] **DASH-11 (P3)** Pull to refresh if supported. Expected: data reloads and the indicator ends.

## 3. Time tracking (add, edit, delete)

- [ ] **TIME-01 (P1)** Add an entry for each skill (reading, writing, listening, speaking) with a date, a length and a note. Expected: each saves and appears in history with the right skill, date, length and note.
- [ ] **TIME-02 (P1)** Edit an entry: change the skill, date, length and note. Expected: all changes persist after leaving the screen and after kill and reopen.
- [ ] **TIME-03 (P1)** Delete an entry. Expected: a confirmation is shown, then the entry disappears, and dashboard and reports update.
- [ ] **TIME-04 (P1)** Cancel at the delete confirmation. Expected: the entry stays.
- [ ] **TIME-05 (P1)** Add an entry for a specific language when the account has several. Expected: it is attached to the chosen language only.
- [ ] **TIME-06 (P1)** Validation: save with no skill, no language, a zero length, a negative length, a non-numeric length and an empty length. Expected: each is blocked with a clear message, and nothing is saved.
- [ ] **TIME-07 (P2)** Add an entry with no note. Expected: allowed, since the note is optional.
- [ ] **TIME-08 (P2)** Add an entry with a very long note (2,000 or more characters, including emoji and line breaks). Expected: it is limited or saved cleanly, and it displays without breaking the list or detail layout.
- [ ] **TIME-09 (P2)** Add an entry with an extreme length (such as 24 hours, 99 hours, 100000 minutes). Expected: per spec, either accepted and displayed well or rejected with a message.
- [ ] **TIME-10 (P1)** Add an entry at 11:55 PM, and another at 12:05 AM, in the device's local time. Expected: each is on the correct local date, in the right week, and counts toward the right daily goal.
- [ ] **TIME-11 (P2)** Add an entry dated yesterday or earlier. Expected: allowed, and it lands in the right day and week.
- [ ] **TIME-12 (P2)** Try a future date. Expected: per spec, either allowed or blocked with a message. Record which.
- [ ] **TIME-13 (P2)** Change the device time zone, then view past entries. Expected: past entries do not move to a different day.
- [ ] **TIME-14 (P1)** Save an entry, kill the app immediately, reopen. Expected: the entry is there.
- [ ] **TIME-15 (P1)** Add an entry with no network. Expected: a clear failure message or a queued save, never a silent loss. Record which behaviour the build has.
- [ ] **TIME-16 (P2)** Double-tap Save quickly. Expected: only one entry is created.
- [ ] **TIME-17 (P2)** Start an entry, leave the screen without saving. Expected: nothing is saved, and a discard prompt is shown if the app has one.
- [ ] **TIME-18 (P2)** View history with many entries (100 or more). Expected: list scrolls smoothly, ordering is newest first (or per spec), and nothing is duplicated.
- [ ] **TIME-19 (P3)** Open an entry in detail, rotate the device. Expected: layout holds and no data is lost.

## 4. Languages and levels

- [ ] **LANG-01 (P1)** Add a language from the picker. Expected: it appears in the user's languages and is selectable when logging time.
- [ ] **LANG-02 (P1)** Set a level for a language. Expected: it shows and persists after kill and reopen.
- [ ] **LANG-03 (P1)** Change a level through each step from Beginner up to Fluent. Expected: there are 7 levels in total, all selectable, and each saves.
- [ ] **LANG-04 (P2)** Open the language picker. Expected: 44 languages are available, they scroll and search properly, and languages already added are not offered again or are marked.
- [ ] **LANG-05 (P1)** Try to add the same language twice. Expected: blocked or hidden, no duplicate.
- [ ] **LANG-06 (P1)** Delete a language that has entries and goals. Expected: a confirmation that states entries and goals will be deleted too, and after confirming, the language, its entries and its goals are gone. Dashboard totals, reports and achievements (if tied to it) update.
- [ ] **LANG-07 (P1)** Cancel the language delete confirmation. Expected: nothing is deleted.
- [ ] **LANG-08 (P1)** Delete a language, then check another language's data. Expected: the other languages' entries, goals and levels are untouched.
- [ ] **LANG-09 (P2)** Delete a language, then add it again. Expected: it starts clean with no old entries or goals.
- [ ] **LANG-10 (P2)** Delete the only language on the account. Expected: the app shows an empty state and prompts to add a language, and logging time is disabled or redirected.
- [ ] **LANG-11 (P2)** Add a language with no network. Expected: a clear failure message, and no phantom language afterwards.
- [ ] **LANG-12 (P2)** Account with a goal in a language, then delete the language. Expected: the goal's pending reminder is cancelled and no stale reminder fires later.
- [ ] **LANG-13 (P3)** Add a large number of languages (10 or more). Expected: lists and filters in Reports and the entry form still work.
- [ ] **LANG-14 (P3)** Check that language names with accents or non-Latin scripts display correctly. Expected: correct rendering, no missing glyph boxes.

## 5. Goals and reminders

- [ ] **GOAL-01 (P1)** Create a daily time goal. Expected: it saves with a title, target and dates, and shows on the goals screen and dashboard.
- [ ] **GOAL-02 (P1)** Create a weekly time goal. Expected: same as above, with the weekly period.
- [ ] **GOAL-03 (P1)** Log time toward a goal. Expected: progress in minutes updates and matches the entries within the goal's dates and language.
- [ ] **GOAL-04 (P1)** Edit a goal (title, description, target, dates). Expected: changes persist and progress recalculates.
- [ ] **GOAL-05 (P1)** Delete a goal. Expected: a confirmation is shown, then it disappears, and its reminder is cancelled.
- [ ] **GOAL-06 (P1)** Validation: save a goal with an empty title, a zero target, a negative target, an end date before the start date, and a non-numeric target. Expected: each is blocked with a clear message.
- [ ] **GOAL-07 (P1)** Create a goal for the first time with notification permission not yet granted. Expected: the app asks for notification permission at this moment (and not before). Test both Allow and Deny.
- [ ] **GOAL-08 (P1)** Deny notification permission, then create the goal. Expected: the goal still saves, and the app handles the denied state without crashing and tells the user reminders will not appear.
- [ ] **GOAL-09 (P1)** With a goal ending today, wait for the following morning. Expected: a reminder arrives asking whether you hit the goal. Test with the device locked and the app killed.
- [ ] **GOAL-10 (P2)** Turn off goal reminders in settings, then let a goal end. Expected: no reminder arrives.
- [ ] **GOAL-11 (P2)** Turn reminders off, then on again. Expected: reminders for current goals work again.
- [ ] **GOAL-12 (P2)** Tap the reminder. Expected: the app opens, to the relevant screen if the build deep-links.
- [ ] **GOAL-13 (P2)** Mark a finished goal as hit or missed, if the app supports it. Expected: status updates and persists.
- [ ] **GOAL-14 (P1)** Goal with an end time near midnight. Expected: entries logged at 11:55 PM count toward the goal's last day, and entries at 12:05 AM do not.
- [ ] **GOAL-15 (P2)** Two goals at once in the same language. Expected: both track progress independently.
- [ ] **GOAL-16 (P2)** Goals in different languages. Expected: an entry only counts toward the goal of its own language, unless the goal is for all languages (per spec).
- [ ] **GOAL-17 (P2)** Reboot the device after creating a goal. Expected: the reminder schedule survives, since reminders are created on the phone.
- [ ] **GOAL-18 (P2)** Sign out, then sign in as Account B. Expected: A's reminders do not fire for B (see ISO-06).
- [ ] **GOAL-19 (P2)** Change the device time zone after creating a goal. Expected: the reminder still fires at a sensible time the morning after the goal ends.
- [ ] **GOAL-20 (P3)** Very long goal title and description (500 or more characters). Expected: handled with a limit or clean wrapping.
- [ ] **GOAL-21 (P3)** Empty state with no goals. Expected: a clear prompt to create one.
- [ ] **GOAL-22 (P2)** Create a goal with no network. Expected: a clear failure message, and no reminder is scheduled for a goal that did not save.

## 6. Reports

- [ ] **REP-01 (P1)** Open Reports for all languages on Account A. Expected: total time, average session, time per skill and weekly progress all show.
- [ ] **REP-02 (P1)** Check the maths. Add up the account's entries by hand for a known period. Expected: total time, average session (total divided by number of entries) and time per skill match your hand count.
- [ ] **REP-03 (P1)** Filter to one language. Expected: every number reflects only that language.
- [ ] **REP-04 (P1)** Check the input and output comparison. Expected: input equals reading plus listening, output equals writing plus speaking, and the split matches the per-skill numbers.
- [ ] **REP-05 (P1)** Add, edit and delete an entry, then reopen Reports. Expected: numbers update correctly each time.
- [ ] **REP-06 (P1)** Fresh account with no data. Expected: a clear empty state, no division-by-zero, no NaN, no crash.
- [ ] **REP-07 (P2)** Account with one entry only. Expected: average session equals that entry, and charts render a single data point properly.
- [ ] **REP-08 (P2)** Weekly progress across a week boundary and a month boundary. Expected: entries fall in the correct week.
- [ ] **REP-09 (P2)** Entries near midnight (11:55 PM and 12:05 AM). Expected: each is in the correct local day and week.
- [ ] **REP-10 (P2)** Skill with zero time (for example no speaking). Expected: shows zero and does not break the chart or the percentages.
- [ ] **REP-11 (P2)** Large numbers: many hours in one skill. Expected: hours and minutes format correctly (no overflow, no "60 min").
- [ ] **REP-12 (P2)** Delete a language, then open Reports. Expected: its time is gone from all-language totals and it is gone from the filter.
- [ ] **REP-13 (P2)** Open Reports with no network. Expected: no crash, and cached data or a clear message.
- [ ] **REP-14 (P3)** Rotate the device and use a large font. Expected: charts and labels stay readable.
- [ ] **REP-15 (P3)** Chart accessibility: check that colours are distinguishable and values are readable as text. Expected: not colour-only.

## 7. Achievements

- [ ] **ACH-01 (P1)** Add an achievement (a certificate, a course or an award) with a title, a note and a date. Expected: it saves and appears in the list.
- [ ] **ACH-02 (P1)** Edit an achievement. Expected: changes persist after kill and reopen.
- [ ] **ACH-03 (P1)** Delete an achievement. Expected: a confirmation, then it disappears.
- [ ] **ACH-04 (P1)** Validation: empty title, missing type, missing date. Expected: each is blocked with a clear message.
- [ ] **ACH-05 (P2)** Empty state on a new account. Expected: a clear prompt to add the first achievement.
- [ ] **ACH-06 (P2)** Very long title and note (500 or more characters). Expected: limited or wrapped cleanly.
- [ ] **ACH-07 (P2)** Ordering with many achievements. Expected: ordered by date (newest first, or per spec) and consistent after edits.
- [ ] **ACH-08 (P2)** Achievement dated in the past and in the future. Expected: per spec; record the behaviour.
- [ ] **ACH-09 (P2)** Add an achievement with no network. Expected: a clear failure message, no silent loss.
- [ ] **ACH-10 (P2)** Delete a language and check achievements. Expected: per spec; confirm whether achievements tied to the language are removed or kept, and that the app does not crash either way.
- [ ] **ACH-11 (P3)** Emoji and non-Latin text in an achievement. Expected: displays correctly.

## 8. Profile and avatar

- [ ] **PROF-01 (P1)** View the profile. Expected: display name, username, about me and native language show correctly.
- [ ] **PROF-02 (P1)** Edit each field (display name, username, about me, native language) and save. Expected: changes persist after kill and reopen.
- [ ] **PROF-03 (P1)** Choose a profile photo from the photo library. Expected: the app asks for photo access at this moment only, the photo uploads and it displays on the profile.
- [ ] **PROF-04 (P1)** Deny photo permission. Expected: no crash, and a clear message or a way to open settings.
- [ ] **PROF-05 (P2)** Replace the photo with a new one. Expected: the new photo shows and the old one is no longer displayed.
- [ ] **PROF-06 (P2)** Remove the photo, if supported. Expected: falls back to a default avatar.
- [ ] **PROF-07 (P2)** Choose a very large photo (12 MP or more), a tiny one, a portrait and a landscape. Expected: all upload and crop or fit cleanly, with no stretch.
- [ ] **PROF-08 (P2)** Choose a non-image file or a corrupt image, if the picker allows it. Expected: rejected with a clear message.
- [ ] **PROF-09 (P1)** Validation: empty display name, empty username, a username that is already taken, a username with spaces or symbols. Expected: each is blocked or handled per spec with a clear message.
- [ ] **PROF-10 (P2)** Very long display name, username and about me. Expected: limited, with no layout break.
- [ ] **PROF-11 (P3)** Emoji and accented characters in the display name. Expected: save and display correctly.
- [ ] **PROF-12 (P2)** Upload a photo with no network. Expected: a clear failure and the old photo is kept.
- [ ] **PROF-13 (P2)** Edit the profile, then leave without saving. Expected: changes are discarded (or a prompt is shown).
- [ ] **PROF-14 (P2)** Change the native language. Expected: it persists, and it does not affect the study languages list.
- [ ] **PROF-15 (P3)** Open the profile photo link in a browser. Expected: it loads without sign in, which the privacy policy discloses. Confirm that the policy text still matches this behaviour.

## 9. Settings and notifications

- [ ] **SET-01 (P1)** Open settings. Expected: all items are present and each opens its screen.
- [ ] **SET-02 (P1)** Turn notifications on for the first time. Expected: the system permission prompt appears, and on Allow the setting is on.
- [ ] **SET-03 (P1)** Turn notifications on, then deny the system permission. Expected: the setting reflects the real state, with a way to open system settings.
- [ ] **SET-04 (P1)** Turn a reminder on, set a reminder time, and wait for it. Expected: the notification arrives at the chosen time with the app closed.
- [ ] **SET-05 (P2)** Change the reminder time. Expected: the old time no longer fires, and the new one does.
- [ ] **SET-06 (P2)** Turn each reminder off. Expected: nothing fires, and the setting persists after kill and reopen.
- [ ] **SET-07 (P2)** Turn off notifications in Android system settings while the app setting is on. Expected: the app does not crash, and it shows the true state when reopened.
- [ ] **SET-08 (P2)** Reinstall the app and sign in. Expected: preferences are restored from the account, and device-only reminder schedules are recreated or the user is told.
- [ ] **SET-09 (P2)** Sign out. Expected: the session is cleared, and the app returns to sign in. Check that local reminders are handled per spec (the site does not state this, so record what happens, and compare it with the privacy policy wording).
- [ ] **SET-10 (P2)** Change settings with no network. Expected: a clear failure message, and the UI does not show a changed state that did not save.
- [ ] **SET-11 (P3)** Dark mode and light mode, if supported. Expected: every screen is readable in both.
- [ ] **SET-12 (P3)** Show the app version in settings or about, if present. Expected: it matches the installed build number.
- [ ] **SET-13 (P1)** App update check. With a newer build published, open the app. Expected: the update is delivered and applied without losing the session or data.
- [ ] **SET-14 (P1)** Delete account entry point. Expected: the app points the user to the web deletion page (or in-app deletion once shipped), and the link works. The web page must still be reachable.

## 10. Feedback

- [ ] **FB-01 (P1)** Send feedback with a message. Expected: success confirmation, and the message arrives on the receiving side with the sender's profile name and email.
- [ ] **FB-02 (P1)** Validation: empty message, whitespace only. Expected: blocked with a clear message.
- [ ] **FB-03 (P2)** Very long feedback (5,000 or more characters). Expected: limited or sent cleanly.
- [ ] **FB-04 (P1)** Send feedback with no network. Expected: the message is kept on the device, and the user is told it will be sent later.
- [ ] **FB-05 (P1)** After FB-04, restore the network and reopen the app. Expected: the queued feedback sends once, with no duplicates.
- [ ] **FB-06 (P2)** After FB-04, kill the app before restoring the network. Expected: the queued message survives and sends later.
- [ ] **FB-07 (P2)** Double-tap Send. Expected: one message is sent.
- [ ] **FB-08 (P3)** Emoji, line breaks and non-Latin text. Expected: arrive intact.
- [ ] **FB-09 (P2)** Send feedback as Account B right after A. Expected: each message carries the right sender details (see ISO-07).

## 11. About and legal screens

- [ ] **LEG-01 (P1)** Open the privacy policy from the app. Expected: it opens and matches the live page at `/privacy`.
- [ ] **LEG-02 (P1)** Open the terms from the app. Expected: it opens and matches the live page at `/terms`.
- [ ] **LEG-03 (P1)** Open the delete-account link. Expected: it opens `/delete-account`, and the page loads.
- [ ] **LEG-04 (P2)** Open the support link and the contact email. Expected: `/support` loads, and the email link opens a mail app with the correct address.
- [ ] **LEG-05 (P2)** Open the legal links with no network. Expected: a clear message, no crash.
- [ ] **LEG-06 (P2)** Check the about screen, if present. Expected: app name, version and operator details are correct.
- [ ] **LEG-07 (P2)** Compare the privacy policy against the build's real behaviour. Expected: permissions (photo library only when choosing a photo, notifications only when creating a goal or turning them on), no location, no contacts, no analytics, no ads. Any mismatch is a release blocker for the policy text.
- [ ] **LEG-08 (P3)** Check that no placeholder text or "draft" labels show in the app's legal screens.

## 12. Data isolation between two accounts

Run these with Account A and Account B on the same device, and where noted, on two devices.

- [ ] **ISO-01 (P1)** Sign in as A, note the data, sign out, sign in as B. Expected: B sees none of A's languages, entries, goals, achievements or profile.
- [ ] **ISO-02 (P1)** Sign out of B, sign in as A. Expected: A's data is exactly as before.
- [ ] **ISO-03 (P1)** Add an entry as B. Sign in as A. Expected: the entry is not in A's history, dashboard or reports.
- [ ] **ISO-04 (P1)** Delete a language, goal and entry as B. Expected: A's data is unchanged on a second device after a refresh.
- [ ] **ISO-05 (P1)** Switch accounts quickly without killing the app. Expected: no stale screens, cached lists or avatars from the previous account.
- [ ] **ISO-06 (P1)** Create a goal as A, sign out, sign in as B. Expected: A's goal reminders do not notify B (reminders are created on the phone, so this needs a device check).
- [ ] **ISO-07 (P2)** Send feedback as A, then as B. Expected: each message carries only the sender's own name and email.
- [ ] **ISO-08 (P1)** Profile photo: A uploads a photo, B signs in. Expected: B sees B's own photo or a default, never A's.
- [ ] **ISO-09 (P2)** Offline queue: write feedback offline as A, sign out, sign in as B, go online. Expected: A's queued feedback is not sent under B's identity. Record what happens.
- [ ] **ISO-10 (P2)** Both accounts use the same language. Expected: totals and levels stay separate.
- [ ] **ISO-11 (P2)** Two devices signed in as A. Add an entry on device 1. Expected: device 2 shows it after a refresh or relaunch.
- [ ] **ISO-12 (P2)** Look at the app's network behaviour with a proxy or logs, if possible. Expected: requests return only the signed-in user's rows. Confirm that row-level security is enabled on every user table.
- [ ] **ISO-13 (P3)** Use the same email with different letter case at sign in. Expected: it resolves to one account.

## 13. Cross-cutting checks

- [ ] **X-01 (P1)** Cold start time on the lowest-spec device. Expected: the app is usable in a few seconds, with no blank screen.
- [ ] **X-02 (P1)** Back button on every screen. Expected: it behaves sensibly and never closes the app unexpectedly from the middle of a flow.
- [ ] **X-03 (P1)** Kill and reopen on each main screen. Expected: no crash, and data loads.
- [ ] **X-04 (P1)** Airplane mode on, then use every main screen. Expected: no crash, no infinite spinner, and clear messages.
- [ ] **X-05 (P2)** Slow network (throttled). Expected: loading states show and nothing gets duplicated.
- [ ] **X-06 (P2)** Network drops during a save. Expected: a clear failure, no half-saved records.
- [ ] **X-07 (P2)** Rotate the device on each screen. Expected: layout holds and form input is kept.
- [ ] **X-08 (P2)** Largest system font and display size. Expected: text is readable and buttons are reachable.
- [ ] **X-09 (P2)** Android system language changed to French or another language. Expected: no crash, and the app copy stays readable.
- [ ] **X-10 (P3)** TalkBack on the main flows. Expected: controls have labels and the order makes sense.
- [ ] **X-11 (P2)** Background the app for an hour, then return. Expected: the session is valid or the app asks for sign in cleanly.
- [ ] **X-12 (P2)** Low storage and low battery modes. Expected: no crash on save, and notifications still behave.
- [ ] **X-13 (P1)** Uninstall and reinstall. Expected: sign in restores all server-side data.
- [ ] **X-14 (P2)** Confirm no ads appear anywhere in the app, and no analytics or advertising permissions are requested. Expected: matches the site's claims.

---

## Results log

| Field | Value |
| --- | --- |
| Build number | |
| Date | |
| Tester | |
| Device and Android version | |
| P1 failures | |
| P2 failures | |
| P3 failures | |
| Release decision | |
