import { GoalFormSteps } from '@/components/goals/GoalFormSteps';
import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type GoalType = 'daily_time' | 'weekly_time' | 'monthly_vocab' | 'lessons_completed' | 'skill_level' | 'custom';

interface Language {
  id: string;
  name: string;
  flag?: string | null;
}

interface GoalFormData {
  title: string;
  languageId: string | null;
  goalType: GoalType;
  targetValueNumeric: number | null;
  targetValueText: string | null;
  startDate: Date;
  endDate: Date;
  description: string;
}

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'daily_time', label: 'Daily Time' },
  { value: 'weekly_time', label: 'Weekly Time' },
  { value: 'monthly_vocab', label: 'Monthly Vocabulary' },
  { value: 'lessons_completed', label: 'Lessons Completed' },
  { value: 'skill_level', label: 'Skill Level' },
  { value: 'custom', label: 'Custom' },
];

export default function GoalsScreen() {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    languageId: null,
    goalType: 'daily_time',
    targetValueNumeric: null,
    targetValueText: null,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    description: '',
  });

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select(`
          id, 
          name,
          master_languages (
            flag
          )
        `)
        .order('name');

      if (error) throw error;
      
      // transform the data to include flag information
      const transformedData = (data || []).map((lang: any) => ({
        id: lang.id,
        name: lang.name,
        flag: lang.master_languages?.flag || null,
      }));
      
      setLanguages(transformedData);
    } catch (error) {
      console.error('Error fetching languages:', error);
      Alert.alert('Error', 'Failed to load languages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) {
      Alert.alert('Error', 'User profile not found');
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: profile.id,
          language_id: formData.languageId,
          title: formData.title,
          description: formData.description,
          goal_type: formData.goalType,
          target_value_numeric: formData.targetValueNumeric,
          target_value_text: formData.targetValueText,
          start_date: formData.startDate.toISOString(),
          end_date: formData.endDate.toISOString(),
        });

      if (error) throw error;

      router.back();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal');
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length > 0;
      case 2:
        if (formData.goalType === 'skill_level' || formData.goalType === 'custom') {
          return formData.targetValueText ? formData.targetValueText.trim().length > 0 : false;
        }
        return formData.targetValueNumeric !== null && formData.targetValueNumeric > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.rust} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Set a New Goal',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.light.background },
        }} 
      />

      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <View style={[
              styles.progressStep,
              currentStep >= step && styles.progressStepActive
            ]}>
              <Text style={[
                styles.progressStepText,
                currentStep >= step && styles.progressStepTextActive
              ]}>
                {step}
              </Text>
            </View>
            {step < 3 && (
              <View style={[
                styles.progressLine,
                currentStep > step && styles.progressLineActive
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <GoalFormSteps
          currentStep={currentStep}
          formData={formData}
          setFormData={setFormData}
          languages={languages}
        />
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.nextButton,
            currentStep === 3 && styles.saveButton,
            !validateStep() && styles.buttonDisabled
          ]}
          onPress={currentStep === 3 ? handleSave : handleNext}
          disabled={!validateStep()}
        >
          <Text style={[
            styles.nextButtonText,
            !validateStep() && styles.buttonTextDisabled
          ]}>
            {currentStep === 3 ? 'Save Goal' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: Colors.light.rust,
  },
  progressStepText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  progressStepTextActive: {
    color: Colors.light.textLight,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.light.border,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: Colors.light.rust,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: Colors.light.buttonPrimary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: Colors.light.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: Colors.light.textLight,
  },
}); 