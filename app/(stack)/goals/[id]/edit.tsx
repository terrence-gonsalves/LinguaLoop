import { router, useLocalSearchParams } from 'expo-router';
import Stack from 'expo-router/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalFormSteps } from '@/components/goals/GoalFormSteps';
import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function EditGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [languages, setLanguages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGoalAndLanguages();
  }, [id, profile?.id]);

  async function fetchGoalAndLanguages() {
    setIsLoading(true);

    try {

      // fetch user's languages
      const { data: langs } = await supabase
        .from('languages')
        .select('id, name, master_languages(flag)')
        .eq('user_id', profile?.id)
        .order('name');

      const transformedLangs = (langs || []).map((lang: any) => ({
        id: lang.id,
        name: lang.name,
        flag: lang.master_languages?.flag || null,
      }));

      setLanguages(transformedLangs);

      // fetch goal
      const { data: goal, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !goal) throw error || new Error('Goal not found');

      setFormData({
        title: goal.title,
        languageId: goal.language_id,
        goalType: goal.goal_type,
        targetValueNumeric: goal.target_value_numeric,
        targetValueText: goal.target_value_text,
        startDate: goal.start_date ? new Date(goal.start_date) : new Date(),
        endDate: goal.end_date ? new Date(goal.end_date) : new Date(),
        description: goal.description || '',
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to load goal or languages.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSave = async () => {
    if (!profile?.id) {
      Alert.alert('Error', 'User profile not found');
      return;
    }
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('goals')
        .update({
          user_id: profile.id,
          language_id: formData.languageId,
          title: formData.title,
          description: formData.description,
          goal_type: formData.goalType,
          target_value_numeric: formData.targetValueNumeric,
          target_value_text: formData.targetValueText,
          start_date: formData.startDate.toISOString(),
          end_date: formData.endDate.toISOString(),
        })
        .eq('id', id);
        
      if (error) throw error;
      router.replace('/(stack)/goals');
    } catch (error) {
      Alert.alert('Error', 'Failed to update goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setDeleting(true);
          await supabase.from('goals').delete().eq('id', id);
          setDeleting(false);
          router.replace('/(stack)/goals');
        }
      }
    ]);
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


  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Edit Goal',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.light.background },
        }}
      />
      {(isLoading || !formData) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.rust} />
        </View>
      ) : (
        <>
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
                summaryExtras={{
                    durationDays: formData.startDate && formData.endDate
                    ? Math.max(
                        1,
                        Math.ceil(
                            ((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                        )
                        )
                    : null
                }}
                />
            </ScrollView>
            <View style={styles.buttonRow}>
                {currentStep > 1 && (
                <Pressable style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.buttonText}>Back</Text>
                </Pressable>
                )}
                {currentStep < 3 && (
                <Pressable style={styles.nextButton} onPress={handleNext} disabled={!validateStep()}>
                    <Text style={styles.buttonText}>Next</Text>
                </Pressable>
                )}
                {currentStep === 3 && (
                <Pressable style={styles.saveButton} onPress={handleSave} disabled={!validateStep() || isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
                </Pressable>
                )}
            </View>
            <Pressable style={styles.deleteButton} onPress={handleDelete} disabled={deleting}>
                <Text style={styles.deleteButtonText}>{deleting ? 'Deleting...' : 'Delete Goal'}</Text>
            </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
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
    color: Colors.light.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  progressStepTextActive: {
    color: Colors.light.background,
  },
  progressLine: {
    width: 32,
    height: 2,
    backgroundColor: Colors.light.border,
  },
  progressLineActive: {
    backgroundColor: Colors.light.rust,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  backButton: {
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: Colors.light.rust,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginLeft: 8,
  },
  buttonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: Colors.light.error,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    margin: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 16,
  },
}); 