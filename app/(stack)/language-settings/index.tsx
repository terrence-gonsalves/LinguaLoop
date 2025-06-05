import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Language {
  id: string;
  name: string;
}

interface LanguageResponse {
  id: string;
  master_language_id: string;
  master_languages: {
    id: string;
    name: string;
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
        .select('id, master_language_id, master_languages(id, name)')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Cast to unknown first to avoid type error
      const typedLanguages = (languages as unknown) as LanguageResponse[];
      const formattedLanguages = typedLanguages.map(lang => ({
        id: lang.id,
        name: lang.master_languages.name,
      }));

      setSelectedLanguages(formattedLanguages);
    } catch (error) {
      console.error('Error fetching languages:', error);
      Alert.alert('Error', 'Failed to load languages');
    }
  };

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

              setSelectedLanguages(prev => 
                prev.filter(lang => lang.id !== language.id)
              );
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
          headerStyle: { backgroundColor: Colors.light.generalBG },
        }} 
      />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Target Languages</Text>
        
        <View style={styles.languageList}>
          {selectedLanguages.map((language) => (
            <View key={language.id} style={styles.languageItem}>
              <View style={styles.languageInfo}>
                <View style={styles.flagPlaceholder}>
                  <Text style={styles.flagPlaceholderText}>
                    {language.name[0]}
                  </Text>
                </View>
                <Text style={styles.languageName}>{language.name}</Text>
              </View>
              <Pressable
                onPress={() => handleRemoveLanguage(language)}
                hitSlop={8}
              >
                <MaterialIcons 
                  name="remove-circle-outline" 
                  size={24} 
                  color={Colors.light.textSecondary} 
                />
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable 
          style={styles.addButton}
          onPress={() => router.push('/(stack)/language-settings/add')}
        >
          <Text style={styles.addButtonText}>+ Add New Language</Text>
        </Pressable>
      </ScrollView>
    </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  languageList: {
    backgroundColor: Colors.light.background,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagPlaceholderText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '600',
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
}); 