import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../app/providers/theme-provider';

const ACHIEVEMENT_TYPES = [
  { value: 'award', label: 'Award', icon: 'trophy-outline' },
  { value: 'certificate', label: 'Certificate', icon: 'certificate-outline' },
  { value: 'course', label: 'Course', icon: 'book-open-outline' },
  { value: 'badge', label: 'Badge', icon: 'shield-star-outline' },
  { value: 'other', label: 'Other', icon: 'star-outline' },
];

interface AddAchievementModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
  saveLabel?: string;
}

export default function AddAchievementModal({ visible, onClose, onAdded, saveLabel }: AddAchievementModalProps) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('award');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setTitle('');
    setType('award');
    setDate(new Date());
    setNotes('');
    setError(null);
  }

  // format date as 'month day, year' and localize
  function formatDate(date: Date) {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  async function handleSave() {
    if (!title.trim() || !type || !date) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    
    const { error: insertError } = await supabase.from('achievements').insert({
      user_id: profile?.id,
      type,
      title,
      notes: notes || null,
      obtained_date: date.toISOString().split('T')[0],
    });

    setLoading(false);

    if (insertError) {
      setError('Failed to save achievement.');
      return;
    }

    resetForm();
    onAdded();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Achievement</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={28} color={Colors.light.textPrimary} />
            </Pressable>
          </View>
          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Achievement *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Completed B2 Exam"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.label}>Achievement Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow} contentContainerStyle={{ gap: 8 }}>
              {ACHIEVEMENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.typeChip, type === t.value && styles.typeChipSelected]}
                  onPress={() => setType(t.value)}
                >
                  <MaterialCommunityIcons name={t.icon as any} size={22} color={type === t.value ? Colors.light.background : Colors.light.textSecondary} />
                  <Text style={[styles.typeChipText, type === t.value && styles.typeChipTextSelected]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Date Obtained *</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <MaterialCommunityIcons name="calendar" size={20} color={Colors.light.textSecondary} />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
                locale={undefined}
              />
            )}
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add details about this achievement..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={8}
              maxLength={200}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Pressable style={styles.saveButton} onPress={handleSave} disabled={loading}>
              <Text style={styles.saveButtonText}>{loading ? 'Saving...' : (saveLabel || 'Save Achievement')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '80%',
    maxHeight: '95%',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.generalBG,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.light.generalBG,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: Colors.light.textPrimary,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.generalBG,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  typeChipSelected: {
    backgroundColor: Colors.light.rust,
  },
  typeChipText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    marginLeft: 6,
  },
  typeChipTextSelected: {
    color: Colors.light.background,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.generalBG,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
    marginTop: 2,
  },
  dateText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  notesInput: {
    backgroundColor: Colors.light.generalBG,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: Colors.light.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.light.error,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginTop: 18,
  },
  saveButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 