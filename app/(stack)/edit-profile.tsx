import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/forms/FormInput';
import { Language, LanguageDropdown } from '../../components/forms/LanguageDropdown';

export default function EditProfileScreen() {
  const { profile, reloadProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  
  // form state
  const [displayName, setDisplayName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.user_name || '');
  const [aboutMe, setAboutMe] = useState(profile?.about_me || '');
  const [nativeLanguage, setNativeLanguage] = useState<string | null>(profile?.native_language || null);
  
  // form errors
  const [usernameError, setUsernameError] = useState('');
  const [aboutMeError, setAboutMeError] = useState('');

  // check if username was set during onboarding
  const isUsernameSetDuringOnboarding = Boolean(profile?.user_name);

  useEffect(() => {
    loadLanguages();
  }, []);

  async function loadLanguages() {
    try {
      const { data, error } = await supabase
        .from('master_languages')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error('Error loading languages:', error);
      Alert.alert('Error', 'Failed to load languages. Please try again.');
    }
  }

  function validateUsername(value: string) {
    if (!value) {
      setUsernameError('Username is required');
      return false;
    }
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    if (value.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9._]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, periods, and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  }

  function validateAboutMe(value: string) {
    if (value.length > 250) {
      setAboutMeError('About me must be less than 250 characters');
      return false;
    }
    setAboutMeError('');
    return true;
  }

  async function handleSubmit() {
    if (!profile?.id) {
      console.error('No profile ID found');
      return;
    }
    
    // validate required fields
    if (!nativeLanguage) {
      Alert.alert('Error', 'Please select your native language');
      return;
    }

    if (!isUsernameSetDuringOnboarding && !username) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (username && !validateUsername(username)) return;
    if (aboutMe && !validateAboutMe(aboutMe)) return;

    setIsLoading(true);

    try {
      console.log('Updating profile with data:', {
        name: displayName,
        user_name: isUsernameSetDuringOnboarding ? profile.user_name : username,
        about_me: aboutMe,
        native_language: nativeLanguage,
      });

      // check if username is unique (only if it's being changed)
      if (username && username !== profile.user_name) {
        const { data: existingUser, error: userCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_name', username)
          .neq('id', profile.id)
          .single();

        if (userCheckError && userCheckError.code !== 'PGRST116') {
          console.error('Error checking username uniqueness:', userCheckError);
          throw userCheckError;
        }

        if (existingUser) {
          setUsernameError('This username is already taken');
          setIsLoading(false);
          return;
        }
      }

      // update profile
      const { data, error: profileError } = await supabase
        .from('profiles')
        .update({
          name: displayName || null,
          user_name: isUsernameSetDuringOnboarding ? profile.user_name : username || null,
          about_me: aboutMe || null,
          native_language: nativeLanguage,
        })
        .eq('id', profile.id)
        .select();

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      console.log('Profile updated successfully:', data);

      // reload the profile in the auth context to reflect changes
      await reloadProfile();

      // show success toast and navigate to settings
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });

      // navigate to settings screen
      router.replace('/(tabs)/(settings)');
    } catch (error) {
      console.error('Error saving profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save your profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.light.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Profile Photo Section */}
          <View style={styles.card}>
            <View style={styles.photoSection}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>
                  {displayName ? displayName[0].toUpperCase() : '?'}
                </Text>
              </View>
              <Pressable style={styles.changePhotoButton}>
                <MaterialIcons name="camera-alt" size={16} color={Colors.light.background} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </Pressable>
            </View>
          </View>

          {/* Profile Details Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Profile Details</Text>
            
            <FormInput
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
            />

            <FormInput
              label={isUsernameSetDuringOnboarding ? "Username" : "Username (required)"}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (!isUsernameSetDuringOnboarding) {
                  validateUsername(text);
                }
              }}
              placeholder={isUsernameSetDuringOnboarding ? "Username cannot be changed" : "Choose a username"}
              error={usernameError}
              editable={!isUsernameSetDuringOnboarding}
              helperText={isUsernameSetDuringOnboarding ? "Your username cannot be changed" : undefined}
            />

            <LanguageDropdown
              label="Native Language"
              data={languages}
              value={nativeLanguage}
              onChange={setNativeLanguage}
            />
          </View>

          {/* About Me Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <FormInput
              label="About Me"
              value={aboutMe}
              onChangeText={(text) => {
                setAboutMe(text);
                validateAboutMe(text);
              }}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.aboutMeInput}
              error={aboutMeError}
              helperText={`${aboutMe.length}/250 characters`}
            />
          </View>

          {/* Save Button Section */}
          <View style={styles.card}>
            <Button 
              title={isLoading ? 'Saving...' : 'Save Changes'}
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    gap: 24,
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.formInputBG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoPlaceholderText: {
    fontSize: 36,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  changePhotoButton: {
    backgroundColor: Colors.light.buttonPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changePhotoText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 16,
  },
  aboutMeInput: {
    height: 120,
    paddingTop: 12,
  },
  saveButton: {
    width: '100%',
  },
}); 