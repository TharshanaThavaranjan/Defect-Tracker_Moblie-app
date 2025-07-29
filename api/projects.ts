import { apiClient } from './config';
import { ProjectsResponse, DefectDensityResponse, DefectSeverityIndexResponse, DefectRemarkRatioResponse, ApiError } from './types';

export const projectsApi = {
  /**
   * Get all projects
   * @returns Promise<ProjectsResponse>
   */
  getProjects: async (): Promise<ProjectsResponse> => {
    try {
      const response = await apiClient.get<ProjectsResponse>('/projects');
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch projects');
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other error
        throw new Error('An unexpected error occurred.');
      }
    }
  },

  /**
   * Get defect density for a specific project
   * @param projectId - The project ID
   * @param kloc - Kilo Lines of Code
   * @returns Promise<DefectDensityResponse>
   */
  getDefectDensity: async (projectId: number, kloc: number): Promise<DefectDensityResponse> => {
    try {
      const response = await apiClient.get<DefectDensityResponse>(`/dashboard/defect-density/${projectId}`, {
        params: { kloc }
      });
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch defect density');
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other error
        throw new Error('An unexpected error occurred.');
      }
    }
  },

  /**
   * Get defect severity index for a specific project
   * @param projectId - The project ID
   * @returns Promise<DefectSeverityIndexResponse>
   */
  getDefectSeverityIndex: async (projectId: number): Promise<DefectSeverityIndexResponse> => {
    try {
      const response = await apiClient.get<DefectSeverityIndexResponse>(`/dashboard/dsi/${projectId}`);
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch defect severity index');
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other error
        throw new Error('An unexpected error occurred.');
      }
    }
  },

  /**
   * Get defect to remark ratio for a specific project
   * @param projectId - The project ID
   * @returns Promise<DefectRemarkRatioResponse>
   */
  getDefectRemarkRatio: async (projectId: number): Promise<DefectRemarkRatioResponse> => {
    try {
      const response = await apiClient.get<DefectRemarkRatioResponse>('/dashboard/defect-remark-ratio', {
        params: { projectId }
      });
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch defect remark ratio');
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other error
        throw new Error('An unexpected error occurred.');
      }
    }
  },
};