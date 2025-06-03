import { Colors } from '@/constants/Colors';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateAccountScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Placeholder Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder} />
        </View>

        <Text style={styles.title}>Create Your</Text>
        <Text style={[styles.title, styles.titleSecondLine]}>LinguaLoop Account</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor={Colors.light.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Create a strong password"
                placeholderTextColor={Colors.light.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
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
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Re-enter your password"
                placeholderTextColor={Colors.light.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={Colors.light.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.termsContainer}>
            <Pressable
              style={styles.checkbox}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <MaterialIcons
                name={acceptedTerms ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={Colors.light.rust}
              />
            </Pressable>
            <Text style={styles.termsText}>
              I accept LinguaLoop's{' '}
              <Link href="../terms" style={styles.link}>
                Terms of Use
              </Link>
              {' '}and its{' '}
              <Link href="../privacy" style={styles.link}>
                Privacy Policy
              </Link>
            </Text>
          </View>

          <Pressable style={styles.signUpButton}>
            <Text style={styles.signUpButtonText}>Sign Up Now</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <Pressable style={styles.socialButton}>
              <FontAwesome name="google" size={24} color={Colors.light.textPrimary} />
            </Pressable>

            <Pressable style={styles.socialButton}>
              <FontAwesome name="apple" size={24} color={Colors.light.textPrimary} />
            </Pressable>

            <Pressable style={styles.socialButton}>
              <FontAwesome name="facebook" size={24} color={Colors.light.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="../login" style={styles.loginLink}>
              Log in
            </Link>
          </View>
        </View>
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
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.rust,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  titleSecondLine: {
    marginBottom: 20,
  },
  form: {
    gap: 12,
  },
  inputContainer: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  input: {
    backgroundColor: Colors.light.formInputBG,
    borderWidth: 1,
    borderColor: Colors.light.formInputBorder,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: Colors.light.textPrimary,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkbox: {
    padding: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  link: {
    color: Colors.light.rust,
    textDecorationLine: 'underline',
  },
  signUpButton: {
    backgroundColor: Colors.light.rust,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.formInputBorder,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.formInputBorder,
    width: 56,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.light.rust,
    fontSize: 14,
    fontWeight: '600',
  },
}); 