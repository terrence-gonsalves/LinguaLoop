import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');

  const handleSaveActivity = () => {
    // TODO: Implement save functionality
    console.log({
      activity: selectedActivity,
      duration,
      notes,
      date: new Date()
    });
  };

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
          <View style={styles.content}>
            {/* Header */}
            <Text style={styles.headerTitle}>Track Activity</Text>

            {/* Date Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date of Activity</Text>
              <Pressable style={styles.dateButton}>
                <MaterialCommunityIcons name="calendar" size={20} color={Colors.light.textSecondary} />
                <Text style={styles.dateText}>May 31st, 2025</Text>
              </Pressable>
            </View>

            {/* Activity Type Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity Type</Text>
              <View style={styles.activityGrid}>
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
                  title="Listening"
                  icon={<MaterialCommunityIcons name="headphones" size={24} color={selectedActivity === 'listening' ? Colors.light.textTertiary : Colors.light.rust} />}
                  isSelected={selectedActivity === 'listening'}
                  onPress={() => setSelectedActivity('listening')}
                />
                <ActivityOption
                  title="Speaking"
                  icon={<MaterialCommunityIcons name="microphone-outline" size={24} color={selectedActivity === 'speaking' ? Colors.light.textTertiary : Colors.light.rust} />}
                  isSelected={selectedActivity === 'speaking'}
                  onPress={() => setSelectedActivity('speaking')}
                />
              </View>
            </View>

            {/* Duration Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <View style={styles.durationContainer}>
                <View style={styles.durationInputContainer}>
                  <Pressable 
                    style={styles.durationButton}
                    onPress={() => setDuration(prev => Math.max(0, prev - 5))}
                  >
                    <Text style={styles.durationButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.durationValue}>{duration}</Text>
                  <Pressable 
                    style={styles.durationButton}
                    onPress={() => setDuration(prev => prev + 5)}
                  >
                    <Text style={styles.durationButtonText}>+</Text>
                  </Pressable>
                  <Text style={styles.durationUnit}>minutes</Text>
                </View>
                <View style={styles.quickDurationContainer}>
                  <Pressable style={styles.quickDurationButton} onPress={() => setDuration(15)}>
                    <Text style={styles.quickDurationText}>+15 min</Text>
                  </Pressable>
                  <Pressable style={styles.quickDurationButton} onPress={() => setDuration(30)}>
                    <Text style={styles.quickDurationText}>+30 min</Text>
                  </Pressable>
                  <Pressable style={styles.quickDurationButton} onPress={() => setDuration(60)}>
                    <Text style={styles.quickDurationText}>+60 min</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Notes Section */}
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

            {/* Save Button */}
            <Pressable style={styles.saveButton} onPress={handleSaveActivity}>
              <MaterialCommunityIcons name="check-circle-outline" size={24} color={Colors.light.textTertiary} />
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
    marginBottom: 24,
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
  dateText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  activityOption: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
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
    backgroundColor: Colors.light.ice,
    borderRadius: 20,
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
    borderRadius: 12,
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
    backgroundColor: Colors.light.rust,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
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
    color: Colors.light.textTertiary,
  },
});
