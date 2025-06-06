import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Language {
  id: string;
  name: string;
  selected?: boolean;
}

export default function AddLanguageScreen() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    fetchAvailableLanguages();
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const fetchAvailableLanguages = async () => {
    try {
      const { data: masterLanguages, error: masterError } = await supabase
        .from('master_languages')
        .select('id, name')
        .order('name');

      if (masterError) throw masterError;

      const { data: userLanguages, error: userError } = await supabase
        .from('languages')
        .select('master_language_id');

      if (userError) throw userError;

      const userLanguageIds = userLanguages.map(lang => lang.master_language_id);
      
      const availableLanguages = masterLanguages
        .filter(lang => !userLanguageIds.includes(lang.id))
        .map(lang => ({
          id: lang.id,
          name: lang.name,
          selected: false,
        }));

      setLanguages(availableLanguages);
    } catch (error) {
      console.error('Error fetching languages:', error);
      Alert.alert('Error', 'Failed to load available languages');
    }
  };

  const handleToggleLanguage = (languageId: string) => {
    setLanguages(prev => {
      const updated = prev.map(lang => {
        if (lang.id === languageId) {
          return { ...lang, selected: !lang.selected };
        }
        return lang;
      });
      
      setSelectedCount(updated.filter(lang => lang.selected).length);
      return updated;
    });
  };

  const handleAddLanguages = async () => {
    try {
      const selectedLanguages = languages.filter(lang => lang.selected);
      
      const { error } = await supabase
        .from('languages')
        .insert(
          selectedLanguages.map(lang => ({
            master_language_id: lang.id,
            name: lang.name
          }))
        );

      if (error) throw error;

      router.back();
    } catch (error) {
      console.error('Error adding languages:', error);
      Alert.alert('Error', 'Failed to add selected languages');
    }
  };

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Add target language</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <ScrollView style={styles.languageList}>
          {filteredLanguages.map((language) => (
            <Pressable
              key={language.id}
              style={styles.languageItem}
              onPress={() => handleToggleLanguage(language.id)}
            >
              <View style={styles.languageInfo}>
                <View style={styles.flagPlaceholder}>
                  <Text style={styles.flagPlaceholderText}>
                    {language.name[0]}
                  </Text>
                </View>
                <Text style={styles.languageName}>{language.name}</Text>
              </View>
              <MaterialIcons
                name={language.selected ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={language.selected ? Colors.light.rust : Colors.light.textSecondary}
              />
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={styles.cancelButton}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[
              styles.addButton,
              selectedCount === 0 && styles.addButtonDisabled
            ]}
            onPress={handleAddLanguages}
            disabled={selectedCount === 0}
          >
            <Text style={[
              styles.addButtonText,
              selectedCount === 0 && styles.addButtonTextDisabled
            ]}>
              Add Language
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  searchContainer: {
    margin: 16,
  },
  searchInput: {
    backgroundColor: Colors.light.generalBG,
    padding: 12,
    borderRadius: 8,
    color: Colors.light.text,
    fontSize: 16,
  },
  languageList: {
    flex: 1,
    marginHorizontal: 16,
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
    flex: 1,
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
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.rust,
    borderRadius: 8,
    marginLeft: 8,
  },
  addButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  addButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '500',
  },
  addButtonTextDisabled: {
    color: Colors.light.textSecondary,
  },
}); 