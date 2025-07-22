export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: { userEmail: string };
  ForgetPassword: undefined;
  NextPage: undefined;
  ProjectDetail: { project: { name: string; risk: string } };
}; 