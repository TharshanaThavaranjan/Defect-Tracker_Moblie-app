import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Svg, { Path, Line, G, Circle, Text as SvgText } from 'react-native-svg';

// Project list (should match DashboardScreen)
const PROJECTS = [
  { name: 'Defect Tracker', risk: 'High Risk' },
  { name: 'QA testing', risk: 'High Risk' },
  { name: 'project 1', risk: 'Low Risk' },
  { name: 'Heart', risk: 'Low Risk' },
  { name: 'Dashbord testing', risk: 'High Risk' },
  { name: 'JALI', risk: 'Low Risk' },
  { name: 'Hello world', risk: 'Low Risk' },
  { name: 'dashboard test', risk: 'High Risk' },
];

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

const ProjectDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { project } = route.params;

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const handleSelectProject = (proj: { name: string; risk: string }) => {
    if (proj.name !== project.name) {
      navigation.replace('ProjectDetail', { project: proj });
    }
  };

  const handleBack = () => {
    navigation.goBack();
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
          <Text style={styles.logoutIcon}>⇦</Text>
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
              style={[styles.selectorPill, proj.name === project.name && styles.selectorPillActive]}
              onPress={() => handleSelectProject(proj)}
            >
              <Text style={[styles.selectorPillText, proj.name === project.name && styles.selectorPillTextActive]}>
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
          <Text style={styles.projectTitle}>{project.name}</Text>
          <Text style={[styles.risk, 
            project.risk === 'High Risk' ? styles.high : project.risk === 'Medium Risk' ? styles.medium : styles.low
          ]}>{project.risk}</Text>
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

        {/* Defect Density, Severity Index, Remark Ratio - vertical cards */}
        <View style={styles.metricColumnFull}>
          {/* Defect Density Gauge */}
          <View style={styles.metricCardFull}>
            <Text style={styles.metricTitleLeft}>Defect Density</Text>
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <Text style={styles.metricLabelCenter}>
                Defect Density: <Text style={styles.metricValue}>{MOCK_DATA.defectDensity}</Text>
              </Text>
              <Svg width={160} height={90}>
                {/* Arc: 180-degree semi-circle */}
                <Path
                  d="M 10 80 A 70 70 0 0 1 150 80"
                  stroke="#2563eb"
                  strokeWidth={6}
                  fill="none"
                />
                {/* Pointer/Needle */}
                <G origin="80,80" rotation={(MOCK_DATA.defectDensity / 10) * 180 - 90}>
                  <Line
                    x1="80"
                    y1="80"
                    x2="80"
                    y2="20"
                    stroke="#F44336"
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                </G>
                {/* Center dot */}
                <Circle cx="80" cy="80" r="6" fill="#222" />
                {/* Tick labels */}
                <SvgText
                  x="10"
                  y="90"
                  fontSize="12"
                  fill="#222"
                  textAnchor="middle"
                >0</SvgText>
                <SvgText
                  x="80"
                  y="18"
                  fontSize="12"
                  fill="#222"
                  textAnchor="middle"
                >7</SvgText>
                <SvgText
                  x="150"
                  y="90"
                  fontSize="12"
                  fill="#222"
                  textAnchor="middle"
                >10</SvgText>
              </Svg>
            </View>
          </View>
          {/* Defect Severity Index Vertical Bar */}
          <View style={styles.metricCardFull}>
            <Text style={styles.metricTitleLeft}>Defect Severity Index</Text>
            <View style={styles.severityIndexContent}>
              <View style={styles.barContainerWeb}>
                <View style={styles.barTrackWeb}>
                  <View style={[styles.barFillWeb, { height: `${MOCK_DATA.defectSeverityIndex}%` }]} />
                </View>
                <Text style={styles.barValueWeb}>{MOCK_DATA.defectSeverityIndex}</Text>
              </View>
              <Text style={styles.barLabelWeb}>Weighted severity score (higher = more severe defects)</Text>
            </View>
          </View>
          {/* Defect to Remark Ratio (unchanged) */}
          <View style={styles.metricCardFull}>
            <Text style={styles.metricTitle}>Defect to Remark Ratio</Text>
            <View style={styles.ratioCard}>
              <Text style={styles.ratioValue}>{MOCK_DATA.defectToRemarkRatio}</Text>
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

        {/* Pie Charts Row */}
        <View style={styles.sectionRow}>
          <View style={styles.chartCard}>
            <Text style={styles.metricTitle}>Defects Reopened Multiple Times</Text>
            <View style={styles.piePlaceholder}>
              <Text style={styles.pieLabel}>Pie</Text>
            </View>
          </View>
          <View style={styles.chartCard}>
            <Text style={styles.metricTitle}>Defect Distribution by Type</Text>
            <View style={styles.piePlaceholder}>
              <Text style={styles.pieLabel}>Pie</Text>
            </View>
          </View>
        </View>

        {/* Line Charts Row */}
        <View style={styles.sectionRow}>
          <View style={styles.lineCard}>
            <Text style={styles.metricTitle}>Time to Find Defects</Text>
            <View style={styles.linePlaceholder}>
              <Text style={styles.lineLabel}>Line</Text>
            </View>
          </View>
          <View style={styles.lineCard}>
            <Text style={styles.metricTitle}>Time to Fix Defects</Text>
            <View style={styles.linePlaceholder}>
              <Text style={styles.lineLabel}>Line</Text>
            </View>
          </View>
        </View>

        {/* Defects by Module Pie */}
        <View style={styles.chartCard}>
          <Text style={styles.metricTitle}>Defects by Module</Text>
          <View style={styles.piePlaceholder}>
            <Text style={styles.pieLabel}>Pie</Text>
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
  backBtn: {
    marginRight: 8,
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