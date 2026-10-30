/**
 * API Client for Maple Backend
 * Handles all HTTP requests to the Django REST API
 * Includes JWT token management and error handling
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_V1 = '/api/v1';

export const API_ENDPOINTS = {
  // Authentication
  AUTH_REGISTER: `${API_BASE_URL}${API_V1}/auth/register/`,
  AUTH_LOGIN: `${API_BASE_URL}${API_V1}/auth/token/`,
  AUTH_REFRESH: `${API_BASE_URL}${API_V1}/auth/token/refresh/`,
  
  // Curriculum
  COUNTRIES: `${API_BASE_URL}${API_V1}/curriculum/countries/`,
  SUBJECTS: `${API_BASE_URL}${API_V1}/curriculum/subjects/`,
  CLASS_LEVELS: `${API_BASE_URL}${API_V1}/curriculum/class-levels/`,
  TOPICS: `${API_BASE_URL}${API_V1}/curriculum/topics/`,
  
  // Institutions
  INSTITUTIONS: `${API_BASE_URL}${API_V1}/institutions/`,
  INSTITUTION_MEMBERSHIPS: `${API_BASE_URL}${API_V1}/institution-memberships/`,
  
  // Marketplace
  LISTINGS: `${API_BASE_URL}${API_V1}/marketplace/listings/`,
  PAYOUTS: `${API_BASE_URL}${API_V1}/marketplace/payouts/`,
  
  // Live Sessions
  LIVE_SESSIONS: `${API_BASE_URL}${API_V1}/live-sessions/live-session/`,
  SESSION_REMINDERS: `${API_BASE_URL}${API_V1}/live-sessions/session-reminder/`,
  
  // Assessments
  ASSESSMENTS: `${API_BASE_URL}${API_V1}/assessments/assessment/`,
  ASSESSMENT_WINDOWS: `${API_BASE_URL}${API_V1}/assessments/assessment-window/`,
  SUBMISSIONS: `${API_BASE_URL}${API_V1}/assessments/submission/`,
  
  // Classes
  CLASSES: `${API_BASE_URL}${API_V1}/classes/`,
  CLASS_ENROLLMENTS: `${API_BASE_URL}${API_V1}/class-enrollments/`,
  
  // Lessons
  LESSONS: `${API_BASE_URL}${API_V1}/lessons/lesson/`,
  LESSON_NOTES: `${API_BASE_URL}${API_V1}/lessons/lesson-note/`,
  LESSON_RECORDINGS: `${API_BASE_URL}${API_V1}/lessons/lesson-recording/`,
  LESSON_ATTENDANCE: `${API_BASE_URL}${API_V1}/lessons/lesson-attendance/`,
  
  // Attendance
  DAILY_ATTENDANCE: `${API_BASE_URL}${API_V1}/attendance/daily/`,

  // Scheduling
  TIMETABLE_SLOTS: `${API_BASE_URL}${API_V1}/scheduling/timetable/`,

  // Resources
  RESOURCES: `${API_BASE_URL}${API_V1}/resources/`,

  // Content Management System
  CONTENT_ITEMS: `${API_BASE_URL}${API_V1}/content/items/`,
  CONTENT_TEACHER: `${API_BASE_URL}${API_V1}/content/teacher/`,
  CONTENT_INSTITUTION: `${API_BASE_URL}${API_V1}/content/institution/`,
  CONTENT_ADMIN: `${API_BASE_URL}${API_V1}/content/admin/`,
  CONTENT_LIBRARY: `${API_BASE_URL}${API_V1}/content/library/`,
  CONTENT_CLASSROOM: `${API_BASE_URL}${API_V1}/content/classroom/`,
  CONTENT_ENGAGEMENT: `${API_BASE_URL}${API_V1}/content/engagement/`,
  CONTENT_TAGS: `${API_BASE_URL}${API_V1}/content/tags/`,
  CONTENT_ASSIGNMENTS: `${API_BASE_URL}${API_V1}/content/assignments/`,
  CONTENT_RECOMMENDATIONS: `${API_BASE_URL}${API_V1}/content/recommendations/`,
  CONTENT_DASHBOARD_STUDENT: `${API_BASE_URL}${API_V1}/content/dashboard/student/`,
  CONTENT_DASHBOARD_TEACHER: `${API_BASE_URL}${API_V1}/content/dashboard/teacher/`,
  CONTENT_DASHBOARD_PARENT: `${API_BASE_URL}${API_V1}/content/dashboard/parent/`,
  
  // Discussions
  THREADS: `${API_BASE_URL}${API_V1}/discussions/thread/`,
  POSTS: `${API_BASE_URL}${API_V1}/discussions/post/`,
  
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}${API_V1}/notifications/notification/`,
  
  // Dashboards
  STUDENT_DASHBOARD: `${API_BASE_URL}${API_V1}/analytics/student-dashboard/`,
  TEACHER_DASHBOARD: `${API_BASE_URL}${API_V1}/analytics/teacher-dashboard/`,
  PARENT_DASHBOARD: `${API_BASE_URL}${API_V1}/analytics/parent-dashboard/`,
  ADMIN_DASHBOARD: `${API_BASE_URL}${API_V1}/analytics/admin-dashboard/`,

  // Intelligence Engine
  INTELLIGENCE_ACTIONS: `${API_BASE_URL}${API_V1}/intelligence/actions/`,
  INTELLIGENCE_INTERVENTION_PACKS: `${API_BASE_URL}${API_V1}/intelligence/intervention-packs/`,
  INTELLIGENCE_INTERVENTION_ASSIGNMENTS: `${API_BASE_URL}${API_V1}/intelligence/intervention-assignments/`,
  INTELLIGENCE_STUDY_PLANS: `${API_BASE_URL}${API_V1}/intelligence/study-plans/`,
  INTELLIGENCE_STUDY_TASKS: `${API_BASE_URL}${API_V1}/intelligence/study-tasks/`,
  INTELLIGENCE_PARENT_ACTIONS: `${API_BASE_URL}${API_V1}/intelligence/parent-actions/`,
  INTELLIGENCE_POINTS: `${API_BASE_URL}${API_V1}/intelligence/points/`,
  INTELLIGENCE_BADGES: `${API_BASE_URL}${API_V1}/intelligence/badges/`,
  INTELLIGENCE_MY_BADGES: `${API_BASE_URL}${API_V1}/intelligence/my-badges/`,
  INTELLIGENCE_CHALLENGES: `${API_BASE_URL}${API_V1}/intelligence/challenges/`,
  INTELLIGENCE_HOUSES: `${API_BASE_URL}${API_V1}/intelligence/houses/`,
  INTELLIGENCE_LEARNING_PROGRESS: `${API_BASE_URL}${API_V1}/intelligence/learning-progress/`,
  INTELLIGENCE_NATIONAL_EXAMS: `${API_BASE_URL}${API_V1}/intelligence/national-exams/`,
  INTELLIGENCE_STORY_CARDS: `${API_BASE_URL}${API_V1}/intelligence/story-cards/`,
  INTELLIGENCE_HEALTH: `${API_BASE_URL}${API_V1}/intelligence/health/`,
  INTELLIGENCE_HEALTH_HISTORY: `${API_BASE_URL}${API_V1}/intelligence/health-history/`,
  INTELLIGENCE_IMPACT: `${API_BASE_URL}${API_V1}/intelligence/impact/`,
  INTELLIGENCE_STUDENT_PASSPORT: `${API_BASE_URL}${API_V1}/intelligence/passport/student/`,
  INTELLIGENCE_TEACHER_PASSPORT: `${API_BASE_URL}${API_V1}/intelligence/passport/teacher/`,

  // P7 Readiness & Primary
  P7_READINESS: `${API_BASE_URL}${API_V1}/intelligence/p7-readiness/`,
  P7_SUBJECT_READINESS: `${API_BASE_URL}${API_V1}/intelligence/p7-subject-readiness/`,
  P7_MOCK_EXAMS: `${API_BASE_URL}${API_V1}/intelligence/p7-mock-exams/`,
  P7_REVISION_TASKS: `${API_BASE_URL}${API_V1}/intelligence/p7-revision-tasks/`,
  P7_INTERVENTION_PACKS: `${API_BASE_URL}${API_V1}/intelligence/p7-intervention-packs/`,
  P7_RISK_FLAGS: `${API_BASE_URL}${API_V1}/intelligence/p7-risk-flags/`,
  P7_PARENT_SUPPORT: `${API_BASE_URL}${API_V1}/intelligence/p7-parent-support/`,
  P7_INSTITUTION_SUMMARY: `${API_BASE_URL}${API_V1}/intelligence/p7-institution-summary/`,
  OFFLINE_ASSESSMENT_UPLOAD: `${API_BASE_URL}${API_V1}/assessments/offline-results/`,
  OFFLINE_ONLINE_COMPARISON: `${API_BASE_URL}${API_V1}/assessments/offline-online-comparison/`,
};

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

/**
 * Get JWT tokens from localStorage
 */
