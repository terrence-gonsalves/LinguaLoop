import Colors from '@/constants/Colors';
import { Image as ExpoImage } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LanguageFlagProps {
  name: string;
  flagUrl: string | null;
}

export const LanguageFlag = ({ name, flagUrl }: LanguageFlagProps) => {
  const [imageError, setImageError] = useState(false);

  if (!flagUrl || imageError) {
    return (
      <View style={styles.flagPlaceholder}>
        <Text style={styles.flagPlaceholderText}>{name[0]}</Text>
      </View>
    );
  }

  return (
    <View style={styles.flagPlaceholder}>
      <ExpoImage
        source={{ uri: flagUrl }}
        style={styles.flagImage}
        contentFit="cover"
        onError={() => setImageError(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flagPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  flagPlaceholderText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
}); 