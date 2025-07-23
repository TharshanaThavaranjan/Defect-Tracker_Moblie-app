import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const PROJECTS = [
  { name: 'Defect Tracker', risk: 'High Risk' },
  { name: 'QA testing', risk: 'High Risk' },
  { name: 'proko', risk: 'Low Risk' },
  { name: 'Heart', risk: 'Low Risk' },
  { name: 'Dashbord ', risk: 'High Risk' },
  { name: 'JALI', risk: 'Low Risk' },
  { name: 'Hell', risk: 'Low Risk' },
  { name: 'Test', risk: 'High Risk' },
  { name: 'Joko', risk: 'Medium Risk' },
  { name: 'Tika', risk: 'Medium Risk' },
];

const FILTERS = ['All Projects', 'High Risk', 'Medium Risk', 'Low Risk'];

const STATUS_CARDS = [
  {
    label: 'High Risk Projects',
    description: 'Immediate attention required',
    color: '#F44336',
    light: '#fff5f5',
    border: '#F44336',
    key: 'High Risk',
    icon: '❗',
  },
  {
    label: 'Medium Risk Projects',
    description: 'Monitor progress closely',
    color: '#FFB300',
    light: '#fffbe5',
    border: '#FFB300',
    key: 'Medium Risk',
    icon: '⚠️',
  },
  {
    label: 'Low Risk Projects',
    description: 'Stable and on track',
    color: '#43A047',
    light: '#f5fff7',
    border: '#43A047',
    key: 'Low Risk',
    icon: '✅',
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const [selectedFilter, setSelectedFilter] = useState('All Projects');
  const { userEmail } = route.params || {};

  const filteredProjects =
    selectedFilter === 'All Projects'
      ? PROJECTS
      : PROJECTS.filter((p) => p.risk === selectedFilter);

  // Sort projects by risk: High Risk (red) → Medium Risk (yellow) → Low Risk (green)
  const riskOrder = { 'High Risk': 0, 'Medium Risk': 1, 'Low Risk': 2 };
  const sortedProjects = [...filteredProjects].sort((a, b) => riskOrder[a.risk as keyof typeof riskOrder] - riskOrder[b.risk as keyof typeof riskOrder]);

  // Calculate counts dynamically
  const highRiskCount = PROJECTS.filter(p => p.risk === 'High Risk').length;
  const mediumRiskCount = PROJECTS.filter(p => p.risk === 'Medium Risk').length;
  const lowRiskCount = PROJECTS.filter(p => p.risk === 'Low Risk').length;

  const statusCounts = {
    'High Risk': highRiskCount,
    'Medium Risk': mediumRiskCount,
    'Low Risk': lowRiskCount,
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
      {/* Custom Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.appIcon}><Text style={styles.appIconText}>DT</Text></View>
          <View>
            <Text style={styles.appName}>DefectTracker Pro</Text>
            <Text style={styles.appSubtitle}>Project Management Suite</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
         { /*<Text style={styles.logoutIcon}>⇦</Text>*/}
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {/* Main Content */}
      <ScrollView>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Dashboard Overview</Text>
          <Text style={styles.headerSubtitle}>
            Gain insights into your projects with real-time health metrics and status summaries
          </Text>
          <View style={styles.headerUnderline} />
        </View>

        <Text style={styles.sectionTitle}>Project Status Insights</Text>
        <View style={styles.statusCardsRow}>
          {STATUS_CARDS.map((card) => (
            <View
              key={card.label}
              style={[styles.statusCard, { borderColor: card.border, backgroundColor: card.light }]}
            >
              <Text style={[styles.statusIcon, { color: card.color }]}>{card.icon}</Text>
              <Text style={styles.statusCardTitle}>{card.label}</Text>
              <Text style={[styles.statusCardCount, { color: card.color }]}> {
                statusCounts[card.key as 'High Risk' | 'Medium Risk' | 'Low Risk']
              }</Text>
              <Text style={styles.statusCardDesc}>{card.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.projectsSection}>
          <Text style={styles.projectsTitle}>All Projects</Text>
          <View style={styles.filterRow}>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter && styles.filterButtonTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.projectsGrid}>
            {sortedProjects.map((project, idx) => {
              const cardStyle =
                project.risk === 'High Risk'
                  ? styles.projectCardHigh
                  : project.risk === 'Medium Risk'
                  ? styles.projectCardMedium
                  : styles.projectCardLow;
              return (
                <TouchableOpacity
                  key={project.name + idx}
                  style={[styles.projectCard, cardStyle]}
                  onPress={() => navigation.navigate('ProjectDetail', { project })}
                >
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={styles.riskPillWrap}>
                    <Text
                      style={[
                        styles.riskPill,
                        project.risk === 'High Risk'
                          ? styles.riskPillHigh
                          : project.risk === 'Medium Risk'
                          ? styles.riskPillMedium
                          : styles.riskPillLow,
                      ]}
                    >
                      {project.risk}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f1f6',
    elevation: 2,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  appIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  appName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2563eb',
    marginBottom: 0,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#6c6c8a',
    marginTop: -2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logoutIcon: {
    fontSize: 18,
    color: '#2563eb',
    marginRight: 4,
  },
  logoutText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6c6c8a',
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 320,
  },
  headerUnderline: {
    width: 80,
    height: 3,
    backgroundColor: '#6c6c8a',
    opacity: 0.15,
    borderRadius: 2,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 12,
    marginTop: 8,
    color: '#222',
  },
  statusCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    marginHorizontal: 8,
  },
  statusCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 14,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    minWidth: 110,
    maxWidth: 150,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statusIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  statusCardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
    color: '#222',
    textAlign: 'center',
  },
  statusCardCount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusCardDesc: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  projectsSection: {
    marginTop: 12,
    paddingHorizontal: 8,
  },
  projectsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 8,
    color: '#222',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 2,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f0f4fa',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  projectCard: {
    width: 120,
    height: 120,
    borderRadius: 60,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectCardHigh: {
    backgroundColor: '#F44336',
  },
  projectCardMedium: {
    backgroundColor: '#FFB300',
  },
  projectCardLow: {
    backgroundColor: '#43A047',
  },
  projectCheck: {
    color: '#fff',
    fontSize: 22,
    position: 'absolute',
    top: 16,
    right: 18,
  },
  projectName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 8,
  },
  riskPillWrap: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  riskPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    overflow: 'hidden',
  },
  riskPillHigh: {
    backgroundColor: '#c62828',
  },
  riskPillMedium: {
    backgroundColor: '#ff9800',
  },
  riskPillLow: {
    backgroundColor: '#2e7d32',
  },
});

export default DashboardScreen; 