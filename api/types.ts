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

export interface ApiError {
  status: 'failure';
  message: string;
  data: null;
  statusCode: string;
}