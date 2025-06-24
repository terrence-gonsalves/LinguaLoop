import { Colors } from '@/providers/theme-provider';
import { StyleSheet, Text, View } from 'react-native';

interface DefaultAvatarProps {
  size?: number;
  letter?: string;
}

export default function DefaultAvatar({ size = 40, letter = '?' }: DefaultAvatarProps) {
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
      }
    ]}>
      <Text style={[
        styles.letter,
        {
          fontSize: size * 0.4,
        }
      ]}>
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: Colors.light.background,
    fontWeight: '600',
  },
}); 