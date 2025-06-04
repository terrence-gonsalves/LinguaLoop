import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormInput } from '../../components/forms/FormInput';
import { Language, LanguageDropdown } from '../../components/forms/LanguageDropdown';

export default function OnboardingScreen() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  
  // Form state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState<string | null>(null);
  const [targetLanguages, setTargetLanguages] = useState<string[]>(['']);
  
  // Form errors
  const [usernameError, setUsernameError] = useState('');
  const [aboutMeError, setAboutMeError] = useState('');

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

  function addTargetLanguage() {
    if (targetLanguages.length < 5) {
      setTargetLanguages([...targetLanguages, '']);
    }
  }

  function removeTargetLanguage(index: number) {
    const newTargetLanguages = targetLanguages.filter((_, i) => i !== index);
    setTargetLanguages(newTargetLanguages);
  }

  function updateTargetLanguage(index: number, value: string) {
    const newTargetLanguages = [...targetLanguages];
    newTargetLanguages[index] = value;
    setTargetLanguages(newTargetLanguages);
  }

  async function handleSubmit() {
    if (!profile?.id) return;
    
    // Validate required fields
    if (!nativeLanguage) {
      Alert.alert('Error', 'Please select your native language');
      return;
    }

    if (!targetLanguages[0]) {
      Alert.alert('Error', 'Please select at least one target language');
      return;
    }

    if (username && !validateUsername(username)) return;
    if (aboutMe && !validateAboutMe(aboutMe)) return;

    // Remove empty target languages
    const validTargetLanguages = targetLanguages.filter(lang => lang);

    // Check for duplicate target languages
    const uniqueTargets = new Set(validTargetLanguages);
    if (uniqueTargets.size !== validTargetLanguages.length) {
      Alert.alert('Error', 'Please select different languages for each target language');
      return;
    }

    // Check if native language is selected as target
    if (validTargetLanguages.includes(nativeLanguage)) {
      Alert.alert('Error', 'Your native language cannot be a target language');
      return;
    }

    setIsLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: displayName || null,
          user_name: username || null,
          about_me: aboutMe || null,
          native_language: nativeLanguage,
          onboarding_completed: true,
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Insert target languages
      const languageInserts = validTargetLanguages.map(langId => ({
        user_id: profile.id,
        master_language_id: langId,
        name: languages.find(l => l.id === langId)?.name || '',
      }));

      const { error: languagesError } = await supabase
        .from('languages')
        .insert(languageInserts);

      if (languagesError) throw languagesError;

      // Navigate to dashboard - update to force replace
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome to LinguaLoop!</Text>
        <Text style={styles.subtitle}>Let's set up your learning preferences</Text>

        <View style={styles.form}>
          <FormInput
            label="Display Name (optional)"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your display name"
          />

          <FormInput
            label="Username (optional)"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              validateUsername(text);
            }}
            placeholder="Choose a username"
            error={usernameError}
          />

          <LanguageDropdown
            label="Native Language"
            data={languages}
            value={nativeLanguage}
            onChange={setNativeLanguage}
          />

          <View style={styles.targetLanguagesContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Target Languages</Text>
              {targetLanguages.length < 5 && (
                <Pressable onPress={addTargetLanguage} style={styles.addButton}>
                  <MaterialIcons name="add-circle-outline" size={24} color={Colors.light.rust} />
                </Pressable>
              )}
            </View>

            {targetLanguages.map((lang, index) => (
              <View key={index} style={styles.targetLanguageRow}>
                <View style={styles.targetLanguageDropdown}>
                  <LanguageDropdown
                    label={`Target Language ${index + 1}`}
                    data={languages}
                    value={lang}
                    onChange={(value) => updateTargetLanguage(index, value)}
                    excludeValues={[nativeLanguage || '', ...targetLanguages.filter((_, i) => i !== index)]}
                  />
                </View>
                {index > 0 && (
                  <Pressable
                    onPress={() => removeTargetLanguage(index)}
                    style={styles.removeButton}
                  >
                    <MaterialIcons name="remove-circle-outline" size={24} color={Colors.light.error} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          <FormInput
            label="About Me (optional)"
            value={aboutMe}
            onChangeText={(text) => {
              setAboutMe(text);
              validateAboutMe(text);
            }}
            placeholder="Tell us about yourself (250 characters max)"
            multiline
            numberOfLines={4}
            error={aboutMeError}
          />
        </View>

        <Pressable
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Saving...' : 'Start Learning'}
          </Text>
        </Pressable>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  targetLanguagesContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.textPrimary,
  },
  addButton: {
    padding: 4,
  },
  targetLanguageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetLanguageDropdown: {
    flex: 1,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
    marginTop: -8,
  },
  submitButton: {
    backgroundColor: Colors.light.rust,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.light.textTertiary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 