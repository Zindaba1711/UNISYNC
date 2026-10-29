import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Profile,
  Course,
  AcademicResource,
  Announcement,
  CampusNotification,
  NotificationRecipient,
  ResourceReport,
  ActivityLog,
  PlatformSettings,
  UserRole,
} from '../types';

// Default initial state
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-dev-1',
    full_name: 'David Chen',
    email: 'david.chen@unisync.edu',
    programme: 'Computer Science & Software Eng.',
    role: 'developer',
    is_suspended: false,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'user-admin-1',
    full_name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@unisync.edu',
    programme: 'Electrical & Electronic Engineering',
    role: 'admin',
    is_suspended: false,
    created_at: '2026-09-10T09:30:00Z',
  },
  {
    id: 'user-stu-1',
    full_name: 'Alex Morgan',
    email: 'alex.morgan@university.edu',
    programme: 'Computer Science & Software Eng.',
    role: 'student',
    is_suspended: false,
    created_at: '2026-09-15T14:20:00Z',
  },
  {
    id: 'user-stu-2',
    full_name: 'Elena Rostova',
    email: 'elena.rostova@university.edu',
    programme: 'Mechanical & Mechatronic Eng.',
    role: 'student',
    is_suspended: false,
    created_at: '2026-09-18T11:15:00Z',
  },
  {
    id: 'user-stu-3',
    full_name: 'Marcus Brody',
    email: 'marcus.brody@university.edu',
    programme: 'Business Administration & Finance',
    role: 'student',
    is_suspended: false,
    created_at: '2026-09-22T16:45:00Z',
  },
];

const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    course_code: 'CS101',
    course_name: 'Introduction to Computer Science & Algorithms',
    department: 'School of Computing',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'course-2',
    course_code: 'CS204',
    course_name: 'Data Structures and Algorithms',
    department: 'School of Computing',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'course-3',
    course_code: 'SE302',
    course_name: 'Software Engineering Principles & Architecture',
    department: 'School of Computing',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'course-4',
    course_code: 'ENG101',
    course_name: 'Engineering Mathematics I',
    department: 'School of Engineering',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'course-5',
    course_code: 'BUS201',
    course_name: 'Principles of Management & Entrepreneurship',
    department: 'School of Business',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
];

