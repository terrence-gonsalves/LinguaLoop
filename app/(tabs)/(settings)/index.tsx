import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VersionDisplay } from '../../../components/common/VersionDisplay';
import { SettingsItem } from '../../../components/settings/SettingsItem';
import { SettingsSection } from '../../../components/settings/SettingsSection';
import Colors from '../../../constants/Colors';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.headerTitle}>Settings</Text>

          {/* Language Management */}
          <SettingsSection title="Language Management">
            <SettingsItem
              icon={<MaterialIcons name="language" size={24} color={Colors.light.rust} />}
              title="My Target Languages"
              rightElement={
                <View style={styles.languageFlags}>
                  <Text>🇬🇧</Text>
                  <Text>🇪🇸</Text>
                  <Text>🇯🇵</Text>
                </View>
              }
            />
            <SettingsItem
              icon={<MaterialIcons name="translate" size={24} color={Colors.light.rust} />}
              title="Native Language"
              rightElement={<Text>English</Text>}
            />
            <SettingsItem
              icon={<MaterialIcons name="add-circle-outline" size={24} color={Colors.light.rust} />}
              title="Add New Language"
            />
          </SettingsSection>

          {/* Study Preferences */}
          <SettingsSection title="Study Preferences">
            <SettingsItem
              icon={<MaterialCommunityIcons name="book-education" size={24} color={Colors.light.rust} />}
              title="Difficulty Level"
              rightElement={<Text style={styles.settingValue}>Intermediate</Text>}
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="playlist-check" size={24} color={Colors.light.rust} />}
              title="Daily Study Goal"
              rightElement={<Text style={styles.settingValue}>30 min</Text>}
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="calendar-check" size={24} color={Colors.light.rust} />}
              title="Study Days"
              rightElement={<Text style={styles.settingValue}>Mon-Fri</Text>}
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="text-recognition" size={24} color={Colors.light.rust} />}
              title="Writing System"
              rightElement={<Text style={styles.settingValue}>Romaji</Text>}
            />
          </SettingsSection>

          {/* Notification Preferences */}
          <SettingsSection title="Notification Preferences">
            <SettingsItem
              icon={<MaterialIcons name="notifications-none" size={24} color={Colors.light.rust} />}
              title="Enable Notifications"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: Colors.light.fossil, true: Colors.light.rust }}
                  thumbColor={Colors.light.background}
                />
              }
            />
            <SettingsItem
              icon={<MaterialIcons name="volume-up" size={24} color={Colors.light.rust} />}
              title="Notification Sound"
              rightElement={
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: Colors.light.fossil, true: Colors.light.rust }}
                  thumbColor={Colors.light.background}
                />
              }
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="clock-outline" size={24} color={Colors.light.rust} />}
              title="Daily Study Reminder"
              rightElement={<Text style={styles.settingValue}>9:00 AM</Text>}
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="bell-badge" size={24} color={Colors.light.rust} />}
              title="Achievement Alerts"
            />
          </SettingsSection>

          {/* Learning Experience */}
          <SettingsSection title="Learning Experience">
            <SettingsItem
              icon={<MaterialCommunityIcons name="brain" size={24} color={Colors.light.rust} />}
              title="Learning Style"
              rightElement={<Text style={styles.settingValue}>Visual</Text>}
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="speedometer" size={24} color={Colors.light.rust} />}
              title="Lesson Pace"
              rightElement={<Text style={styles.settingValue}>Normal</Text>}
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="repeat" size={24} color={Colors.light.rust} />}
              title="Review Frequency"
              rightElement={<Text style={styles.settingValue}>Daily</Text>}
            />
          </SettingsSection>

          {/* Personal Goals */}
          <SettingsSection title="Personal Goals">
            <SettingsItem
              icon={<MaterialIcons name="list-alt" size={24} color={Colors.light.rust} />}
              title="View All Goals"
            />
            <SettingsItem
              icon={<MaterialIcons name="add-task" size={24} color={Colors.light.rust} />}
              title="Set New Goal"
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="chart-line" size={24} color={Colors.light.rust} />}
              title="Progress Tracking"
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="trophy" size={24} color={Colors.light.rust} />}
              title="Achievements"
            />
          </SettingsSection>

          {/* Data & Storage */}
          <SettingsSection title="Data & Storage">
            <SettingsItem
              icon={<MaterialCommunityIcons name="cloud-download" size={24} color={Colors.light.rust} />}
              title="Download Learning Materials"
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="database" size={24} color={Colors.light.rust} />}
              title="Storage Usage"
              rightElement={<Text style={styles.settingValue}>234 MB</Text>}
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="backup-restore" size={24} color={Colors.light.rust} />}
              title="Backup & Restore"
            />
          </SettingsSection>

          {/* Account */}
          <SettingsSection title="Account">
            <SettingsItem
              icon={<MaterialIcons name="person-outline" size={24} color={Colors.light.rust} />}
              title="Edit Profile"
              onPress={() => router.push('/(stack)/edit-profile')}
            />
            <SettingsItem
              icon={<MaterialIcons name="security" size={24} color={Colors.light.rust} />}
              title="Privacy Settings"
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="sync" size={24} color={Colors.light.rust} />}
              title="Sync Settings"
            />
            <SettingsItem
              icon={<MaterialIcons name="logout" size={24} color={Colors.light.rust} />}
              title="Log Out"
            />
          </SettingsSection>

          {/* App Information */}
          <SettingsSection title="App Information">
            <SettingsItem
              icon={<MaterialIcons name="info-outline" size={24} color={Colors.light.rust} />}
              title="About LinguaLoop"
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="help-circle-outline" size={24} color={Colors.light.rust} />}
              title="Help & Support"
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="star-outline" size={24} color={Colors.light.rust} />}
              title="Rate the App"
            />
            <SettingsItem
              icon={<MaterialCommunityIcons name="android" size={24} color={Colors.light.rust} />}
              title="Version"
              rightElement={<VersionDisplay showBuildNumber />}
            />
          </SettingsSection>
        </View>
      </ScrollView>
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
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 24,
  },
  languageFlags: {
    flexDirection: 'row',
    gap: 8,
  },
  settingValue: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
}); 