export const getStoredTokens = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  return { accessToken, refreshToken };
};

/**
 * Store JWT tokens in localStorage
 */
export const storeTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

/**
 * Clear tokens from localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Refresh JWT token using refresh token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken } = getStoredTokens();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(API_ENDPOINTS.AUTH_REFRESH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      const newAccessToken = data.access;
      storeTokens(newAccessToken, refreshToken);
      return newAccessToken;
    } else {
      // Refresh token expired, clear all tokens
      clearTokens();
      return null;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

/**
 * Make an API request with JWT token
 */
export const apiRequest = async <T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  // Fast-fail when browser is offline — avoids hanging TCP timeouts
  if (!navigator.onLine) {
    return {
      data: null as unknown as T,
      error: { status: 0, message: 'You are offline. Please check your internet connection.' },
    };
  }

  try {
    const { accessToken } = getStoredTokens();
    
    // Ensure URL has the full API v1 path
    let fullUrl = url;
    if (!url.startsWith('http') && !url.startsWith('/api')) {
      fullUrl = `/api/v1${url.startsWith('/') ? url : '/' + url}`;
    } else if (!url.startsWith('http') && url.startsWith('/api') && !url.includes('/v1')) {
      // If it has /api but not /v1, add it
      fullUrl = url.replace('/api/', '/api/v1/');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Handle 401 - Token expired, try refresh
    if (response.status === 401 && accessToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(fullUrl, {
          ...options,
          headers,
        });

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return { data: data as T };
        } else if (retryResponse.status === 401) {
          // Still 401 after refresh, redirect to login
          clearTokens();
          window.location.href = '/login';
          return { data: null as unknown as T, error: { status: 401, message: 'Unauthorized' } };
        }
      } else {
        // Refresh failed, clear tokens and redirect to login
        clearTokens();
        window.location.href = '/login';
        return { data: null as unknown as T, error: { status: 401, message: 'Session expired' } };
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null as unknown as T,
        error: {
          status: response.status,
          message: response.statusText,
          data: errorData,
        },
      };
    }

    const data = await response.json();
    return { data: data as T };
  } catch (error) {
    console.error('API request error:', error);
    return {
      data: null as unknown as T,
      error: {
        status: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};

/**
 * GET request
 */
export const apiGet = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { method: 'GET' });
};

