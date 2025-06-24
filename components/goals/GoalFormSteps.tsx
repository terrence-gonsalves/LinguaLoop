import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LanguageDropdown } from '../forms/LanguageDropdown';


interface GoalFormStepsProps {
  currentStep: number;
  formData: any;
  setFormData: (data: any) => void;
  languages: { id: string; name: string; flag?: string | null }[];
}

const GOAL_TYPES = [
  { value: 'daily_time', label: 'Daily Time' },
  { value: 'weekly_time', label: 'Weekly Time' },
  { value: 'monthly_vocab', label: 'Monthly Vocabulary' },
  { value: 'lessons_completed', label: 'Lessons Completed' },
  { value: 'skill_level', label: 'Skill Level' },
  { value: 'custom', label: 'Custom' },
];

export const GoalFormSteps = ({ currentStep, formData, setFormData, languages }: GoalFormStepsProps) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const renderStep1 = () => (
    <View style={styles.step}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Goal Title</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="e.g., Daily Spanish Practice"
          placeholderTextColor={Colors.light.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Language (Optional)</Text>
        <LanguageDropdown
          label=""
          data={languages}
          value={formData.languageId}
          onChange={(value: string | null) => setFormData({ ...formData, languageId: value })}
          dropdownStyle={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Goal Type</Text>
        <View style={styles.goalTypeContainer}>
          {GOAL_TYPES.map((type) => (
            <Pressable
              key={type.value}
              style={[
                styles.goalTypeButton,
                formData.goalType === type.value && styles.goalTypeButtonActive
              ]}
              onPress={() => setFormData({ ...formData, goalType: type.value })}
            >
              <Text style={[
                styles.goalTypeText,
                formData.goalType === type.value && styles.goalTypeTextActive
              ]}>
                {type.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.step}>
      {formData.goalType === 'skill_level' ? (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Level</Text>
          <TextInput
            style={styles.input}
            value={formData.targetValueText}
            onChangeText={(text) => setFormData({ ...formData, targetValueText: text })}
            placeholder="e.g., B1, Intermediate"
            placeholderTextColor={Colors.light.textSecondary}
          />
          <Text style={styles.helperText}>
            Examples: A1, B2, Beginner, Intermediate, Fluent
          </Text>
        </View>
      ) : formData.goalType === 'custom' ? (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Custom Target</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.targetValueText}
            onChangeText={(text) => setFormData({ ...formData, targetValueText: text })}
            placeholder="Describe your target here"
            placeholderTextColor={Colors.light.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>
      ) : (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {formData.goalType === 'daily_time' || formData.goalType === 'weekly_time'
              ? 'Target Minutes'
              : formData.goalType === 'monthly_vocab'
              ? 'Target Words'
              : 'Target Lessons'}
          </Text>
          <View style={styles.stepperContainer}>
            <Pressable
              style={styles.stepperButton}
              onPress={() => {
                const increment = formData.goalType === 'lessons_completed' ? 1 : 5;
                const newValue = (formData.targetValueNumeric || 0) - increment;
                if (newValue >= 0) {
                  setFormData({ ...formData, targetValueNumeric: newValue });
                }
              }}
            >
              <MaterialIcons name="remove" size={24} color={Colors.light.text} />
            </Pressable>
            <TextInput
              style={styles.stepperInput}
              value={formData.targetValueNumeric?.toString() || '0'}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setFormData({ ...formData, targetValueNumeric: value });
              }}
              keyboardType="numeric"
            />
            <Pressable
              style={styles.stepperButton}
              onPress={() => {
                const increment = formData.goalType === 'lessons_completed' ? 1 : 5;
                const newValue = (formData.targetValueNumeric || 0) + increment;
                setFormData({ ...formData, targetValueNumeric: newValue });
              }}
            >
              <MaterialIcons name="add" size={24} color={Colors.light.text} />
            </Pressable>
          </View>
          <Text style={styles.helperText}>
            Increments of {formData.goalType === 'lessons_completed' ? '1' : '5'}
          </Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Start Date</Text>
        <Pressable
          style={styles.dateButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formData.startDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
          </Text>
        </Pressable>
        {showStartDatePicker && (
          <DateTimePicker
            value={formData.startDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowStartDatePicker(false);
              if (date) {
                setFormData({ ...formData, startDate: date });
              }
            }}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>End Date</Text>
        <Pressable
          style={styles.dateButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formData.endDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
          </Text>
        </Pressable>
        {showEndDatePicker && (
          <DateTimePicker
            value={formData.endDate}
            mode="date"
            display="default"
            minimumDate={formData.startDate}
            onChange={(event, date) => {
              setShowEndDatePicker(false);
              if (date) {
                setFormData({ ...formData, endDate: date });
              }
            }}
          />
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.step}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => {
            if (text.length <= 1000) {
              setFormData({ ...formData, description: text });
            }
          }}
          placeholder="Add any extra details or motivation here..."
          placeholderTextColor={Colors.light.textSecondary}
          multiline
          numberOfLines={6}
        />
        <Text style={styles.characterCount}>
          {formData.description.length}/1000
        </Text>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Goal Summary</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Title:</Text>
          <Text style={styles.summaryValue}>{formData.title}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Language:</Text>
          <Text style={styles.summaryValue}>
            {formData.languageId
              ? languages.find(l => l.id === formData.languageId)?.name
              : 'All Languages'}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Type:</Text>
          <Text style={styles.summaryValue}>
            {GOAL_TYPES.find(t => t.value === formData.goalType)?.label}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Target:</Text>
          <Text style={styles.summaryValue}>
            {formData.goalType === 'skill_level' || formData.goalType === 'custom'
              ? formData.targetValueText
              : `${formData.targetValueNumeric} ${
                  formData.goalType === 'daily_time' || formData.goalType === 'weekly_time'
                    ? 'minutes'
                    : formData.goalType === 'monthly_vocab'
                    ? 'words'
                    : 'lessons'
                }`}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>
            {formData.startDate.toLocaleDateString()} - {formData.endDate.toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  switch (currentStep) {
    case 1:
      return renderStep1();
    case 2:
      return renderStep2();
    case 3:
      return renderStep3();
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  step: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.generalBG,
    padding: 12,
    borderRadius: 8,
    color: Colors.light.text,
    fontSize: 16,
    minHeight: 50,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: Colors.light.generalBG,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: Colors.light.text,
  },
  goalTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.generalBG,
  },
  goalTypeButtonActive: {
    backgroundColor: Colors.light.rust,
  },
  goalTypeText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  goalTypeTextActive: {
    color: Colors.light.textLight,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.generalBG,
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperButton: {
    padding: 12,
    backgroundColor: Colors.light.border,
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: Colors.light.text,
    padding: 12,
  },
  helperText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: Colors.light.generalBG,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    width: 80,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  dateButton: {
    backgroundColor: Colors.light.generalBG,
    padding: 12,
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.light.text,
  },
}); 