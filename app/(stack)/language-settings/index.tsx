import { LanguageFlag } from '@/components/LanguageFlag';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Language {
  id: string;
  name: string;
  flag: string | null;
}

interface LanguageResponse {
  id: string;
  master_language_id: string;
  master_languages: {
    id: string;
    name: string;
    flag: string | null;
  };
}

export default function LanguageSettingsScreen() {
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);

  useEffect(() => {
    fetchUserLanguages();
  }, []);

  const fetchUserLanguages = async () => {
    try {
      const { data: languages, error } = await supabase
        .from('languages')
        .select('id, master_language_id, master_languages(id, name, flag)')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // cast to unknown first to avoid type error
      const typedLanguages = (languages as unknown) as LanguageResponse[];
      const formattedLanguages = typedLanguages.map(lang => ({
        id: lang.id,
        name: lang.master_languages.name,
        flag: lang.master_languages.flag,
      }));

      setSelectedLanguages(formattedLanguages);
    } catch (error) {
      console.error('Error fetching languages:', error);
      Alert.alert('Error', 'Failed to load languages');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserLanguages();
    }, [])
  );

  const handleRemoveLanguage = (language: Language) => {
    Alert.alert(
      'Remove Language',
      'Are you sure you want to remove this language? All data related to this language will be removed and cannot be restored.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('languages')
                .delete()
                .eq('id', language.id);

              if (error) throw error;

              // refresh the language list after successful deletion
              fetchUserLanguages();
            } catch (error) {
              console.error('Error removing language:', error);
              Alert.alert('Error', 'Failed to remove language');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Languages',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.light.background },
        }} 
      />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Languages</Text>
          
          <View style={styles.languageList}>
            {selectedLanguages.map((language) => (
              <Pressable
                key={language.id}
                style={styles.languageItem}
              >
                <View style={styles.languageInfo}>
                  <LanguageFlag
                    name={language.name}
                    flagUrl={language.flag}
                  />
                  <Text style={styles.languageName}>{language.name}</Text>
                </View>
                <Pressable
                  onPress={() => handleRemoveLanguage(language)}
                  hitSlop={8}
                  disabled={selectedLanguages.length === 1}
                  style={({ pressed }) => [
                    styles.removeButton,
                    selectedLanguages.length === 1 && styles.removeButtonDisabled,
                    pressed && { opacity: 0.7 }
                  ]}
                >
                  <MaterialIcons 
                    name="remove-circle-outline" 
                    size={24} 
                    color={selectedLanguages.length === 1 ? Colors.light.border : Colors.light.textSecondary} 
                  />
                </Pressable>
              </Pressable>
            ))}
          </View>

          <Pressable 
            style={styles.addButton}
            onPress={() => router.push('/(stack)/language-settings/add')}
          >
            <Text style={styles.addButtonText}>+ Add New Language</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  languageList: {
    backgroundColor: Colors.light.background,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  addButton: {
    padding: 16,
  },
  addButtonText: {
    color: Colors.light.rust,
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  removeButtonDisabled: {
    opacity: 0.5,
  },
}); 