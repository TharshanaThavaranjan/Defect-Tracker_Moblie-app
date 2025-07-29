import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Share,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../ThemeContext';
import { useNavigation } from '@react-navigation/native';

const APP_LINK = 'https://your-app-link.com';
const PRIVACY_URL = 'https://your-privacy-policy.com';
const TERMS_URL = 'https://your-terms.com';
const COOKIES_URL = 'https://your-cookies.com';
const CONTACT_EMAIL = 'support@yourapp.com';
const FEEDBACK_EMAIL = 'feedback@yourapp.com';
const RATE_APP_URL = 'https://play.google.com/store/apps/details?id=yourappid'; // or App Store link

const settingsItems = [
  { key: 'notification', label: 'Notification', icon: 'bell', type: 'toggle' },
  { key: 'darkMode', label: 'Dark Mode', icon: 'sun', type: 'toggle' },
  { key: 'rate', label: 'Rate App', icon: 'star', type: 'nav' },
  { key: 'share', label: 'Share App', icon: 'share-2', type: 'nav' },
  { key: 'privacy', label: 'Privacy Policy', icon: 'lock', type: 'nav' },
  { key: 'terms', label: 'Terms and Conditions', icon: 'file-text', type: 'nav' },
  { key: 'cookies', label: 'Cookies Policy', icon: 'file', type: 'nav' },
  { key: 'contact', label: 'Contact', icon: 'mail', type: 'nav' },
  { key: 'feedback', label: 'Feedback', icon: 'message-circle', type: 'nav' },
  { key: 'logout', label: 'Logout', icon: 'log-out', type: 'nav' },
];

const SettingsScreen = () => {
  const { isDark, toggleTheme } = useTheme();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const navigation = useNavigation();

  const handleToggle = (key: string) => {
    if (key === 'notification') {
      setNotificationEnabled((prev) => !prev);
    } else if (key === 'darkMode') {
      toggleTheme();
    }
  };

  const handleNav = async (key: string) => {
    switch (key) {
      case 'rate':
        Linking.openURL(RATE_APP_URL);
        break;
      case 'share':
        Share.share({ message: APP_LINK });
        break;
      case 'privacy':
        Linking.openURL(PRIVACY_URL);
        break;
      case 'terms':
        Linking.openURL(TERMS_URL);
        break;
      case 'cookies':
        Linking.openURL(COOKIES_URL);
        break;
      case 'contact':
        Linking.openURL(`mailto:${CONTACT_EMAIL}`);
        break;
      case 'feedback':
        Linking.openURL(`mailto:${FEEDBACK_EMAIL}`);
        break;
      case 'logout':
        console.log('Logout pressed!');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2563eb" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your preferences</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* App Info Card */}
        <View style={styles.appInfoCard}>
          <View style={styles.appIconCircle}>
            <Text style={styles.appIconText}>DT</Text>
          </View>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>DefectTracker Pro</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {settingsItems.slice(0, 2).map((item) => (
            <TouchableOpacity key={item.key} style={styles.settingsCard}>
              <View style={styles.itemContent}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={20} color="#2563eb" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemDescription}>
                    {item.key === 'notification' ? 'Enable push notifications' : 'Switch to dark theme'}
                  </Text>
                </View>
                <Switch
                  value={item.key === 'notification' ? notificationEnabled : isDark}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
                  thumbColor={Platform.OS === 'android' ? '#fff' : ''}
                  style={styles.switch}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          {settingsItems.slice(2, 6).map((item) => (
            <TouchableOpacity key={item.key} style={styles.settingsCard} onPress={() => handleNav(item.key)}>
              <View style={styles.itemContent}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={20} color="#2563eb" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Legal</Text>
          {settingsItems.slice(6, 9).map((item) => (
            <TouchableOpacity key={item.key} style={styles.settingsCard} onPress={() => handleNav(item.key)}>
              <View style={styles.itemContent}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={20} color="#2563eb" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={[styles.settingsCard, styles.logoutCard]} onPress={() => handleNav('logout')}>
            <View style={styles.itemContent}>
              <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                <Icon name="log-out" size={20} color="#ef4444" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemLabel, styles.logoutLabel]}>Logout</Text>
                <Text style={styles.itemDescription}>Sign out of your account</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ef4444" />
            </View>
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
  backBtn: {
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
  appInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  appIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  appIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutCard: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  logoutIconContainer: {
    backgroundColor: '#fecaca',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  logoutLabel: {
    color: '#ef4444',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  switch: {
    marginLeft: 8,
  },
});

export default SettingsScreen; 