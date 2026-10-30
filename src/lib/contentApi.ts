/**
 * Content Management API Service
 * 
 * Provides typed functions for all content CRUD, upload, delivery, and engagement operations.
 * Uses the main apiClient for JWT-authenticated requests.
 */
import { API_ENDPOINTS, apiGet, apiPost, apiDelete, getStoredTokens } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ── Types ──────────────────────────────────────────────────────

export type ContentType =
  | 'notes' | 'textbook' | 'pdf' | 'document' | 'video'
  | 'slides' | 'worksheet' | 'assignment' | 'project'
  | 'activity' | 'revision' | 'teacher_guide' | 'lesson_attachment'
  | 'topic_resource' | 'class_resource' | 'library_resource'
  | 'mock_exam' | 'intervention' | 'other';

export type PublicationStatus =
  | 'draft' | 'uploaded' | 'processing' | 'under_review'
  | 'published' | 'archived' | 'rejected' | 'hidden';

export type VisibilityScope =
  | 'global' | 'country' | 'institution' | 'class'
  | 'assigned_students' | 'private';

export type OwnerType = 'teacher' | 'institution' | 'platform_admin';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: ContentType;
  uploader_name: string;
  owner_type: OwnerType;
  institution_name: string | null;
  school_level: string;
  class_level: number | null;
  class_level_name: string | null;
  subject: number | null;
  subject_name: string | null;
  topic: number | null;
  topic_name: string | null;
  visibility_scope: VisibilityScope;
  publication_status: PublicationStatus;
  file_url: string | null;
  thumbnail_url: string | null;
  mime_type: string;
  file_size: number | null;
  duration_seconds: number | null;
  language: string;
  version: number;
  is_featured: boolean;
  tags: string[];
  engagement_summary: {
    total_views: number;
    unique_viewers: number;
    avg_completion: number;
  };
  created_at: string;
  updated_at: string;
  published_at: string | null;
  // Detail fields
  uploaded_by?: number;
  owner_institution?: number | null;
  country?: number | null;
  curriculum?: number | null;
  education_level?: number | null;
  lesson?: number | null;
  assignment?: number | null;
  intervention?: number | null;
  moderation_status?: string;
  rejection_reason?: string;
  vimeo_video_id?: string;
  vimeo_upload_status?: string;
  external_url?: string;
  archived_at?: string | null;
  versions?: ContentVersion[];
}

export interface ContentVersion {
  id: string;
  content_item: string;
  version_number: number;
  file: string | null;
  file_size: number | null;
  mime_type: string;
  change_note: string;
  replaced_by: number | null;
  replaced_by_name: string;
  created_at: string;
}

export interface ContentEngagement {
  id: string;
  student: number;
  student_name: string;
  content_item: string;
  status: 'not_started' | 'started' | 'in_progress' | 'completed';
  view_count: number;
  active_time_seconds: number;
  completion_percentage: number;
  remaining_percentage: number;
  last_position: number;
  is_completed: boolean;
  first_accessed: string | null;
  last_accessed: string | null;
  completed_at: string | null;
}

