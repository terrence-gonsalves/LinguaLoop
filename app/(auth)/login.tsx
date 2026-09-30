import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import Link from 'expo-router/link';

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { FormInput } from '@/components/forms/FormInput';

import { useAuth } from '@/lib/auth-context';

import { Colors } from '@/providers/theme-provider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { signIn } = useAuth();

  const handleLogin = async () => {

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
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setErrors({ password: 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.keyboardContainer}
        bottomOffset={10}
        style={styles.keyboardAvoidingView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <ExpoImage
              source={require('../../assets/images/linguaLoopLogo.png')}
              style={styles.logo}
              contentFit="cover"
            />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue tracking your progress</Text>

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
            />

            <FormInput
              label=""
              value={password}
              onChangeText={setPassword}
              placeholder="password"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
            />

            <Link href="/(auth)/forgot-password" style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Link>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <Link href="/(auth)/create-account">
              <Text style={styles.footerLink}>Create Account</Text>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  keyboardContainer: {
    padding: 16,
    gap: 16,
  },
  keyboardAvoidingView: {
    flex: 1, 
  },
  content: {
    flex: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 143,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  error: {
    color: Colors.light.error,
    fontSize: 14,
    marginTop: -8,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.light.rust,
    fontSize: 14,
    fontWeight: '600',
  },
}); 