import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router/stack';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { FormInput } from '@/components/forms/FormInput';
import { LanguageDropdown } from '@/components/forms/LanguageDropdown';

import Colors from '@/constants/Colors';

import { useUserLanguages } from '@/hooks/useUserLanguages';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { showErrorToast, showSuccessToast } from '@/lib/toast';

interface TimeEntry {
  id: string;
  activity_date: string;
  duration_seconds: number;
  notes: string | null;
  activity_id: string;
  language_id: string;
  associated_goal_id: string | null;
  activities: {
    name: string;
  } | null;
  languages: {
    name: string;
  } | null;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: string;
  status: string;
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

export default function EditActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { languages, isLoading: isLoadingLanguages } = useUserLanguages(profile?.id || '');
  
  const [timeEntry, setTimeEntry] = useState<TimeEntry | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // form state
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (id && profile?.id) {
      fetchTimeEntry();
      fetchGoals();
    }
  }, [id, profile?.id]);

  async function fetchTimeEntry() {
    if (!id || !profile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          activity_date,
          duration_seconds,
          notes,
          activity_id,
          language_id,
          associated_goal_id,
          activities(name),
          languages(name)
        `)
        .eq('id', id)
        .eq('user_id', profile.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setTimeEntry(data as any);
        setSelectedActivity((data.activities as any)?.name || '');
        setSelectedLanguage(data.language_id);
        setSelectedGoal(data.associated_goal_id);
        setDuration(Math.floor(data.duration_seconds / 60));
        setNotes(data.notes || '');
        setDate(new Date(data.activity_date));
      }
    } catch (error) {
      console.error('Error fetching time entry:', error);
      showErrorToast('Failed to load activity');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function fetchGoals() {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('id, title, description, goal_type, status')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

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

    if (!profile?.id || !id) {
      showErrorToast('User Error');
      return;
    }

    setSaving(true);

    try {
        
      // lookup activity_id from activities table
      let activityId: string | null = null;

      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('id')
        .eq('name', selectedActivity.charAt(0).toUpperCase() + selectedActivity.slice(1))
        .single();

      if (activityError || !activityData) {
        throw activityError || new Error('Activity not found');
      }

      activityId = activityData.id;

      // update time_entries
      const { error } = await supabase
        .from('time_entries')
        .update({
          language_id: selectedLanguage,
          activity_id: activityId,
          duration_seconds: duration * 60,
          notes: notes || null,
          activity_date: date.toISOString(),
          associated_goal_id: selectedGoal,
        })
        .eq('id', id)
        .eq('user_id', profile.id);

      if (error) throw error;

      showSuccessToast('Activity Updated');
      router.back();
    } catch (err: any) {
      console.error('Error updating activity:', err);
      showErrorToast('Update Error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{
          title: 'Edit Activity',
          headerShadowVisible: true,
        }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.rust} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <Stack.Screen options={{
            title: 'Edit Activity',
            headerShadowVisible: true,
       }} />
      
      <KeyboardAwareScrollView
        contentContainerStyle={styles.keyboardContainer}
        bottomOffset={50}
        style={styles.keyboardAvoidingView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

          {/* date selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={Colors.light.textSecondary}
              />
            </Pressable>
          </View>

          {/* language selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language</Text>
            <LanguageDropdown
              label=""
              data={languages}
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              dropdownStyle={styles.dropdownStyle}
            />
          </View>

          {/* activity type selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Type</Text>
            <View style={styles.activityGrid}>
              <ActivityOption
                title="Reading"
                icon={<Ionicons name="book" size={24} color={Colors.light.activityBlue1} />}
                isSelected={selectedActivity === 'reading'}
                onPress={() => setSelectedActivity('reading')}
              />
              <ActivityOption
                title="Writing"
                icon={<Ionicons name="create" size={24} color={Colors.light.activityBlue2} />}
                isSelected={selectedActivity === 'writing'}
                onPress={() => setSelectedActivity('writing')}
              />
              <ActivityOption
                title="Speaking"
                icon={<Ionicons name="mic" size={24} color={Colors.light.activityOrange} />}
                isSelected={selectedActivity === 'speaking'}
                onPress={() => setSelectedActivity('speaking')}
              />
              <ActivityOption
                title="Listening"
                icon={<Ionicons name="headset" size={24} color={Colors.light.activityPink} />}
                isSelected={selectedActivity === 'listening'}
                onPress={() => setSelectedActivity('listening')}
              />
            </View>
          </View>

          {/* duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration (minutes)</Text>
            <TextInput
              style={styles.durationInput}
              value={duration.toString()}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setDuration(value);
              }}
              keyboardType="numeric"
              placeholder="Enter duration in minutes"
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>

          {/* associated goal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Associated Goal (Optional)</Text>
            <View style={styles.goalDropdown}>
              <Pressable
                style={styles.goalButton}
                onPress={() => {
                  Alert.alert(
                    'Select Goal',
                    'Choose a goal to associate with this activity',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'No Goal', style: 'destructive', onPress: () => setSelectedGoal(null) },
                      ...goals.map(goal => ({
                        text: goal.title,
                        onPress: () => setSelectedGoal(goal.id)
                      }))
                    ]
                  );
                }}
              >
                <Text style={styles.goalButtonText}>
                  {selectedGoal 
                    ? goals.find(g => g.id === selectedGoal)?.title || 'Unknown Goal'
                    : 'Select a goal (optional)'
                  }
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={Colors.light.textSecondary}
                />
              </Pressable>
            </View>
          </View>

            {/* notes */}
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Notes (Optional)</Text>
             <FormInput
               label=""
               value={notes}
               onChangeText={setNotes}
               placeholder="Add notes about this activity..."
               multiline
               numberOfLines={4}
               style={styles.notesInput}
             />
           </View>
         </View>
       </KeyboardAwareScrollView>

       {/* bottom action buttons */}
       <View style={styles.bottomActions}>
            <Pressable 
                style={styles.cancelButton} 
                onPress={handleCancel}
            >
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                onPress={handleSaveActivity}
                disabled={saving}
            >
                <Text style={[styles.saveButtonText, saving && styles.saveButtonTextDisabled]}>
                        {saving ? 'Saving...' : 'Save'}
                </Text>
            </Pressable>
       </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardContainer: {
    padding: 16,
    gap: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
     content: {
     padding: 16,
   },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  dropdownStyle: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  activityOptionSelected: {
    backgroundColor: Colors.light.generalBG,
    borderColor: Colors.light.rust,
  },
  activityContent: {
    alignItems: 'center',
    gap: 8,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activityOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'center',
  },
  activityOptionTextSelected: {
    color: Colors.light.rust,
  },
  durationInput: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  goalDropdown: {
    marginBottom: 16,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  goalButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
     notesInput: {
     backgroundColor: Colors.light.background,
     borderWidth: 1,
     borderColor: Colors.light.border,
   },
   bottomActions: {
     flexDirection: 'row',
     padding: 16,
     gap: 12,
     borderTopWidth: 1,
     borderTopColor: Colors.light.border,
     backgroundColor: Colors.light.background,
   },
   cancelButton: {
     flex: 1,
     paddingVertical: 12,
     alignItems: 'center',
     justifyContent: 'center',
   },
   cancelButtonText: {
     fontSize: 16,
     fontWeight: '600',
     color: Colors.light.textSecondary,
   },
   saveButton: {
     flex: 1,
     backgroundColor: Colors.light.rust,
     paddingVertical: 12,
     borderRadius: 8,
     alignItems: 'center',
     justifyContent: 'center',
   },
   saveButtonDisabled: {
     opacity: 0.5,
   },
   saveButtonText: {
     fontSize: 16,
     fontWeight: '600',
     color: Colors.light.background,
   },
   saveButtonTextDisabled: {
     color: Colors.light.textSecondary,
   },
 });