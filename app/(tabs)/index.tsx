import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Dashboard() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isInvalid, setIsInvalid] = useState(false)
  const [inputValue, setInputValue] = useState("12345");

  const handleSubmit = () => {
    if (inputValue.length < 6) {
      setIsInvalid(true)
    } else {
      setIsInvalid(false)
    }
  }
  
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' }
  ];

    return (
      <View style={styles.wrapper}>
          <ThemedView style={styles.titleContainer}>
              <ThemedText type="title">Welcome!</ThemedText>
          </ThemedView>
          <ThemedView style={styles.stepContainer}>
              <ThemedText type="subtitle">Dashboard Screen</ThemedText>
          </ThemedView>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stepContainer: {
      gap: 8,
      marginBottom: 8,
    },
    reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: 'absolute',
    },
  });