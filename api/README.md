# API Integration Documentation

## Overview
This folder contains the API integration for the Defect Tracker mobile app. The integration uses Axios for HTTP requests and follows a clean architecture pattern.

## File Structure

### `config.ts`
- Contains the API base URL and Axios client configuration
- Sets up request/response interceptors for logging
- Configures timeout and headers

### `types.ts`
- Defines TypeScript interfaces for API responses
- Includes `Project`, `DefectDensity`, `DefectSeverityIndex`, `DefectRemarkRatio`, `ApiResponse`, `ProjectsResponse`, `DefectDensityResponse`, `DefectSeverityIndexResponse`, `DefectRemarkRatioResponse`, and `ApiError` interfaces
- Based on the API documentation provided

### `projects.ts`
- Contains the `projectsApi` object with API methods
- Implements `getProjects()`, `getDefectDensity()`, `getDefectSeverityIndex()`, and `getDefectRemarkRatio()` methods
- Includes proper error handling for network and server errors

### `test.ts`
- Simple test function to verify API integration
- Can be used for debugging and testing

## API Endpoints

### Get Projects
- **URL**: `http://34.56.162.48:8087/api/v1/projects`
- **Method**: GET
- **Headers**: `Content-Type: application/json`
- **Response**: Array of Project objects

### Get Defect Density
- **URL**: `http://34.56.162.48:8087/api/v1/dashboard/defect-density/{projectId}`
- **Method**: GET
- **Headers**: `Content-Type: application/json`
- **Parameters**: 
  - `projectId` (path): Project ID (Integer/Long, Mandatory)
  - `kloc` (query): Kilo Lines of Code (Double, Mandatory)
- **Response**: DefectDensity object

### Get Defect Severity Index (DSI)
- **URL**: `http://34.56.162.48:8087/api/v1/dashboard/dsi/{projectId}`
- **Method**: GET
- **Headers**: `Content-Type: application/json`
- **Parameters**: 
  - `projectId` (path): Project ID (Long, Mandatory)
- **Response**: DefectSeverityIndex object

### Get Defect to Remark Ratio
- **URL**: `http://34.56.162.48:8087/api/v1/dashboard/defect-remark-ratio`
- **Method**: GET
- **Headers**: `Content-Type: application/json`
- **Parameters**: 
  - `projectId` (query): Project ID (Number/Long, Mandatory)
- **Response**: DefectRemarkRatio object

## Usage Example

```typescript
import { projectsApi } from './api/projects';

// Fetch all projects
const fetchProjects = async () => {
  try {
    const response = await projectsApi.getProjects();
    console.log('Projects:', response.data);
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
};

// Fetch defect density for a project
const fetchDefectDensity = async (projectId: number, kloc: number) => {
  try {
    const response = await projectsApi.getDefectDensity(projectId, kloc);
    console.log('Defect Density:', response.data);
  } catch (error) {
    console.error('Error fetching defect density:', error);
  }
};

// Fetch defect severity index for a project
const fetchDefectSeverityIndex = async (projectId: number) => {
  try {
    const response = await projectsApi.getDefectSeverityIndex(projectId);
    console.log('Defect Severity Index:', response.data);
  } catch (error) {
    console.error('Error fetching defect severity index:', error);
  }
};

// Fetch defect to remark ratio for a project
const fetchDefectRemarkRatio = async (projectId: number) => {
  try {
    const response = await projectsApi.getDefectRemarkRatio(projectId);
    console.log('Defect to Remark Ratio:', response.data);
  } catch (error) {
    console.error('Error fetching defect remark ratio:', error);
  }
};
```

## Error Handling

The API integration includes comprehensive error handling:

1. **Network Errors**: When the request fails to reach the server
2. **Server Errors**: When the server responds with an error status
3. **Other Errors**: Unexpected errors during the request

All errors are logged and re-thrown with descriptive messages.

## Integration with Screens

### DashboardScreen.tsx
- Fetches projects on component mount
- Displays loading and error states
- Calculates risk levels based on project dates
- Updates project counts dynamically

### ProjectDetailScreen.tsx
- Receives project data via navigation params
- Displays project details using the new Project interface
- Calculates risk levels dynamically
- **NEW**: Fetches and displays defect density from API
- Shows loading, error, and success states for defect density
- Displays color-coded meter based on defect density values
- **NEW**: Fetches and displays defect severity index from API
- Shows loading, error, and success states for DSI
- Displays color-coded meter based on DSI percentage
- **NEW**: Fetches and displays defect to remark ratio from API
- Shows loading, error, and success states for remark ratio
- Displays color-coded bar based on remark ratio percentage

## Risk Calculation Logic

Projects are categorized by risk level based on their dates:

- **High Risk**: Project is overdue (end date < current date)
- **Medium Risk**: Project is within 7 days of deadline
- **Low Risk**: Project has more than 7 days until deadline

## Defect Density Logic

Defect density is categorized based on the API response:

- **Green (Good)**: 0 to 7 defects per KLOC
- **Yellow (Moderate Quality)**: 7 to 10 defects per KLOC
- **Red (High Risk)**: Above 10 defects per KLOC

## Defect Severity Index Logic

DSI percentage is categorized based on the API response:

- **Green (Low Risk)**: 0 to 25%
- **Yellow (Moderate Risk)**: 25 to 50%
- **Red (High Risk)**: Above 50%

## Defect to Remark Ratio Logic

Remark ratio is categorized based on the API response:

- **Green (Low)**: ratio > 98% && ratio <= 100%
- **Yellow (Medium)**: ratio >= 90% && ratio <= 98%
- **Red (High)**: ratio < 90%

## Future Enhancements

1. Add authentication headers when required
2. Implement caching for better performance
3. Add more API endpoints (create, update, delete projects)
4. Add retry logic for failed requests
5. Implement offline support
6. Add KLOC input field for user to specify project size