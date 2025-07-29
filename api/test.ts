import { projectsApi } from './projects';

// Simple test function to verify API integration
export const testApiIntegration = async () => {
  try {
    console.log('Testing API integration...');
    const response = await projectsApi.getProjects();
    console.log('API Response:', response);
    console.log('Projects count:', response.data.length);
    return response;
  } catch (error) {
    console.error('API Test failed:', error);
    throw error;
  }
};