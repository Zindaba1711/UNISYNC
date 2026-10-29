import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Megaphone,
  Bell,
  AlertTriangle,
  Sliders,
  History,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { store } from '../services/store';
import {
  Profile,
  Course,
  AcademicResource,
  Announcement,
  CampusNotification,
  ResourceReport,
  ActivityLog,
  PlatformSettings,
  UserRole,
} from '../types';

interface AdminDashboardProps {
  currentAdmin: Profile;
  onLogout: () => void;
}

type TabType =
  | 'overview'
  | 'users'
  | 'courses'
  | 'resources'
  | 'reviews'
  | 'announcements'
  | 'notifications'
  | 'reports'
  | 'settings'
  | 'logs';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentAdmin, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [, setTick] = useState(0);

  // Subscribe to store updates
  useEffect(() => {
    return store.subscribe(() => {
      setTick((t) => t + 1);
      setFormSettings(store.getSettings());
    });
  }, []);

  const stats = store.getOverviewStats();
  const profiles = store.getProfiles();
  const courses = store.getCourses();
  const resources = store.getResources();
  const announcements = store.getAnnouncements();
  const notifications = store.getNotifications();
  const reports = store.getReports();
  const logs = store.getActivityLogs();
  const settings = store.getSettings();

  // Local state for modals and forms
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // New Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('School of Computing');

  // Rejection Modal State
  const [rejectingResId, setRejectingResId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Incomplete syllabus coverage or unverified exam year.');

  // New Announcement Modal State
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState('Academic');
  const [annMessage, setAnnMessage] = useState('');
  const [annTriggerNotif, setAnnTriggerNotif] = useState(true);

  // New Notification Modal State
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifCategory, setNotifCategory] = useState<'announcement' | 'resource' | 'academic' | 'system' | 'moderation'>('academic');
  const [notifTargetProg, setNotifTargetProg] = useState('ALL');
  const [confirmBroadcastModal, setConfirmBroadcastModal] = useState(false);

  // Settings State
  const [formSettings, setFormSettings] = useState<PlatformSettings>(() => store.getSettings());

  // Handle Course Creation
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;
    store.addCourse(
      {
        course_code: newCourseCode,
        course_name: newCourseName,
        department: newCourseDept,
      },
      currentAdmin
    );
    setNewCourseCode('');
    setNewCourseName('');
    setShowCourseModal(false);
  };

  // Handle Announcement Creation
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return;
    store.createAnnouncement(
      {
        title: annTitle,
        message: annMessage,
        category: annCategory,
        status: 'published',
        trigger_notification: annTriggerNotif,
      },
      currentAdmin
    );
    setAnnTitle('');
    setAnnMessage('');
    setShowAnnModal(false);
  };

  // Handle Notification Dispatch
  const handleDispatchNotification = () => {
    if (!notifTitle || !notifMessage) return;
    store.dispatchNotification(
      {
        title: notifTitle,
        message: notifMessage,
        category: notifCategory,
        target_programme: notifTargetProg === 'ALL' ? null : notifTargetProg,
      },
      currentAdmin
    );
    setNotifTitle('');
    setNotifMessage('');
    setShowNotifModal(false);
    setConfirmBroadcastModal(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              US
            </div>
            <div>
              <div className="font-bold text-white text-base leading-tight tracking-tight">UniSync</div>
              <div className="text-[11px] text-blue-400 font-medium">Administration Backend</div>
            </div>
          </div>
        </div>

        {/* Current Admin Badge */}
        <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-500/30">
            {currentAdmin.full_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{currentAdmin.full_name}</div>
            <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              {currentAdmin.role}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto text-xs font-medium">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('users')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>User Accounts</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {profiles.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('courses')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'courses'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4" />
              <span>Course Catalog</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {courses.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('resources')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'resources'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4" />
              <span>Academic Resources</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {resources.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('reviews')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'reviews'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4" />
              <span>Upload Reviews</span>
            </div>
            {stats.totalPendingUploads > 0 && (
              <span className="text-[10px] bg-amber-500 text-slate-900 font-bold px-1.5 py-0.5 rounded-full">
                {stats.totalPendingUploads}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('announcements')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'announcements'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Megaphone className="w-4 h-4" />
              <span>Announcements</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {announcements.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('notifications')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'notifications'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4" />
              <span>Notification Dispatch</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('reports')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'reports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Reported Content</span>
            </div>
            {stats.pendingReports > 0 && (
              <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                {stats.pendingReports}
              </span>
            )}
          </button>

          <div className="pt-3 pb-1 border-t border-slate-800/80">
            <span className="px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              System Administration
            </span>
          </div>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'settings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4" />
              <span>Platform Settings</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('logs')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'logs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4" />
              <span>Activity Logs</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {logs.length}
            </span>
          </button>
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => store.resetToDefaultSeed()}
            title="Reset to default seed state"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 rounded"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
          >
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-800 capitalize">
              {currentTab === 'reviews'
                ? 'Resource Upload Reviews'
                : currentTab === 'courses'
                ? 'Course Management'
                : currentTab === 'notifications'
                ? 'Campus Notification System'
                : currentTab}
            </h1>
            <span className="text-xs text-slate-400 font-normal">| Connected to Supabase Engine</span>
          </div>

          <div className="flex items-center gap-3">
            {currentTab === 'courses' && (
              <button
                onClick={() => setShowCourseModal(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course</span>
              </button>
            )}
            {currentTab === 'announcements' && (
              <button
                onClick={() => setShowAnnModal(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Announcement</span>
              </button>
            )}
            {currentTab === 'notifications' && (
              <button
                onClick={() => setShowNotifModal(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Compose Notification</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-medium text-slate-500">Registered Users</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">{stats.totalUsers}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">Students & Staff</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-medium text-slate-500">Approved Resources</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{stats.totalApprovedResources}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Live in Student Search</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
                  <div className="text-xs font-medium text-amber-700">Pending Uploads</div>
                  <div className="text-2xl font-bold text-amber-600 mt-1">{stats.totalPendingUploads}</div>
                  <div className="text-[11px] text-amber-700 font-medium mt-1">Awaiting Review</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-medium text-slate-500">Active Courses</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">{stats.totalCourses}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Department Catalogs</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-medium text-slate-500">Announcements</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">{stats.totalAnnouncements}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Published Updates</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-medium text-slate-500">Notifications Sent</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">{stats.totalNotifications}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Campus Broadcasts</div>
                </div>
              </div>

              {/* Two Column Layout: Pending Moderation & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Upload Reviews Preview */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-amber-500" />
                      <span>Pending Upload Reviews ({store.getPendingResources().length})</span>
                    </h2>
                    <button
                      onClick={() => setCurrentTab('reviews')}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Open Queue
                    </button>
                  </div>

                  {store.getPendingResources().length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No documents currently waiting for moderation review.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {store.getPendingResources().slice(0, 3).map((res) => (
                        <div
                          key={res.id}
                          className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="text-xs font-semibold text-slate-800 truncate">{res.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {res.course_code} • {res.resource_type === 'lecture_note' ? 'Lecture Note' : 'Past Paper'} • Uploaded by {res.uploader_name}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => store.approveResource(res.id, currentAdmin)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingResId(res.id);
                              }}
                              className="px-2 py-1 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded text-[11px] font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Administrative Activity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-600" />
                      <span>Recent Activity Logs</span>
                    </h2>
                    <button
                      onClick={() => setCurrentTab('logs')}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {logs.slice(0, 5).map((log) => (
                      <div key={log.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{log.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-slate-600 mt-0.5 text-[11px]">
                          By <span className="font-medium text-slate-700">{log.actor_name}</span> • Entity: {log.entity_type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {currentTab === 'users' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="student">Students</option>
                    <option value="admin">Administrators</option>
                    <option value="developer">Developers</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Programme of Study</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Registered</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profiles
                      .filter((p) => {
                        if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
                        if (searchTerm.trim()) {
                          const q = searchTerm.toLowerCase();
                          return p.full_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
                        }
                        return true;
                      })
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{p.full_name}</div>
                            <div className="text-[11px] text-slate-500">{p.email}</div>
                          </td>
                          <td className="py-2.5 px-3">{p.programme}</td>
                          <td className="py-2.5 px-3">
                            {currentAdmin.role === 'developer' && p.id !== currentAdmin.id ? (
                              <select
                                value={p.role}
                                onChange={(e) => store.updateUserRole(p.id, e.target.value as UserRole, currentAdmin)}
                                className="text-[11px] font-semibold border border-slate-200 rounded px-1.5 py-0.5 bg-white"
                              >
                                <option value="student">Student</option>
                                <option value="admin">Admin</option>
                                <option value="developer">Developer</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                                  p.role === 'developer'
                                    ? 'bg-purple-100 text-purple-700'
                                    : p.role === 'admin'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {p.role}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.is_suspended ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {p.is_suspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {new Date(p.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {p.id !== currentAdmin.id && (
                              <button
                                onClick={() => store.toggleUserSuspension(p.id, currentAdmin)}
                                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                  p.is_suspended
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                {p.is_suspended ? 'Reactivate' : 'Suspend'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: COURSES */}
          {currentTab === 'courses' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Manage academic courses and department associations for student resource uploads.
                </div>
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Course</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Course Code</th>
                      <th className="py-2.5 px-3">Course Name</th>
                      <th className="py-2.5 px-3">Academic Department</th>
                      <th className="py-2.5 px-3">Catalog Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-blue-600">{c.course_code}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{c.course_name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{c.department}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {c.is_active ? 'Active' : 'Archived'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => store.toggleCourseActive(c.id, currentAdmin)}
                            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                          >
                            {c.is_active ? 'Archive' : 'Restore'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ACADEMIC RESOURCES */}
          {currentTab === 'resources' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search documents by title or uploader..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">All Courses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.course_code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Title & Course</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Uploader</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Downloads</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources
                      .filter((r) => {
                        if (courseFilter !== 'ALL' && r.course_id !== courseFilter) return false;
                        if (searchTerm.trim()) {
                          const q = searchTerm.toLowerCase();
                          return (
                            r.title.toLowerCase().includes(q) ||
                            (r.uploader_name || '').toLowerCase().includes(q) ||
                            (r.course_code || '').toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900 max-w-xs truncate">{res.title}</div>
                            <div className="text-[11px] text-blue-600">{res.course_code}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="capitalize">{res.resource_type === 'lecture_note' ? 'Lecture Note' : `Past Paper (${res.examination_year || 'N/A'})`}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{res.uploader_name}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                res.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : res.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {res.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700">{res.download_count}</td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {new Date(res.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <button
                              onClick={() => store.deleteResource(res.id, currentAdmin)}
                              title="Delete resource"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: UPLOAD REVIEWS (MODERATION QUEUE) */}
          {currentTab === 'reviews' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Resource Moderation Queue</h2>
                    <p className="text-xs text-slate-500">
                      Submissions from students remain private until approved by an administrator or developer.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                    {store.getPendingResources().length} Pending
                  </span>
                </div>

                {store.getPendingResources().length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <h3 className="text-sm font-bold text-slate-800">Queue is Clear</h3>
                    <p className="text-xs text-slate-500 mt-1">All student uploads have been moderated and reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {store.getPendingResources().map((res) => (
                      <div
                        key={res.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[11px]">
                              {res.course_code}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 uppercase">
                              {res.resource_type === 'lecture_note' ? 'Lecture Note' : `Past Paper (${res.examination_year})`}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{res.title}</h4>
                          <p className="text-xs text-slate-600">{res.description}</p>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                            <span>Uploaded by: <b className="text-slate-600">{res.uploader_name}</b></span>
                            <span>File: {res.file_name}</span>
                            <span>Date: {new Date(res.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => store.approveResource(res.id, currentAdmin)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve & Publish</span>
                          </button>
                          <button
                            onClick={() => setRejectingResId(res.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject with Reason</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ANNOUNCEMENTS */}
          {currentTab === 'announcements' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">UniSync Updates & Campus Notices</h2>
                  <p className="text-xs text-slate-500">
                    Publish official notices to all student apps with optional notification broadcasting.
                  </p>
                </div>
                <button
                  onClick={() => setShowAnnModal(true)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Announcement</span>
                </button>
              </div>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                            {ann.category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Published by {ann.author_name} • {new Date(ann.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{ann.message}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => store.deleteAnnouncement(ann.id, currentAdmin)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete announcement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {currentTab === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Campus Notification Dispatcher</h2>
                    <p className="text-xs text-slate-500">
                      Send verified in-app notifications to students across all programmes or targeted faculties.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNotifModal(true)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Compose Notification</span>
                  </button>
                </div>

                {/* Notifications History List */}
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px] uppercase">
                            {n.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                      <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-3">
                        <span>Target: <b className="text-slate-600">{n.target_programme || 'All Registered Students'}</b></span>
                        <span>Delivered to: <b className="text-blue-600">{n.recipient_count || 0} students</b></span>
                        <span className="text-emerald-600 font-medium">✓ In-App Realtime Delivered</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: REPORTS */}
          {currentTab === 'reports' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Student Issue & Resource Reports</h2>
                <p className="text-xs text-slate-500">
                  Review student reports regarding incorrect answers, corrupted PDFs, or academic integrity flags.
                </p>
              </div>

              {reports.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No active reports filed by students.</div>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div key={rep.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                              {rep.reason}
                            </span>
                            <span className="text-xs text-slate-400">
                              Reported by {rep.reporter_name} • {new Date(rep.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 mt-1">Resource: {rep.resource_title}</h4>
                          <p className="text-xs text-slate-600 mt-1 italic">"{rep.description || 'No additional note provided.'}"</p>
                        </div>
                        <div>
                          {rep.status === 'pending' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => store.resolveReport(rep.id, 'resolved', 'Verified and addressed.', currentAdmin)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
                              >
                                Mark Resolved
                              </button>
                              <button
                                onClick={() => store.resolveReport(rep.id, 'dismissed', 'False report.', currentAdmin)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-medium"
                              >
                                Dismiss
                              </button>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px] capitalize">
                              {rep.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SETTINGS */}
          {currentTab === 'settings' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-3xl">
              <div>
                <h2 className="text-base font-bold text-slate-800">UniSync Platform Settings</h2>
                <p className="text-xs text-slate-500">
                  Configure university portal parameters and upload governance policies.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Display Name</label>
                  <input
                    type="text"
                    value={formSettings.platform_name}
                    onChange={(e) => setFormSettings({ ...formSettings, platform_name: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={formSettings.tagline}
                    onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Resource Moderation Requirement</div>
                    <div className="text-[11px] text-slate-500">
                      When enabled, uploaded lecture notes and past papers must be approved before public listing.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formSettings.moderation_enabled}
                    onChange={(e) => setFormSettings({ ...formSettings, moderation_enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Document Size (MB)</label>
                  <input
                    type="number"
                    value={formSettings.max_file_size_mb}
                    onChange={(e) => setFormSettings({ ...formSettings, max_file_size_mb: Number(e.target.value) })}
                    className="w-32 text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maintenance Notice Message</label>
                  <textarea
                    rows={2}
                    value={formSettings.maintenance_message}
                    onChange={(e) => setFormSettings({ ...formSettings, maintenance_message: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      store.updateSettings(formSettings, currentAdmin);
                      alert('Platform settings saved successfully.');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY LOGS */}
          {currentTab === 'logs' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Administrative Audit Trail</h2>
                  <p className="text-xs text-slate-500">
                    Immutable security log of all approvals, suspensions, and broadcast actions.
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-400">{logs.length} Total Events Logged</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Staff Actor</th>
                      <th className="py-2.5 px-3">Action Type</th>
                      <th className="py-2.5 px-3">Target Entity</th>
                      <th className="py-2.5 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{log.actor_name}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 capitalize">{log.entity_type}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: ADD COURSE */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Add Academic Course</h3>
            <p className="text-xs text-slate-500 mb-4">Register a course into the university academic catalog.</p>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS305"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Computing & Distributed Systems"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department</label>
                <select
                  value={newCourseDept}
                  onChange={(e) => setNewCourseDept(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="School of Computing">School of Computing</option>
                  <option value="School of Engineering">School of Engineering</option>
                  <option value="School of Business">School of Business</option>
                  <option value="Faculty of Law">Faculty of Law</option>
                  <option value="School of Medicine">School of Medicine</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REJECT RESOURCE REASON */}
      {rejectingResId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Reject Resource Upload</h3>
            <p className="text-xs text-slate-500 mb-4">
              Provide a clear reason for the student. They will receive this feedback via in-app notification.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRejectingResId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    store.rejectResource(rejectingResId, rejectionReason, currentAdmin);
                    setRejectingResId(null);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ANNOUNCEMENT */}
      {showAnnModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Create UniSync Announcement</h3>
            <p className="text-xs text-slate-500 mb-4">
              Publish university announcements visible to students without requiring app updates.
            </p>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. End of Semester Examinations Schedule"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="Academic">Academic</option>
                  <option value="Examinations">Examinations</option>
                  <option value="System">System & Campus Notice</option>
                  <option value="Events">Campus Events</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Full announcement text..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="annNotif"
                  checked={annTriggerNotif}
                  onChange={(e) => setAnnTriggerNotif(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="annNotif" className="text-xs text-slate-700">
                  Broadcast as in-app notification to students immediately
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPOSE NOTIFICATION */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Compose Campus Notification</h3>
            <p className="text-xs text-slate-500 mb-4">
              Deliver an alert directly to student devices. Confirmation is required before platform-wide dispatch.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent Examination Hall Notice"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={notifCategory}
                    onChange={(e) => setNotifCategory(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="academic">Academic</option>
                    <option value="announcement">Announcement</option>
                    <option value="resource">New Resource</option>
                    <option value="system">System Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Programme</label>
                  <select
                    value={notifTargetProg}
                    onChange={(e) => setNotifTargetProg(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="ALL">All Students (Platform-Wide)</option>
                    <option value="Computer Science & Software Eng.">Computer Science & Software Eng.</option>
                    <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                    <option value="Mechanical & Mechatronic Eng.">Mechanical & Mechatronic Eng.</option>
                    <option value="Business Administration & Finance">Business Administration & Finance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={3}
                  placeholder="Notification text..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowNotifModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!notifTitle || !notifMessage) return;
                    if (notifTargetProg === 'ALL') {
                      setConfirmBroadcastModal(true);
                    } else {
                      handleDispatchNotification();
                    }
                  }}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  {notifTargetProg === 'ALL' ? 'Review & Broadcast...' : 'Send Notification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR PLATFORM-WIDE BROADCAST */}
      {confirmBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Confirm Platform Broadcast</h3>
            <p className="text-xs text-slate-600 mt-2 mb-5">
              You are about to dispatch an in-app notification to <b>ALL registered university students</b>.
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmBroadcastModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Go Back
              </button>
              <button
                onClick={handleDispatchNotification}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                Yes, Dispatch Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
