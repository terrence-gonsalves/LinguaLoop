import { Colors } from '@/providers/theme-provider';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

export interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

export function FormInput({ label, error, helperText, style, secureTextEntry, ...props }: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = secureTextEntry !== undefined;
  const shouldShowPassword = isPasswordField && !secureTextEntry;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={isPasswordField ? styles.passwordContainer : null}>
        <TextInput
          style={[
            styles.input,
            isPasswordField && styles.passwordInput,
            error ? styles.inputError : null,
            style,
          ]}
          placeholderTextColor={Colors.light.textSecondary}
          secureTextEntry={isPasswordField ? !showPassword : secureTextEntry}
          {...props}
        />
        {isPasswordField && (
          <Pressable
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color={Colors.light.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.formInputBG,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 10,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
}); 