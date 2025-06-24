import { Colors } from '@/providers/theme-provider';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export function Button({ 
  onPress, 
  title, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={
          variant === 'outline' ? Colors.light.buttonPrimary : Colors.light.background
        } />
      ) : (
        <Text style={[
          styles.text,
          variant === 'primary' && styles.primaryText,
          variant === 'secondary' && styles.secondaryText,
          variant === 'outline' && styles.outlineText,
          disabled && styles.disabledText,
        ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: Colors.light.buttonPrimary,
  },
  secondaryButton: {
    backgroundColor: Colors.light.buttonSecondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.buttonPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.light.background,
  },
  secondaryText: {
    color: Colors.light.background,
  },
  outlineText: {
    color: Colors.light.buttonPrimary,
  },
  disabledText: {
    color: Colors.light.textSecondary,
  },
}); 