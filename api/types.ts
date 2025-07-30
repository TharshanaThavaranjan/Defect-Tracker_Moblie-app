export interface Project {
  id: number;
  projectId: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  clientName: string;
  country: string;
  state: string;
  email: string;
  phoneNo: string;
  userId: number;
  userFirstName: string;
  userLastName: string;
}

export interface DefectDensity {
  defects: number;
  projectId: number;
  defectDensity: number;
  color: string;
  meaning: string;
  range: string;
  projectName: string;
  clientName: string;
  kloc: number;
}

export interface DefectSeverityIndex {
  projectId: number;
  totalDefects: number;
  actualSeverityScore: number;
  maximumSeverityScore: number;
  dsiPercentage: number;
  interpretation: string;
}

export interface DefectRemarkRatio {
  remarks: number;
  defects: number;
  ratio: string;
  category: string;
  color: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'failure';
  message: string;
  data: T;
  statusCode: number;
}

export interface ProjectsResponse extends ApiResponse<Project[]> {}
export interface DefectDensityResponse extends ApiResponse<DefectDensity> {}
export interface DefectSeverityIndexResponse extends ApiResponse<DefectSeverityIndex> {}
export interface DefectRemarkRatioResponse extends ApiResponse<DefectRemarkRatio> {}

export interface ProjectCardColor {
  projectId: number;
  projectName: string;
  availableRiskLevels: string[];
  projectCardColor: string;
}

export interface ProjectCardColorResponse extends ApiResponse<ProjectCardColor> {}

export interface DefectStatus {
  color: string;
  count: number;
}

export interface DefectSeveritySummaryItem {
  severity: string;
  Severity_color: string;
  total: number;
  statuses: {
    REOPEN: DefectStatus;
    NEW: DefectStatus;
    OPEN: DefectStatus;
    FIXED: DefectStatus;
    CLOSED: DefectStatus;
    REJECTED: DefectStatus;
    DUPLICATE: DefectStatus;
  };
}

export interface DefectSeveritySummary {
  projectId: number;
  projectName: string;
  totalDefects: number;
  defectSummary: DefectSeveritySummaryItem[];
}

export interface DefectSeveritySummaryResponse extends ApiResponse<DefectSeveritySummary> {}

export interface DefectType {
  defectType: string;
  defectCount: number;
  percentage: number;
}

export interface DefectStatistics {
  defectTypes: DefectType[];
  totalDefectCount: number;
  mostCommonDefectType: string;
  mostCommonDefectCount: number;
}

export interface DefectStatisticsResponse extends ApiResponse<DefectStatistics> {}

export interface DefectByModule {
  moduleId: number;
  name: string;
  value: number;
  percentage: number;
}

export interface DefectByModuleResponse extends ApiResponse<DefectByModule[]> {}

export interface ReopenCountSummary {
  label: string;
  count: number;
}

export interface ReopenCountSummaryResponse extends ApiResponse<ReopenCountSummary[]> {}

export interface DefectDetail {
  defectId: number;
  title: string;
  assignee: string;
  reporter: string;
  release: string;
}

export interface DefectDetailsResponse extends ApiResponse<DefectDetail[]> {}

export interface ApiError {
  status: 'failure';
  message: string;
  data: null;
  statusCode: string;
}