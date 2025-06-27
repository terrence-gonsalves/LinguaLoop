import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LanguageFlag } from '@/components/LanguageFlag';
import { SetLevelModal } from '@/components/language-level/SetLevelModal';
import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const PROFICIENCY_LABELS: Record<string, { label: string; color: string }> = {
  Beginner: { label: 'Beginner', color: '#A3BFFA' },
  'Lower Intermediate': { label: 'Lower Intermediate', color: '#F7D070' },
  Intermediate: { label: 'Intermediate', color: '#F7B801' },
  'Upper Intermediate': { label: 'Upper Intermediate', color: '#F6A623' },
  Advanced: { label: 'Advanced', color: '#4ECDC4' },
  'Upper Advanced': { label: 'Upper Advanced', color: '#36B37E' },
  Fluent: { label: 'Fluent', color: '#3DD598' },
};

interface Language {
  id: string;
  name: string;
  flag: string | null;
  proficiency_level: string | null;
}

interface LanguageResponse {
  id: string;
  proficiency_level: string | null;
  master_languages: {
    id: string;
    name: string;
    flag: string | null;
  };
}

export default function LanguageLevelScreen() {
  const { profile } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  useEffect(() => {
    fetchLanguages();
  }, [profile?.id]);

  const fetchLanguages = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('id, proficiency_level, master_languages(id, name, flag)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const formatted = data.map((lang: any) => ({
        id: lang.id,
        name: lang.master_languages.name,
        flag: lang.master_languages.flag,
        proficiency_level: lang.proficiency_level,
      }));
      setLanguages(formatted);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSetLevel = (language: Language) => {
    setSelectedLanguage(language);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedLanguage(null);
  };

  const handleLevelUpdated = () => {
    fetchLanguages(); // refresh the languages list
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set Your Language Levels</Text>
          <View style={styles.languageList}>
            {languages.map((language) => (
              <View key={language.id} style={styles.languageCard}>
                <View style={styles.languageHeader}>
                  <LanguageFlag name={language.name} flagUrl={language.flag} />
                  <Text style={styles.languageName}>{language.name}</Text>
                </View>
                <View style={styles.levelContainer}>
                  <Text style={styles.levelLabel}>Current Level: </Text>
                  {language.proficiency_level ? (
                    <View style={[styles.levelBadge, { backgroundColor: PROFICIENCY_LABELS[language.proficiency_level]?.color || '#E0E0E0' }] }>
                      <Text style={styles.levelBadgeText}>{PROFICIENCY_LABELS[language.proficiency_level]?.label || language.proficiency_level}</Text>
                    </View>
                  ) : (
                    <Text style={styles.levelNotSet}>Not set</Text>
                  )}
                </View>
                <Pressable
                  style={styles.setLevelButton}
                  onPress={() => handleSetLevel(language)}
                >
                  <Text style={styles.setLevelButtonText}>
                    {language.proficiency_level ? 'Update Level' : 'Set Level'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* modal */}
      {selectedLanguage && (
        <SetLevelModal
          visible={modalVisible}
          onClose={handleModalClose}
          languageId={selectedLanguage.id}
          currentLevel={selectedLanguage.proficiency_level || ''}
          languageName={selectedLanguage.name}
          onSuccess={handleLevelUpdated}
        />
      )}
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
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  languageList: {
    gap: 16,
    marginHorizontal: 8,
  },
  languageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginLeft: 12,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginRight: 4,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelBadgeText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 13,
  },
  levelNotSet: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  setLevelButton: {
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  setLevelButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 15,
  },
});