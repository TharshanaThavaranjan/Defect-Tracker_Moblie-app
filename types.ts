export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: { userEmail: string };
  ForgetPassword: undefined;
  NextPage: undefined;
  ProjectDetail: { project: { name: string; risk: string } };
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
}; 