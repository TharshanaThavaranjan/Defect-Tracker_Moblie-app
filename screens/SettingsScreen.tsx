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
    <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={26} color={isDark ? '#fff' : '#2563eb'} />
      </TouchableOpacity>
      <Text style={styles.header}>Settings</Text>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {settingsItems.map((item) => (
          <View key={item.key} style={styles.card}>
            <View style={styles.itemRow}>
              <View style={styles.iconLabelRow}>
                <Icon
                  name={item.icon}
                  size={22}
                  color={'#2563eb'}
                  style={styles.icon}
                />
                <Text style={styles.label}>{item.label}</Text>
              </View>
              {item.type === 'toggle' ? (
                <Switch
                  value={item.key === 'notification' ? notificationEnabled : isDark}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{ false: '#bfc9d1', true: '#2563eb' }}
                  thumbColor={Platform.OS === 'android' ? (item.key === 'notification' ? (notificationEnabled ? '#2563eb' : '#fff') : (isDark ? '#2563eb' : '#fff')) : ''}
                />
              ) : (
                <TouchableOpacity onPress={() => handleNav(item.key)}>
                  <Icon name="chevron-right" size={22} color={'#bfc9d1'} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
    paddingTop: 50,
  },
  backBtn: {
    position: 'absolute',
    top: 18,
    left: 18,
    zIndex: 10,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    padding: 6,
    elevation: 2,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    alignSelf: 'center',
    color: '#222',
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    letterSpacing: 0.1,
  },
});

export default SettingsScreen; 