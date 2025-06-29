import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { FormInput } from '@/components/forms/FormInput';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { Language, LanguageDropdown } from '@/components/forms/LanguageDropdown';
import Colors from '@/constants/Colors';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { deleteAvatar, uploadAvatar } from '@/lib/supabase/storage';
import { showErrorToast, showSuccessToast } from '@/lib/toast';

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
        .select('id, name, flag')
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
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: displayName || null,
          user_name: isUsernameSetDuringOnboarding ? profile.user_name : username || null,
          about_me: aboutMe || null,
          native_language: nativeLanguage,
        })
        .eq('id', profile.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      // reload the profile in the auth context to reflect changes
      await reloadProfile();

      // show success toast and navigate to settings
      showSuccessToast('Profile Updated');

      // navigate to settings screen
      router.replace('/(tabs)/settings');
    } catch (error) {
      console.error('Error saving profile:', error);
      showErrorToast('Failed to save your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageSelected(imageUri: string) {
    if (!profile?.id) return;

    try {
      
      // upload the image to Supabase Storage
      const publicUrl = await uploadAvatar(profile.id, imageUri);

      // update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // reload the profile to update the UI
      await reloadProfile();

      showSuccessToast('Profile Photo Updated');
    } catch (error) {
      console.error('Error updating profile photo:', error);
      showErrorToast('Failed to update profile photo. Please try again.');
    }
  }

  async function handleImageRemoved() {
    if (!profile?.id) return;

    try {
      
      // delete the image from Supabase Storage
      await deleteAvatar(profile.id);

      // update the profile to remove the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // reload the profile to update the UI
      await reloadProfile();

      showSuccessToast('Profile Photo Removed');
    } catch (error) {
      console.error('Error removing profile photo:', error);
      showErrorToast('Failed to remove profile photo. Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>

            {/* profile photo section */}
            <View style={styles.card}>
              <View style={styles.photoSection}>
                <ImageUpload
                  size={120}
                  currentImageUrl={profile?.avatar_url}
                  onImageSelected={handleImageSelected}
                  onImageRemoved={handleImageRemoved}
                  letter={profile?.name?.[0] || profile?.user_name?.[0] || '?'}
                />
              </View>
            </View>

            {/* form fields */}
            <View style={styles.card}>
              <FormInput
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                autoCapitalize="words"
              />

              <FormInput
                label="Username"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  validateUsername(text);
                }}
                placeholder="Enter your username"
                autoCapitalize="none"
                error={usernameError}
                editable={!isUsernameSetDuringOnboarding}
              />

              <FormInput
                label="About Me"
                value={aboutMe}
                onChangeText={(text) => {
                  setAboutMe(text);
                  validateAboutMe(text);
                }}
                placeholder="Tell us about yourself"
                multiline
                maxLength={250}
                error={aboutMeError}
                style={styles.aboutMeInput}
                textAlignVertical="top"
              />
              {aboutMe ? (
                <Text style={styles.characterCount}>
                  {aboutMe.length}/250
                </Text>
              ) : null}

              <LanguageDropdown
                label="Native Language"
                data={languages}
                value={nativeLanguage}
                onChange={setNativeLanguage}
                dropdownStyle={styles.profileDropdown}
              />
            </View>

            <Button
              title="Save Changes"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
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
    backgroundColor: Colors.light.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  photoSection: {
    alignItems: 'center',
  },
  aboutMeInput: {
    height: 120,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'right',
    marginTop: -12,
  },
  submitButton: {
    marginTop: 8,
  },
  profileDropdown: {
    height: 44,
    backgroundColor: Colors.light.formInputBG,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
}); 