export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: { userEmail: string };
  ProjectDetail: { project: { name: string; risk: string } };
  ForgetPassword: undefined;
  Settings: undefined;
  Profile: undefined;
  EditProfile: undefined;
}; 