export interface ContentAssignment {
  id: string;
  content_item: string;
  content_title: string;
  content_type: ContentType;
  content_thumbnail: string | null;
  student: number;
  student_name: string;
  assigned_by: number | null;
  assigned_by_name: string | null;
  assigned_by_type: 'teacher' | 'ai' | 'institution' | 'platform';
  assignment_type: 'required' | 'recommended';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  note: string;
  target_class: number | null;
  subject: number | null;
  subject_name: string | null;
  topic: number | null;
  topic_name: string | null;
  lesson: number | null;
  due_date: string | null;
  is_active: boolean;
  engagement: {
    status: 'not_started' | 'started' | 'in_progress' | 'completed';
    completion_percentage: number;
    remaining_percentage: number;
    active_time_seconds: number;
    last_position: number;
    first_accessed: string | null;
    last_accessed: string | null;
    is_completed: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ContentRecommendation {
  id: string;
  student: number;
  student_name: string;
  content_item: string;
  content_title: string;
  content_type: ContentType;
  source: string;
  reason: string;
  confidence_score: number;
  subject: number | null;
  subject_name: string | null;
  topic: number | null;
  topic_name: string | null;
  status: 'active' | 'dismissed' | 'accepted' | 'expired';
  engagement: {
    status: string;
    completion_percentage: number;
    remaining_percentage: number;
    active_time_seconds: number;
    is_completed: boolean;
  };
  created_at: string;
  expires_at: string | null;
  dismissed_at: string | null;
}

export interface ContinueLearningItem {
  content_item_id: string;
  title: string;
  content_type: ContentType;
  subject_name: string | null;
  topic_name: string | null;
  status: string;
  completion_percentage: number;
  remaining_percentage: number;
  active_time_seconds: number;
  last_position: number;
  last_accessed: string | null;
}

export interface StudentContentDashboard {
  assignments: ContentAssignment[];
  recommendations: ContentRecommendation[];
  continue_learning: ContinueLearningItem[];
  summary: {
    total_time_seconds: number;
    completed_count: number;
    in_progress_count: number;
    assigned_count: number;
  };
}

export interface TeacherContentDashboard {
  resources: Array<{
    content_item_id: string;
    title: string;
    content_type: ContentType;
    subject_name: string | null;
    assigned_count: number;
    not_started: number;
    started: number;
    in_progress: number;
    completed: number;
    avg_completion: number;
    avg_time_seconds: number;
    missing_students: string[];
    learners: Array<{
      student_id: number;
      student_name: string;
      status: string;
      completion_percentage: number;
      active_time_seconds: number;
      last_accessed: string | null;
    }>;
  }>;
  total_assignments: number;
}

export interface ParentContentDashboard {
  children: Array<{
    child_id: number;
    child_name: string;
    assigned_content: Array<{
      assignment_id: string;
      content_title: string;
      content_type: ContentType;
      assigned_by_type: string;
      assigned_by_name: string;
      assignment_type: string;
      subject_name: string | null;
      topic_name: string | null;
      due_date: string | null;
      engagement: {
        status: string;
        completion_percentage: number;
        remaining_percentage: number;
        active_time_seconds: number;
        is_completed: boolean;
        first_accessed: string | null;
        last_accessed: string | null;
      };
    }>;
    total_assigned: number;
    not_started_count: number;
    completed_count: number;
  }>;
}

export interface ContentStats {
  total: number;
  drafts: number;
  published: number;
  archived: number;
  total_views?: number;
  total_engagement_minutes?: number;
  by_teacher?: number;
  by_institution?: number;
  by_platform?: number;
  pending_review?: number;
  rejected?: number;
  featured?: number;
  total_file_size_mb?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ContentUploadData {
  title: string;
  description?: string;
  content_type: ContentType;
  owner_type?: OwnerType;
  owner_institution?: number | null;
  school_level?: string;
  country?: number | null;
  curriculum?: number | null;
  education_level?: number | null;
  class_level?: number | null;
  subject?: number | null;
  topic?: number | null;
  lesson?: number | null;
  assignment?: number | null;
  intervention?: number | null;
  visibility_scope?: VisibilityScope;
  publication_status?: PublicationStatus;
  file?: File;
  external_url?: string;
  thumbnail?: File;
  language?: string;
  is_featured?: boolean;
  tags?: string[];
  duration_seconds?: number;
}

export interface ContentFilters {
  content_type?: ContentType;
  publication_status?: PublicationStatus;
  visibility_scope?: VisibilityScope;
  school_level?: string;
  owner_type?: OwnerType;
  owner_institution?: number;
  subject?: number;
  class_level?: number;
  topic?: number;
  lesson?: number;
  country?: number;
  is_featured?: boolean;
  language?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

// ── Helper: Build query string ─────────────────────────────────

function buildQueryString(filters: ContentFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ── Helper: Multipart upload ───────────────────────────────────

async function multipartUpload(
  url: string,
  data: ContentUploadData,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST'
): Promise<ContentItem> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'file' || key === 'thumbnail') {
      if (value instanceof File) {
        formData.append(key, value);
      }
    } else if (key === 'tags' && Array.isArray(value)) {
      value.forEach((tag: string) => formData.append('tags', tag));
    } else {
      formData.append(key, String(value));
    }
  });

  const tokens = getStoredTokens();
  const headers: Record<string, string> = {};
  if (tokens.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail || `Upload failed with status ${response.status}`);
  }

