import { SettingsSection } from '@/components/settings/SettingsSection';
import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import {
  getPushToken,
  requestNotificationPermissions,
  sendTestNotification,
  type NotificationSettings
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { showSuccessToast } from '@/lib/toast';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack } from 'expo-router/stack';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    notifications_enabled: false,
    study_reminder: false,
    study_reminder_time: null,
    news_promotions: false,
    product_updates: false,
    user_notifications: false,
    goal_notifications: false,
    expo_push_token: null,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [displayTime, setDisplayTime] = useState<string>('Set reminder time');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchNotificationSettings();
    }
  }, [profile?.id]);

  const setupNotifications = async () => {
    try {

      // get push token
      const token = await getPushToken();

      if (token) {
        console.log('💾 Saving push token to settings:', token);
        setSettings(prev => ({
          ...prev,
          expo_push_token: token,
        }));
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const fetchNotificationSettings = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {

          // no settings found, create default settings
          const { data: newSettings, error: createError } = await supabase
            .from('notification_settings')
            .insert([{
              user_id: profile.id,
              notifications_enabled: false,
              study_reminder: false,
              study_reminder_time: null,
              news_promotions: false,
              product_updates: false,
              user_notifications: false,
              goal_notifications: false,
              expo_push_token: null,
            }])
            .select()
            .single();

          if (createError) throw createError;
          setSettings(newSettings);
          setDisplayTime('Set reminder time');
        } else {
          throw error;
        }
      } else {
        setSettings(data);
        if (data.study_reminder_time) {
          try {

            // the database time comes in format "HH:MM:SS+00"
            // we need to parse it and format it for display
            const [time] = data.study_reminder_time.split('+'); // Remove timezone
            const [hours, minutes] = time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            
            const formattedTime = date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            });
            setDisplayTime(formattedTime);
          } catch (e) {
            console.error('Error parsing time:', e);
            setDisplayTime('Set reminder time');
          }
        } else {
          setDisplayTime('Set reminder time');
        }
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    }
  };

  const handleNotificationsToggle = async () => {
    if (!settings.notifications_enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        return;
      }
      
      // get push token when enabling notifications
      await setupNotifications();
    }
    
    setSettings(prev => ({
      ...prev,
      notifications_enabled: !prev.notifications_enabled
    }));
    setHasUnsavedChanges(true);
  };

  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean | string | null) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    
    // on Android, cancelling returns undefined
    // on iOS, cancelling returns the previously selected time
    if (event.type === 'dismissed' || !selectedTime) {
      return;
    }

    // update display time
    const timeString = selectedTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    setDisplayTime(timeString);

    // format time for database (HH:MM:SS+00)
    const dbTimeString = selectedTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + '+00';
    
    handleSettingChange('study_reminder_time', dbTimeString);
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    
    try {
      setIsLoading(true);
      
      const saveData = {
        user_id: profile.id,
        notifications_enabled: settings.notifications_enabled,
        study_reminder: settings.study_reminder,
        study_reminder_time: settings.study_reminder_time,
        news_promotions: settings.news_promotions,
        product_updates: settings.product_updates,
        user_notifications: settings.user_notifications,
        goal_notifications: settings.goal_notifications,
        expo_push_token: settings.expo_push_token,
        updated_at: new Date().toISOString(),
      };
      
      console.log('💾 Saving notification settings:', saveData);
      
      const { error } = await supabase
        .from('notification_settings')
        .upsert(saveData);

      if (error) throw error;

      console.log('✅ Notification settings saved successfully');
      setHasUnsavedChanges(false);
      showSuccessToast('Settings saved successfully');
    } catch (error) {
      console.error('❌ Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();

      showSuccessToast('Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Notifications',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.light.background },
        }} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* main notifications toggle */}
          <View style={styles.mainToggleSection}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Notifications</Text>
              <Switch
                value={settings.notifications_enabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: Colors.light.border, true: Colors.light.buttonPrimary }}
              />
            </View>
          </View>

          {settings.notifications_enabled && (
            <>
              {/* study reminders section */}
              <SettingsSection title="Study Reminder">
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Daily reminder</Text>
                  <Switch
                    value={settings.study_reminder}
                    onValueChange={(value) => {
                      handleSettingChange('study_reminder', value);
                      if (!value) {
                        handleSettingChange('study_reminder_time', null);
                        setDisplayTime('Set reminder time');
                      }
                    }}
                    trackColor={{ false: Colors.light.border, true: Colors.light.buttonPrimary }}
                  />
                </View>

                <Pressable
                  style={[
                    styles.timePickerButton,
                    !settings.study_reminder && styles.timePickerButtonDisabled
                  ]}
                  onPress={() => settings.study_reminder && setShowTimePicker(true)}
                  disabled={!settings.study_reminder}
                >
                  <Text style={[
                    styles.timePickerText,
                    !settings.study_reminder && styles.timePickerTextDisabled
                  ]}>
                    {displayTime}
                  </Text>
                </Pressable>
              </SettingsSection>

              {/* user notifications section */}
              <SettingsSection title="User Notifications">
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Messages and follows</Text>
                  <Switch
                    value={settings.user_notifications}
                    onValueChange={(value) => handleSettingChange('user_notifications', value)}
                    trackColor={{ false: Colors.light.border, true: Colors.light.buttonPrimary }}
                  />
                </View>
              </SettingsSection>

              {/* goal notifications section */}
              <SettingsSection title="Goal Notifications">
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Goal reminders and progress</Text>
                  <Switch
                    value={settings.goal_notifications}
                    onValueChange={(value) => handleSettingChange('goal_notifications', value)}
                    trackColor={{ false: Colors.light.border, true: Colors.light.buttonPrimary }}
                    disabled={true} // Coming soon feature
                  />
                </View>
                <View style={styles.comingSoonContainer}>
                  <Text style={styles.comingSoonText}>Coming soon</Text>
                </View>
              </SettingsSection>

              {/* other notifications section */}
              <SettingsSection title="Other Notifications">
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>News and promotions</Text>
                  <Switch
                    value={settings.news_promotions}
                    onValueChange={(value) => handleSettingChange('news_promotions', value)}
                    trackColor={{ false: Colors.light.border, true: Colors.light.buttonPrimary }}
                  />
                </View>

                <View style={[styles.settingRow, styles.lastRow]}>
                  <Text style={styles.settingLabel}>Product updates</Text>
                  <Switch
                    value={settings.product_updates}
                    onValueChange={(value) => handleSettingChange('product_updates', value)}
                    trackColor={{ false: Colors.light.border, true: Colors.light.buttonPrimary }}
                  />
                </View>
              </SettingsSection>

              {/* test notification button */}
              <View style={styles.testButtonContainer}>
                <Pressable
                  style={styles.testButton}
                  onPress={handleTestNotification}
                >
                  <Text style={styles.testButtonText}>Test Notification</Text>
                </Pressable>
              </View>
            </>
          )}

          {/* save button */}
          <Pressable
            style={[
              styles.saveButton,
              (!hasUnsavedChanges || !settings.notifications_enabled || isLoading) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!hasUnsavedChanges || !settings.notifications_enabled || isLoading}
          >
            <Text style={[
              styles.saveButtonText,
              (!hasUnsavedChanges || !settings.notifications_enabled || isLoading) && styles.saveButtonTextDisabled
            ]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>

          {/* Add bottom padding for scroll */}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* time picker modal */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={false}
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  mainToggleSection: {
    backgroundColor: Colors.light.background,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  toggleLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  timePickerButton: {
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  timePickerButtonDisabled: {
    opacity: 0.5,
  },
  timePickerText: {
    fontSize: 16,
    color: Colors.light.buttonPrimary,
  },
  timePickerTextDisabled: {
    color: Colors.light.textSecondary,
  },
  comingSoonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
  },
  comingSoonText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  testButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  testButton: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.buttonPrimary,
    alignItems: 'center',
  },
  testButtonText: {
    color: Colors.light.buttonPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.light.buttonPrimary,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: Colors.light.background,
  },
  bottomPadding: {
    height: 100, // add space at bottom for better scrolling
  },
}); 