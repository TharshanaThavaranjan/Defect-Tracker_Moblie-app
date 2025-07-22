import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const NextPage: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Dashboard', { userEmail: '' })}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>welcome back!</Text>
      <Text style={styles.message}>Dashboard overview of your projects</Text>
      <View style={styles.logoutContainer}>
        <Button title="Logout" color="#d9534f" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  backButton: { position: 'absolute', top: 40, left: 16, padding: 8 },
  backText: { color: '#007bff', fontSize: 18 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  message: { fontSize: 18, color: '#666', textAlign: 'center' },
  logoutContainer: { position: 'absolute', bottom: 40, width: '80%' },
});

export default NextPage; 