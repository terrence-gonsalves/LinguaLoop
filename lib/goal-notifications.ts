import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { parseDateOnly, type Goal } from '@/lib/goals';
import { supabase } from '@/lib/supabase';

// registers the foreground notification handler, so a reminder that fires
// while the app is open is still shown
import '@/lib/notifications';

// local "your goal ended" reminders, one per goal, at 09:00 local time on the
// day after the goal's end_date. scheduled on this device with
// expo-notifications, so no server is involved.
//
// the goalId -> notificationId map lives in AsyncStorage. scheduled local
// notifications are lost on reinstall, so syncGoalNotifications() rebuilds
// them on app start.

const STORAGE_KEY = 'goal-notification-ids';
const NOTIFICATION_TYPE = 'goal-ended';
const REMINDER_HOUR = 9;

type NotificationMap = Record<string, string>;

type SchedulableGoal = Pick<Goal, 'id' | 'user_id' | 'title' | 'end_date' | 'status'>;

async function readMap(): Promise<NotificationMap> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading goal notification ids:', error);
    return {};
  }
}

async function writeMap(map: NotificationMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Error saving goal notification ids:', error);
  }
}

// 09:00 local time on the day after end_date
export function getGoalReminderDate(goal: Pick<Goal, 'end_date'>): Date {
  const date = parseDateOnly(goal.end_date);
  date.setDate(date.getDate() + 1);
  date.setHours(REMINDER_HOUR, 0, 0, 0);

  return date;
}

// active goals get a reminder. a missed goal still gets one if its reminder
// time hasn't passed: the nightly job can mark a goal missed before 09:00.
function isEligible(goal: SchedulableGoal, now: Date): boolean {
  if (goal.status === 'completed') return false;

  return getGoalReminderDate(goal) > now;
}

// the notification_settings.goal_notifications setting. a user with no
// settings row, or a null value, counts as on (the column defaults to true).
export async function isGoalNotificationsEnabled(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('goal_notifications')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error reading goal notification setting:', error);
    return false;
  }

  return data?.goal_notifications !== false;
}

async function hasNotificationPermission(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();

  return granted;
}

// asks for notification permission, but only if the user hasn't been asked yet
// and has goal notifications on. called after a goal is created, so the first
// goal is the first time the app asks.
export async function requestGoalNotificationPermission(userId: string): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();

    if (current.granted) return true;
    if (current.status !== 'undetermined') return false;
    if (!(await isGoalNotificationsEnabled(userId))) return false;

    const requested = await Notifications.requestPermissionsAsync();

    return requested.granted;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

async function scheduleReminder(goal: SchedulableGoal): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Goal ended',
      body: `Your goal ${goal.title} ended. Did you hit it?`,
      data: { type: NOTIFICATION_TYPE, goalId: goal.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: getGoalReminderDate(goal),
    },
  });
}

// cancels the goal's reminder, if it has one
export async function cancelGoalNotification(goalId: string): Promise<void> {
  const map = await readMap();
  const notificationId = map[goalId];

  if (!notificationId) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error cancelling goal notification:', error);
  }

  delete map[goalId];
  await writeMap(map);
}

// schedules (or reschedules) the goal's reminder. replaces any existing one,
// and just cancels it if the goal no longer needs one. never asks for permission.
export async function scheduleGoalNotification(goal: SchedulableGoal): Promise<void> {
  try {
    await cancelGoalNotification(goal.id);

    if (!isEligible(goal, new Date())) return;
    if (!(await hasNotificationPermission())) return;
    if (!(await isGoalNotificationsEnabled(goal.user_id))) return;

    const notificationId = await scheduleReminder(goal);
    const map = await readMap();
    map[goal.id] = notificationId;
    await writeMap(map);
  } catch (error) {
    console.error('Error scheduling goal notification:', error);
  }
}

// cancels every goal reminder on this device, including any the map lost track of
async function cancelAllGoalReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((request) => request.content.data?.type === NOTIFICATION_TYPE)
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier))
  );
}

// rebuilds all of the user's reminders from the goals table. runs on app start
// so a reinstall, a changed setting or a goal changed on another device is
// picked up. never asks for permission.
export async function syncGoalNotifications(userId: string): Promise<void> {
  try {
    await cancelAllGoalReminders();

    const map: NotificationMap = {};

    if (await hasNotificationPermission() && await isGoalNotificationsEnabled(userId)) {
      const { data: goals, error } = await supabase
        .from('goals')
        .select('id, user_id, title, end_date, status')
        .eq('user_id', userId)
        .in('status', ['active', 'missed']);

      if (error) throw error;

      const now = new Date();

      for (const goal of (goals || []) as SchedulableGoal[]) {
        if (isEligible(goal, now)) {
          map[goal.id] = await scheduleReminder(goal);
        }
      }
    }

    await writeMap(map);
  } catch (error) {
    console.error('Error syncing goal notifications:', error);
  }
}

// cancels every goal reminder and forgets the map. used on sign out so the
// next account on this device doesn't get them.
export async function clearGoalNotifications(): Promise<void> {
  try {
    await cancelAllGoalReminders();
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing goal notifications:', error);
  }
}

// the goal id carried by a tapped goal reminder, or null for any other notification
export function getGoalIdFromResponse(response: Notifications.NotificationResponse | null | undefined): string | null {
  if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return null;

  const data = response.notification.request.content.data;

  if (data?.type !== NOTIFICATION_TYPE || typeof data.goalId !== 'string') return null;

  return data.goalId;
}
