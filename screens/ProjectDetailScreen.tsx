import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Animated, PanResponder, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Project, DefectDensity, DefectSeverityIndex, DefectRemarkRatio } from '../types';
import Svg, { Path, Line, G, Circle, Text as SvgText, Polyline } from 'react-native-svg';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { projectsApi } from '../api/projects';
import { ProjectCardColor, DefectSeveritySummary, DefectStatistics, DefectByModule, ReopenCountSummary, DefectDetail } from '../api/types';

// Project metrics for each project
const PROJECT_DENSITY: Record<string, number> = {
  'Defect_Tracker': 82.77,
  'QA testing': 70.12,
  'project 1': 60.5,
  'Heart': 90.0,
  'Dashbord testing': 50.0,
  'JALI': 75.0,
  'Hello world': 40.0,
  'dashboard test': 65.0,
};

const STATIC_SEVERITY_INDEX = 67.6;
const STATIC_DEFECT_TO_REMARK_RATIO = '2:1';

// Accepts a project object via navigation params
type Props = NativeStackScreenProps<RootStackParamList, 'ProjectDetail'>;

const STATUS_COLORS = {
  REOPEN: '#eb1909',
  NEW: '#3b82f6',
  OPEN: '#ffeb3b',
  FIXED: '#43A047', // green
  CLOSED: '#19d2bf', // blue (distinct from green)
  REJECT: '#8909eb',
  DUPLICATE: '#fc4efa',
};

const MOCK_DATA = {
  defectDensity: 82.77,
  defectSeverityIndex: 67.6,
  defectToRemarkRatio: '2:1',
  defectSeverityBreakdown: [
    {
      label: 'High',
      color: '#F44336',
      border: '#F44336',
      statuses: [
        { name: 'REOPEN', count: 2 },
        { name: 'NEW', count: 3 },
        { name: 'OPEN', count: 1 },
        { name: 'FIXED', count: 0 },
        { name: 'CLOSED', count: 0 },
        { name: 'REJECT', count: 0 },
        { name: 'DUPLICATE', count: 0 },
      ],
    },
    {
      label: 'Medium',
      color: '#FFB300',
      border: '#FFB300',
      statuses: [
        { name: 'REOPEN', count: 0 },
        { name: 'NEW', count: 1 },
        { name: 'OPEN', count: 2 },
        { name: 'FIXED', count: 2 },
        { name: 'CLOSED', count: 0 },
        { name: 'REJECT', count: 0 },
        { name: 'DUPLICATE', count: 0 },
      ],
    },
    {
      label: 'Low',
      color: '#43A047',
      border: '#43A047',
      statuses: [
        { name: 'REOPEN', count: 0 },
        { name: 'NEW', count: 0 },
        { name: 'OPEN', count: 0 },
        { name: 'FIXED', count: 1 },
        { name: 'CLOSED', count: 2 },
        { name: 'REJECT', count: 1 },
        { name: 'DUPLICATE', count: 0 },
      ],
    },
  ],
  reopened: [
    { label: 'Once', value: 87, color: '#4285F4' },
    { label: 'More', value: 13, color: '#FFB300' },
  ],
  defectType: [
    { label: 'Functionality', value: 60, color: '#4285F4' },
    { label: 'UI', value: 20, color: '#43A047' },
    { label: 'Performance', value: 10, color: '#FFB300' },
    { label: 'Security', value: 10, color: '#F44336' },
  ],
  timeToFind: [5, 6, 8, 7, 6, 5, 4, 5],
  timeToFix: [4, 5, 7, 6, 7, 6, 5, 6],
  modules: [
    { label: 'Config', value: 17, color: '#4285F4' },
    { label: 'Project Mgmt', value: 15, color: '#43A047' },
    { label: 'Batch', value: 13, color: '#FFB300' },
    { label: 'Defect', value: 12, color: '#F44336' },
    { label: 'Test Cases', value: 10, color: '#8e24aa' },
    { label: 'Release', value: 9, color: '#00bcd4' },
    { label: 'Requirement', value: 8, color: '#ff7043' },
    { label: 'Main Navigation', value: 7, color: '#cddc39' },
    { label: 'Dashboard', value: 6, color: '#607d8b' },
  ],
};

