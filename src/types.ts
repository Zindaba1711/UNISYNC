export type UserRole = 'student' | 'admin' | 'developer';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  programme: string;
  role: UserRole;
  is_suspended: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type ResourceType = 'lecture_note' | 'past_paper';
export type ResourceStatus = 'pending' | 'approved' | 'rejected';

export interface AcademicResource {
  id: string;
  title: string;
  description: string;
  resource_type: ResourceType;
  course_id: string;
  course_code?: string;
  course_name?: string;
  file_path: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  uploaded_by: string;
  uploader_name?: string;
  examination_year?: number;
  status: ResourceStatus;
  rejection_reason?: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export type AnnouncementStatus = 'draft' | 'published' | 'archived';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: string;
  image_path?: string;
  author_id?: string;
  author_name?: string;
  status: AnnouncementStatus;
  published_at?: string;
  created_at: string;
  updated_at?: string;
}

export type NotificationStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled';
export type NotificationCategory = 'announcement' | 'resource' | 'academic' | 'system' | 'moderation';

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  target_programme?: string | null;
  destination_route?: string;
  created_by?: string;
  created_at: string;
  scheduled_at?: string;
  sent_at?: string;
  status: NotificationStatus;
  recipient_count?: number;
}

export interface NotificationRecipient {
  id: string;
  notification_id: string;
  user_id: string;
  is_read: boolean;
  read_at?: string;
  delivery_status: string;
  created_at: string;
  title?: string;
  message?: string;
  category?: NotificationCategory;
}

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface ResourceReport {
  id: string;
  resource_id: string;
  resource_title?: string;
  reporter_id: string;
  reporter_name?: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  reviewed_by?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id?: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: Record<string, any>;
  created_at: string;
}

export interface PlatformSettings {
  platform_name: string;
  tagline: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  moderation_enabled: boolean;
  max_file_size_mb: number;
  allowed_file_types: string[];
}
