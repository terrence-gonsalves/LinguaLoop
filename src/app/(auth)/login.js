import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Toast, Alert } from 'react-native';
import { supabase } from '../../utils/supabaseConfig'; 
import { useRouter } from 'expo-router'; 

const LoginScreen = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const router = useRouter(); 

  // login process
  const handleLogin = async () => {
    setLoading(true); 
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Toast.show({
          text1: 'Login Error',
          text2: error.message,
          type: 'error',
        });
      } 
    } catch (error) {
      console.error("Login unexpected error:", error);
      Alert.alert('Error', 'An unexpected error occurred during login.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      
      <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
      <Button
        title="Don't have an account? Sign Up"
        onPress={() => router.navigate('/(auth)/signup')} 
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

export default LoginScreen;
