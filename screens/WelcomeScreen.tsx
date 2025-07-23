import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleStart = () => {
    navigation.replace('Login');
  };

  return (
    <View style={[styles.background, { backgroundColor: '#e0e7ff' }]}> {/* Use a color background */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to Defect Tracker</Text>
        <Text style={styles.subtitle}>
          The smart way to track, manage, and resolve defects in your projects.
        </Text>
        <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>Let's Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    width: '100%',
    height: '100%',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 40,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 2,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default WelcomeScreen; 