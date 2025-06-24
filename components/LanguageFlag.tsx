import Colors from '@/constants/Colors';
import { Image as ExpoImage } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LanguageFlagProps {
  name: string;
  flagUrl: string | null;
  size?: number;
}

export const LanguageFlag = ({ name, flagUrl, size = 32 }: LanguageFlagProps) => {
  const [imageError, setImageError] = useState(false);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textStyle = {
    fontSize: size * 0.5,
    lineHeight: size,
  };

  if (!flagUrl || imageError) {
    return (
      <View style={[styles.flagPlaceholder, containerStyle]}>
        <Text style={[styles.flagPlaceholderText, textStyle]}>{name[0]}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.flagPlaceholder, containerStyle]}>
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