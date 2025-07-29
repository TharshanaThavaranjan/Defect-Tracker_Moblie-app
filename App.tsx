/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import ForgetPassword from './screens/ForgetPassword';
import NextPage from './screens/NextPage';
import ProjectDetailScreen from './screens/ProjectDetailScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import { RootStackParamList } from './types';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import { ThemeProvider } from './ThemeContext';
import { ProfileProvider } from './ProfileContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: true }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="NextPage" component={NextPage} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgetPassword" component={ForgetPassword} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