const INITIAL_RESOURCES: AcademicResource[] = [
  {
    id: 'res-1',
    title: 'CS204 Lecture 04 — Binary Search Trees & Red-Black Balancing',
    description: 'Comprehensive lecture slides and breakdown of self-balancing tree rotations with asymptotic analysis.',
    resource_type: 'lecture_note',
    course_id: 'course-2',
    course_code: 'CS204',
    course_name: 'Data Structures and Algorithms',
    file_path: 'academic-resources/cs204_trees.pdf',
    file_name: 'CS204_Trees_Balanced.pdf',
    file_size: 2450000,
    file_type: 'pdf',
    uploaded_by: 'user-stu-1',
    uploader_name: 'Alex Morgan',
    status: 'approved',
    download_count: 142,
    created_at: '2026-10-10T14:00:00Z',
    updated_at: '2026-10-10T15:00:00Z',
  },
  {
    id: 'res-2',
    title: 'CS204 Past Examination Paper 2025 (Semester 1 Main Exam)',
    description: 'Official department past examination paper covering algorithm complexity, graph traversal, and dynamic programming.',
    resource_type: 'past_paper',
    course_id: 'course-2',
    course_code: 'CS204',
    course_name: 'Data Structures and Algorithms',
    file_path: 'academic-resources/cs204_exam_2025.pdf',
    file_name: 'CS204_Exam_2025_Sem1.pdf',
    file_size: 1850000,
    file_type: 'pdf',
    uploaded_by: 'user-admin-1',
    uploader_name: 'Dr. Sarah Jenkins',
    examination_year: 2025,
    status: 'approved',
    download_count: 320,
    created_at: '2026-10-12T10:00:00Z',
    updated_at: '2026-10-12T10:00:00Z',
  },
  {
    id: 'res-3',
    title: 'SE302 Clean Architecture & Design Patterns Field Guide',
    description: 'Architectural overview comparing hexagonal, onion, and layered patterns with practical microservice examples.',
    resource_type: 'lecture_note',
    course_id: 'course-3',
    course_code: 'SE302',
    course_name: 'Software Engineering Principles & Architecture',
    file_path: 'academic-resources/se302_patterns.docx',
    file_name: 'SE302_DesignPatterns.docx',
    file_size: 4200000,
    file_type: 'docx',
    uploaded_by: 'user-stu-2',
    uploader_name: 'Elena Rostova',
    status: 'approved',
    download_count: 89,
    created_at: '2026-10-18T16:30:00Z',
    updated_at: '2026-10-19T09:00:00Z',
  },
  {
    id: 'res-4',
    title: 'ENG101 Calculus & Differential Equations Past Paper 2024',
    description: 'End-of-year comprehensive exam paper including multivariable calculus, Taylor series, and Laplace transforms.',
    resource_type: 'past_paper',
    course_id: 'course-4',
    course_code: 'ENG101',
    course_name: 'Engineering Mathematics I',
    file_path: 'academic-resources/eng101_2024.pdf',
    file_name: 'ENG101_Exam_2024.pdf',
    file_size: 3100000,
    file_type: 'pdf',
    uploaded_by: 'user-stu-3',
    uploader_name: 'Marcus Brody',
    examination_year: 2024,
    status: 'pending', // Pending moderation review
    download_count: 0,
    created_at: '2026-10-27T11:00:00Z',
    updated_at: '2026-10-27T11:00:00Z',
  },
  {
    id: 'res-5',
    title: 'CS101 Intro to Big-O Notation and Computational Bounds',
    description: 'Student submitted lecture summary notes on time and space complexity with Python code snippets.',
    resource_type: 'lecture_note',
    course_id: 'course-1',
    course_code: 'CS101',
    course_name: 'Introduction to Computer Science & Algorithms',
    file_path: 'academic-resources/cs101_big_o.pdf',
    file_name: 'CS101_BigO_Notes.pdf',
    file_size: 1200000,
    file_type: 'pdf',
    uploaded_by: 'user-stu-1',
    uploader_name: 'Alex Morgan',
    status: 'pending', // Pending moderation review
    download_count: 0,
    created_at: '2026-10-28T09:15:00Z',
    updated_at: '2026-10-28T09:15:00Z',
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Semester 1 Final Examination Timetable & Venue Allocations Released',
    message: 'The official University Examination Board has published the timetable for Semester 1 examinations. Please verify your course codes and reporting hall locations. Students requiring disability accommodations must notify academic registry by Friday.',
    category: 'Examinations',
    author_id: 'user-admin-1',
    author_name: 'Dr. Sarah Jenkins',
    status: 'published',
    published_at: '2026-10-25T08:00:00Z',
    created_at: '2026-10-25T07:30:00Z',
  },
  {
    id: 'ann-2',
    title: 'UniSync Academic Resource Sharing Drive — Moderation Guidelines',
    message: 'We encourage all students to upload high-quality revision notes and past papers. Remember that all documents undergo administrative peer review before public listing. Please verify that uploads do not contain proprietary quiz solutions without permission.',
    category: 'Academic',
    author_id: 'user-dev-1',
    author_name: 'David Chen',
    status: 'published',
    published_at: '2026-10-20T10:00:00Z',
    created_at: '2026-10-20T09:00:00Z',
  },
  {
    id: 'ann-3',
    title: 'Scheduled Campus Network Maintenance & Library Access Notice',
    message: 'Campus IT will carry out server maintenance this coming Saturday from 02:00 to 06:00 UTC. The UniSync offline document caching will remain active on your Android mobile device.',
    category: 'System',
    author_id: 'user-dev-1',
    author_name: 'David Chen',
    status: 'published',
    published_at: '2026-10-15T12:00:00Z',
    created_at: '2026-10-15T11:00:00Z',
  },
];

