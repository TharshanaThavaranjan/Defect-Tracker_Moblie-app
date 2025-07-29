import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useProfile } from '../ProfileContext';

const ProfileScreen = ({ navigation }: any) => {
  const { profileData } = useProfile();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('ProjectDetail', { project: { name: 'Defect Tracker', risk: 'High Risk' } })}>
          <Icon name="arrow-left" size={24} color="#2563eb" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Your account information</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Icon name="account" size={40} color="#2563eb" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileEmail}>{profileData.email}</Text>
            </View>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="account-outline" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{profileData.name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="calendar" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Birthday</Text>
                <Text style={styles.infoValue}>{profileData.birthday}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="cellphone" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{profileData.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="instagram" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Instagram</Text>
                <Text style={styles.infoValue}>{profileData.instagram}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="email-outline" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{profileData.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="eye-outline" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Password</Text>
                <Text style={styles.infoValue}>{profileData.password}</Text>
              </View>
              <TouchableOpacity style={styles.syncButton}>
                <Icon name="sync" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Icon name="pencil" size={20} color="#fff" style={styles.editButtonIcon} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f1f6',
    elevation: 2,
  },
  backButton: {
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    padding: 8,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  syncButton: {
    padding: 8,
  },
  editButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 