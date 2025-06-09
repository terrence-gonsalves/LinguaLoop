import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/forms/FormInput';
import { ImageUpload } from '../../components/forms/ImageUpload';
import { Language, LanguageDropdown } from '../../components/forms/LanguageDropdown';
import { deleteAvatar, uploadAvatar } from '../../lib/supabase/storage';

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

      // reload the profile in the auth context to reflect changes
      await reloadProfile();

      // show success toast and navigate to settings
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });

      // navigate to settings screen
      router.replace('/(tabs)/settings');
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

      Toast.show({
        type: 'success',
        text1: 'Profile Photo Updated',
        text2: 'Your profile photo has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile photo:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update profile photo. Please try again.',
      });
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

      Toast.show({
        type: 'success',
        text1: 'Profile Photo Removed',
        text2: 'Your profile photo has been removed successfully',
      });
    } catch (error) {
      console.error('Error removing profile photo:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove profile photo. Please try again.',
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Profile Photo Section */}
          <View style={styles.card}>
            <View style={styles.photoSection}>
              <ImageUpload
                size={120}
                currentImageUrl={profile?.avatar_url}
                onImageSelected={handleImageSelected}
                onImageRemoved={handleImageRemoved}
                letter={displayName ? displayName[0].toUpperCase() : '?'}
              />
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
            />
            <Text style={styles.characterCount}>
              {aboutMe.length}/250 characters
            </Text>
          </View>

          <Button
            title="Save Changes"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  photoSection: {
    alignItems: 'center',
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  aboutMeInput: {
    height: 120,
    textAlignVertical: 'top',
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
}); 