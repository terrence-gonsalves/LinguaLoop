import Colors from '@/constants/Colors';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

export interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

export function FormInput({ label, error, helperText, style, ...props }: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={Colors.light.textSecondary}
        {...props}
      />
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
    color: Colors.light.textPrimary,
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: Colors.light.formInputBG,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.textPrimary,
    borderWidth: 1,
    borderColor: Colors.light.formInputBorder,
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
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
}); 