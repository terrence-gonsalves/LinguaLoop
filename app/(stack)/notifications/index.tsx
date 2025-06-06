import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router/stack';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { Switch } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsSection } from '../../../components/settings/SettingsSection';

interface NotificationSettings {
  notifications_enabled: boolean;
  study_reminder: boolean;
  study_reminder_time: string | null;
  news_promotions: boolean;
  product_updates: boolean;
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    notifications_enabled: false,
    study_reminder: false,
    study_reminder_time: null,
    news_promotions: false,
    product_updates: false,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [displayTime, setDisplayTime] = useState<string>('Set reminder time');

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {

          // no settings found, create default settings
          const { data: newSettings, error: createError } = await supabase
            .from('notification_settings')
            .insert([{
              notifications_enabled: false,
              study_reminder: false,
              study_reminder_time: null,
              news_promotions: false,
              product_updates: false,
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
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
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

    // ormat time for database (HH:MM:SS+00)
    const dbTimeString = selectedTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + '+00';
    
    handleSettingChange('study_reminder_time', dbTimeString);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          notifications_enabled: settings.notifications_enabled,
          study_reminder: settings.study_reminder,
          study_reminder_time: settings.study_reminder_time,
          news_promotions: settings.news_promotions,
          product_updates: settings.product_updates,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setHasUnsavedChanges(false);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Settings saved successfully', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
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

      <View style={styles.content}>
        {/* Main Notifications Toggle */}
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
            {/* Study Reminders Section */}
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

            {/* Other Notifications Section */}
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
          </>
        )}

        {/* Save Button */}
        <Pressable
          style={[
            styles.saveButton,
            (!hasUnsavedChanges || !settings.notifications_enabled) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!hasUnsavedChanges || !settings.notifications_enabled}
        >
          <Text style={[
            styles.saveButtonText,
            (!hasUnsavedChanges || !settings.notifications_enabled) && styles.saveButtonTextDisabled
          ]}>
            Save
          </Text>
        </Pressable>

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={false}
            onChange={handleTimeChange}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
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
}); 