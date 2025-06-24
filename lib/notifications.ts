import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

// configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  notifications_enabled: boolean;
  study_reminder: boolean;
  study_reminder_time: string | null;
  news_promotions: boolean;
  product_updates: boolean;
  user_notifications: boolean;
  goal_notifications: boolean;
  expo_push_token: string | null;
}

export async function getPushToken(): Promise<string | null> {
  try {
    console.log('🔔 Getting Expo push token...');
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: '065b7f0f-4e87-4776-adad-e88c984c7adb',
    });
    console.log('✅ Push token generated:', token.data);
    return token.data;
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function sendTestNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification from LinguaLoop!',
        data: { type: 'test' },
      },
      trigger: null, // send immediately
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
}

export async function updatePushToken(userId: string, token: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: userId,
        expo_push_token: token,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating push token:', error);
    throw error;
  }
}

export async function getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return null;
  }
}

export async function saveNotificationSettings(
  userId: string, 
  settings: Partial<NotificationSettings>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw error;
  }
} 