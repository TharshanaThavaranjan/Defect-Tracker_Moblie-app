import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = () => {
    if (email && password) {
      navigation.replace('Dashboard', { userEmail: email });
    } else {
      Alert.alert('Signup Failed', 'Please enter email and password');
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.card}>
        {/* Attractive App Icon Circle */}
        <View style={styles.appIconCircleShadow}>
          <View style={styles.appIconCircleBorder}>
            <View style={styles.appIconCircleGradient}>
              <Text style={styles.appIconText}>DT</Text>
            </View>
          </View>
        </View>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#888" />
        </TouchableOpacity>
      </View>
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f3f6fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f0f1f6',
  },
  appIconCircleShadow: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'center',
    borderRadius: 40,
    marginBottom: 18,
  },
  appIconCircleBorder: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 40,
    padding: 2,
    backgroundColor: '#2563eb',
  },
  appIconCircleGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  appIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
    letterSpacing: 2,
  },
  signupButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', maxWidth: 320, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 320, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 16, backgroundColor: '#fff' },
  passwordInput: { flex: 1, padding: 12 },
  eyeIcon: { padding: 8 },
  link: { color: '#007bff', marginTop: 16 },
});

export default SignupScreen; 