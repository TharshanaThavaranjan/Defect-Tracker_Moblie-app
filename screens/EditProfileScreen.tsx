import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useProfile } from '../ProfileContext';

const EditProfileScreen = ({ navigation }: any) => {
  const { profileData, updateProfile } = useProfile();
  const [formData, setFormData] = useState(profileData);

  const handleSave = () => {
    updateProfile(formData);
    console.log('Saving profile:', formData);
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2563eb" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.headerSubtitle}>Update your information</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.formCard}>
            {/* Name Field */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Icon name="account-outline" size={20} color="#2563eb" style={styles.labelIcon} />
                <Text style={styles.labelText}>Full Name</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your full name"
              />
            </View>

            {/* Birthday Field */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Icon name="calendar" size={20} color="#2563eb" style={styles.labelIcon} />
                <Text style={styles.labelText}>Birthday</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={formData.birthday}
                onChangeText={(text) => setFormData({ ...formData, birthday: text })}
                placeholder="Enter your birthday"
              />
            </View>

            {/* Phone Field */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Icon name="cellphone" size={20} color="#2563eb" style={styles.labelIcon} />
                <Text style={styles.labelText}>Phone Number</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          
          <View style={styles.formCard}>
            {/* Instagram Field */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Icon name="instagram" size={20} color="#2563eb" style={styles.labelIcon} />
                <Text style={styles.labelText}>Instagram</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={formData.instagram}
                onChangeText={(text) => setFormData({ ...formData, instagram: text })}
                placeholder="Enter your Instagram username"
              />
            </View>
          </View>
        </View>

        {/* Account Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          
          <View style={styles.formCard}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Icon name="email-outline" size={20} color="#2563eb" style={styles.labelIcon} />
                <Text style={styles.labelText}>Email Address</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Icon name="eye-outline" size={20} color="#2563eb" style={styles.labelIcon} />
                <Text style={styles.labelText}>Password</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="Enter your password"
                secureTextEntry={true}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Icon name="close" size={20} color="#6b7280" style={styles.buttonIcon} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Icon name="check" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
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
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#222',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen; 