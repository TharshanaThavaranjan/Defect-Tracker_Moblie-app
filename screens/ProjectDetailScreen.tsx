import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Svg, { Path, Line, G, Circle, Text as SvgText, Polyline } from 'react-native-svg';

// Project list (should match DashboardScreen)
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

// Project metrics for each project
const PROJECT_DENSITY: Record<string, number> = {
  'Defect Tracker': 82.77,
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
  REOPEN: '#F44336',
  NEW: '#3b82f6',
  OPEN: '#ffeb3b',
  FIXED: '#43A047',
  CLOSED: '#388e3c',
  REJECT: '#6d4c41',
  DUPLICATE: '#424242',
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
        { name: 'REOPEN', count: 0 },
        { name: 'NEW', count: 0 },
        { name: 'OPEN', count: 0 },
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
        { name: 'NEW', count: 0 },
        { name: 'OPEN', count: 0 },
        { name: 'FIXED', count: 0 },
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
        { name: 'FIXED', count: 0 },
        { name: 'CLOSED', count: 0 },
        { name: 'REJECT', count: 0 },
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
    <Svg width={width} height={height}>
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
    </Svg>
  );
};

const ProjectDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { project } = route.params;

  // State for selected project and its defect density
  const [selectedProject, setSelectedProject] = useState(project);
  const [defectDensity, setDefectDensity] = useState(() => PROJECT_DENSITY[project.name] || 0);

  useEffect(() => {
    setDefectDensity(PROJECT_DENSITY[selectedProject.name] || 0);
  }, [selectedProject]);

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const handleSelectProject = (proj: { name: string; risk: string }) => {
    if (proj.name !== selectedProject.name) {
      setSelectedProject(proj);
      navigation.replace('ProjectDetail', { project: proj });
    }
  };

  const handleBack = () => {
    navigation.goBack();
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

  const timeToFindData = [5, 6, 8, 7, 6, 5, 4, 5];
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

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
      {/* Custom Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
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
      {/* Project Selector */}
      <View style={styles.selectorCard}>
        <Text style={styles.selectorLabel}>Project Selection</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
          {PROJECTS.map((proj, idx) => (
            <TouchableOpacity
              key={proj.name + idx}
              style={[styles.selectorPill, proj.name === selectedProject.name && styles.selectorPillActive]}
              onPress={() => handleSelectProject(proj)}
            >
              <Text style={[styles.selectorPillText, proj.name === selectedProject.name && styles.selectorPillTextActive]}>
                {proj.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Main Content */}
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {/* Project Title and Risk */}
        <View style={styles.headerCard}>
          <Text style={styles.projectTitle}>{selectedProject.name}</Text>
          <Text style={[styles.risk, 
            selectedProject.risk === 'High Risk' ? styles.high : selectedProject.risk === 'Medium Risk' ? styles.medium : styles.low
          ]}>{selectedProject.risk}</Text>
        </View>
        {/* Defect Severity Breakdown Heading */}
        <Text style={styles.sectionHeading}>Defect Severity Breakdown</Text>
        {/* Defect Severity Breakdown */}
        <View style={{ marginBottom: 16 }}>
          {MOCK_DATA.defectSeverityBreakdown.map((sev, idx) => {
            const total = sev.statuses.reduce((sum, s) => sum + s.count, 0);
            return (
              <View key={sev.label} style={[styles.severityBreakdownCard, { borderColor: sev.border }]}> 
                <View style={styles.severityBreakdownHeader}>
                  <Text style={[styles.severityBreakdownTitle, { color: sev.color }]}>Defects on {sev.label}</Text>
                  <Text style={styles.severityBreakdownTotal}>Total: {total}</Text>
                </View>
                <View style={styles.severityBreakdownStatusList}>
                  {sev.statuses.map((status, i) => (
                    <View key={status.name} style={styles.severityBreakdownStatusRow}>
                      <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status.name as keyof typeof STATUS_COLORS] }]} />
                      <Text style={styles.statusName}>{status.name}</Text>
                      <Text style={styles.statusCount}>{status.count}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={styles.viewChartBtn}>
                  <Text style={styles.viewChartBtnText}>View Chart</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        {/* Metrics Section (Density, Severity Index, Ratio) */}
        <View style={styles.metricColumnFull}>
          {/* Defect Density Meter Section */}
          <View style={styles.metricCardFull}>
            <Text style={{ fontSize: 17, color: '#222', fontWeight: '500', marginBottom: 8, textAlign: 'left' }}>Defect Density</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 8 }}>
              Defect Density: <Text style={{ color: '#FFC107' }}>{defectDensity.toFixed(2)}</Text>
            </Text>
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <Svg width={180} height={100}>
                {/* Green arc */}
                <Path d="M 20 90 A 70 70 0 0 1 90 20" stroke="#43A047" strokeWidth={8} fill="none" />
                {/* Yellow arc */}
                <Path d="M 90 20 A 70 70 0 0 1 140 45" stroke="#FFB300" strokeWidth={8} fill="none" />
                {/* Red arc */}
                <Path d="M 140 45 A 70 70 0 0 1 160 90" stroke="#F44336" strokeWidth={8} fill="none" />
                {/* Pointer/Needle with base circle */}
                {(() => {
                  const value = Math.max(0, Math.min(defectDensity, 15));
                  const angle = 180 - (value / 15) * 180;
                  const rad = (angle * Math.PI) / 180;
                  const cx = 90, cy = 90, r = 60;
                  const x2 = cx + r * Math.cos(rad);
                  const y2 = cy + r * Math.sin(rad);
                  return (
                    <>
                      <Line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#222" strokeWidth={4} strokeLinecap="round" />
                      <Circle cx={cx} cy={cy} r={8} fill="#222" />
                    </>
                  );
                })()}
                {/* Tick labels */}
                <SvgText x={20} y={105} fontSize="13" fill="#222" textAnchor="middle">0</SvgText>
                <SvgText x={60} y={35} fontSize="13" fill="#222" textAnchor="middle" rotation="-20" origin="60,35">7</SvgText>
                <SvgText x={120} y={35} fontSize="13" fill="#222" textAnchor="middle" rotation="20" origin="120,35">10</SvgText>
              </Svg>
            </View>
          </View>
          {/* Defect Severity Index Vertical Bar */}
          <View style={styles.metricCardFull}>
            <Text style={styles.metricTitleLeft}>Defect Severity Index</Text>
            <View style={styles.severityIndexContent}>
              <View style={styles.barContainerWeb}>
                <View style={styles.barTrackWeb}>
                  <View style={[styles.barFillWeb, { height: `${STATIC_SEVERITY_INDEX}%` }]} />
                </View>
                <Text style={styles.barValueWeb}>{STATIC_SEVERITY_INDEX}</Text>
              </View>
              <Text style={styles.barLabelWeb}>Weighted severity score (higher = more severe defects)</Text>
            </View>
          </View>
          {/* Defect to Remark Ratio (unchanged) */}
          <View style={styles.metricCardFull}>
            <Text style={styles.metricTitle}>Defect to Remark Ratio</Text>
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
          </View>
        </View>
        {/* --- VERTICAL CHART SECTIONS --- */}
        <View style={{ marginTop: 10 }}>
          {/* Defects Reopened Multiple Times */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Defects Reopened Multiple Times</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
              <PieChart data={reopenedData} radius={35} cx={40} cy={40} />
            </View>
            <View style={{ marginTop: 10 }}>
              {reopenedData.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <View style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 6, marginRight: 6 }} />
                  <Text style={{ fontSize: 13 }}>{item.label}: {item.value} ({((item.value / reopenedData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%)</Text>
                </View>
              ))}
            </View>
          </View>
          {/* Defect Distribution by Type */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Defect Distribution by Type</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
              <PieChart data={defectTypeData} radius={40} cx={50} cy={50} />
            </View>
            <View style={{ marginTop: 10 }}>
              {defectTypeData.map((item, idx) => {
                const total = defectTypeData.reduce((sum, d) => sum + d.value, 0);
                return (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <View style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 6, marginRight: 6 }} />
                    <Text style={{ fontSize: 13 }}>
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
          </View>
          {/* Time to Find Defects */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Time to Find Defects</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
              <LineChart data={timeToFindData} labels={timeToFindLabels} width={320} height={140} />
            </View>
          </View>
          {/* Time to Fix Defects */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Time to Fix Defects</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
              <LineChart data={timeToFixData} labels={timeToFixLabels} width={320} height={140} color={'#00b894'} />
            </View>
          </View>
          {/* Defects by Module */}
          <View style={sectionContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Defects by Module</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
              <PieChart data={defectsByModuleData} radius={50} cx={60} cy={60} />
            </View>
            <View style={{ marginTop: 10 }}>
              {defectsByModuleData.map((item, idx) => {
                const total = defectsByModuleData.reduce((sum, d) => sum + d.value, 0);
                return (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <View style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 6, marginRight: 6 }} />
                    <Text style={{ fontSize: 13 }}>
                      {item.label}{' '}
                      <Text style={{ fontWeight: 'bold' }}>{item.value}</Text>
                      {' '}({((item.value / total) * 100).toFixed(2)}%)
                    </Text>
                  </View>
                );
              })}
            </View>
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
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f1f6',
    elevation: 2,
    zIndex: 10,
    position: 'relative', // allow absolute positioning of logout
  },
  backBtn: {
    marginRight: 4, // reduce margin
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f3f6fd',
  },
  backIcon: {
    fontSize: 20,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0, // remove any extra margin
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
    position: 'absolute',
    right: 8,
    top: 18,
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
  selectorCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 0,
    marginTop: 12,
    marginBottom: 0,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f1f6',
    width: '100%',
    alignSelf: 'center',
  },
  selectorLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#222',
    marginLeft: 8,
  },
  selectorScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
  },
  selectorPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f3f6fd',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e7ef',
  },
  selectorPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  selectorPillText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
  selectorPillTextActive: {
    color: '#fff',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f0f1f6',
  },
  projectTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  risk: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    color: '#fff',
    marginBottom: 2,
    overflow: 'hidden',
  },
  high: { backgroundColor: '#F44336' },
  medium: { backgroundColor: '#FFB300' },
  low: { backgroundColor: '#43A047' },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  severityCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 3,
    minWidth: 90,
    maxWidth: 140,
  },
  severityLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  severityCount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  severityDesc: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 3,
    minWidth: 90,
    maxWidth: 140,
  },
  metricTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 6,
    color: '#222',
    textAlign: 'center',
  },
  gaugePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8d7da',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  gaugeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
  },
  gaugeLabel: {
    fontSize: 10,
    color: '#888',
  },
  vGaugePlaceholder: {
    width: 30,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ffe0b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  vGaugeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFB300',
  },
  ratioCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  ratioValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
  },
  ratioLabel: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: 'bold',
  },
  chartCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 3,
    minWidth: 120,
    maxWidth: 300,
    marginBottom: 14,
  },
  piePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e3e9fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  pieLabel: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  lineCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 3,
    minWidth: 120,
    maxWidth: 300,
    marginBottom: 14,
  },
  linePlaceholder: {
    width: 120,
    height: 40,
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  lineLabel: {
    fontSize: 13,
    color: '#43A047',
    fontWeight: 'bold',
  },
  severityBreakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    padding: 16,
    marginHorizontal: 0,
    marginBottom: 16,
    minWidth: 200,
    maxWidth: 500,
    borderColor: '#eee',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: 'stretch',
  },
  severityBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f1f6',
  },
  severityBreakdownTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  severityBreakdownTotal: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#444',
  },
  severityBreakdownStatusList: {
    marginBottom: 12,
    marginTop: 4,
  },
  severityBreakdownStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#f8fafd',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusName: {
    fontSize: 14,
    color: '#222',
    width: 80,
    fontWeight: '500',
  },
  statusCount: {
    fontSize: 14,
    color: '#444',
    marginLeft: 'auto',
    fontWeight: 'bold',
  },
  viewChartBtn: {
    backgroundColor: '#e8f0fe',
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  viewChartBtnText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  metricBigCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#f0f1f6',
    alignItems: 'flex-start',
  },
  metricBigTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
    marginBottom: 12,
  },
  metricBigContent: {
    width: '100%',
    alignItems: 'center',
  },
  metricBigLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },
  metricBigSubLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  // Gauge web style placeholder
  gaugeWebPlaceholder: {
    width: 120,
    height: 70,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    marginTop: 8,
  },
  gaugeWebArc: {
    position: 'absolute',
    bottom: 0,
    width: 120,
    height: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderWidth: 8,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  gaugeWebNeedle: {
    position: 'absolute',
    bottom: 10,
    left: 60,
    width: 2,
    height: 40,
    backgroundColor: '#222',
    zIndex: 2,
    borderRadius: 1,
  },
  gaugeWebMin: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    fontSize: 12,
    color: '#222',
  },
  gaugeWebMid: {
    position: 'absolute',
    left: 50,
    bottom: 0,
    fontSize: 12,
    color: '#222',
  },
  gaugeWebMax: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    fontSize: 12,
    color: '#222',
  },
  // Severity bar
  severityBarWrap: {
    width: 40,
    height: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    marginBottom: 6,
  },
  severityBarTrack: {
    position: 'absolute',
    left: 18,
    bottom: 0,
    width: 8,
    height: 100,
    backgroundColor: '#f8d7da',
    borderRadius: 4,
  },
  severityBarFill: {
    position: 'absolute',
    left: 18,
    bottom: 0,
    width: 8,
    backgroundColor: '#F44336',
    borderRadius: 4,
    zIndex: 2,
  },
  severityBarValue: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 24,
    color: '#F44336',
    zIndex: 3,
  },
  // Remark ratio
  remarkRatioCard: {
    backgroundColor: '#fff4f4',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#fde0e0',
  },
  remarkRatioValue: {
    fontWeight: 'bold',
    fontSize: 32,
    color: '#222',
    marginBottom: 2,
  },
  remarkRatioLabel: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
  },
  remarkRatioBadge: {
    backgroundColor: '#fde0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  remarkRatioBadgeText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 14,
  },
  remarkRatioBarWrap: {
    width: '100%',
    height: 12,
    backgroundColor: '#fde0e0',
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 2,
    justifyContent: 'center',
  },
  remarkRatioBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F44336',
    borderRadius: 6,
  },
  remarkRatioBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  remarkRatioBarLabel: {
    fontSize: 12,
    color: '#888',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },
  metricColumn: {
    flexDirection: 'column',
    gap: 18,
    marginBottom: 18,
  },
  metricCardGauge: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginHorizontal: 3,
    minWidth: 120,
    maxWidth: 300,
  },
  metricCardBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginHorizontal: 3,
    minWidth: 120,
    maxWidth: 300,
  },
  metricTitleLeft: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
    color: '#222',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  metricLabelCenter: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#222',
    textAlign: 'center',
    alignSelf: 'center',
  },
  metricValue: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gaugeContent: {
    alignItems: 'center',
    width: '100%',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  gaugeBase: {
    width: 90,
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  gaugeArcGreen: {
    position: 'absolute',
    width: 90,
    height: 45,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 0,
    borderWidth: 8,
    borderColor: 'green',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
    zIndex: 1,
  },
  gaugeArcYellow: {
    position: 'absolute',
    width: 90,
    height: 45,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 8,
    borderColor: 'gold',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 30,
    zIndex: 2,
    transform: [{ rotate: '30deg' }],
  },
  gaugeArcRed: {
    position: 'absolute',
    width: 90,
    height: 45,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 90,
    borderWidth: 8,
    borderColor: '#F44336',
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 60,
    zIndex: 3,
    transform: [{ rotate: '60deg' }],
  },
  gaugePointer: {
    position: 'absolute',
    width: 2,
    height: 38,
    backgroundColor: '#222',
    bottom: 6,
    left: 44,
    borderRadius: 2,
    zIndex: 10,
    transform: [{ rotate: '-90deg' }],
  },
  gaugeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 90,
    marginTop: 2,
  },
  gaugeLabelNum: {
    fontSize: 11,
    color: '#222',
    fontWeight: 'bold',
  },
  severityIndexContent: {
    alignItems: 'center',
    width: '100%',
  },
  barContainerWeb: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 4,
    width: '100%',
    justifyContent: 'center',
  },
  barTrackWeb: {
    width: 28,
    height: 90,
    backgroundColor: '#f0f1f6',
    borderRadius: 14,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  barFillWeb: {
    width: 28,
    backgroundColor: '#F44336',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  barValueWeb: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: 8,
    alignSelf: 'center',
  },
  barLabelWeb: {
    fontSize: 12,
    color: '#444',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 160,
  },
  ratioCard: {
    backgroundColor: '#fff4f4',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#fde0e0',
  },
  ratioValue: {
    fontWeight: 'bold',
    fontSize: 32,
    color: '#222',
    marginBottom: 2,
  },
  ratioLabel: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
  },
  remarkRatioBadge: {
    backgroundColor: '#fde0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  remarkRatioBadgeText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 14,
  },
  remarkRatioBarWrap: {
    width: '100%',
    height: 12,
    backgroundColor: '#fde0e0',
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 2,
    justifyContent: 'center',
  },
  remarkRatioBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F44336',
    borderRadius: 6,
  },
  remarkRatioBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  remarkRatioBarLabel: {
    fontSize: 12,
    color: '#888',
  },
  ratioBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#fde0e0',
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 2,
    justifyContent: 'center',
  },
  ratioBarFill: {
    width: '100%',
    height: 8,
    backgroundColor: '#F44336',
    borderRadius: 6,
  },
  ratioBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  ratioBarLabelNum: {
    fontSize: 12,
    color: '#888',
  },
  metricColumnFull: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 18,
    marginBottom: 18,
  },
  metricCardFull: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db', // slightly darker for visibility
    padding: 16,
    marginBottom: 18,
    minHeight: 0,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    marginLeft: 2,
    marginTop: 8,
  },
  halfGaugeContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  halfGaugeBase: {
    width: 140,
    height: 70,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  halfGaugeGreen: {
    position: 'absolute',
    width: 140,
    height: 70,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 0,
    backgroundColor: 'green',
    left: 0,
    top: 0,
    zIndex: 1,
    transform: [{ skewX: '-30deg' }],
  },
  halfGaugeYellow: {
    position: 'absolute',
    width: 140,
    height: 70,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: 'gold',
    left: 46,
    top: 0,
    zIndex: 2,
    transform: [{ skewX: '0deg' }],
  },
  halfGaugeRed: {
    position: 'absolute',
    width: 140,
    height: 70,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 70,
    backgroundColor: '#F44336',
    left: 93,
    top: 0,
    zIndex: 3,
    transform: [{ skewX: '30deg' }],
  },
  halfGaugePointer: {
    position: 'absolute',
    width: 2,
    height: 60,
    backgroundColor: '#222',
    bottom: 0,
    left: 69,
    borderRadius: 2,
    zIndex: 10,
    transform: [{ rotate: '-90deg' }],
  },
  speedometerContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  speedometerHalfCircle: {
    width: 160,
    height: 80,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    overflow: 'hidden',
    backgroundColor: '#eee',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  speedometerGreen: {
    position: 'absolute',
    width: 160,
    height: 80,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 0,
    backgroundColor: 'green',
    left: 0,
    top: 0,
    zIndex: 1,
    transform: [{ skewX: '-30deg' }],
  },
  speedometerYellow: {
    position: 'absolute',
    width: 160,
    height: 80,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: 'gold',
    left: 53,
    top: 0,
    zIndex: 2,
    transform: [{ skewX: '0deg' }],
  },
  speedometerRed: {
    position: 'absolute',
    width: 160,
    height: 80,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 80,
    backgroundColor: '#F44336',
    left: 106,
    top: 0,
    zIndex: 3,
    transform: [{ skewX: '30deg' }],
  },
  speedometerPointer: {
    position: 'absolute',
    width: 4,
    height: 68,
    backgroundColor: '#222',
    bottom: 0,
    left: 78,
    borderRadius: 2,
    zIndex: 10,
    transform: [{ rotate: '-90deg' }],
  },
  speedometerTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 160,
    marginTop: 2,
  },
});

export default ProjectDetailScreen; 