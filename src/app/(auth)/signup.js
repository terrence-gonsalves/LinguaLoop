import React, { useStatem } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../utils/supabaseConfig'; 
import { useRouter } from 'expo-router'; 

const SignUpScreen = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const router = useRouter(); 

  const handleSignUp = async () => {
    setLoading(true); 
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        Toast.show({
          text1: 'Sign Up Error',
          text2: error.message,
          type: 'error',
        });
      } else { // sign-up is successful
        if (data.user) {
          router.navigate('/(auth)/login');
        } else {
          Toast.show({
            text1: 'Success',
            text2: 'Account created! Please check your email for a verification link to log in.',
            type: 'success',
          });
          router.navigate('/(auth)/login'); 
        }
      }
    } catch (error) { // catch any unexpected errors during the process
      console.error("Sign up unexpected error:", error);
      Alert.alert('Error', 'An unexpected error occurred during sign up.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button title={loading ? "Signing up..." : "Sign Up"} onPress={handleSignUp} disabled={loading} />
      
      <Button
        title="Already have an account? Login"
        onPress={() => router.navigate('/(auth)/login')}
        color="gray"
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
});

export default SignUpScreen;
