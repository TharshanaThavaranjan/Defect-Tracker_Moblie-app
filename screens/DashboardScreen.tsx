import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Animated, PanResponder, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Project } from '../types';
import { projectsApi } from '../api/projects';

const FILTERS = ['All Projects', 'High Risk', 'Medium Risk', 'Low Risk'];

const STATUS_CARDS = [
  {
    label: 'High Risk Projects',
    description: 'Immediate attention required',
    color: '#F44336',
    light: '#fff5f5',
    border: '#F44336',
    key: 'High Risk',
    icon: <Icon name="alert-circle-outline" size={32} color="#F44336" />,
  },
  {
    label: 'Medium Risk Projects',
    description: 'Monitor progress closely',
    color: '#FFB300',
    light: '#fffbe5',
    border: '#FFB300',
    key: 'Medium Risk',
    icon: <Icon name="alert-outline" size={32} color="#FFB300" />,
  },
  {
    label: 'Low Risk Projects',
    description: 'Stable and on track',
    color: '#43A047',
    light: '#f5fff7',
    border: '#43A047',
    key: 'Low Risk',
    icon: <Icon name="check-circle-outline" size={32} color="#43A047" />,
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

// Swipeable Notification Component
const SwipeableNotification: React.FC<{
  notification: { id: number; message: string };
  onDismiss: (id: number) => void;
}> = ({ notification, onDismiss }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      translateX.setValue(gestureState.dx);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (Math.abs(gestureState.dx) > 100) {
        // Swipe threshold met, dismiss notification
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: gestureState.dx > 0 ? 400 : -400,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss(notification.id);
        });
      } else {
        // Reset position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return (
    <Animated.View
      style={[
        styles.centerModalItem,
        {
          transform: [{ translateX }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.notificationItemHeader}>
        <View style={styles.notificationIconContainer}>
          <Icon name="bell" size={16} color="#2563eb" />
        </View>
        <Text style={styles.notificationTime}>Just now</Text>
      </View>
      <Text style={styles.centerModalItemText}>{notification.message}</Text>
    </Animated.View>
  );
};

const DashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const [selectedFilter, setSelectedFilter] = useState('All Projects');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Project "Defect Tracker" is at high risk.' },
    { id: 2, message: 'QA testing deadline approaching.' },
    { id: 3, message: 'New comment on "Heart" project.' },
  ]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userEmail } = route.params || {};

  // Function to determine risk level based on project data
  const getProjectRisk = (project: Project): string => {
    // Simple risk calculation based on project dates and other factors
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const now = new Date();
    
    // If project is overdue, it's high risk
    if (now > endDate) {
      return 'High Risk';
    }
    
    // If project is within 7 days of deadline, it's medium risk
    const daysUntilDeadline = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline <= 7) {
      return 'Medium Risk';
    }
    
    // Otherwise, it's low risk
    return 'Low Risk';
  };

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsApi.getProjects();
      setProjects(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Transform API projects to display format
  const transformedProjects = projects.map(project => ({
    ...project,
    name: project.projectName,
    risk: getProjectRisk(project),
  }));

  const filteredProjects =
    selectedFilter === 'All Projects'
      ? transformedProjects
      : transformedProjects.filter((p) => p.risk === selectedFilter);

  // Sort projects by risk: High Risk (red) → Medium Risk (yellow) → Low Risk (green)
  const riskOrder = { 'High Risk': 0, 'Medium Risk': 1, 'Low Risk': 2 };
  const sortedProjects = [...filteredProjects].sort((a, b) => riskOrder[a.risk as keyof typeof riskOrder] - riskOrder[b.risk as keyof typeof riskOrder]);

  // Calculate counts dynamically
  const highRiskCount = transformedProjects.filter(p => p.risk === 'High Risk').length;
  const mediumRiskCount = transformedProjects.filter(p => p.risk === 'Medium Risk').length;
  const lowRiskCount = transformedProjects.filter(p => p.risk === 'Low Risk').length;

  const statusCounts = {
    'High Risk': highRiskCount,
    'Medium Risk': mediumRiskCount,
    'Low Risk': lowRiskCount,
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#f44336" />
        <Text style={styles.errorTitle}>Failed to load projects</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
      {/* Notification Center Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.centerModalOverlay}>
          <View style={styles.centerModalContent}>
            <View style={styles.centerModalHeader}>
              <View style={styles.modalTitleContainer}>
                <Icon name="bell" size={24} color="#2563eb" style={styles.modalTitleIcon} />
                <Text style={styles.centerModalTitle}>Notifications</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowNotifications(false)}>
                <Icon name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>
            <View style={styles.centerModalList}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotificationContainer}>
                  <Icon name="bell-off" size={48} color="#cbd5e1" />
                  <Text style={styles.noNotifications}>No notifications</Text>
                  <Text style={styles.emptyNotificationSubtitle}>You're all caught up!</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.swipeHint}>Swipe left or right to dismiss</Text>
                  {notifications.map((notif) => (
                    <SwipeableNotification
                      key={notif.id}
                      notification={notif}
                      onDismiss={handleDismissNotification}
                    />
                  ))}
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
      {/* Custom Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.appIcon}><Text style={styles.appIconText}>DT</Text></View>
          <View>
            <Text style={styles.appName}>DefectTracker Pro</Text>
            <Text style={styles.appSubtitle}>Project Management Suite</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowNotifications(true)}>
            <View style={styles.bellContainer}>
              <Icon name="bell-outline" size={24} color="#2563eb" />
              {notifications.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>
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
              <View style={styles.statusIconWrap}>{card.icon}</View>
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
            {FILTERS.map((filter) => {
              const isActive = selectedFilter === filter;
              let filterStyle: any = styles.filterButton;
              let textStyle: any = styles.filterButtonText;
              
              if (isActive) {
                if (filter === 'High Risk') {
                  filterStyle = StyleSheet.flatten([styles.filterButton, { backgroundColor: '#F44336' }]);
                  textStyle = StyleSheet.flatten([styles.filterButtonText, { color: '#fff' }]);
                } else if (filter === 'Medium Risk') {
                  filterStyle = StyleSheet.flatten([styles.filterButton, { backgroundColor: '#FFB300' }]);
                  textStyle = StyleSheet.flatten([styles.filterButtonText, { color: '#fff' }]);
                } else if (filter === 'Low Risk') {
                  filterStyle = StyleSheet.flatten([styles.filterButton, { backgroundColor: '#43A047' }]);
                  textStyle = StyleSheet.flatten([styles.filterButtonText, { color: '#fff' }]);
                } else {
                  // All Projects
                  filterStyle = StyleSheet.flatten([styles.filterButton, styles.filterButtonActive]);
                  textStyle = StyleSheet.flatten([styles.filterButtonText, styles.filterButtonTextActive]);
                }
              }
              
              return (
                <TouchableOpacity
                  key={filter}
                  style={filterStyle}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={textStyle}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
                  key={project.id || project.name + idx}
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
  statusIconWrap: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginRight: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  centerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    minWidth: 340,
    maxWidth: '90%',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  centerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  modalTitleIcon: {
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  centerModalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#2563eb',
  },
  centerModalClose: {
    fontSize: 22,
    color: '#888',
    padding: 4,
  },
  centerModalList: {
    width: '100%',
    marginTop: 8,
  },
  centerModalItem: {
    backgroundColor: '#f8fafd',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  centerModalItemText: {
    color: '#222',
    fontSize: 15,
  },
  sheetItem: {
    backgroundColor: '#f0f4fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  sheetItemText: {
    color: '#222',
    fontSize: 15,
  },
  noNotifications: {
    color: '#888',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyNotificationContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyNotificationSubtitle: {
    fontSize: 13,
    color: '#6c6c8a',
    marginTop: 5,
  },
  notificationItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationIconContainer: {
    marginRight: 8,
  },
  notificationIcon: {
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6c6c8a',
  },
  swipeHint: {
    fontSize: 14,
    color: '#6c6c8a',
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafd',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c6c8a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafd',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6c6c8a',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DashboardScreen;