/**
 * POST request
 */
export const apiPost = async <T = unknown>(url: string, data: unknown): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 */
export const apiPut = async <T = unknown>(url: string, data: unknown): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request
 */
export const apiPatch = async <T = unknown>(url: string, data: unknown): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const apiDelete = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { method: 'DELETE' });
};

/**
 * Register new user
 */
export const registerUser = async (userData: {
  email: string;
  full_name: string;
  password: string;
  country_code: string;
  role: 'student' | 'teacher' | 'institution' | 'admin';
}) => {
  return apiPost(API_ENDPOINTS.AUTH_REGISTER, userData);
};

/**
 * Login user and get JWT tokens
 */
export const loginUser = async (email: string, password: string) => {
  const response = await apiPost<{ access: string; refresh: string }>(
    API_ENDPOINTS.AUTH_LOGIN,
    { email, password }
  );

  if (response.data) {
    storeTokens(response.data.access, response.data.refresh);
  }

  return response;
};

/**
 * Logout user by clearing tokens
 */
export const logoutUser = () => {
  clearTokens();
  window.location.href = '/login';
};

/**
 * Format paginated response
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Fetch paginated results with automatic page concatenation
 */
export const fetchAllPaginated = async <T = unknown>(
  url: string,
  maxPages?: number
): Promise<T[]> => {
  const results: T[] = [];
  let page = 1;
  let hasMore = true;
  const pageLimit = maxPages || 10;

  while (hasMore && page <= pageLimit) {
    const pageUrl = url.includes('?')
      ? `${url}&page=${page}`
      : `${url}?page=${page}`;

    const response = await apiGet<PaginatedResponse<T>>(pageUrl);

    if (response.data?.results) {
      results.push(...response.data.results);
      hasMore = !!response.data.next;
      page++;
    } else {
      hasMore = false;
    }
  }

  return results;
};

export const apiClient = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  request: apiRequest,
  registerUser,
  loginUser,
  logoutUser,
  getStoredTokens,
  storeTokens,
  clearTokens,
  refreshAccessToken,
  endpoints: API_ENDPOINTS,
};

export default apiClient;
