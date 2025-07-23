import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgetPassword'>;

const ForgetPassword: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    if (email) {
      Alert.alert('Reset Link Sent', `A password reset link has been sent to ${email}`);
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Please enter your email address');
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
        <View style={{ height: 12 }} />
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.info}>Enter your email address to receive a password reset link.</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Send Reset Link</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  info: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    fontSize: 17,
    height: 48,
  },
  resetButton: {
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
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.2,
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
});

export default ForgetPassword; 