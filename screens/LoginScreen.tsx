import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Button, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Feather from 'react-native-vector-icons/Feather';
import CheckBox from '@react-native-community/checkbox';
// import LinearGradient from 'react-native-linear-gradient';

const DUMMY_USER = { email: 'admin', password: 'admin' };

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      navigation.replace('Dashboard', { userEmail: email });
    } else {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <View style={styles.background}>
      {/* Back Button at the very top */}
      <View style={{ marginTop: 16 }} />
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.replace('Welcome')}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        {/* Attractive App Icon Circle */}
        <View style={styles.appIconCircleShadow}>
          <View style={styles.appIconCircleBorder}>
            <View style={styles.appIconCircleGradient}>
              <Text style={styles.appIconText}>DT</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 16 }} />
        <Text style={styles.title}>DefectTracker Pro</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // FIX: true means hidden, false means visible
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={22} color="#888" />
          </TouchableOpacity>
        </View>
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <CheckBox
              value={rememberMe}
              onValueChange={setRememberMe}
              style={styles.checkbox}
            />
            <Text style={styles.rememberMe}>Remember Me</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 16 }} />
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Feather name="user" size={24} color="#fff" style={styles.signInIcon} />
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
        {/* Add Sign Up link at the bottom of the card */}
        <View style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={{ color: '#444' }}>
            Don’t have an account?{' '}
            <Text
              style={{ color: '#2563eb', fontWeight: 'bold' }}
              onPress={() => navigation.replace('Signup')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
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
  iconCircle: {
    backgroundColor: '#e0e7ff',
    borderRadius: 60,
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 4,
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 17,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '400',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
    marginTop: 12,
    fontSize: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    fontSize: 17,
    height: 48,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 17,
    height: 48,
  },
  eyeIcon: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    ...Platform.select({ ios: { marginRight: 8 }, android: {} }),
  },
  rememberMe: {
    fontSize: 16,
    color: '#222',
  },
  forgot: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '500',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 22,
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  signInText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  signInIcon: {
    marginRight: 10,
    alignSelf: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 10, // Move closer to the top
    left: 20,
    zIndex: 10,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backBtnText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  appIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
    letterSpacing: 2,
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
    backgroundColor: 'linear-gradient(135deg, #2563eb 60%, #4f8cff 100%)', // fallback for gradient
  },
});

export default LoginScreen;