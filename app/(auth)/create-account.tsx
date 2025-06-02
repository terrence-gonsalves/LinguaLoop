import { Colors } from '@/constants/Colors';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateAccountScreen() {
  const [displayName, setDisplayName] = useState('');
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
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.light.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
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
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <Pressable style={styles.socialButton}>
              <FontAwesome name="google" size={24} color={Colors.light.textPrimary} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </Pressable>

            <Pressable style={styles.socialButton}>
              <FontAwesome name="apple" size={24} color={Colors.light.textPrimary} />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </Pressable>

            <Pressable style={styles.socialButton}>
              <FontAwesome name="facebook" size={24} color={Colors.light.textPrimary} />
              <Text style={styles.socialButtonText}>Continue with Facebook</Text>
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
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.rust,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  titleSecondLine: {
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.light.formInputBG,
    borderWidth: 1,
    borderColor: Colors.light.formInputBorder,
    borderRadius: 8,
    padding: 12,
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
    top: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkbox: {
    padding: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  link: {
    color: Colors.light.link,
  },
  signUpButton: {
    backgroundColor: Colors.light.rust,
    borderRadius: 8,
    padding: 16,
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
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.formInputBorder,
  },
  dividerText: {
    color: Colors.light.textSecondary,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.formInputBorder,
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.light.link,
    fontWeight: '500',
  },
}); 