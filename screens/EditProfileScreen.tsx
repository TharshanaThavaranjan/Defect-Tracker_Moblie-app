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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafd' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit Profile</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Icon name="account-outline" size={20} color="#2563eb" style={styles.labelIcon} />
              <Text style={styles.labelText}>Name</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter your name"
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
              <Text style={styles.labelText}>Phone</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

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
              placeholder="Enter your Instagram account"
            />
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Icon name="email-outline" size={20} color="#2563eb" style={styles.labelIcon} />
              <Text style={styles.labelText}>Email</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter your email"
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

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#f8fafd',
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    top: 20,
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
    letterSpacing: 0.2,
  },
  formContainer: {
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
    letterSpacing: 0.1,
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
    marginTop: 30,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

export default EditProfileScreen; 