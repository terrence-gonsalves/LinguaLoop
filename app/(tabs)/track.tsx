import { LanguageDropdown } from '@/components/forms/LanguageDropdown';
import Colors from '@/constants/Colors';
import { useUserLanguages } from '@/hooks/useUserLanguages';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TrackScreenParams {
  activity?: string;
}

interface ActivityOptionProps {
  title: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
}

const ActivityOption = ({ title, icon, isSelected, onPress }: ActivityOptionProps) => (
  <Pressable 
    style={[styles.activityOption, isSelected && styles.activityOptionSelected]} 
    onPress={onPress}
  >
    <View style={styles.activityContent}>
      <View style={styles.activityIconContainer}>
        {icon}
      </View>
      <Text style={[
        styles.activityOptionText, 
        isSelected && styles.activityOptionTextSelected
      ]}>
        {title}
      </Text>
    </View>
  </Pressable>
);

export default function TrackActivityScreen() {
  const { profile } = useAuth();
  const { languages, isLoading: isLoadingLanguages } = useUserLanguages(profile?.id || '');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  // set initial activity from URL parameter
  useEffect(() => {
    const state = navigation.getState();
    if (state) {
      const route = state.routes.find(route => route.name === 'track');
      const params = route?.params as TrackScreenParams | undefined;
      if (params?.activity) {
        setSelectedActivity(params.activity);
      }
    }
  }, [navigation]);

  // helper to reset all fields
  function resetFields() {
    setDate(new Date());
    setSelectedLanguage(null);
    setSelectedActivity('');
    setDuration(0);
    setNotes('');

    // scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }

  // format date as 'month day, year' and localize
  function formatDate(date: Date) {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // save handler
  const handleSaveActivity = async () => {
    if (!selectedLanguage) {
      showErrorToast('Language Required');
      return;
    }

    if (!selectedActivity) {
      showErrorToast('Activity Type Required');
      return;
    }

    if (!duration || duration <= 0) {
      showErrorToast('Duration Required');
      return;
    }

    if (!profile?.id) {
      showErrorToast('User Error');
      return;
    }

    // lookup activity_id from activities table
    let activityId: string | null = null;

    try {
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('id')
        .eq('name', selectedActivity.charAt(0).toUpperCase() + selectedActivity.slice(1))
        .single();

      if (activityError || !activityData) {
        throw activityError || new Error('Activity not found');
      }

      activityId = activityData.id;
    } catch (err) {
      showErrorToast('Activity Error');
      return;
    }

    // insert into time_entries
    try {
      const { error } = await supabase
        .from('time_entries')
        .insert({
          user_id: profile.id,
          language_id: selectedLanguage,
          activity_id: activityId,
          duration_seconds: duration * 60,
          notes: notes || null,
          activity_date: date,
        });

      if (error) throw error;

      showSuccessToast('Activity Saved');
      resetFields();
    } catch (err: any) {
      showErrorToast('Save Error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.content}>

            {/* header */}
            <Text style={styles.headerTitle}>Track Activity</Text>

            {/* date section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date of Activity</Text>
              <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <MaterialCommunityIcons name="calendar" size={20} color={Colors.light.textSecondary} />
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </Pressable>
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
                  style={styles.datePicker}
                />
              )}
            </View>

            {/* language section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Language</Text>
              <View style={styles.languageDropdownContainer}>
                <MaterialCommunityIcons name="translate" size={20} color={Colors.light.textSecondary} style={styles.languageIcon} />
                <LanguageDropdown
                  label=""
                  data={languages}
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  dropdownStyle={styles.dropdownButton}
                  style={styles.languageDropdown}
                />
              </View>
            </View>

            {/* activity type section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity Type</Text>
              <View style={styles.activityGrid}>
                <ActivityOption
                  title="Listening"
                  icon={<MaterialCommunityIcons name="headphones" size={24} color={selectedActivity === 'listening' ? Colors.light.textTertiary : Colors.light.rust} />}
                  isSelected={selectedActivity === 'listening'}
                  onPress={() => setSelectedActivity('listening')}
                />
                <ActivityOption
                  title="Reading"
                  icon={<Ionicons name="book-outline" size={24} color={selectedActivity === 'reading' ? Colors.light.textTertiary : Colors.light.rust} />}
                  isSelected={selectedActivity === 'reading'}
                  onPress={() => setSelectedActivity('reading')}
                />
                <ActivityOption
                  title="Writing"
                  icon={<MaterialCommunityIcons name="pencil-outline" size={24} color={selectedActivity === 'writing' ? Colors.light.textTertiary : Colors.light.rust} />}
                  isSelected={selectedActivity === 'writing'}
                  onPress={() => setSelectedActivity('writing')}
                />
                <ActivityOption
                  title="Speaking"
                  icon={<MaterialCommunityIcons name="microphone-outline" size={24} color={selectedActivity === 'speaking' ? Colors.light.textTertiary : Colors.light.rust} />}
                  isSelected={selectedActivity === 'speaking'}
                  onPress={() => setSelectedActivity('speaking')}
                />
              </View>
            </View>

            {/* duration section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <View style={styles.durationContainer}>
                <View style={styles.durationInputContainer}>
                  <Pressable 
                    style={styles.durationButton}
                    onPress={() => setDuration(prev => Math.max(0, prev - 1))}
                  >
                    <Text style={styles.durationButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.durationValue}>{duration}</Text>
                  <Pressable 
                    style={styles.durationButton}
                    onPress={() => setDuration(prev => prev + 1)}
                  >
                    <Text style={styles.durationButtonText}>+</Text>
                  </Pressable>
                  <Text style={styles.durationUnit}>minutes</Text>
                </View>
                <View style={styles.quickDurationContainer}>
                  <Pressable style={styles.quickDurationButton} onPress={() => setDuration(prev => prev +15)}>
                    <Text style={styles.quickDurationText}>+ 15 min</Text>
                  </Pressable>
                  <Pressable style={styles.quickDurationButton} onPress={() => setDuration(prev => prev +30)}>
                    <Text style={styles.quickDurationText}>+ 30 min</Text>
                  </Pressable>
                  <Pressable style={styles.quickDurationButton} onPress={() => setDuration(prev => prev +60)}>
                    <Text style={styles.quickDurationText}>+ 60 min</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* notes section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add details about your study session, e.g., 'Reviewed vocabulary on fruits' or 'Practiced pronunciation of 'R' sound.'"
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={200}
                value={notes}
                onChangeText={setNotes}
              />
              <Text style={styles.characterCount}>{notes.length}/200 characters</Text>
            </View>

            {/* save button */}
            <Pressable style={styles.saveButton} onPress={handleSaveActivity}>
              <Text style={styles.saveButtonText}>Save Activity</Text>
            </Pressable>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownButton: {
    borderWidth: 0,
  },
  dateText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  activityOption: {
    backgroundColor: Colors.light.background,
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityOptionSelected: {
    backgroundColor: Colors.light.rust,
  },
  activityOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  activityOptionTextSelected: {
    color: Colors.light.textTertiary,
  },
  durationContainer: {
    gap: 16,
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  durationButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.background,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 24,
    color: Colors.light.textPrimary,
  },
  durationValue: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    minWidth: 60,
    textAlign: 'center',
  },
  durationUnit: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  quickDurationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickDurationButton: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickDurationText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  notesInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    color: Colors.light.textPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: Colors.light.buttonBG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 5,
    gap: 8,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textLight,
  },
  languageDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 56,
  },
  languageIcon: {
    marginRight: 0,
  },
  languageDropdown: {
    flex: 1,
    marginBottom: 0,
  },
  datePicker: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});