  return response.json();
}

// ── Content CRUD API ───────────────────────────────────────────

export const contentApi = {
  // ── General Content Items ──
  list: (filters: ContentFilters = {}): Promise<PaginatedResponse<ContentItem>> =>
    apiGet<PaginatedResponse<ContentItem>>(`${API_ENDPOINTS.CONTENT_ITEMS}${buildQueryString(filters)}`).then(r => r.data),

  get: (id: string): Promise<ContentItem> =>
    apiGet<ContentItem>(`${API_ENDPOINTS.CONTENT_ITEMS}${id}/`).then(r => r.data),

  create: (data: ContentUploadData): Promise<ContentItem> =>
    multipartUpload(API_ENDPOINTS.CONTENT_ITEMS, data),

  update: (id: string, data: Partial<ContentUploadData>): Promise<ContentItem> =>
    multipartUpload(`${API_ENDPOINTS.CONTENT_ITEMS}${id}/`, data as ContentUploadData, 'PATCH'),

  publish: (id: string, action: string, reason?: string): Promise<ContentItem> =>
    apiPost<ContentItem>(`${API_ENDPOINTS.CONTENT_ITEMS}${id}/publish/`, { action, reason }).then(r => r.data),

  delete: (id: string): Promise<void> =>
    apiDelete(`${API_ENDPOINTS.CONTENT_ITEMS}${id}/`).then(() => undefined),

  versions: (id: string): Promise<ContentVersion[]> =>
    apiGet<ContentVersion[]>(`${API_ENDPOINTS.CONTENT_ITEMS}${id}/versions/`).then(r => r.data),

  auditLog: (id: string): Promise<any[]> =>
    apiGet<any[]>(`${API_ENDPOINTS.CONTENT_ITEMS}${id}/audit_log/`).then(r => r.data),

  // ── Teacher Upload Center ──
  teacher: {
    list: (filters: ContentFilters = {}): Promise<PaginatedResponse<ContentItem>> =>
      apiGet<PaginatedResponse<ContentItem>>(`${API_ENDPOINTS.CONTENT_TEACHER}${buildQueryString(filters)}`).then(r => r.data),

    get: (id: string): Promise<ContentItem> =>
      apiGet<ContentItem>(`${API_ENDPOINTS.CONTENT_TEACHER}${id}/`).then(r => r.data),

    create: (data: ContentUploadData): Promise<ContentItem> =>
      multipartUpload(API_ENDPOINTS.CONTENT_TEACHER, data),

    update: (id: string, data: Partial<ContentUploadData>): Promise<ContentItem> =>
      multipartUpload(`${API_ENDPOINTS.CONTENT_TEACHER}${id}/`, data as ContentUploadData, 'PATCH'),

    stats: (): Promise<ContentStats> =>
      apiGet<ContentStats>(`${API_ENDPOINTS.CONTENT_TEACHER}stats/`).then(r => r.data),
  },

  // ── Institution Content Center ──
  institution: {
    list: (filters: ContentFilters = {}): Promise<PaginatedResponse<ContentItem>> =>
      apiGet<PaginatedResponse<ContentItem>>(`${API_ENDPOINTS.CONTENT_INSTITUTION}${buildQueryString(filters)}`).then(r => r.data),

    get: (id: string): Promise<ContentItem> =>
      apiGet<ContentItem>(`${API_ENDPOINTS.CONTENT_INSTITUTION}${id}/`).then(r => r.data),

    create: (data: ContentUploadData): Promise<ContentItem> =>
      multipartUpload(API_ENDPOINTS.CONTENT_INSTITUTION, data),

    update: (id: string, data: Partial<ContentUploadData>): Promise<ContentItem> =>
      multipartUpload(`${API_ENDPOINTS.CONTENT_INSTITUTION}${id}/`, data as ContentUploadData, 'PATCH'),

    stats: (): Promise<ContentStats> =>
      apiGet<ContentStats>(`${API_ENDPOINTS.CONTENT_INSTITUTION}stats/`).then(r => r.data),

    teacherSubmissions: (filters: ContentFilters = {}): Promise<PaginatedResponse<ContentItem>> =>
      apiGet<PaginatedResponse<ContentItem>>(`${API_ENDPOINTS.CONTENT_INSTITUTION}teacher_submissions/${buildQueryString(filters)}`).then(r => r.data),
  },

  // ── Platform Admin Content Center ──
  admin: {
    list: (filters: ContentFilters = {}): Promise<PaginatedResponse<ContentItem>> =>
      apiGet<PaginatedResponse<ContentItem>>(`${API_ENDPOINTS.CONTENT_ADMIN}${buildQueryString(filters)}`).then(r => r.data),

    get: (id: string): Promise<ContentItem> =>
      apiGet<ContentItem>(`${API_ENDPOINTS.CONTENT_ADMIN}${id}/`).then(r => r.data),

    create: (data: ContentUploadData): Promise<ContentItem> =>
      multipartUpload(API_ENDPOINTS.CONTENT_ADMIN, data),

    update: (id: string, data: Partial<ContentUploadData>): Promise<ContentItem> =>
      multipartUpload(`${API_ENDPOINTS.CONTENT_ADMIN}${id}/`, data as ContentUploadData, 'PATCH'),

    stats: (): Promise<ContentStats> =>
      apiGet<ContentStats>(`${API_ENDPOINTS.CONTENT_ADMIN}stats/`).then(r => r.data),

    moderationQueue: (filters: ContentFilters = {}): Promise<PaginatedResponse<ContentItem>> =>
      apiGet<PaginatedResponse<ContentItem>>(`${API_ENDPOINTS.CONTENT_ADMIN}moderation_queue/${buildQueryString(filters)}`).then(r => r.data),
  },

  // ── Content Delivery (Consumer) ──
  library: (filters: ContentFilters = {}): Promise<PaginatedResponse<ContentItem>> =>
    apiGet<PaginatedResponse<ContentItem>>(`${API_ENDPOINTS.CONTENT_LIBRARY}${buildQueryString(filters)}`).then(r => r.data),

  classroom: (filters: ContentFilters = {}): Promise<PaginatedResponse<ContentItem>> =>
    apiGet<PaginatedResponse<ContentItem>>(`${API_ENDPOINTS.CONTENT_CLASSROOM}${buildQueryString(filters)}`).then(r => r.data),

  // ── Engagement Tracking ──
  engagement: {
    track: (data: {
      content_item_id: string;
      active_time_seconds?: number;
      completion_percentage?: number;
      last_position?: number;
      is_completed?: boolean;
      session_id?: string;
    }): Promise<ContentEngagement> =>
      apiPost<ContentEngagement>(`${API_ENDPOINTS.CONTENT_ENGAGEMENT}track/`, data).then(r => r.data),

    startSession: (content_item_id: string): Promise<{ session_id: string; engagement_id: string }> =>
      apiPost<{ session_id: string; engagement_id: string }>(
        `${API_ENDPOINTS.CONTENT_ENGAGEMENT}start_session/`, { content_item_id }
      ).then(r => r.data),

    endSession: (data: {
      session_id: string;
      active_seconds?: number;
      progress_at_end?: number;
      position_at_end?: number;
    }): Promise<void> =>
      apiPost<any>(`${API_ENDPOINTS.CONTENT_ENGAGEMENT}end_session/`, data).then(() => undefined),

    myProgress: (): Promise<any[]> =>
      apiGet<any[]>(`${API_ENDPOINTS.CONTENT_ENGAGEMENT}my_progress/`).then(r => r.data),
  },

  // ── Content Assignments ──
  assignments: {
    list: (filters: Record<string, any> = {}): Promise<ContentAssignment[]> => {
      const qs = buildQueryString(filters as ContentFilters);
      return apiGet<ContentAssignment[]>(`${API_ENDPOINTS.CONTENT_ASSIGNMENTS}${qs}`).then(r =>
        Array.isArray(r.data) ? r.data : (r.data as any).results || []
      );
    },

    myAssignments: (): Promise<ContentAssignment[]> =>
      apiGet<ContentAssignment[]>(`${API_ENDPOINTS.CONTENT_ASSIGNMENTS}my_assignments/`).then(r => r.data),

    teacherTracking: (): Promise<ContentAssignment[]> =>
      apiGet<ContentAssignment[]>(`${API_ENDPOINTS.CONTENT_ASSIGNMENTS}teacher_tracking/`).then(r => r.data),

    classSummary: (classId: number | string): Promise<any[]> =>
      apiGet<any[]>(`${API_ENDPOINTS.CONTENT_ASSIGNMENTS}class_summary/?target_class=${classId}`).then(r => r.data),

    bulkAssign: (data: {
      content_item_id: string;
      student_ids: number[];
      assignment_type?: 'required' | 'recommended';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      note?: string;
      target_class_id?: number | null;
      subject_id?: number | null;
      topic_id?: number | null;
      lesson_id?: number | null;
      due_date?: string | null;
    }): Promise<ContentAssignment[]> =>
      apiPost<ContentAssignment[]>(`${API_ENDPOINTS.CONTENT_ASSIGNMENTS}bulk_assign/`, data).then(r => r.data),
  },

  // ── Content Recommendations ──
  recommendations: {
    list: (filters: Record<string, any> = {}): Promise<ContentRecommendation[]> => {
      const qs = buildQueryString(filters as ContentFilters);
      return apiGet<ContentRecommendation[]>(`${API_ENDPOINTS.CONTENT_RECOMMENDATIONS}${qs}`).then(r =>
        Array.isArray(r.data) ? r.data : (r.data as any).results || []
      );
    },

    myRecommendations: (): Promise<ContentRecommendation[]> =>
      apiGet<ContentRecommendation[]>(`${API_ENDPOINTS.CONTENT_RECOMMENDATIONS}my_recommendations/`).then(r => r.data),

    dismiss: (id: string): Promise<void> =>
      apiPost<any>(`${API_ENDPOINTS.CONTENT_RECOMMENDATIONS}${id}/dismiss/`, {}).then(() => undefined),

    accept: (id: string): Promise<void> =>
      apiPost<any>(`${API_ENDPOINTS.CONTENT_RECOMMENDATIONS}${id}/accept/`, {}).then(() => undefined),
  },

  // ── Dashboard Summary APIs ──
  dashboard: {
    student: (): Promise<StudentContentDashboard> =>
      apiGet<StudentContentDashboard>(API_ENDPOINTS.CONTENT_DASHBOARD_STUDENT).then(r => r.data),

    teacher: (): Promise<TeacherContentDashboard> =>
      apiGet<TeacherContentDashboard>(API_ENDPOINTS.CONTENT_DASHBOARD_TEACHER).then(r => r.data),

    parent: (childId?: number): Promise<ParentContentDashboard> => {
      const qs = childId ? `?child_id=${childId}` : '';
      return apiGet<ParentContentDashboard>(`${API_ENDPOINTS.CONTENT_DASHBOARD_PARENT}${qs}`).then(r => r.data);
    },
  },

  // ── Tags ──
  tags: {
    list: (search?: string): Promise<PaginatedResponse<{ id: number; name: string; slug: string }>> =>
      apiGet<PaginatedResponse<{ id: number; name: string; slug: string }>>(`${API_ENDPOINTS.CONTENT_TAGS}${search ? `?search=${search}` : ''}`).then(r => r.data),
  },
};

export default contentApi;
