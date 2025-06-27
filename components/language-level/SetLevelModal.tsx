import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

const PROFICIENCY_LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Lower Intermediate', label: 'Lower Intermediate' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Upper Intermediate', label: 'Upper Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Upper Advanced', label: 'Upper Advanced' },
  { value: 'Fluent', label: 'Fluent' },
];

interface SetLevelModalProps {
  visible: boolean;
  onClose: () => void;
  languageId: string;
  currentLevel: string;
  languageName: string;
  onSuccess?: () => void;
}

export function SetLevelModal({
  visible,
  onClose,
  languageId,
  currentLevel,
  languageName,
  onSuccess,
}: SetLevelModalProps) {
  const { profile } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState(currentLevel || 'Beginner');
  const [isLoading, setIsLoading] = useState(false);

  // reset selected level when modal opens with new data
  useEffect(() => {
    if (visible) {
      setSelectedLevel(currentLevel || 'Beginner');
    }
  }, [visible, currentLevel]);

  const handleSave = async () => {
    if (!profile?.id || !languageId) {
      showErrorToast('Missing user or language information');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('languages')
        .update({
          proficiency_level: selectedLevel,
        })
        .eq('id', languageId)
        .eq('user_id', profile.id);

      if (error) throw error;

      showSuccessToast('Language level updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating language level:', error);
      showErrorToast('Failed to update language level');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.modalContainer}>
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          {/* header */}
          <View style={styles.header}>
            <Text style={styles.title}>Set Language Level</Text>
            <Text style={styles.subtitle}>{languageName}</Text>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={Colors.light.textSecondary} />
            </Pressable>
          </View>

          {/* content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>
              Choose the level that best describes your current ability in this language
            </Text>

            <View style={styles.levelsContainer}>
              {PROFICIENCY_LEVELS.map((level) => (
                <Pressable
                  key={level.value}
                  style={[
                    styles.levelOption,
                    selectedLevel === level.value && styles.levelOptionSelected,
                  ]}
                  onPress={() => setSelectedLevel(level.value)}
                >
                  <Text
                    style={[
                      styles.levelText,
                      selectedLevel === level.value && styles.levelTextSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* footer */}
          <View style={styles.footer}>
            <Pressable
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Level'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  levelsContainer: {
    marginBottom: 20,
  },
  levelOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginBottom: 12,
    backgroundColor: Colors.light.background,
  },
  levelOptionSelected: {
    borderColor: Colors.light.rust,
    backgroundColor: Colors.light.rust + '20',
  },
  levelText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
  },
  levelTextSelected: {
    color: Colors.light.rust,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  saveButton: {
    backgroundColor: Colors.light.rust,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.light.textTertiary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 