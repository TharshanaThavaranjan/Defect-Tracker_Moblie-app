import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useProfile } from '../ProfileContext';

const ProfileScreen = ({ navigation }: any) => {
  const { profileData } = useProfile();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafd' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('ProjectDetail', { project: { name: 'Defect Tracker', risk: 'High Risk' } })}>
            <Icon name="arrow-left" size={26} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{profileData.name}</Text>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Icon name="account" size={60} color="#bdbdbd" />
            </View>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Icon name="account-outline" size={24} color="#2563eb" style={styles.infoIcon} />
            <Text style={styles.infoText}>{profileData.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={24} color="#2563eb" style={styles.infoIcon} />
            <Text style={styles.infoText}>{profileData.birthday}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="cellphone" size={24} color="#2563eb" style={styles.infoIcon} />
            <Text style={styles.infoText}>{profileData.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="instagram" size={24} color="#2563eb" style={styles.infoIcon} />
            <Text style={styles.infoText}>{profileData.instagram}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="email-outline" size={24} color="#2563eb" style={styles.infoIcon} />
            <Text style={styles.infoText}>{profileData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="eye-outline" size={24} color="#2563eb" style={styles.infoIcon} />
            <Text style={styles.infoText}>{profileData.password}</Text>
            <Icon name="sync" size={20} color="#bdbdbd" style={{ marginLeft: 'auto' }} />
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <View style={styles.editButtonGradient}>
              <Text style={styles.editButtonText}>Edit profile</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 200,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#f8fafd',
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 2,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    padding: 6,
    elevation: 2,
  },
  headerText: {
    color: '#222',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 40,
    letterSpacing: 0.2,
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -40,
    alignSelf: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#f8fafd',
    elevation: 4,
  },
  infoContainer: {
    marginTop: 60,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 14,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoText: {
    fontSize: 17,
    color: '#222',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  editButton: {
    marginTop: 30,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  editButtonGradient: {
    alignItems: 'center',
    borderRadius: 24,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.1,
  },
});

export default ProfileScreen; 