// Pie chart component for defects reopened multiple times
interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  radius?: number;
  cx?: number;
  cy?: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, radius = 35, cx = 40, cy = 40 }) => {
  const total = data.reduce((sum: number, d: PieChartData) => sum + d.value, 0);
  let startAngle = 0;
  const paths = data.map((slice: PieChartData, idx: number) => {
    const angle = (slice.value / total) * 2 * Math.PI;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(startAngle + angle);
    const y2 = cy + radius * Math.sin(startAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');
    startAngle += angle;
    return (
      <Path
        key={idx}
        d={pathData}
        fill={slice.color}
      />
    );
  });
  return (
    <Svg width={cx * 2} height={cy * 2}>
      {paths}
    </Svg>
  );
};

// Line chart component for time to find defects
type LineChartProps = {
  data: number[];
  labels: string[];
  width?: number;
  height?: number;
  color?: string;
};

const LineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  width = 300,
  height = 120,
  color = '#2563eb',
}) => {
  const maxY = Math.max(...data, 5);
  const minY = 0;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const points: [number, number][] = data.map((y: number, i: number) => {
    const x = padding + (i * chartWidth) / (data.length - 1);
    const yPos = padding + chartHeight - ((y - minY) / (maxY - minY)) * chartHeight;
    return [x, yPos];
  });
  const polylinePoints = points.map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <View>
      <Svg width={width} height={height + 40}>
        {/* Y-axis label */}
        <SvgText
          x={10}
          y={height / 2 + 10}
          fontSize="14"
          fill="#222"
          textAnchor="middle"
          transform={`rotate(-90, 10, ${height / 2 + 10})`}
          fontWeight="bold"
        >
          Defect counts
        </SvgText>
        {/* Grid lines and labels */}
        {[...Array(6)].map((_, i) => {
          const y = padding + (chartHeight * i) / 5;
          return (
            <G key={i}>
              <Line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e0e0e0"
                strokeWidth={1}
              />
              <SvgText
                x={padding - 8}
                y={y + 4}
                fontSize="10"
                fill="#888"
                textAnchor="end"
              >
                {Math.round(maxY - ((maxY - minY) * i) / 5)}
              </SvgText>
            </G>
          );
        })}
        {/* X axis labels */}
        {labels.map((label: string, i: number) => {
          const x = padding + (i * chartWidth) / (labels.length - 1);
          return (
            <SvgText
              key={i}
              x={x}
              y={height - 8}
              fontSize="10"
              fill="#888"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
        {/* Polyline for data */}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
        {/* Dots */}
        {points.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={4} fill="#fff" stroke={color} strokeWidth={2} />
        ))}
        {/* X-axis label */}
        <SvgText
          x={width / 2}
          y={height + 28}
          fontSize="14"
          fill="#222"
          textAnchor="middle"
          fontWeight="bold"
        >
          Days
        </SvgText>
      </Svg>
    </View>
  );
};

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

const ProjectDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const [selectedReopenedLabel, setSelectedReopenedLabel] = useState('2 times');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Project "Defect Tracker" is at high risk.' },
    { id: 2, message: 'QA testing deadline approaching.' },
    { id: 3, message: 'New comment on "Heart" project.' },
  ]);
  const { project } = route.params || {};

  // State for projects from API
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for project card color
  const [projectColorData, setProjectColorData] = useState<ProjectCardColor | null>(null);
  const [colorLoading, setColorLoading] = useState(false);
  const [colorError, setColorError] = useState<string | null>(null);

  // State for defect density
  const [defectDensityData, setDefectDensityData] = useState<DefectDensity | null>(null);
  const [defectDensityLoading, setDefectDensityLoading] = useState(false);
  const [defectDensityError, setDefectDensityError] = useState<string | null>(null);

  // State for defect severity index
  const [dsiData, setDsiData] = useState<DefectSeverityIndex | null>(null);
  const [dsiLoading, setDsiLoading] = useState(false);
  const [dsiError, setDsiError] = useState<string | null>(null);

  // State for defect remark ratio
  const [remarkRatioData, setRemarkRatioData] = useState<DefectRemarkRatio | null>(null);
  const [remarkRatioLoading, setRemarkRatioLoading] = useState(false);
  const [remarkRatioError, setRemarkRatioError] = useState<string | null>(null);

  // State for defect severity summary
  const [defectSeveritySummaryData, setDefectSeveritySummaryData] = useState<DefectSeveritySummary | null>(null);
  const [defectSeveritySummaryLoading, setDefectSeveritySummaryLoading] = useState(false);
  const [defectSeveritySummaryError, setDefectSeveritySummaryError] = useState<string | null>(null);

  // State for defect statistics
  const [defectStatisticsData, setDefectStatisticsData] = useState<DefectStatistics | null>(null);
  const [defectStatisticsLoading, setDefectStatisticsLoading] = useState(false);
  const [defectStatisticsError, setDefectStatisticsError] = useState<string | null>(null);

  // State for defects by module
  const [defectsByModuleApiData, setDefectsByModuleApiData] = useState<DefectByModule[] | null>(null);
  const [defectsByModuleLoading, setDefectsByModuleLoading] = useState(false);
  const [defectsByModuleError, setDefectsByModuleError] = useState<string | null>(null);

  // State for reopen count summary
  const [reopenCountSummaryData, setReopenCountSummaryData] = useState<ReopenCountSummary[] | null>(null);
  const [reopenCountSummaryLoading, setReopenCountSummaryLoading] = useState(false);
  const [reopenCountSummaryError, setReopenCountSummaryError] = useState<string | null>(null);

  // State for defect details by reopen count
  const [defectDetailsData, setDefectDetailsData] = useState<DefectDetail[] | null>(null);
  const [defectDetailsLoading, setDefectDetailsLoading] = useState(false);
  const [defectDetailsError, setDefectDetailsError] = useState<string | null>(null);
  const [selectedReopenCount, setSelectedReopenCount] = useState<string>('2 times');

  // State for selected project and its defect density
  const [selectedProject, setSelectedProject] = useState(project);
  const [defectDensity, setDefectDensity] = useState(() => PROJECT_DENSITY[project.projectName] || 0);
  // State for modal visibility and selected severity index
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSeverityIndex, setModalSeverityIndex] = useState<number | null>(null);
  const [showReopenedTable, setShowReopenedTable] = useState(false);

  // Function to get risk level from gradient class
  const getRiskFromGradient = (gradientClass: string): string => {
    if (gradientClass.includes('yellow')) {
      return 'Medium';
    } else if (gradientClass.includes('red')) {
      return 'High';
    } else if (gradientClass.includes('green')) {
      return 'Low';
    } else {
      return 'Low';
    }
  };

  // Function to get risk level text for display
  const getRiskLevelText = (gradientClass: string): string => {
    if (gradientClass.includes('yellow')) {
      return 'Medium Risk';
    } else if (gradientClass.includes('red')) {
      return 'High Risk';
    } else if (gradientClass.includes('green')) {
      return 'Low Risk';
    } else {
      return 'Low Risk';
    }
  };

  // Function to determine risk level based on project data (fallback)
  const getProjectRisk = (project: Project): string => {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const now = new Date();
    
    if (now > endDate) {
      return 'High Risk';
    }
    
    const daysUntilDeadline = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline <= 7) {
      return 'Medium Risk';
    }
    
    return 'Low Risk';
  };

  // Fetch project card color from API
  const fetchProjectCardColor = async (projectId: number) => {
    try {
      setColorLoading(true);
      setColorError(null);
      const response = await projectsApi.getProjectCardColor(projectId.toString());
      setProjectColorData(response.data);
      console.log('Project color data:', response.data);
    } catch (err: any) {
      setColorError(err.message || 'Failed to fetch project color');
      console.error('Error fetching project color:', err);
    } finally {
      setColorLoading(false);
    }
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

  // Fetch defect density for selected project
  const fetchDefectDensity = async (projectId: number) => {
    try {
      setDefectDensityLoading(true);
      setDefectDensityError(null);
      // Using a default KLOC value of 1.0 - in a real app, this would come from project data
      const response = await projectsApi.getDefectDensity(projectId, 1.0);
      setDefectDensityData(response.data);
      setDefectDensity(response.data.defectDensity);
    } catch (err: any) {
      setDefectDensityError(err.message || 'Failed to fetch defect density');
      console.error('Error fetching defect density:', err);
      // Fallback to static data
      setDefectDensity(PROJECT_DENSITY[selectedProject.projectName] || 0);
    } finally {
      setDefectDensityLoading(false);
    }
  };

  // Fetch defect severity index for selected project
  const fetchDefectSeverityIndex = async (projectId: number) => {
    try {
      setDsiLoading(true);
      setDsiError(null);
      const response = await projectsApi.getDefectSeverityIndex(projectId);
      setDsiData(response.data);
    } catch (err: any) {
      setDsiError(err.message || 'Failed to fetch defect severity index');
      console.error('Error fetching defect severity index:', err);
    } finally {
      setDsiLoading(false);
    }
  };

  // Fetch defect remark ratio for selected project
  const fetchDefectRemarkRatio = async (projectId: number) => {
    try {
      setRemarkRatioLoading(true);
      setRemarkRatioError(null);
      const response = await projectsApi.getDefectRemarkRatio(projectId);
      setRemarkRatioData(response.data);
    } catch (err: any) {
      setRemarkRatioError(err.message || 'Failed to fetch defect remark ratio');
      console.error('Error fetching defect remark ratio:', err);
    } finally {
      setRemarkRatioLoading(false);
    }
  };

  // Fetch defect severity summary for selected project
  const fetchDefectSeveritySummary = async (projectId: number) => {
    try {
      setDefectSeveritySummaryLoading(true);
      setDefectSeveritySummaryError(null);
      const response = await projectsApi.getDefectSeveritySummary(projectId);
      setDefectSeveritySummaryData(response.data);
      console.log('Defect severity summary data:', response.data);
    } catch (err: any) {
      setDefectSeveritySummaryError(err.message || 'Failed to fetch defect severity summary');
      console.error('Error fetching defect severity summary:', err);
    } finally {
      setDefectSeveritySummaryLoading(false);
    }
  };

  // Fetch defect statistics for selected project
  const fetchDefectStatistics = async (projectId: number) => {
    try {
      setDefectStatisticsLoading(true);
      setDefectStatisticsError(null);
      const response = await projectsApi.getDefectStatistics(projectId);
      setDefectStatisticsData(response.data);
      console.log('Defect statistics data:', response.data);
    } catch (err: any) {
      setDefectStatisticsError(err.message || 'Failed to fetch defect type statistics');
      console.error('Error fetching defect type statistics:', err);
    } finally {
      setDefectStatisticsLoading(false);
    }
  };

  // Fetch defects by module for selected project
  const fetchDefectsByModule = async (projectId: number) => {
    try {
      setDefectsByModuleLoading(true);
      setDefectsByModuleError(null);
      const response = await projectsApi.getDefectsByModule(projectId);
      setDefectsByModuleApiData(response.data);
      console.log('Defects by module data:', response.data);
    } catch (err: any) {
      setDefectsByModuleError(err.message || 'Failed to fetch defects by module');
      console.error('Error fetching defects by module:', err);
    } finally {
      setDefectsByModuleLoading(false);
    }
  };

  // Fetch reopen count summary for selected project
  const fetchReopenCountSummary = async (projectId: number) => {
    try {
      setReopenCountSummaryLoading(true);
      setReopenCountSummaryError(null);
      const response = await projectsApi.getReopenCountSummary(projectId);
      setReopenCountSummaryData(response.data);
    } catch (err: any) {
      setReopenCountSummaryError(err.message || 'Failed to fetch reopen count summary');
      console.error('Error fetching reopen count summary:', err);
    } finally {
      setReopenCountSummaryLoading(false);
    }
  };

  // Fetch defect details by reopen count for selected project
  const fetchDefectDetails = async (projectId: number, reopenCount?: string) => {
    try {
      setDefectDetailsLoading(true);
      setDefectDetailsError(null);
      
      let response;
      if (reopenCount === 'More than 5 times') {
        response = await projectsApi.getDefectDetailsMoreThanFive(projectId);
      } else {
        const count = parseInt(reopenCount?.replace(' times', '') || '2');
        response = await projectsApi.getDefectDetailsByReopenCount(projectId, count);
      }
      
      setDefectDetailsData(response.data);
    } catch (err: any) {
      setDefectDetailsError(err.message || 'Failed to fetch defect details');
      console.error('Error fetching defect details:', err);
    } finally {
      setDefectDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Fetch all metrics when project changes
    if (selectedProject.id) {
      fetchDefectDensity(selectedProject.id);
      fetchDefectSeverityIndex(selectedProject.id);
      fetchDefectRemarkRatio(selectedProject.id);
      fetchProjectCardColor(selectedProject.id);
      fetchDefectSeveritySummary(selectedProject.id);
      fetchDefectStatistics(selectedProject.id);
      fetchDefectsByModule(selectedProject.id);
      fetchReopenCountSummary(selectedProject.id);
      fetchDefectDetails(selectedProject.id);
    } else {
      // Fallback to static data
      setDefectDensity(PROJECT_DENSITY[selectedProject.projectName] || 0);
    }
  }, [selectedProject]);

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

  const handleSelectProject = (proj: Project) => {
    if (proj.projectName !== selectedProject.projectName) {
      setSelectedProject(proj);
      navigation.replace('ProjectDetail', { project: proj });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Get color based on defect density (based on industry standards)
  const getDefectDensityColor = (density: number): string => {
    if (density <= 7.0) return '#43A047'; // Green - Good
    if (density <= 10.0) return '#FFB300'; // Yellow - Moderate
    return '#F44336'; // Red - High Risk
  };

  // Get meaning based on defect density (based on industry standards)
  const getDefectDensityMeaning = (density: number): string => {
    if (density <= 7.0) return 'Good';
    if (density <= 10.0) return 'Moderate Quality';
    return 'High Risk';
  };

  // Get color based on DSI percentage
  const getDsiColor = (percentage: number): string => {
    if (percentage <= 25) return '#43A047'; // Green - Low risk
    if (percentage <= 50) return '#FFB300'; // Yellow - Moderate risk
    return '#F44336'; // Red - High risk
  };

  // Get interpretation based on DSI percentage
  const getDsiInterpretation = (percentage: number): string => {
    if (percentage <= 25) return 'Low risk';
    if (percentage <= 50) return 'Moderate risk';
    return 'High risk';
  };

  // Get color based on remark ratio
  const getRemarkRatioColor = (ratio: string): string => {
    const numericRatio = parseFloat(ratio.replace('%', ''));
    if (numericRatio > 98 && numericRatio <= 100) return '#43A047'; // Green - Low
    if (numericRatio >= 90 && numericRatio <= 98) return '#FFB300'; // Yellow - Medium
    return '#F44336'; // Red - High
  };

  // Get category based on remark ratio
  const getRemarkRatioCategory = (ratio: string): string => {
    const numericRatio = parseFloat(ratio.replace('%', ''));
    if (numericRatio > 98 && numericRatio <= 100) return 'Low';
    if (numericRatio >= 90 && numericRatio <= 98) return 'Medium';
    return 'High';
  };

  const reopenedData = [
    { label: '2 times', value: 3, color: '#4285F4' },
    { label: '3 times', value: 1, color: '#FFB300' },
  ];

  const defectTypeData = [
    { label: 'Functionality', value: 236, color: '#4285F4' },
    { label: 'UI', value: 81, color: '#00b894' },
    { label: 'Usability', value: 31, color: '#fdcb6e' },
    { label: 'Validation', value: 99, color: '#d63031' },
  ];

  const timeToFindData = [5, 6, 8, 7, 6, 5, 4, 5, 3, 2];
  const timeToFindLabels = [
    'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5',
    'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'
  ];

  const timeToFixData = [3, 2, 5, 4, 2, 3, 2, 2, 1, 2];
  const timeToFixLabels = [
    'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5',
    'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'
  ];

  const defectsByModuleData = [
    { label: 'Configurations', value: 78, color: '#4285F4' },
    { label: 'Project Management', value: 50, color: '#00b894' },
    { label: 'Bench', value: 57, color: '#fdcb6e' },
    { label: 'Defects', value: 63, color: '#d63031' },
    { label: 'Test Cases', value: 54, color: '#a29bfe' },
    { label: 'Employee', value: 67, color: '#e17055' },
    { label: 'Releases', value: 35, color: '#00bcd4' },
    { label: 'Project', value: 22, color: '#6c5ce7' },
    { label: 'Main Template', value: 4, color: '#00b894' },
    { label: 'Dashboard', value: 17, color: '#e17055' },
  ];

  // Add sample defect data for table display
  const DEFECTS_REOPENED_DETAILS: Record<string, Array<{ id: string; count: number; release: string; reporter: string }>> = {
    '2 times': [
      { id: 'DF-101', count: 2, release: 'v1.2', reporter: 'Alice' },
      { id: 'DF-102', count: 2, release: 'v1.2', reporter: 'Bob' },
      { id: 'DF-103', count: 2, release: 'v1.3', reporter: 'Charlie' },
    ],
    '3 times': [
      { id: 'DF-104', count: 3, release: 'v1.3', reporter: 'David' },
    ],
  };

  // Helper for table rendering
  const renderReopenedTable = (label: string) => {
    const rows = DEFECTS_REOPENED_DETAILS[label] || [];
    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Defect ID</Text>
          <Text style={styles.tableHeaderCell}>Reopened Counts</Text>
          <Text style={styles.tableHeaderCell}>Reporter</Text>
          <Text style={styles.tableHeaderCell}>Release</Text>
        </View>
        {rows.map((row: { id: string; count: number; release: string; reporter: string }, idx: number) => (
          <View key={row.id + idx} style={styles.tableRow}>
            <Text style={styles.tableCell}>{row.id}</Text>
            <Text style={styles.tableCell}>{row.count}</Text>
            <Text style={styles.tableCell}>{row.reporter}</Text>
            <Text style={styles.tableCell}>{row.release}</Text>
          </View>
        ))}
      </View>
    );
  };

  const sectionContainer = {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  };

  const handleDismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

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
                    <SwipeableNotification key={notif.id} notification={notif} onDismiss={() => handleDismissNotification(notif.id)} />
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
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
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
      {/* Project Selector - STICKY */}
      <View style={[styles.selectorCard, { zIndex: 10, elevation: 3 }]}> 
        <Text style={styles.selectorLabel}>Project Selection</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.loadingText}>Loading projects...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color="#f44336" />
              <Text style={styles.errorText}>Failed to load projects</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : projects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No projects available</Text>
            </View>
          ) : (
            projects.map((proj, idx) => (
              <TouchableOpacity
                key={proj.projectName + idx}
                style={[styles.selectorPill, proj.projectName === selectedProject.projectName && styles.selectorPillActive]}
                onPress={() => handleSelectProject(proj)}
              >
                <Text style={[styles.selectorPillText, proj.projectName === selectedProject.projectName && styles.selectorPillTextActive]}>
                  {proj.projectName}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
      {/* Selected Project Card - STICKY */}
      <View style={styles.headerCard}>
        <Text style={styles.projectTitle}>{selectedProject.projectName}</Text>
        {colorLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Loading risk level...</Text>
          </View>
        ) : colorError ? (
          <Text style={styles.errorText}>Failed to load risk level</Text>
        ) : projectColorData ? (
        <Text style={[
          styles.risk, 
            getRiskLevelText(projectColorData.projectCardColor) === 'High Risk' ? styles.high : 
            getRiskLevelText(projectColorData.projectCardColor) === 'Medium Risk' ? styles.medium : styles.low
        ]}>
            {getRiskLevelText(projectColorData.projectCardColor)}
        </Text>
        ) : (
          <Text style={[
            styles.risk, 
            (() => {
              const startDate = new Date(selectedProject.startDate);
              const endDate = new Date(selectedProject.endDate);
              const now = new Date();
              
              if (now > endDate) {
                return styles.high;
              }
              
              const daysUntilDeadline = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              if (daysUntilDeadline <= 7) {
                return styles.medium;
              }
              
              return styles.low;
            })()
          ]}>
            {(() => {
              const startDate = new Date(selectedProject.startDate);
              const endDate = new Date(selectedProject.endDate);
              const now = new Date();
              
              if (now > endDate) {
                return 'High Risk';
              }
              
              const daysUntilDeadline = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              if (daysUntilDeadline <= 7) {
                return 'Medium Risk';
              }
              
              return 'Low Risk';
            })()}
          </Text>
        )}
      </View>
      {/* Main Content */}
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {/* Defect Severity Breakdown Heading */}
        <Text style={styles.sectionHeading}>Defect Severity Breakdown</Text>
        
        {/* Total Defects Summary */}
        {defectSeveritySummaryData && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Defects: {defectSeveritySummaryData.totalDefects}</Text>
            <Text style={styles.summarySubtitle}>
              {defectSeveritySummaryData.defectSummary.map(sev => `${sev.severity}: ${sev.total}`).join(' • ')}
            </Text>
          </View>
        )}
        
        {/* Defect Severity Breakdown */}
        <View style={{ marginBottom: 16 }}>
          {defectSeveritySummaryLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={{ marginTop: 12, color: '#666', fontSize: 16 }}>Loading defect severity breakdown...</Text>
            </View>
          ) : defectSeveritySummaryError ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Icon name="alert-circle" size={48} color="#f44336" />
              <Text style={{ marginTop: 12, color: '#f44336', fontSize: 16, textAlign: 'center' }}>
                {defectSeveritySummaryError}
              </Text>
              <TouchableOpacity 
                style={{ marginTop: 12, backgroundColor: '#e0e7ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
                onPress={() => selectedProject.id && fetchDefectSeveritySummary(selectedProject.id)}
              >
                <Text style={{ color: '#2563eb', fontSize: 14, fontWeight: 'bold' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : defectSeveritySummaryData ? (
            defectSeveritySummaryData.defectSummary.map((sev, idx) => {
            // Prepare pie chart data for this severity
              const pieData = Object.entries(sev.statuses).map(([statusName, statusData]) => ({
                label: statusName,
                value: statusData.count,
                color: statusData.color,
              })).filter(d => d.value > 0); // Only show statuses with count > 0
              
              return (
                <View key={sev.severity} style={[styles.severityBreakdownCard, { borderColor: sev.Severity_color }]}> 
                  <View style={styles.severityBreakdownHeader}>
                    <Text style={[styles.severityBreakdownTitle, { color: sev.Severity_color }]}>Defects on {sev.severity}</Text>
                    <Text style={styles.severityBreakdownTotal}>Total: {sev.total}</Text>
                  </View>
                  <View style={styles.severityBreakdownStatusList}>
                    <View style={styles.severityBreakdownStatusGrid}>
                      {Object.entries(sev.statuses).map(([statusName, statusData]) => (
                        <View key={statusName} style={styles.severityBreakdownStatusItem}>
                          <View style={[styles.statusDot, { backgroundColor: statusData.color }]} />
                          <Text style={styles.statusName}>{statusName}</Text>
                          <Text style={styles.statusCount}>{statusData.count}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.viewChartBtn} onPress={() => { setModalSeverityIndex(idx); setModalVisible(true); }}>
                    <Text style={styles.viewChartBtnText}>View Chart</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            // Fallback to mock data if API data is not available
            MOCK_DATA.defectSeverityBreakdown.map((sev, idx) => {
              const total = sev.statuses.reduce((sum, s: any) => sum + s.count, 0);
              // Prepare pie chart data for this severity
              const pieData = sev.statuses.map((status: any) => ({
              label: status.name,
              value: status.count,
              color: STATUS_COLORS[status.name as keyof typeof STATUS_COLORS] || '#888',
              })).filter((d: any) => d.value > 0); // Only show statuses with count > 0
            return (
              <View key={sev.label} style={[styles.severityBreakdownCard, { borderColor: sev.border }]}> 
                <View style={styles.severityBreakdownHeader}>
                  <Text style={[styles.severityBreakdownTitle, { color: sev.color }]}>Defects on {sev.label}</Text>
                  <Text style={styles.severityBreakdownTotal}>Total: {total}</Text>
                </View>
                <View style={styles.severityBreakdownStatusList}>
                  <View style={styles.severityBreakdownStatusGrid}>
                    {sev.statuses.map((status, i) => (
                      <View key={status.name} style={styles.severityBreakdownStatusItem}>
                        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status.name as keyof typeof STATUS_COLORS] }]} />
                        <Text style={styles.statusName}>{status.name}</Text>
                        <Text style={styles.statusCount}>{status.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <TouchableOpacity style={styles.viewChartBtn} onPress={() => { setModalSeverityIndex(idx); setModalVisible(true); }}>
                  <Text style={styles.viewChartBtnText}>View Chart</Text>
                </TouchableOpacity>
              </View>
            );
            })
          )}
        </View>
        {/* Pie Chart Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 24, alignItems: 'center', minWidth: 280, maxWidth: '90%' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>Defect Status Breakdown</Text>
              {modalSeverityIndex !== null && (() => {
                let sev: any;
                let pieData: any[];
                
                if (defectSeveritySummaryData) {
                  sev = defectSeveritySummaryData.defectSummary[modalSeverityIndex];
                  pieData = Object.entries(sev.statuses).map(([statusName, statusData]: [string, any]) => ({
                    label: statusName,
                    value: statusData.count,
                    color: statusData.color,
                  })).filter(d => d.value > 0);
                } else {
                  // Fallback to mock data
                  sev = MOCK_DATA.defectSeverityBreakdown[modalSeverityIndex];
                  pieData = sev.statuses.map((status: any) => ({
                  label: status.name,
                  value: status.count,
                  color: STATUS_COLORS[status.name as keyof typeof STATUS_COLORS] || '#888',
                  })).filter((d: any) => d.value > 0);
                }
                
                return (
                  <>
                    <PieChart data={pieData.length > 0 ? pieData : [{ label: 'No Data', value: 1, color: '#eee' }]} radius={70} cx={80} cy={80} />
                    <View style={{ marginTop: 14, marginBottom: 8 }}>
                      {pieData.length > 0 ? pieData.map((item, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                          <View style={{ width: 14, height: 14, backgroundColor: item.color, borderRadius: 7, marginRight: 8 }} />
                          <Text style={{ fontSize: 16 }}>{item.label}: {item.value}</Text>
                        </View>
                      )) : <Text style={{ color: '#888' }}>No defect data</Text>}
                    </View>
                  </>
                );
              })()}
              <TouchableOpacity style={[styles.viewChartBtn, { marginTop: 10, minWidth: 100 }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.viewChartBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Metrics Section (Density, Severity Index, Ratio) */}
        <View style={styles.metricColumnFull}>
          {/* Defect Density Meter Section */}
          <View style={styles.metricCardFull}>
            <Text style={{ fontSize: 17, color: '#222', fontWeight: '500', marginBottom: 8, textAlign: 'left' }}>Defect Density</Text>
            
            {defectDensityLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={{ marginTop: 8, color: '#666', fontSize: 14 }}>Loading defect density...</Text>
              </View>
            ) : defectDensityError ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Icon name="alert-circle" size={24} color="#f44336" />
                <Text style={{ marginTop: 8, color: '#f44336', fontSize: 14, textAlign: 'center' }}>
                  {defectDensityError}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 8, backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                  onPress={() => selectedProject.id && fetchDefectDensity(selectedProject.id)}
                >
                  <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : defectDensityData ? (
              <>
                <View style={{ alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 22, textAlign: 'center', color: '#222' }}>
                    Defect Density: <Text style={{ color: getDefectDensityColor(defectDensityData.defectDensity) }}>
                      {defectDensityData.defectDensity.toFixed(2)}
                    </Text>
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                    {defectDensityData.meaning} • {defectDensityData.range}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {defectDensityData.defects} defects • {defectDensityData.kloc} KLOC
                  </Text>
                </View>
                <View style={{ alignItems: 'center', marginTop: 8 }}>
                  <Svg width={280} height={160}>
                    {/* Semi-circular gauge background */}
                    <Path
                      d="M 50 140 A 90 90 0 0 1 230 140"
                      stroke="#f0f0f0"
                      strokeWidth={28}
                      fill="none"
                    />

                    {/* Green arc (0-7.0) - approximately 47% of the arc */}
                    <Path
                      d="M 50 140 A 90 90 0 0 1 165 60"
                      stroke="#43A047"
                      strokeWidth={25}
                      fill="none"
                    />

                    {/* Yellow arc (7.0-10.0) - approximately 20% of the arc */}
                    <Path
                      d="M 165 60 A 90 90 0 0 1 200 75"
                      stroke="#FFB300"
                      strokeWidth={25}
                      fill="none"
                    />

                    {/* Red arc (10.0-15.0) - remaining 33% of the arc */}
                    <Path
                      d="M 200 75 A 90 90 0 0 1 230 140"
                      stroke="#F44336"
                      strokeWidth={25}
                      fill="none"
                    />

                    {/* Needle/Pointer */}
                    {(() => {
                      const maxScale = 15;
                      const value = Math.max(0, Math.min(defectDensityData.defectDensity, maxScale));
                      // Calculate angle for semi-circle: 180 degrees (left) to 0 degrees (right)
                      const angle = 180 - (value / maxScale) * 180;
                      const rad = (angle * Math.PI) / 180;
                      const cx = 140, cy = 140; // Center of the semi-circle
                      const needleLength = 75;
                      const x2 = cx + needleLength * Math.cos(rad);
                      const y2 = cy - needleLength * Math.sin(rad);

                      return (
                        <>
                          {/* Needle line */}
                          <Line
                            x1={cx}
                            y1={cy}
                            x2={x2}
                            y2={y2}
                            stroke="#333"
                            strokeWidth={4}
                            strokeLinecap="round"
                          />
                          {/* Center circle */}
                          <Circle cx={cx} cy={cy} r={8} fill="#333" />
                        </>
                      );
                    })()}

                    {/* Scale labels */}
                    <SvgText x={35} y={155} fontSize="16" fill="#666" textAnchor="middle" fontWeight="500">0</SvgText>
                    <SvgText x={165} y={45} fontSize="16" fill="#666" textAnchor="middle" fontWeight="500">7</SvgText>
                    <SvgText x={209.5} y={62} fontSize="16" fill="#666" textAnchor="middle" fontWeight="500">10</SvgText>
                    <SvgText x={245} y={155} fontSize="16" fill="#666" textAnchor="middle" fontWeight="500">15</SvgText>
                  </Svg>
                </View>
              </>
            ) : (
              <View style={{ alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 22, textAlign: 'center', color: '#222' }}>
                  Defect Density: <Text style={{ color: defectDensity === 0 ? '#43A047' : '#FFC107' }}>{defectDensity.toFixed(2)}</Text>
                </Text>
              </View>
            )}
          </View>
          {/* Defect Severity Index Box (matches image) */}
          <View style={styles.metricCardFull}>
            <Text style={{ fontSize: 17, color: '#222', fontWeight: '500', marginBottom: 8, textAlign: 'left' }}>Defect Severity Index</Text>
            
            {dsiLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={{ marginTop: 8, color: '#666', fontSize: 14 }}>Loading severity index...</Text>
              </View>
            ) : dsiError ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Icon name="alert-circle" size={24} color="#f44336" />
                <Text style={{ marginTop: 8, color: '#f44336', fontSize: 14, textAlign: 'center' }}>
                  {dsiError}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 8, backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                  onPress={() => selectedProject.id && fetchDefectSeverityIndex(selectedProject.id)}
                >
                  <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : dsiData ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  {/* Meter */}
                  <View style={{ alignItems: 'center', marginRight: 18 }}>
                    <View style={{ width: 32, height: 100, backgroundColor: '#f0f1f6', borderRadius: 16, justifyContent: 'flex-end', overflow: 'hidden' }}>
                      <View style={{ 
                        width: 32, 
                        height: `${Math.min(dsiData.dsiPercentage, 100)}%`, 
                        backgroundColor: getDsiColor(dsiData.dsiPercentage), 
                        borderBottomLeftRadius: 16, 
                        borderBottomRightRadius: 16 
                      }} />
                    </View>
                  </View>
                  {/* Value and meter labels */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ 
                      fontSize: 48, 
                      fontWeight: 'bold', 
                      color: getDsiColor(dsiData.dsiPercentage), 
                      marginRight: 18, 
                      minWidth: 80, 
                      textAlign: 'right' 
                    }}>
                      {dsiData.dsiPercentage.toFixed(1)}
                    </Text>
                    <View style={{ height: 100, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 16, color: '#888' }}>100</Text>
                      <Text style={{ fontSize: 16, color: '#888' }}>75</Text>
                      <Text style={{ fontSize: 16, color: '#888' }}>50</Text>
                      <Text style={{ fontSize: 16, color: '#888' }}>25</Text>
                      <Text style={{ fontSize: 16, color: '#888' }}>0</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontSize: 15, color: '#444', textAlign: 'center', marginTop: 4 }}>
                  {dsiData.interpretation} • {dsiData.totalDefects} defects
                </Text>
                <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 2 }}>
                  Score: {dsiData.actualSeverityScore}/{dsiData.maximumSeverityScore}
                </Text>
              </>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                {/* Meter */}
                <View style={{ alignItems: 'center', marginRight: 18 }}>
                  <View style={{ width: 32, height: 100, backgroundColor: '#f0f1f6', borderRadius: 16, justifyContent: 'flex-end', overflow: 'hidden' }}>
                    <View style={{ width: 32, height: `${STATIC_SEVERITY_INDEX}%`, backgroundColor: '#F44336', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} />
                  </View>
                </View>
                {/* Value and meter labels */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#F44336', marginRight: 18, minWidth: 80, textAlign: 'right' }}>{STATIC_SEVERITY_INDEX}</Text>
                  <View style={{ height: 100, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 16, color: '#888' }}>100</Text>
                    <Text style={{ fontSize: 16, color: '#888' }}>75</Text>
                    <Text style={{ fontSize: 16, color: '#888' }}>50</Text>
                    <Text style={{ fontSize: 16, color: '#888' }}>25</Text>
                    <Text style={{ fontSize: 16, color: '#888' }}>0</Text>
                  </View>
                </View>
              </View>
            )}
            <Text style={{ fontSize: 15, color: '#444', textAlign: 'center', marginTop: 4 }}>
              Weighted severity score{"\n"}(higher = more severe defects)
            </Text>
          </View>
          {/* Defect to Remark Ratio */}
          <View style={styles.metricCardFull}>
            <Text style={styles.metricTitle}>Defect to Remark Ratio</Text>
            
            {remarkRatioLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={{ marginTop: 8, color: '#666', fontSize: 14 }}>Loading remark ratio...</Text>
              </View>
            ) : remarkRatioError ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Icon name="alert-circle" size={24} color="#f44336" />
                <Text style={{ marginTop: 8, color: '#f44336', fontSize: 14, textAlign: 'center' }}>
                  {remarkRatioError}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 8, backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                  onPress={() => selectedProject.id && fetchDefectRemarkRatio(selectedProject.id)}
                >
                  <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : remarkRatioData ? (
              <View style={styles.ratioCard}>
                <Text style={[styles.ratioValue, { color: getRemarkRatioColor(remarkRatioData.ratio) }]}>
                  {remarkRatioData.ratio}
                </Text>
                <Text style={[styles.ratioLabel, { color: getRemarkRatioColor(remarkRatioData.ratio) }]}>
                  {remarkRatioData.category}
                </Text>
                <View style={styles.ratioBar}>
                  <View style={[
                    styles.ratioBarFill, 
                    { 
                      backgroundColor: getRemarkRatioColor(remarkRatioData.ratio),
                      width: `${Math.min(parseFloat(remarkRatioData.ratio.replace('%', '')), 100)}%`
                    }
                  ]} />
                </View>
                <View style={styles.ratioBarLabels}>
                  <Text style={styles.ratioBarLabelNum}>0%</Text>
                  <Text style={styles.ratioBarLabelNum}>50%</Text>
                  <Text style={styles.ratioBarLabelNum}>100%</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 8 }}>
                  {remarkRatioData.defects} defects • {remarkRatioData.remarks} remarks
                </Text>
              </View>
            ) : (
              <View style={styles.ratioCard}>
                <Text style={styles.ratioValue}>{STATIC_DEFECT_TO_REMARK_RATIO}</Text>
                <Text style={styles.ratioLabel}>Critical</Text>
                <View style={styles.ratioBar}>
                  <View style={styles.ratioBarFill} />
                </View>
                <View style={styles.ratioBarLabels}>
                  <Text style={styles.ratioBarLabelNum}>0.0</Text>
                  <Text style={styles.ratioBarLabelNum}>0.5</Text>
                  <Text style={styles.ratioBarLabelNum}>1.0</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        {/* --- VERTICAL CHART SECTIONS --- */}
        <View style={{ marginTop: 10 }}>
          {/* Defects Reopened Multiple Times */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Defects Reopened Multiple Times</Text>
            
            {reopenCountSummaryLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 12, color: '#666', fontSize: 16 }}>Loading reopen count summary...</Text>
              </View>
            ) : reopenCountSummaryError ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Icon name="alert-circle" size={48} color="#f44336" />
                <Text style={{ marginTop: 12, color: '#f44336', fontSize: 16, textAlign: 'center' }}>
                  {reopenCountSummaryError}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 12, backgroundColor: '#e0e7ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
                  onPress={() => selectedProject.id && fetchReopenCountSummary(selectedProject.id)}
                >
                  <Text style={{ color: '#2563eb', fontSize: 14, fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : reopenCountSummaryData ? (
              <>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      if (reopenCountSummaryData.length > 0) {
                        setSelectedReopenCount(reopenCountSummaryData[0].label);
                        setShowReopenedTable(true);
                        fetchDefectDetails(selectedProject.id, reopenCountSummaryData[0].label);
                      }
                    }}
                    style={{}}
                  >
                    <PieChart
                      data={reopenCountSummaryData.map((item, idx) => ({
                        label: item.label,
                        value: item.count,
                        color: ['#4285F4', '#00b894', '#fdcb6e', '#d63031', '#a29bfe', '#e17055', '#00bcd4', '#6c5ce7'][idx % 8],
                      }))}
                      radius={88}
                      cx={90}
                      cy={90}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ marginTop: 10 }}>
                  {reopenCountSummaryData.map((item, idx) => {
                    const total = reopenCountSummaryData.reduce((sum, d) => sum + d.count, 0);
                    return (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <View style={{ 
                          width: 12, 
                          height: 12, 
                          backgroundColor: ['#4285F4', '#00b894', '#fdcb6e', '#d63031', '#a29bfe', '#e17055', '#00bcd4', '#6c5ce7'][idx % 8], 
                          borderRadius: 6, 
                          marginRight: 6 
                        }} />
                        <Text style={{ fontSize: 15 }}>
                          {item.label}: {item.count} ({((item.count / total) * 100).toFixed(1)}%)
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : (
              // Fallback to mock data if API data is not available
              <>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedReopenedLabel('2 times');
                      setShowReopenedTable(true);
                    }}
                    style={{}}
                  >
                    <PieChart
                      data={reopenedData}
                      radius={88}
                      cx={90}
                      cy={90}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ marginTop: 10 }}>
                  {reopenedData.map((item, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <View style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 6, marginRight: 6 }} />
                      <Text style={{ fontSize: 15 }}>{item.label}: {item.value} ({((item.value / reopenedData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%)</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
          {/* Modal for table */}
          <Modal
            visible={showReopenedTable}
            transparent
            animationType="fade"
            onRequestClose={() => setShowReopenedTable(false)}
          >
            <View style={styles.centerModalOverlay}>
              <View style={styles.reopenedTableModalContent}>
                <View style={styles.reopenedTableModalHeader}>
                  <Text style={styles.reopenedTableModalTitle}>Defects Reopened Details</Text>
                  <TouchableOpacity onPress={() => setShowReopenedTable(false)}>
                    <Text style={styles.reopenedTableModalClose}>✖</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.reopenedTableModalTable}>
                  {defectDetailsLoading ? (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <ActivityIndicator size="small" color="#2563eb" />
                      <Text style={{ marginTop: 8, color: '#666', fontSize: 14 }}>Loading defect details...</Text>
                    </View>
                  ) : defectDetailsError ? (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <Icon name="alert-circle" size={24} color="#f44336" />
                      <Text style={{ marginTop: 8, color: '#f44336', fontSize: 14, textAlign: 'center' }}>
                        {defectDetailsError}
                      </Text>
                    </View>
                  ) : defectDetailsData ? (
                    <>
                      <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderCell}>Defect ID</Text>
                        <Text style={styles.tableHeaderCell}>Title</Text>
                        <Text style={styles.tableHeaderCell}>Assignee</Text>
                        <Text style={styles.tableHeaderCell}>Reporter</Text>
                        <Text style={styles.tableHeaderCell}>Release</Text>
                      </View>
                      {defectDetailsData.map((defect, idx) => (
                        <View key={defect.defectId + idx} style={styles.tableRow}>
                          <Text style={styles.tableCell}>{defect.defectId}</Text>
                          <Text style={styles.tableCell}>{defect.title}</Text>
                          <Text style={styles.tableCell}>{defect.assignee}</Text>
                          <Text style={styles.tableCell}>{defect.reporter}</Text>
                          <Text style={styles.tableCell}>{defect.release}</Text>
                        </View>
                      ))}
                    </>
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <Text style={{ color: '#888', fontSize: 14 }}>No defect details available</Text>
                    </View>
                  )}
                  {/* Add details below the table */}
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#2563eb', marginBottom: 6 }}>
                      Defect Reopening Details
                    </Text>
                    <Text style={{ fontSize: 14, color: '#444', marginBottom: 2 }}>
                      - This data shows defects that have been reopened more than once in each release
                    </Text>
                    <Text style={{ fontSize: 14, color: '#444', marginBottom: 2 }}>
                      - Helps teams track and analyze defects with recurring patterns
                    </Text>
                    <Text style={{ fontSize: 14, color: '#444', marginBottom: 2 }}>
                      - Reporter is the person who reported the defect in the system
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
          {/* Defect Distribution by Type */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Defect Distribution by Type</Text>
            
            {defectStatisticsLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 12, color: '#666', fontSize: 16 }}>Loading defect type statistics...</Text>
              </View>
            ) : defectStatisticsError ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Icon name="alert-circle" size={48} color="#f44336" />
                <Text style={{ marginTop: 12, color: '#f44336', fontSize: 16, textAlign: 'center' }}>
                  {defectStatisticsError}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 12, backgroundColor: '#e0e7ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
                  onPress={() => selectedProject.id && fetchDefectStatistics(selectedProject.id)}
                >
                  <Text style={{ color: '#2563eb', fontSize: 14, fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : defectStatisticsData ? (
              <>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
                  <PieChart 
                    data={defectStatisticsData.defectTypes.map((type, idx) => ({
                      label: type.defectType,
                      value: type.defectCount,
                      color: ['#4285F4', '#00b894', '#fdcb6e', '#d63031', '#a29bfe', '#e17055', '#00bcd4', '#6c5ce7'][idx % 8],
                    }))} 
                    radius={90} 
                    cx={95} 
                    cy={95} 
                  />
                </View>
                <View style={{ marginTop: 10 }}>
                  {defectStatisticsData.defectTypes.map((type, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <View style={{ 
                        width: 12, 
                        height: 12, 
                        backgroundColor: ['#4285F4', '#00b894', '#fdcb6e', '#d63031', '#a29bfe', '#e17055', '#00bcd4', '#6c5ce7'][idx % 8], 
                        borderRadius: 6, 
                        marginRight: 6 
                      }} />
                      <Text style={{ fontSize: 15 }}>
                        {type.defectType}: {type.defectCount} ({type.percentage.toFixed(1)}%)
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, borderTopWidth: 1, borderColor: '#eee', paddingTop: 12 }}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{defectStatisticsData.totalDefectCount}</Text>
                    <Text style={{ fontSize: 13, color: '#444' }}>Total Defects</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#4285F4' }}>
                      {defectStatisticsData.mostCommonDefectCount}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#444' }}>
                      Most Common{' '}
                      <Text style={{ fontWeight: 'bold' }}>
                        {defectStatisticsData.mostCommonDefectType}
                      </Text>
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              // Fallback to mock data if API data is not available
              <>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
              <PieChart data={defectTypeData} radius={90} cx={95} cy={95} />
        </View>
            <View style={{ marginTop: 10 }}>
              {defectTypeData.map((item, idx) => {
                const total = defectTypeData.reduce((sum, d) => sum + d.value, 0);
                return (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <View style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 6, marginRight: 6 }} />
                    <Text style={{ fontSize: 15 }}>
                      {item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                    </Text>
            </View>
                );
              })}
          </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, borderTopWidth: 1, borderColor: '#eee', paddingTop: 12 }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{defectTypeData.reduce((sum, d) => sum + d.value, 0)}</Text>
                <Text style={{ fontSize: 13, color: '#444' }}>Total Defects</Text>
            </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#4285F4' }}>
                  {Math.max(...defectTypeData.map(d => d.value))}
                </Text>
                <Text style={{ fontSize: 13, color: '#444' }}>
                  Most Common{' '}
                  <Text style={{ fontWeight: 'bold' }}>
                    {defectTypeData.reduce((a, b) => (a.value > b.value ? a : b)).label}
                  </Text>
                </Text>
          </View>
        </View>
              </>
            )}
          </View>
          {/* Time to Find Defects */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Time to Find Defects</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
              <LineChart data={timeToFindData} labels={timeToFindLabels} width={350} height={240} />
            </View>
          </View>
          {/* Time to Fix Defects */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Time to Fix Defects</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
              <LineChart data={timeToFixData} labels={timeToFixLabels} width={350} height={240} color={'#00b894'} />
            </View>
          </View>
          {/* Defects by Module */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Defects by Module</Text>
            
            {defectsByModuleLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 12, color: '#666', fontSize: 16 }}>Loading defects by module...</Text>
              </View>
            ) : defectsByModuleError ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Icon name="alert-circle" size={48} color="#f44336" />
                <Text style={{ marginTop: 12, color: '#f44336', fontSize: 16, textAlign: 'center' }}>
                  {defectsByModuleError}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 12, backgroundColor: '#e0e7ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
                  onPress={() => selectedProject.id && fetchDefectsByModule(selectedProject.id)}
                >
                  <Text style={{ color: '#2563eb', fontSize: 14, fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : defectsByModuleApiData ? (
              <>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
                  <PieChart
                    data={defectsByModuleApiData.map((mod, idx) => ({
                      label: mod.name,
                      value: mod.value,
                      color: ['#4285F4', '#00b894', '#fdcb6e', '#d63031', '#a29bfe', '#e17055', '#00bcd4', '#6c5ce7'][idx % 8],
                    }))}
                    radius={90}
                    cx={95}
                    cy={95}
                  />
                </View>
                <View style={{ marginTop: 10 }}>
                  {defectsByModuleApiData.map((mod, idx) => (
                    <View key={mod.moduleId} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <View style={{
                        width: 12,
                        height: 12,
                        backgroundColor: ['#4285F4', '#00b894', '#fdcb6e', '#d63031', '#a29bfe', '#e17055', '#00bcd4', '#6c5ce7'][idx % 8],
                        borderRadius: 6,
                        marginRight: 6
                      }} />
                      <Text style={{ fontSize: 15 }}>
                        {mod.name}{' '}
                        <Text style={{ fontWeight: 'bold' }}>{mod.value}</Text>
                        {' '}({mod.percentage.toFixed(2)}%)
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              // Fallback to mock data if API data is not available
              <>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
                  <PieChart data={defectsByModuleData} radius={90} cx={95} cy={95} />
                </View>
                <View style={{ marginTop: 10 }}>
                  {defectsByModuleData.map((item, idx) => {
                    const total = defectsByModuleData.reduce((sum, d) => sum + d.value, 0);
                    return (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <View style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 6, marginRight: 6 }} />
                        <Text style={{ fontSize: 15 }}>
                          {item.label}{' '}
                          <Text style={{ fontWeight: 'bold' }}>{item.value}</Text>
                          {' '}({((item.value / total) * 100).toFixed(2)}%)
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
          {/* Reopen Count Summary */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Reopen Count Summary</Text>
            
            {reopenCountSummaryLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 12, color: '#666', fontSize: 16 }}>Loading reopen count summary...</Text>
              </View>
            ) : reopenCountSummaryError ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Icon name="alert-circle" size={48} color="#f44336" />
                <Text style={{ marginTop: 12, color: '#f44336', fontSize: 16, textAlign: 'center' }}>
                  {reopenCountSummaryError}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 12, backgroundColor: '#e0e7ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
                  onPress={() => selectedProject.id && fetchReopenCountSummary(selectedProject.id)}
                >
                  <Text style={{ color: '#2563eb', fontSize: 14, fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : reopenCountSummaryData ? (
              <>
                {reopenCountSummaryData.map((summary, idx) => (
                  <View key={idx} style={styles.metricCard}>
                    <Text style={styles.metricTitle}>{summary.label}</Text>
                    <View style={styles.metricBigCard}>
                      <Text style={styles.metricBigTitle}>{summary.totalDefects}</Text>
                      <Text style={styles.metricBigContent}>
                        <Text style={styles.metricBigLabel}>Defects</Text>
                        <Text style={styles.metricBigSubLabel}>{summary.defects}</Text>
                      </Text>
                    </View>
                    <View style={styles.metricCardGauge}>
                      <Text style={styles.metricTitleLeft}>Defect Severity</Text>
                      <View style={styles.gaugeContent}>
                        <View style={styles.gaugeContainer}>
                          <View style={styles.gaugeBase}>
                            <View style={styles.gaugeArcGreen} />
                            <View style={styles.gaugeArcYellow} />
                            <View style={styles.gaugeArcRed} />
                            <View style={styles.gaugePointer} />
                          </View>
                          <View style={styles.gaugeLabelsRow}>
                            <Text style={styles.severityIndexContent}>
                              <Text style={styles.metricValue}>{summary.severityIndex}</Text>
                              <Text style={styles.metricLabelCenter}>Severity Index</Text>
                            </Text>
                            <Text style={styles.speedometerContainer}>
                              <View style={styles.speedometerHalfCircle}>
                                <View style={styles.speedometerGreen} />
                                <View style={styles.speedometerYellow} />
                                <View style={styles.speedometerRed} />
                                <View style={styles.speedometerPointer} />
                              </View>
                              <View style={styles.speedometerTicks}>
                                <Text style={styles.speedometerTicks}>{summary.severityBreakdown.map(sev => `${sev.count} (${sev.percentage.toFixed(1)}%)`).join(' ')}</Text>
                              </View>
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Severity</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.severityBreakdown.reduce((sum, sev) => sum + sev.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Type</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectTypes.reduce((sum, type) => sum + type.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Module</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByModule.reduce((sum, mod) => sum + mod.value, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRelease.reduce((sum, release) => sum + release.value, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemark.reduce((sum, remark) => sum + remark.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolution.reduce((sum, resolution) => sum + resolution.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Priority</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByPriority.reduce((sum, priority) => sum + priority.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Category</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByCategory.reduce((sum, category) => sum + category.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Release Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReleaseDate.reduce((sum, releaseDate) => sum + releaseDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Resolution Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByResolutionDate.reduce((sum, resolutionDate) => sum + resolutionDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatusDate.reduce((sum, statusDate) => sum + statusDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Remark Date</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByRemarkDate.reduce((sum, remarkDate) => sum + remarkDate.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Assignee</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByAssignee.reduce((sum, assignee) => sum + assignee.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Reporter</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByReporter.reduce((sum, reporter) => sum + reporter.count, 0)}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.metricCardBar}>
                      <Text style={styles.metricTitleLeft}>Defects by Status</Text>
                      <View style={styles.barContainerWeb}>
                        <View style={styles.barTrackWeb}>
                          <View style={styles.barFillWeb} />
                        </View>
                        <View style={styles.barValueWeb}>
                          <Text style={styles.barLabelWeb}>{summary.defectsByStatus.reduce((sum, status) => sum + status.count, 0)}</Text>
                        </View>
                      </View>