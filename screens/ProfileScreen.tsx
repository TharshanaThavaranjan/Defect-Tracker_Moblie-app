import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const user = {
  name: 'Anna Avetisyan',
  birthday: 'Birthday',
  phone: '818 123 4567',
  instagram: 'Instagram account',
  email: 'info@aplusdesign.co',
  password: 'Password',
};

const ProfileScreen = ({ navigation }: any) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient colors={["#7F53AC", "#647DEE"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('ProjectDetail', { project: { name: 'Defect Tracker', risk: 'High Risk' } })}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{user.name}</Text>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Icon name="account" size={60} color="#bdbdbd" />
          </View>
        </View>
      </LinearGradient>
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name="account-outline" size={24} color="#7F53AC" style={styles.infoIcon} />
          <Text style={styles.infoText}>{user.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="calendar" size={24} color="#7F53AC" style={styles.infoIcon} />
          <Text style={styles.infoText}>{user.birthday}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="cellphone" size={24} color="#7F53AC" style={styles.infoIcon} />
          <Text style={styles.infoText}>{user.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="instagram" size={24} color="#7F53AC" style={styles.infoIcon} />
          <Text style={styles.infoText}>{user.instagram}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="email-outline" size={24} color="#7F53AC" style={styles.infoIcon} />
          <Text style={styles.infoText}>{user.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="eye-outline" size={24} color="#7F53AC" style={styles.infoIcon} />
          <Text style={styles.infoText}>{user.password}</Text>
          <Icon name="sync" size={20} color="#bdbdbd" style={{ marginLeft: 'auto' }} />
        </View>
        <TouchableOpacity style={styles.editButton}>
          <LinearGradient colors={["#7F53AC", "#647DEE"]} style={styles.editButtonGradient}>
            <Text style={styles.editButtonText}>Edit profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  header: {
    height: 200,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 2,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
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
    borderColor: '#f5f5f5',
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
    shadowOpacity: 0.1,
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
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    marginTop: 30,
    borderRadius: 24,
    overflow: 'hidden',
  },
  editButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 24,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 