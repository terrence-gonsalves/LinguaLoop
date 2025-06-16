import Colors from '@/constants/Colors';
import { Stack } from 'expo-router/stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Accordion } from '../../../components/help/Accordion';

const helpSections = [
  {
    title: 'Using the App',
    items: [
      {
        question: 'How do I start learning a new language?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      },
      {
        question: 'How do I track my progress?',
        answer: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      },
      {
        question: 'Can I learn multiple languages at once?',
        answer: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      },
      {
        question: 'How do I change my study schedule?',
        answer: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      },
      {
        question: 'What learning methods are available?',
        answer: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
      },
    ],
  },
  {
    title: 'Account Management',
    items: [
      {
        question: 'How do I update my profile information?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      },
      {
        question: 'How do I change my password?',
        answer: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
      },
      {
        question: 'Can I link my social media accounts?',
        answer: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.',
      },
      {
        question: 'What happens to my data if I delete my account?',
        answer: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
      },
    ],
  },
  {
    title: 'Data Management',
    items: [
      {
        question: 'How is my data stored and protected?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
      },
      {
        question: 'Can I export my learning data?',
        answer: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.',
      },
      {
        question: 'How do I manage app permissions?',
        answer: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
      },
      {
        question: 'What data is shared with third parties?',
        answer: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui.',
      },
      {
        question: 'How do I request my data?',
        answer: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem.',
      },
    ],
  },
  {
    title: 'Learning & Progress',
    items: [
      {
        question: 'How is my progress measured?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        question: 'What do the achievement levels mean?',
        answer: 'Ut enim ad minim veniam, quis nostrud exercitation.',
      },
      {
        question: 'How do I set learning goals?',
        answer: 'Duis aute irure dolor in reprehenderit in voluptate.',
      },
      {
        question: 'Can I reset my progress?',
        answer: 'Excepteur sint occaecat cupidatat non proident.',
      },
      {
        question: 'How do streaks work?',
        answer: 'Nemo enim ipsam voluptatem quia voluptas sit.',
      },
    ],
  },
  {
    title: 'Troubleshooting',
    items: [
      {
        question: 'The app is not responding, what should I do?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
      },
      {
        question: 'Why am I having audio problems?',
        answer: 'Ut enim ad minim veniam, quis nostrud.',
      },
      {
        question: 'How do I report a bug?',
        answer: 'Duis aute irure dolor in reprehenderit.',
      },
      {
        question: 'Why are my notifications not working?',
        answer: 'Excepteur sint occaecat cupidatat.',
      },
      {
        question: 'How do I update the app?',
        answer: 'Sed ut perspiciatis unde omnis.',
      },
    ],
  },
];

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Goals',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.light.background },
        }} 
      />

      <ScrollView style={styles.scrollView}>
        {helpSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <Accordion
                key={item.question}
                title={item.question}
                content={item.answer}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
}); 