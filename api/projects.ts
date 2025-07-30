import { apiClient } from './config';
import { ProjectsResponse, DefectDensityResponse, DefectSeverityIndexResponse, DefectRemarkRatioResponse, ProjectCardColorResponse, DefectSeveritySummaryResponse, DefectStatisticsResponse, DefectByModuleResponse, ReopenCountSummaryResponse, DefectDetailsResponse, ApiError } from './types';

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

  /**
   * Get project card color for a specific project
   * @param projectId - The project ID
   * @returns Promise<ProjectCardColorResponse>
   */
  getProjectCardColor: async (projectId: string): Promise<ProjectCardColorResponse> => {
    try {
      const response = await apiClient.get<ProjectCardColorResponse>(`/dashboard/project-card-color/${projectId}`);
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch project card color');
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
   * Get defect severity summary for a specific project
   * @param projectId - The project ID
   * @returns Promise<DefectSeveritySummaryResponse>
   */
  getDefectSeveritySummary: async (projectId: number): Promise<DefectSeveritySummaryResponse> => {
    try {
      const response = await apiClient.get<DefectSeveritySummaryResponse>(`/dashboard/defect_severity_summary/${projectId}`);
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch defect severity summary');
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
   * Get defect type statistics for a specific project
   * @param projectId - The project ID
   * @returns Promise<DefectStatisticsResponse>
   */
  getDefectStatistics: async (projectId: number): Promise<DefectStatisticsResponse> => {
    try {
      const response = await apiClient.get<DefectStatisticsResponse>(`/dashboard/defect-type/${projectId}`);
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch defect type statistics');
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
   * Get defects by module for a specific project
   * @param projectId - The project ID
   * @returns Promise<DefectByModuleResponse>
   */
  getDefectsByModule: async (projectId: number): Promise<DefectByModuleResponse> => {
    try {
      const response = await apiClient.get<DefectByModuleResponse>(`/dashboard/module`, {
        params: { projectId }
      });
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch defects by module');
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
   * Get reopen count summary for a specific project
   * @param projectId - The project ID
   * @returns Promise<ReopenCountSummaryResponse>
   */
  getReopenCountSummary: async (projectId: number): Promise<ReopenCountSummaryResponse> => {
    try {
      const response = await apiClient.get<ReopenCountSummaryResponse>(`/dashboard/reopen-count_summary/${projectId}`);
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch reopen count summary');
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
   * Get defect details by specific reopen count
   * @param projectId - The project ID
   * @param count - The reopen count (2 to 5)
   * @returns Promise<DefectDetailsResponse>
   */
  getDefectDetailsByReopenCount: async (projectId: number, count: number): Promise<DefectDetailsResponse> => {
    try {
      const response = await apiClient.get<DefectDetailsResponse>(`/dashboard/details/${projectId}/${count}`);
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch defect details by reopen count');
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
   * Get defect details for reopen count more than 5
   * @param projectId - The project ID
   * @returns Promise<DefectDetailsResponse>
   */
  getDefectDetailsMoreThanFive: async (projectId: number): Promise<DefectDetailsResponse> => {
    try {
      const response = await apiClient.get<DefectDetailsResponse>(`/dashboard/details/more-than-five/${projectId}`);
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData: ApiError = error.response.data;
        throw new Error(errorData.message || 'Failed to fetch defect details more than 5 times');
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