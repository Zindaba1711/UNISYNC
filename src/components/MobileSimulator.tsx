import React, { useState, useEffect } from 'react';
import {
  Home,
  BookOpen,
  FileCheck,
  Megaphone,
  User,
  Bell,
  Search,
  Filter,
  Download,
  Flag,
  Upload,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  LogOut,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react';
import { store } from '../services/store';
import {
  Profile,
  AcademicResource,
  Announcement,
  NotificationRecipient,
} from '../types';

interface MobileSimulatorProps {
  onSwitchToAdmin?: () => void;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({ onSwitchToAdmin }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  // Simulator Theme & Active User
  const [isDarkMode, setIsDarkMode] = useState(false);
  const profiles = store.getProfiles();
  const defaultStudent = profiles.find((p) => p.role === 'student') || profiles[2];
  const [currentUser, setCurrentUser] = useState<Profile | null>(defaultStudent);

  // Authentication Screen State (when logged out)
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('alex.morgan@university.edu');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register Form State - Strictly NO student ID!
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regProgramme, setRegProgramme] = useState('Computer Science & Software Eng.');

  // Student Navigation Tab
  // 0: Home, 1: Notes, 2: Past Papers, 3: Updates, 4: Profile
  const [activeTab, setActiveTab] = useState<number>(0);
  const [currentScreen, setCurrentScreen] = useState<'main' | 'upload' | 'notifications' | 'announcement_detail' | 'edit_profile'>('main');

  // Filters & Search
  const [searchNotesQuery, setSearchNotesQuery] = useState('');
  const [selectedNotesCourse, setSelectedNotesCourse] = useState('ALL');

  const [searchPapersQuery, setSearchPapersQuery] = useState('');
  const [selectedPaperCourse, setSelectedPaperCourse] = useState('ALL');
  const [selectedPaperYear, setSelectedPaperYear] = useState<string>('ALL');

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadType, setUploadType] = useState<'lecture_note' | 'past_paper'>('lecture_note');
  const [uploadCourseId, setUploadCourseId] = useState(store.getCourses()[0]?.id || '');
  const [uploadExamYear, setUploadExamYear] = useState('2026');
  const [uploadFileName, setUploadFileName] = useState('Lecture_Slide_Week5.pdf');
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState(false);

  // Selected announcement for detail modal
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Reporting modal
  const [reportingResId, setReportingResId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Incorrect Content');

  // Edit profile state
  const [editName, setEditName] = useState(currentUser?.full_name || '');
  const [editProg, setEditProg] = useState(currentUser?.programme || '');

  const courses = store.getCourses();
  const allApprovedNotes = store.getApprovedResources(
    'lecture_note',
    selectedNotesCourse === 'ALL' ? undefined : selectedNotesCourse,
    searchNotesQuery
  );

  const allApprovedPapers = store.getApprovedResources(
    'past_paper',
    selectedPaperCourse === 'ALL' ? undefined : selectedPaperCourse,
    searchPapersQuery
  ).filter((p) => {
    if (selectedPaperYear === 'ALL') return true;
    return p.examination_year === Number(selectedPaperYear);
  });

  const publishedAnnouncements = store.getPublishedAnnouncements();
  const userNotifications = currentUser ? store.getUserNotifications(currentUser.id) : [];
  const unreadCount = userNotifications.filter((n) => !n.is_read).length;
  const myUploads = currentUser ? store.getResources().filter((r) => r.uploaded_by === currentUser.id) : [];

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = profiles.find((p) => p.email.toLowerCase() === loginEmail.toLowerCase());
    if (found) {
      setCurrentUser(found);
    } else {
      // Create quick student session
      const newP = store.createStudentProfile({
        full_name: 'Student User',
        email: loginEmail,
        programme: 'Computer Science & Software Eng.',
      });
      setCurrentUser(newP);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail) return;
    const newStudent = store.createStudentProfile({
      full_name: regFullName,
      email: regEmail,
      programme: regProgramme,
    });
    setCurrentUser(newStudent);
    setRegFullName('');
    setRegEmail('');
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !currentUser) return;

    store.uploadResource({
      title: uploadTitle,
      description: uploadDesc,
      resource_type: uploadType,
      course_id: uploadCourseId,
      file_name: uploadFileName,
      file_size: 2150000,
      file_type: uploadFileName.split('.').pop() || 'pdf',
      uploaded_by: currentUser.id,
      uploader_name: currentUser.full_name,
      examination_year: uploadType === 'past_paper' ? Number(uploadExamYear) : undefined,
    });

    setUploadTitle('');
    setUploadDesc('');
    setUploadSuccessAlert(true);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-slate-900/90 py-8">
      {/* Device Header Bar */}
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between text-xs text-slate-300 px-2">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-white">UniSync Android App Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          {onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1 rounded shadow-sm"
            >
              Open Admin Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Android Device Shell */}
      <div className="w-[380px] h-[780px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col overflow-hidden">
        {/* Camera Notch & Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-950 rounded-b-xl flex items-center justify-center z-50">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700 mr-3"></div>
          <div className="w-12 h-1 rounded-full bg-slate-800"></div>
        </div>

        {/* Device Screen Frame */}
        <div
          className={`w-full h-full rounded-[34px] overflow-hidden flex flex-col transition-colors duration-200 ${
            isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
          }`}
        >
          {/* Android Status Bar */}
          <div
            className={`h-7 px-5 pt-1.5 flex items-center justify-between text-[11px] font-medium flex-shrink-0 select-none ${
              isDarkMode ? 'text-slate-400 bg-slate-900' : 'text-slate-600 bg-white'
            }`}
          >
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-4 h-2 border border-current rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-current rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* APPLICATION CONTENT CONTAINER */}
          {!currentUser ? (
            /* AUTHENTICATION FLOW (LOGIN / REGISTER) */
            <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 mb-3">
                  US
                </div>
                <h2 className="text-xl font-bold text-slate-800">UniSync</h2>
                <p className="text-xs text-slate-500 mt-1">Your University, Connected.</p>
              </div>

              {authView === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">University Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all mt-2"
                  >
                    Sign In
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthView('register')}
                      className="text-xs text-blue-600 font-semibold"
                    >
                      Don't have an account? Register here
                    </button>
                  </div>
                </form>
              ) : (
                /* REGISTRATION - STRICTLY NO STUDENT ID */
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="Alex Morgan"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">University Email</label>
                    <input
                      type="email"
                      placeholder="alex.morgan@university.edu"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Programme of Study</label>
                    <select
                      value={regProgramme}
                      onChange={(e) => setRegProgramme(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Computer Science & Software Eng.">Computer Science & Software Eng.</option>
                      <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                      <option value="Mechanical & Mechatronic Eng.">Mechanical & Mechatronic Eng.</option>
                      <option value="Business Administration & Finance">Business Administration & Finance</option>
                      <option value="Law & Legal Studies">Law & Legal Studies</option>
                    </select>
                  </div>

                  <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] text-blue-700 leading-tight">
                    Notice: UniSync never collects or requires Student IDs. Your account is verified by your university email.
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all mt-1"
                  >
                    Create Account
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-xs text-blue-600 font-semibold"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : currentScreen === 'upload' ? (
            /* UPLOAD ACADEMIC RESOURCE SCREEN */
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setCurrentScreen('main');
                    setUploadSuccessAlert(false);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h3 className="text-sm font-bold text-slate-800">Upload Resource</h3>
                <div className="w-5"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {uploadSuccessAlert ? (
                  <div className="py-12 text-center space-y-3">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">Submitted for Moderation</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Your document has been sent to UniSync administrators. Once reviewed, it will become searchable for students.
                    </p>
                    <button
                      onClick={() => {
                        setUploadSuccessAlert(false);
                        setCurrentScreen('main');
                        setActiveTab(4); // View in profile
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                    >
                      View in My Uploads
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUploadSubmit} className="space-y-3">
                    {/* Notice */}
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-800">
                      All uploads enter a moderation review process before appearing in search listings.
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Resource Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setUploadType('lecture_note')}
                          className={`py-1.5 text-xs rounded-lg font-semibold border ${
                            uploadType === 'lecture_note'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          Lecture Note
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadType('past_paper')}
                          className={`py-1.5 text-xs rounded-lg font-semibold border ${
                            uploadType === 'past_paper'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          Past Exam Paper
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Title</label>
                      <input
                        type="text"
                        placeholder="e.g. CS204 Week 4 Tree Notes"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Course</label>
                      <select
                        value={uploadCourseId}
                        onChange={(e) => setUploadCourseId(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.course_code} — {c.course_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {uploadType === 'past_paper' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Examination Year</label>
                        <select
                          value={uploadExamYear}
                          onChange={(e) => setUploadExamYear(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        placeholder="Summary of topics covered..."
                        value={uploadDesc}
                        onChange={(e) => setUploadDesc(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Attached Document</label>
                      <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                        <Upload className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-slate-700 block">{uploadFileName}</span>
                        <span className="text-[10px] text-slate-400">PDF Document (2.1 MB)</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md mt-2"
                    >
                      Submit Document for Review
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : currentScreen === 'notifications' ? (
            /* NOTIFICATIONS SCREEN */
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <button onClick={() => setCurrentScreen('main')} className="p-1 rounded-lg hover:bg-slate-100">
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h3 className="text-sm font-bold text-slate-800">In-App Notifications</h3>
                {unreadCount > 0 ? (
                  <button
                    onClick={() => currentUser && store.markAllNotificationsAsRead(currentUser.id)}
                    className="text-[11px] text-blue-600 font-semibold"
                  >
                    Mark Read
                  </button>
                ) : (
                  <div className="w-6"></div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">No notifications received yet.</div>
                ) : (
                  userNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => store.markNotificationAsRead(notif.id)}
                      className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                        notif.is_read
                          ? 'bg-white border-slate-200'
                          : 'bg-blue-50/60 border-blue-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                          {notif.category || 'System'}
                        </span>
                        {!notif.is_read && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{notif.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* MAIN STUDENT EXPERIENCE (WITH BOTTOM NAV) */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* App Top Bar */}
              <div
                className={`px-4 py-3 border-b flex items-center justify-between ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 text-white font-black text-xs rounded-lg flex items-center justify-center">
                    US
                  </div>
                  <span className="font-bold text-sm">UniSync</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentScreen('notifications')}
                    className="relative p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
                    )}
                  </button>
                </div>
              </div>

              {/* Scrollable Tab Views */}
              <div className="flex-1 overflow-y-auto">
                {/* TAB 0: HOME DASHBOARD */}
                {activeTab === 0 && (
                  <div className="p-4 space-y-4">
                    {/* Welcome Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white shadow-md">
                      <div className="text-[11px] text-blue-200">Welcome,</div>
                      <h3 className="text-base font-bold truncate">{currentUser.full_name}</h3>
                      <p className="text-[11px] text-blue-100 mt-0.5">{currentUser.programme}</p>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
                        <div className="bg-white/10 rounded-xl p-2.5">
                          <span className="text-[10px] text-blue-200 block">Available Notes</span>
                          <span className="text-lg font-bold">{allApprovedNotes.length}</span>
                        </div>
                        <div className="bg-white/10 rounded-xl p-2.5">
                          <span className="text-[10px] text-blue-200 block">Past Papers</span>
                          <span className="text-lg font-bold">{allApprovedPapers.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Access */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setActiveTab(1)}
                        className={`p-3 rounded-xl border text-center transition-colors ${
                          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <span className="text-[11px] font-semibold block">Notes</span>
                      </button>
                      <button
                        onClick={() => setActiveTab(2)}
                        className={`p-3 rounded-xl border text-center transition-colors ${
                          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        <FileCheck className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <span className="text-[11px] font-semibold block">Past Papers</span>
                      </button>
                      <button
                        onClick={() => setCurrentScreen('upload')}
                        className={`p-3 rounded-xl border text-center transition-colors ${
                          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        <Upload className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                        <span className="text-[11px] font-semibold block">Upload</span>
                      </button>
                    </div>

                    {/* Latest Updates Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Latest UniSync Updates</h4>
                        <button
                          onClick={() => setActiveTab(3)}
                          className="text-[11px] text-blue-600 font-semibold"
                        >
                          View All
                        </button>
                      </div>

                      {publishedAnnouncements.slice(0, 2).map((ann) => (
                        <div
                          key={ann.id}
                          onClick={() => {
                            setSelectedAnnouncement(ann);
                          }}
                          className={`p-3 rounded-xl border mb-2 cursor-pointer transition-colors ${
                            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                            {ann.category}
                          </span>
                          <h5 className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100">{ann.title}</h5>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{ann.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recent Notes Preview */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Featured Lecture Notes</h4>
                        <button
                          onClick={() => setActiveTab(1)}
                          className="text-[11px] text-blue-600 font-semibold"
                        >
                          Browse
                        </button>
                      </div>

                      {allApprovedNotes.slice(0, 2).map((note) => (
                        <div
                          key={note.id}
                          className={`p-3 rounded-xl border mb-2 ${
                            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {note.course_code}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              {note.file_type || 'PDF'}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">{note.title}</h5>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400">By {note.uploader_name}</span>
                            <button
                              onClick={() => {
                                store.incrementDownload(note.id);
                                alert(`Opening document: ${note.file_name || note.title}`);
                              }}
                              className="text-[11px] text-blue-600 font-semibold flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 1: LECTURE NOTES */}
                {activeTab === 1 && (
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search lecture notes..."
                          value={searchNotesQuery}
                          onChange={(e) => setSearchNotesQuery(e.target.value)}
                          className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-white border-slate-200'
                          }`}
                        />
                      </div>
                      <select
                        value={selectedNotesCourse}
                        onChange={(e) => setSelectedNotesCourse(e.target.value)}
                        className={`w-full text-xs px-3 py-1.5 rounded-xl border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                        }`}
                      >
                        <option value="ALL">All Courses</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.course_code} — {c.course_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {allApprovedNotes.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 text-xs">
                          No lecture notes match your search.
                        </div>
                      ) : (
                        allApprovedNotes.map((note) => (
                          <div
                            key={note.id}
                            className={`p-3 rounded-xl border ${
                              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {note.course_code}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                {note.file_type || 'PDF'}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                              {note.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{note.description}</p>
                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400">By {note.uploader_name}</span>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setReportingResId(note.id)}
                                  className="text-[11px] text-slate-400 hover:text-rose-500"
                                  title="Report"
                                >
                                  <Flag className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    store.incrementDownload(note.id);
                                    alert(`Downloading ${note.file_name || note.title}`);
                                  }}
                                  className="text-[11px] text-blue-600 font-semibold flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: PAST EXAMINATION PAPERS */}
                {activeTab === 2 && (
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search past exam papers..."
                          value={searchPapersQuery}
                          onChange={(e) => setSearchPapersQuery(e.target.value)}
                          className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-white border-slate-200'
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={selectedPaperCourse}
                          onChange={(e) => setSelectedPaperCourse(e.target.value)}
                          className={`w-full text-xs px-2 py-1.5 rounded-xl border ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                          }`}
                        >
                          <option value="ALL">All Courses</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.course_code}
                            </option>
                          ))}
                        </select>
                        <select
                          value={selectedPaperYear}
                          onChange={(e) => setSelectedPaperYear(e.target.value)}
                          className={`w-full text-xs px-2 py-1.5 rounded-xl border ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                          }`}
                        >
                          <option value="ALL">All Years</option>
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {allApprovedPapers.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 text-xs">
                          No past exam papers found for this selection.
                        </div>
                      ) : (
                        allApprovedPapers.map((paper) => (
                          <div
                            key={paper.id}
                            className={`p-3 rounded-xl border ${
                              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                {paper.course_code} • Exam {paper.examination_year}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">PDF</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                              {paper.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{paper.description}</p>
                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400">By {paper.uploader_name}</span>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setReportingResId(paper.id)}
                                  className="text-[11px] text-slate-400 hover:text-rose-500"
                                  title="Report Paper"
                                >
                                  <Flag className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    store.incrementDownload(paper.id);
                                    alert(`Downloading Past Paper: ${paper.file_name || paper.title}`);
                                  }}
                                  className="text-[11px] text-blue-600 font-semibold flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: UPDATES & ANNOUNCEMENTS */}
                {activeTab === 3 && (
                  <div className="p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Official Campus Updates</h3>
                    {publishedAnnouncements.map((ann) => (
                      <div
                        key={ann.id}
                        onClick={() => setSelectedAnnouncement(ann)}
                        className={`p-3.5 rounded-xl border cursor-pointer hover:border-blue-400 transition-colors ${
                          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                            {ann.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ann.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1.5">{ann.title}</h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                          {ann.message}
                        </p>
                        <span className="text-[10px] text-blue-500 font-medium mt-2 block">Read full notice →</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 4: STUDENT PROFILE */}
                {activeTab === 4 && (
                  <div className="p-4 space-y-4">
                    {/* Profile Header */}
                    <div
                      className={`p-4 rounded-2xl border text-center ${
                        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center mx-auto mb-2">
                        {currentUser.full_name[0]}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentUser.full_name}</h3>
                      <p className="text-xs text-slate-500">{currentUser.email}</p>
                      <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                        {currentUser.programme}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2">
                        Registered {new Date(currentUser.created_at).toLocaleDateString()}
                      </div>

                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setEditName(currentUser.full_name);
                            setEditProg(currentUser.programme);
                            setCurrentScreen('edit_profile');
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50"
                        >
                          Edit Profile Details
                        </button>
                      </div>
                    </div>

                    {/* My Uploaded Resources with Moderation Status */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                        My Uploaded Resources ({myUploads.length})
                      </h4>
                      {myUploads.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                          You haven't uploaded any documents yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {myUploads.map((up) => (
                            <div
                              key={up.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs font-semibold truncate">{up.title}</div>
                                <div className="text-[10px] text-slate-400">
                                  {up.course_code} • {new Date(up.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                                  up.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : up.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {up.status === 'pending'
                                  ? 'Under Review'
                                  : up.status === 'approved'
                                  ? 'Approved'
                                  : 'Rejected'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sign Out Button */}
                    <button
                      onClick={() => setCurrentUser(null)}
                      className="w-full py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Android Bottom Navigation Bar (5 tabs) */}
              <div
                className={`h-14 border-t flex items-center justify-around px-2 flex-shrink-0 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  onClick={() => setActiveTab(0)}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                    activeTab === 0 ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                    activeTab === 1 ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Notes</span>
                </button>
                <button
                  onClick={() => setActiveTab(2)}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                    activeTab === 2 ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Past Papers</span>
                </button>
                <button
                  onClick={() => setActiveTab(3)}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                    activeTab === 3 ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Updates</span>
                </button>
                <button
                  onClick={() => setActiveTab(4)}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                    activeTab === 4 ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* Android Bottom Gesture Bar */}
          <div className="h-4 bg-transparent flex items-center justify-center flex-shrink-0">
            <div className="w-28 h-1 rounded-full bg-slate-400/50"></div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL: ANNOUNCEMENT */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
              {selectedAnnouncement.category}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-2">{selectedAnnouncement.title}</h3>
            <div className="text-[10px] text-slate-400 mt-0.5 mb-3">
              By {selectedAnnouncement.author_name} • {new Date(selectedAnnouncement.created_at).toLocaleDateString()}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-h-60 overflow-y-auto">
              {selectedAnnouncement.message}
            </p>
            <div className="mt-4 pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: REPORT RESOURCE */}
      {reportingResId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Report Inappropriate Content</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Flag this resource for administrator review if it violates academic integrity or contains incorrect information.
            </p>
            <div className="space-y-3">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2"
              >
                <option value="Incorrect Content">Incorrect Content / Solutions</option>
                <option value="Inappropriate Content">Inappropriate Content</option>
                <option value="Corrupted File">Corrupted or Unreadable File</option>
                <option value="Copyright Infringement">Copyright Infringement</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setReportingResId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (currentUser) {
                      store.submitReport({
                        resource_id: reportingResId,
                        reporter_id: currentUser.id,
                        reporter_name: currentUser.full_name,
                        reason: reportReason,
                      });
                    }
                    setReportingResId(null);
                    alert('Report submitted. UniSync administrators will examine the resource.');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROFILE */}
      {currentScreen === 'edit_profile' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Edit Student Profile</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
              Update your permitted student profile info. Roles & permissions are protected.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Programme of Study</label>
                <input
                  type="text"
                  value={editProg}
                  onChange={(e) => setEditProg(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCurrentScreen('main')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (currentUser) {
                      store.updateProfileDetails(currentUser.id, {
                        full_name: editName,
                        programme: editProg,
                      });
                      setCurrentUser({ ...currentUser, full_name: editName, programme: editProg });
                    }
                    setCurrentScreen('main');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