const INITIAL_NOTIFICATIONS: CampusNotification[] = [
  {
    id: 'notif-1',
    title: 'Exam Timetable Published',
    message: 'The examination timetable for Semester 1 has been officially posted under UniSync Updates.',
    category: 'announcement',
    target_programme: null,
    created_by: 'user-admin-1',
    created_at: '2026-10-25T08:05:00Z',
    sent_at: '2026-10-25T08:05:00Z',
    status: 'sent',
    recipient_count: 5,
  },
  {
    id: 'notif-2',
    title: 'Resource Approved: CS204 Lecture 04',
    message: 'Your uploaded lecture note "CS204 Lecture 04 — Binary Search Trees" has been approved by the moderator.',
    category: 'moderation',
    target_programme: 'Computer Science & Software Eng.',
    created_by: 'user-admin-1',
    created_at: '2026-10-10T15:02:00Z',
    sent_at: '2026-10-10T15:02:00Z',
    status: 'sent',
    recipient_count: 2,
  },
];

const INITIAL_RECIPIENTS: NotificationRecipient[] = [
  {
    id: 'recip-1',
    notification_id: 'notif-1',
    user_id: 'user-stu-1',
    is_read: false,
    delivery_status: 'delivered',
    created_at: '2026-10-25T08:05:00Z',
    title: 'Exam Timetable Published',
    message: 'The examination timetable for Semester 1 has been officially posted under UniSync Updates.',
    category: 'announcement',
  },
  {
    id: 'recip-2',
    notification_id: 'notif-2',
    user_id: 'user-stu-1',
    is_read: true,
    read_at: '2026-10-10T16:00:00Z',
    delivery_status: 'delivered',
    created_at: '2026-10-10T15:02:00Z',
    title: 'Resource Approved: CS204 Lecture 04',
    message: 'Your uploaded lecture note "CS204 Lecture 04 — Binary Search Trees" has been approved by the moderator.',
    category: 'moderation',
  },
];

const INITIAL_REPORTS: ResourceReport[] = [
  {
    id: 'rep-1',
    resource_id: 'res-3',
    resource_title: 'SE302 Clean Architecture & Design Patterns Field Guide',
    reporter_id: 'user-stu-1',
    reporter_name: 'Alex Morgan',
    reason: 'Incorrect Content',
    description: 'Diagram in chapter 3 reverses the dependency inversion direction arrows.',
    status: 'pending',
    created_at: '2026-10-26T14:10:00Z',
  },
];

const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    actor_id: 'user-admin-1',
    actor_name: 'Dr. Sarah Jenkins',
    action: 'RESOURCE_APPROVED',
    entity_type: 'resource',
    entity_id: 'res-1',
    details: { title: 'CS204 Lecture 04 — Binary Search Trees' },
    created_at: '2026-10-10T15:00:00Z',
  },
  {
    id: 'log-2',
    actor_id: 'user-admin-1',
    actor_name: 'Dr. Sarah Jenkins',
    action: 'ANNOUNCEMENT_PUBLISHED',
    entity_type: 'announcement',
    entity_id: 'ann-1',
    details: { title: 'Semester 1 Final Examination Timetable' },
    created_at: '2026-10-25T08:00:00Z',
  },
  {
    id: 'log-3',
    actor_id: 'user-dev-1',
    actor_name: 'David Chen',
    action: 'NOTIFICATION_DISPATCHED',
    entity_type: 'notification',
    entity_id: 'notif-1',
    details: { title: 'Exam Timetable Published', recipients: 5 },
    created_at: '2026-10-25T08:05:00Z',
  },
];

const INITIAL_SETTINGS: PlatformSettings = {
  platform_name: 'UniSync',
  tagline: 'Your University, Connected.',
  maintenance_mode: false,
  maintenance_message: 'UniSync is undergoing scheduled maintenance. Services will resume shortly.',
  moderation_enabled: true,
  max_file_size_mb: 25,
  allowed_file_types: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
};

class StoreService {
  private profiles: Profile[] = [];
  private courses: Course[] = [];
  private resources: AcademicResource[] = [];
  private announcements: Announcement[] = [];
  private notifications: CampusNotification[] = [];
  private recipients: NotificationRecipient[] = [];
  private reports: ResourceReport[] = [];
  private activityLogs: ActivityLog[] = [];
  private settings: PlatformSettings = INITIAL_SETTINGS;

