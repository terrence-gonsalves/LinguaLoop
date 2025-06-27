import DefaultAvatar from '@/components/DefaultAvatar';
import { useAuth } from '@/lib/auth-context';
import { Colors as defaultColors } from '@/providers/theme-provider';
import { MaterialIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { signOut, profile } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const settingsItems = [
    {
      title: 'Account',
      items: [
        {
          label: 'Edit Profile',
          icon: 'person',
          href: '/(stack)/edit-profile',
        },
        {
          label: 'Languages',
          icon: 'language',
          href: '/(stack)/language-settings',
        },
        {
          label: 'Language Level',
          icon: 'language',
          href: '/(stack)/language-level',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          label: 'Notifications',
          icon: 'notifications',
          href: '/(stack)/notifications',
        },
        {
          label: 'Goals',
          icon: 'check-box',
          href: '/(stack)/goals',
        },
        // {
        //   label: 'Privacy',
        //   icon: 'lock',
        //   href: '/(stack)/privacy',
        // },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          label: 'Help Center',
          icon: 'help',
          href: '/(stack)/help',
        },
        {
          label: 'Feedback',
          icon: 'feedback',
          href: '/(stack)/feedback',
        },
        {
          label: 'About',
          icon: 'info',
          href: '/(stack)/about',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {profile?.avatar_url ? (
            <ExpoImage
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <DefaultAvatar 
              size={80} 
              letter={profile?.name ? profile.name[0].toUpperCase() : '?'} 
            />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name || 'User'}</Text>
            <Text style={styles.username}>@{profile?.user_name || ''}</Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsItems.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <Pressable 
                key={item.label} 
                style={[
                  styles.settingItem,
                  itemIndex === section.items.length - 1 && styles.lastItem
                ]}
                onPress={() => router.push(item.href)}
              >
                <View style={styles.settingItemContent}>
                  <MaterialIcons name={item.icon as any} size={24} color={defaultColors.light.text} />
                  <Text style={styles.settingItemLabel}>{item.label}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={defaultColors.light.textSecondary} />
              </Pressable>
            ))}
          </View>
        ))}

        {/* Sign Out Button */}
        <Pressable onPress={handleSignOut} style={styles.signOutButton}>
          <MaterialIcons name="logout" size={24} color={defaultColors.light.buttonPrimary} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultColors.light.generalBG,
  },
  profileSection: {
    backgroundColor: defaultColors.light.background,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: defaultColors.light.border,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: defaultColors.light.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: defaultColors.light.textSecondary,
  },
  section: {
    marginTop: 24,
  },
  firstSection: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: defaultColors.light.textSecondary,
    marginLeft: 16,
    marginBottom: 8,
  },
  settingItem: {
    backgroundColor: defaultColors.light.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: defaultColors.light.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemLabel: {
    fontSize: 16,
    color: defaultColors.light.text,
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: defaultColors.light.background,
  },
  signOutText: {
    marginLeft: 8,
    fontSize: 16,
    color: defaultColors.light.buttonPrimary,
    fontWeight: '600',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
}); 