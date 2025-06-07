import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Stack } from 'expo-router/stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OFFLINE_FEEDBACK_KEY = 'offline_feedback';

export default function FeedbackScreen() {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOffline(!state.isConnected);
      if (state.isConnected) {
        syncOfflineFeedback();
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const saveFeedbackOffline = async (feedbackText: string) => {
    try {
      const existingFeedback = await AsyncStorage.getItem(OFFLINE_FEEDBACK_KEY);
      const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : [];
      
      feedbackArray.push({
        feedback: feedbackText,
        user_name: profile?.name || '',
        user_email: profile?.email || '',
        created_at: new Date().toISOString(),
      });

      await AsyncStorage.setItem(OFFLINE_FEEDBACK_KEY, JSON.stringify(feedbackArray));
      showToast('Feedback saved offline. Will submit when connection is restored.');
      setFeedback('');
    } catch (error) {
      console.error('Error saving feedback offline:', error);
      showToast('Failed to save feedback offline');
    }
  };

  const syncOfflineFeedback = async () => {
    try {
      const offlineFeedback = await AsyncStorage.getItem(OFFLINE_FEEDBACK_KEY);
      if (!offlineFeedback) return;

      const feedbackArray = JSON.parse(offlineFeedback);
      if (feedbackArray.length === 0) return;

      const { error } = await supabase
        .from('feedback')
        .insert(feedbackArray);

      if (error) throw error;

      await AsyncStorage.removeItem(OFFLINE_FEEDBACK_KEY);
      showToast('Offline feedback synced successfully');
    } catch (error) {
      console.error('Error syncing offline feedback:', error);
    }
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      showToast('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);

    if (isOffline) {
      await saveFeedbackOffline(feedback);
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          feedback,
          user_name: profile?.name || '',
          user_email: profile?.email || '',
        });

      if (error) throw error;

      showToast('Thank you for your feedback!');
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Feedback',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.light.background },
        }} 
      />

      <View style={styles.content}>
        <Text style={styles.subtitle}>Help us improve!</Text>
        <Text style={styles.description}>
          Are you experiencing an issue? Have a bug to report or maybe a feature request? Please give as much detail as possible.
        </Text>

        <TextInput
          style={styles.input}
          multiline
          numberOfLines={5}
          placeholder="Type your feedback here..."
          placeholderTextColor={Colors.light.textSecondary}
          value={feedback}
          onChangeText={setFeedback}
          textAlignVertical="top"
        />

        <Pressable 
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </Pressable>

        {isOffline && (
          <Text style={styles.offlineNotice}>
            You're offline. Your feedback will be submitted when you're back online.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 24,
    lineHeight: 24,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.light.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  offlineNotice: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
}); 