  private supabase: SupabaseClient | null = null;
  private isSupabaseConnected = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
    this.checkSupabaseConnection();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem('unisync_state_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.profiles = parsed.profiles || INITIAL_PROFILES;
        this.courses = parsed.courses || INITIAL_COURSES;
        this.resources = parsed.resources || INITIAL_RESOURCES;
        this.announcements = parsed.announcements || INITIAL_ANNOUNCEMENTS;
        this.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
        this.recipients = parsed.recipients || INITIAL_RECIPIENTS;
        this.reports = parsed.reports || INITIAL_REPORTS;
        this.activityLogs = parsed.activityLogs || INITIAL_ACTIVITY_LOGS;
        this.settings = parsed.settings || INITIAL_SETTINGS;
        return;
      }
    } catch (e) {
      console.warn('Could not load localStorage, using initial seed data', e);
    }

    this.profiles = [...INITIAL_PROFILES];
    this.courses = [...INITIAL_COURSES];
    this.resources = [...INITIAL_RESOURCES];
    this.announcements = [...INITIAL_ANNOUNCEMENTS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.recipients = [...INITIAL_RECIPIENTS];
    this.reports = [...INITIAL_REPORTS];
    this.activityLogs = [...INITIAL_ACTIVITY_LOGS];
    this.settings = { ...INITIAL_SETTINGS };
    this.saveState();
  }

  private saveState() {
    try {
      localStorage.setItem(
        'unisync_state_v1',
        JSON.stringify({
          profiles: this.profiles,
          courses: this.courses,
          resources: this.resources,
          announcements: this.announcements,
          notifications: this.notifications,
          recipients: this.recipients,
          reports: this.reports,
          activityLogs: this.activityLogs,
          settings: this.settings,
        })
      );
    } catch (e) {
      console.warn('Failed to persist to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private checkSupabaseConnection() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (url && key && url !== 'https://your-project-id.supabase.co' && !url.includes('your-project-id')) {
      try {
        this.supabase = createClient(url, key);
        this.isSupabaseConnected = true;
      } catch (e) {
        console.warn('Supabase initialization fallback:', e);
      }
    }
  }

  public getIsSupabaseConnected(): boolean {
    return this.isSupabaseConnected;
  }

  // --- STATS ---
  public getOverviewStats() {
    const totalUsers = this.profiles.length;
    const totalApprovedResources = this.resources.filter((r) => r.status === 'approved').length;
    const totalPendingUploads = this.resources.filter((r) => r.status === 'pending').length;
    const totalCourses = this.courses.length;
    const totalAnnouncements = this.announcements.filter((a) => a.status === 'published').length;
    const totalNotifications = this.notifications.length;
    const pendingReports = this.reports.filter((r) => r.status === 'pending').length;

    return {
      totalUsers,
      totalApprovedResources,
      totalPendingUploads,
      totalCourses,
      totalAnnouncements,
      totalNotifications,
      pendingReports,
    };
  }

  // --- PROFILES & USERS ---
  public getProfiles(): Profile[] {
    return [...this.profiles];
  }

  public getProfileById(id: string): Profile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public toggleUserSuspension(userId: string, actor: Profile) {
    const p = this.profiles.find((u) => u.id === userId);
    if (!p) return;
    p.is_suspended = !p.is_suspended;
    this.logActivity(
      actor,
      p.is_suspended ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      'profile',
      p.id,
      { user_name: p.full_name, email: p.email }
    );
    this.saveState();
  }

  public updateUserRole(userId: string, newRole: UserRole, actor: Profile) {
    const p = this.profiles.find((u) => u.id === userId);
    if (!p) return;
    const oldRole = p.role;
    p.role = newRole;
    this.logActivity(actor, 'ROLE_UPDATED', 'profile', p.id, {
      user_name: p.full_name,
      old_role: oldRole,
      new_role: newRole,
    });
    this.saveState();
  }

  public createStudentProfile(data: { full_name: string; email: string; programme: string }): Profile {
    // Note: STRICT COMPLIANCE: NO student_id column is collected or stored!
    const newProfile: Profile = {
      id: 'user-stu-' + Date.now(),
      full_name: data.full_name,
      email: data.email,
      programme: data.programme,
      role: 'student',
      is_suspended: false,
      created_at: new Date().toISOString(),
    };
    this.profiles.unshift(newProfile);
    this.saveState();
    return newProfile;
  }

  public updateProfileDetails(userId: string, data: { full_name: string; programme: string }) {
    const p = this.profiles.find((u) => u.id === userId);
    if (!p) return;
    p.full_name = data.full_name;
    p.programme = data.programme;
    p.updated_at = new Date().toISOString();
    this.saveState();
  }

  // --- COURSES ---
  public getCourses(): Course[] {
    return [...this.courses];
  }

  public addCourse(data: { course_code: string; course_name: string; department: string }, actor: Profile) {
    const newCourse: Course = {
      id: 'course-' + Date.now(),
      course_code: data.course_code.toUpperCase().trim(),
      course_name: data.course_name.trim(),
      department: data.department.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
    };
    this.courses.unshift(newCourse);
    this.logActivity(actor, 'COURSE_CREATED', 'course', newCourse.id, {
      course_code: newCourse.course_code,
      course_name: newCourse.course_name,
    });
    this.saveState();
    return newCourse;
  }

  public updateCourse(id: string, data: Partial<Course>, actor: Profile) {
    const c = this.courses.find((x) => x.id === id);
    if (!c) return;
    Object.assign(c, data, { updated_at: new Date().toISOString() });
    this.logActivity(actor, 'COURSE_UPDATED', 'course', c.id, { course_code: c.course_code });
    this.saveState();
  }

  public toggleCourseActive(id: string, actor: Profile) {
    const c = this.courses.find((x) => x.id === id);
    if (!c) return;
    c.is_active = !c.is_active;
    this.logActivity(actor, c.is_active ? 'COURSE_ACTIVATED' : 'COURSE_ARCHIVED', 'course', c.id, {
      course_code: c.course_code,
    });
    this.saveState();
  }

  // --- RESOURCES & MODERATION ---
  public getResources(): AcademicResource[] {
    return [...this.resources];
  }

  public getApprovedResources(type?: 'lecture_note' | 'past_paper', courseId?: string, query?: string): AcademicResource[] {
    return this.resources.filter((r) => {
      if (r.status !== 'approved') return false;
      if (type && r.resource_type !== type) return false;
      if (courseId && r.course_id !== courseId) return false;
      if (query && query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesCourse = (r.course_code || '').toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCourse && !matchesDesc) return false;
      }
      return true;
    });
  }

  public getPendingResources(): AcademicResource[] {
    return this.resources.filter((r) => r.status === 'pending');
  }

  public uploadResource(data: {
    title: string;
    description: string;
    resource_type: 'lecture_note' | 'past_paper';
    course_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    uploaded_by: string;
    uploader_name: string;
    examination_year?: number;
  }): AcademicResource {
    const course = this.courses.find((c) => c.id === data.course_id);
    const newRes: AcademicResource = {
      id: 'res-' + Date.now(),
      title: data.title,
      description: data.description,
      resource_type: data.resource_type,
      course_id: data.course_id,
      course_code: course?.course_code || 'COURSE',
      course_name: course?.course_name || 'Course',
      file_path: `academic-resources/${Date.now()}_${data.file_name}`,
      file_name: data.file_name,
      file_size: data.file_size,
      file_type: data.file_type,
      uploaded_by: data.uploaded_by,
      uploader_name: data.uploader_name,
      examination_year: data.examination_year,
      status: this.settings.moderation_enabled ? 'pending' : 'approved',
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.resources.unshift(newRes);
    this.saveState();
    return newRes;
  }

  public approveResource(resourceId: string, actor: Profile) {
    const res = this.resources.find((r) => r.id === resourceId);
    if (!res) return;
    res.status = 'approved';
    res.updated_at = new Date().toISOString();

    // Auto-create in-app notification for the uploader
    this.createDirectNotification(
      res.uploaded_by,
      'Resource Approved!',
      `Your uploaded ${res.resource_type === 'lecture_note' ? 'lecture note' : 'past examination paper'} "${res.title}" has been approved and is now live for students.`,
      'moderation'
    );

    this.logActivity(actor, 'RESOURCE_APPROVED', 'resource', res.id, {
      title: res.title,
      uploader: res.uploader_name,
    });
    this.saveState();
  }

  public rejectResource(resourceId: string, reason: string, actor: Profile) {
    const res = this.resources.find((r) => r.id === resourceId);
    if (!res) return;
    res.status = 'rejected';
    res.rejection_reason = reason;
    res.updated_at = new Date().toISOString();

    this.createDirectNotification(
      res.uploaded_by,
      'Resource Upload Rejected',
      `Your upload "${res.title}" was not approved. Reason: ${reason}`,
      'moderation'
    );

    this.logActivity(actor, 'RESOURCE_REJECTED', 'resource', res.id, {
      title: res.title,
      reason,
    });
    this.saveState();
  }

  public deleteResource(resourceId: string, actor: Profile) {
    const index = this.resources.findIndex((r) => r.id === resourceId);
    if (index === -1) return;
    const [deleted] = this.resources.splice(index, 1);
    this.logActivity(actor, 'RESOURCE_DELETED', 'resource', resourceId, {
      title: deleted.title,
    });
    this.saveState();
  }

  public incrementDownload(resourceId: string) {
    const res = this.resources.find((r) => r.id === resourceId);
    if (res) {
      res.download_count = (res.download_count || 0) + 1;
      this.saveState();
    }
  }

  // --- ANNOUNCEMENTS ---
  public getAnnouncements(): Announcement[] {
    return [...this.announcements];
  }

  public getPublishedAnnouncements(): Announcement[] {
    return this.announcements.filter((a) => a.status === 'published');
  }

  public createAnnouncement(
    data: {
      title: string;
      message: string;
      category: string;
      image_path?: string;
      status: 'published' | 'draft';
      trigger_notification?: boolean;
    },
    actor: Profile
  ): Announcement {
    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      title: data.title,
      message: data.message,
      category: data.category,
      image_path: data.image_path,
      author_id: actor.id,
      author_name: actor.full_name,
      status: data.status,
      published_at: data.status === 'published' ? new Date().toISOString() : undefined,
      created_at: new Date().toISOString(),
    };

    this.announcements.unshift(newAnn);
    this.logActivity(actor, 'ANNOUNCEMENT_CREATED', 'announcement', newAnn.id, {
      title: newAnn.title,
      status: newAnn.status,
    });

    if (data.trigger_notification && data.status === 'published') {
      this.dispatchNotification(
        {
          title: `Announcement: ${newAnn.title}`,
          message: newAnn.message.length > 120 ? `${newAnn.message.substring(0, 117)}...` : newAnn.message,
          category: 'announcement',
          target_programme: null,
        },
        actor
      );
    }

    this.saveState();
    return newAnn;
  }

  public updateAnnouncement(id: string, data: Partial<Announcement>, actor: Profile) {
    const ann = this.announcements.find((a) => a.id === id);
    if (!ann) return;
    Object.assign(ann, data, { updated_at: new Date().toISOString() });
    this.logActivity(actor, 'ANNOUNCEMENT_UPDATED', 'announcement', ann.id, { title: ann.title });
    this.saveState();
  }

  public deleteAnnouncement(id: string, actor: Profile) {
    const index = this.announcements.findIndex((a) => a.id === id);
    if (index === -1) return;
    const [deleted] = this.announcements.splice(index, 1);
    this.logActivity(actor, 'ANNOUNCEMENT_DELETED', 'announcement', id, { title: deleted.title });
    this.saveState();
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): CampusNotification[] {
    return [...this.notifications];
  }

  public getUserNotifications(userId: string): NotificationRecipient[] {
    return this.recipients.filter((r) => r.user_id === userId);
  }

  public dispatchNotification(
    data: {
      title: string;
      message: string;
      category: 'announcement' | 'resource' | 'academic' | 'system' | 'moderation';
      target_programme?: string | null;
      scheduled_at?: string;
    },
    actor: Profile
  ): CampusNotification {
    const targets = this.profiles.filter((p) => {
      if (p.is_suspended) return false;
      if (!data.target_programme || data.target_programme === 'ALL') return true;
      return p.programme === data.target_programme;
    });

    const newNotif: CampusNotification = {
      id: 'notif-' + Date.now(),
      title: data.title,
      message: data.message,
      category: data.category,
      target_programme: data.target_programme || null,
      created_by: actor.id,
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      status: 'sent',
      recipient_count: targets.length,
    };

    this.notifications.unshift(newNotif);

    // Create recipients for each targeted student
    targets.forEach((user) => {
      this.recipients.unshift({
        id: 'recip-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        notification_id: newNotif.id,
        user_id: user.id,
        is_read: false,
        delivery_status: 'delivered',
        created_at: new Date().toISOString(),
        title: newNotif.title,
        message: newNotif.message,
        category: newNotif.category,
      });
    });

    this.logActivity(actor, 'NOTIFICATION_DISPATCHED', 'notification', newNotif.id, {
      title: newNotif.title,
      recipients: targets.length,
      target_programme: data.target_programme || 'All Students',
    });

    this.saveState();
    return newNotif;
  }

  public createDirectNotification(
    userId: string,
    title: string,
    message: string,
    category: 'moderation' | 'academic' | 'system' = 'system'
  ) {
    const notifId = 'notif-dir-' + Date.now();
    this.recipients.unshift({
      id: 'recip-dir-' + Date.now(),
      notification_id: notifId,
      user_id: userId,
      is_read: false,
      delivery_status: 'delivered',
      created_at: new Date().toISOString(),
      title,
      message,
      category,
    });
    this.saveState();
  }

  public markNotificationAsRead(recipientId: string) {
    const r = this.recipients.find((x) => x.id === recipientId);
    if (r) {
      r.is_read = true;
      r.read_at = new Date().toISOString();
      this.saveState();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.recipients.forEach((r) => {
      if (r.user_id === userId) {
        r.is_read = true;
        r.read_at = new Date().toISOString();
      }
    });
    this.saveState();
  }

  // --- REPORTS ---
  public getReports(): ResourceReport[] {
    return [...this.reports];
  }

  public submitReport(data: {
    resource_id: string;
    reporter_id: string;
    reporter_name: string;
    reason: string;
    description?: string;
  }) {
    const res = this.resources.find((r) => r.id === data.resource_id);
    const rep: ResourceReport = {
      id: 'rep-' + Date.now(),
      resource_id: data.resource_id,
      resource_title: res?.title || 'Academic Resource',
      reporter_id: data.reporter_id,
      reporter_name: data.reporter_name,
      reason: data.reason,
      description: data.description,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.reports.unshift(rep);
    this.saveState();
    return rep;
  }

  public resolveReport(reportId: string, status: 'resolved' | 'dismissed', notes: string, actor: Profile) {
    const rep = this.reports.find((r) => r.id === reportId);
    if (!rep) return;
    rep.status = status;
    rep.reviewed_by = actor.id;
    rep.resolution_notes = notes;
    this.logActivity(actor, `REPORT_${status.toUpperCase()}`, 'report', rep.id, {
      resource: rep.resource_title,
      notes,
    });
    this.saveState();
  }

  // --- SETTINGS ---
  public getSettings(): PlatformSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<PlatformSettings>, actor: Profile) {
    Object.assign(this.settings, newSettings);
    this.logActivity(actor, 'SETTINGS_UPDATED', 'platform_settings', undefined, newSettings);
    this.saveState();
  }

  // --- ACTIVITY LOGS ---
  public getActivityLogs(): ActivityLog[] {
    return [...this.activityLogs];
  }

  private logActivity(
    actor: Profile,
    action: string,
    entity_type: string,
    entity_id?: string,
    details: Record<string, any> = {}
  ) {
    const log: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      actor_id: actor.id,
      actor_name: actor.full_name,
      action,
      entity_type,
      entity_id,
      details,
      created_at: new Date().toISOString(),
    };
    this.activityLogs.unshift(log);
  }

  // --- RESET STATE ---
  public resetToDefaultSeed() {
    localStorage.removeItem('unisync_state_v1');
    this.loadState();
  }
}

export const store = new StoreService();
