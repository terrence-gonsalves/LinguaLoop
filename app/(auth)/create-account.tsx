import { FontAwesome } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import Link from 'expo-router/link';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { FormInput } from '@/components/forms/FormInput';
import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';

export default function CreateAccountScreen() {
  const { signUp, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSignUp = async () => {

    // clear previous errors
    setErrors({});
    
    // validate form
    const newErrors: { [key: string]: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!acceptedTerms) {
      newErrors.terms = 'Please accept the terms and conditions';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    await signUp(email, password);
  };

  const isFormValid = email && password && confirmPassword && acceptedTerms && password === confirmPassword;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* logo */}
        <View style={styles.logoContainer}>
          <ExpoImage
            source={require('../../assets/images/linguaLoopLogo.png')}
            style={styles.logo}
            contentFit="cover"
          />
        </View>

        <Text style={styles.title}>Create Your Account</Text>

        <View style={styles.form}>
          <FormInput
            label=""
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            editable={!isLoading}
          />

          <FormInput
            label=""
            value={password}
            onChangeText={setPassword}
            placeholder="password"
            secureTextEntry
            error={errors.password}
            editable={!isLoading}
          />

          <FormInput
            label=""
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="confirm password"
            secureTextEntry
            error={errors.confirmPassword}
            editable={!isLoading}
          />

          <View style={styles.termsContainer}>
            <Pressable
              style={styles.checkbox}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={isLoading}
            >
              <FontAwesome
                name={acceptedTerms ? 'check-square' : 'square-o'}
                size={20}
                color={Colors.light.checkBoxSecondary}
              />
            </Pressable>
            <Text style={styles.termsText}>
              I accept the {' '}
              <Link href="../terms" style={styles.link}>
                Terms of Use
              </Link>
              {' '}and{' '}
              <Link href="../privacy" style={styles.link}>
                Privacy Policy
              </Link>
            </Text>
          </View>
          
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          <Button
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
          />

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
  },
  logo: {
    width: '100%',
    height: 143,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
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
  signUpButtonDisabled: {
    backgroundColor: Colors.light.formInputBorder,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    marginTop: 4,
  },
}); 