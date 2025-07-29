import { Project } from './api/types';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: { userEmail: string };
  ProjectDetail: { project: Project };
  ForgetPassword: undefined;
  Settings: undefined;
  Profile: undefined;
  EditProfile: undefined;
};

// Re-export Project type for convenience
export type { Project, DefectDensity, DefectSeverityIndex, DefectRemarkRatio } from './api/types'; 