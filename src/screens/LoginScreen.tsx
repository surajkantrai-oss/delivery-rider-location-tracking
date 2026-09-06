import React, {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getAuthErrorMessage, login} from '../services/authService';
import type {AuthStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login({email, password});
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Rider</Text>
      <Text style={styles.subtitle}>Sign in to start your route</Text>
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.button, loading && styles.disabled]} onPress={() => void submit()} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Login</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Create Account</Text>
      </Pressable>
    </View>
  );
}

export const authStyles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#FAFBFA'},
  title: {fontSize: 30, fontWeight: '800', color: '#183B34'},
  subtitle: {fontSize: 16, color: '#6B7774', marginTop: 6, marginBottom: 30},
  input: {backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D6DEDB', borderRadius: 10, paddingHorizontal: 14, height: 50, marginBottom: 12, color: '#17201E'},
  error: {color: '#A13030', marginBottom: 12},
  button: {height: 50, borderRadius: 10, backgroundColor: '#176B5B', alignItems: 'center', justifyContent: 'center', marginTop: 4},
  disabled: {opacity: 0.65},
  buttonText: {color: '#FFF', fontSize: 16, fontWeight: '700'},
  link: {color: '#176B5B', fontWeight: '600', textAlign: 'center', padding: 18},
});

const styles = authStyles;
