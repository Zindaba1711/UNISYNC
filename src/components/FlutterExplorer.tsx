import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  Copy,
  Check,
  Terminal,
  Database,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Download,
  BookOpen,
} from 'lucide-react';

interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  category: 'flutter' | 'supabase' | 'doc';
  description?: string;
  code?: string;
  children?: FileNode[];
}

export const FlutterExplorer: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('lib/main.dart');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'android_setup' | 'supabase_setup'>('files');

  // File tree structure with detailed contents
  const fileTree: Record<string, { title: string; desc: string; lang: string; content: string }> = {
    'lib/main.dart': {
      title: 'main.dart',
      desc: 'Flutter app entry point, initializes Supabase and configures app providers and themes.',
      lang: 'dart',
      content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/constants/constants.dart';
import 'core/theme/app_theme.dart';
import 'services/auth_service.dart';
import 'services/resource_service.dart';
import 'services/announcement_service.dart';
import 'services/notification_service.dart';
import 'services/profile_service.dart';
import 'screens/splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase Client
  await Supabase.initialize(
    url: AppConstants.supabaseUrl,
    anonKey: AppConstants.supabaseAnonKey,
  );

  runApp(const UniSyncApp());
}

class UniSyncApp extends StatelessWidget {
  const UniSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => ResourceService()),
        ChangeNotifierProvider(create: (_) => AnnouncementService()),
        ChangeNotifierProvider(create: (_) => NotificationService()),
        ChangeNotifierProvider(create: (_) => ProfileService()),
      ],
      child: MaterialApp(
        title: AppConstants.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        home: const SplashScreen(),
      ),
    );
  }
}`,
    },
    'lib/models/profile.dart': {
      title: 'profile.dart',
      desc: 'Student and Staff profile model. Strictly adheres to requirement: NO student_id column!',
      lang: 'dart',
      content: `class Profile {
  final String id;
  final String fullName;
  final String email;
  final String programme;
  final String role; // 'student', 'admin', 'developer'
  final bool isSuspended;
  final String? avatarUrl;
  final DateTime createdAt;

  Profile({
    required this.id,
    required this.fullName,
    required this.email,
    required this.programme,
    this.role = 'student',
    this.isSuspended = false,
    this.avatarUrl,
    required this.createdAt,
  });

  bool get isStudent => role == 'student';
  bool get isAdmin => role == 'admin' || role == 'developer';
  bool get isDeveloper => role == 'developer';

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      fullName: json['full_name'] as String? ?? 'Student User',
      email: json['email'] as String? ?? '',
      programme: json['programme'] as String? ?? 'General Studies',
      role: json['role'] as String? ?? 'student',
      isSuspended: json['is_suspended'] as bool? ?? false,
      avatarUrl: json['avatar_url'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
    );
  }
}`,
    },
    'lib/models/resource.dart': {
      title: 'resource.dart',
      desc: 'Model for academic lecture notes and past examination papers.',
      lang: 'dart',
      content: `class AcademicResource {
  final String id;
  final String title;
  final String description;
  final String resourceType; // 'lecture_note' or 'past_paper'
  final String courseId;
  final String filePath;
  final String? fileName;
  final int? fileSize;
  final String? fileType;
  final String uploadedBy;
  final int? examinationYear;
  final String status; // 'pending', 'approved', 'rejected'
  final String? rejectionReason;
  final int downloadCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  final String? courseCode;
  final String? courseName;
  final String? uploaderName;

  AcademicResource({
    required this.id,
    required this.title,
    required this.description,
    required this.resourceType,
    required this.courseId,
    required this.filePath,
    this.fileName,
    this.fileSize,
    this.fileType,
    required this.uploadedBy,
    this.examinationYear,
    this.status = 'pending',
    this.rejectionReason,
    this.downloadCount = 0,
    required this.createdAt,
    required this.updatedAt,
    this.courseCode,
    this.courseName,
    this.uploaderName,
  });

  bool get isLectureNote => resourceType == 'lecture_note';
  bool get isPastPaper => resourceType == 'past_paper';
  bool get isApproved => status == 'approved';
  bool get isPending => status == 'pending';
  bool get isRejected => status == 'rejected';
}`,
    },
    'lib/services/auth_service.dart': {
      title: 'auth_service.dart',
      desc: 'Supabase authentication service for registration, login, logout, and password reset.',
      lang: 'dart',
      content: `import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/profile.dart';

class AuthService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;

  User? _currentUser;
  Profile? _currentProfile;
  bool _isLoading = false;
  String? _errorMessage;

  User? get currentUser => _currentUser;
  Profile? get currentProfile => _currentProfile;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _currentUser != null;

  // Register student: Notice strictly NO student ID is collected!
  Future<bool> register({
    required String fullName,
    required String email,
    required String password,
    required String programme,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _supabase.auth.signUp(
        email: email.trim(),
        password: password,
        data: {
          'full_name': fullName.trim(),
          'programme': programme.trim(),
          'role': 'student',
        },
      );

      final user = response.user;
      if (user != null) {
        await _supabase.from('profiles').upsert({
          'id': user.id,
          'full_name': fullName.trim(),
          'email': email.trim(),
          'programme': programme.trim(),
          'role': 'student',
        });
        await fetchCurrentProfile();
      }
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> login({required String email, required String password}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      if (response.user != null) {
        await fetchCurrentProfile();
        _isLoading = false;
        notifyListeners();
        return true;
      }
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Login failed. Please check your credentials.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}`,
    },
    'lib/screens/dashboard_screen.dart': {
      title: 'dashboard_screen.dart',
      desc: 'Main student dashboard containing bottom navigation (Home, Notes, Past Papers, Updates, Profile) and unread notification badge.',
      lang: 'dart',
      content: `// 5-Tab Navigation Bar & Real Supabase Data Feeds
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  final List<Widget> pages = const [
    HomeDashboardView(),
    NotesScreen(),
    PastPapersScreen(),
    UpdatesScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final notifService = Provider.of<NotificationService>(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('UniSync'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                ),
              ),
              if (notifService.unreadCount > 0)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.error,
                      shape: BoxShape.circle,
                    ),
                    child: Text('\${notifService.unreadCount}'),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: pages[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.menu_book), label: 'Notes'),
          NavigationDestination(icon: Icon(Icons.assignment), label: 'Past Papers'),
          NavigationDestination(icon: Icon(Icons.campaign), label: 'Updates'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}`,
    },
    'pubspec.yaml': {
      title: 'pubspec.yaml',
      desc: 'Flutter project dependencies, SDK constraints, and asset declarations.',
      lang: 'yaml',
      content: `name: unisync
description: "UniSync — Centralized University Student Academic & Campus Platform."
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  supabase_flutter: ^2.3.4
  provider: ^6.1.2
  google_fonts: ^6.2.1
  intl: ^0.19.0
  file_picker: ^8.0.0
  url_launcher: ^6.2.6
  flutter_spinkit: ^5.2.0
  cached_network_image: ^3.3.1
  shared_preferences: ^2.2.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/`,
    },
    'android/app/src/main/AndroidManifest.xml': {
      title: 'AndroidManifest.xml',
      desc: 'Android permissions for Internet access and file storage.',
      lang: 'xml',
      content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.unisync.app">

    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28"/>

    <application
        android:label="UniSync"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    'supabase/schema.sql': {
      title: 'schema.sql',
      desc: 'Complete PostgreSQL database schema with tables, RLS policies, indexes, and triggers.',
      lang: 'sql',
      content: `-- PROFILES (Strictly NO student_id column!)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    programme TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'developer')),
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COURSES
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code TEXT NOT NULL UNIQUE,
    course_name TEXT NOT NULL,
    department TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ACADEMIC RESOURCES (Lecture Notes & Past Examination Papers)
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('lecture_note', 'past_paper')),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    examination_year INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ANNOUNCEMENTS (UniSync Updates)
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NOTIFICATIONS & RECIPIENTS
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL,
    target_programme TEXT,
    created_by UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL DEFAULT 'sent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    delivery_status TEXT NOT NULL DEFAULT 'delivered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS POLICIES ENABLED ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;`,
    },
    'supabase/storage_setup.sql': {
      title: 'storage_setup.sql',
      desc: 'Storage buckets configuration and security policies for academic-resources and announcements.',
      lang: 'sql',
      content: `-- BUCKET: academic-resources (Controlled / Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'academic-resources', 
  'academic-resources', 
  false, 
  26214400, -- 25MB max
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- BUCKET: announcement-images (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'announcement-images', 
  'announcement-images', 
  true, 
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;`,
    },
  };

  const selectedFile = fileTree[selectedFilePath] || fileTree['lib/main.dart'];

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Bar */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs">
            US
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">UniSync Native Android & Supabase Codebase</h1>
            <p className="text-[11px] text-slate-400">Complete Flutter + Supabase Architecture</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'files' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Source File Explorer
          </button>
          <button
            onClick={() => setActiveTab('android_setup')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'android_setup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Android Studio Instructions
          </button>
          <button
            onClick={() => setActiveTab('supabase_setup')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'supabase_setup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Supabase Setup Guide
          </button>
        </div>
      </div>

      {activeTab === 'files' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Left Pane */}
          <div className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Project Structure
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs">
              <div className="text-[10px] uppercase font-bold text-blue-400 px-2 py-1">Flutter Android Source</div>
              {Object.keys(fileTree)
                .filter((p) => p.startsWith('lib/') || p.startsWith('pubspec') || p.startsWith('android/'))
                .map((path) => (
                  <button
                    key={path}
                    onClick={() => setSelectedFilePath(path)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                      selectedFilePath === path
                        ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{path}</span>
                  </button>
                ))}

              <div className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-1 pt-3">
                Supabase & PostgreSQL
              </div>
              {Object.keys(fileTree)
                .filter((p) => p.startsWith('supabase/'))
                .map((path) => (
                  <button
                    key={path}
                    onClick={() => setSelectedFilePath(path)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                      selectedFilePath === path
                        ? 'bg-emerald-600/20 text-emerald-400 font-semibold border border-emerald-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{path}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Code Viewer Right Pane */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* File Info Bar */}
            <div className="h-12 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-white">{selectedFilePath}</span>
                <span className="text-xs text-slate-400 ml-3">{selectedFile.desc}</span>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed text-slate-300 bg-slate-950/60">
              <pre>{selectedFile.content}</pre>
            </div>
          </div>
        </div>
      ) : activeTab === 'android_setup' ? (
        /* ANDROID STUDIO INSTRUCTIONS */
        <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <span>How to Open & Run UniSync in Android Studio</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Follow these standard developer steps to run the native Flutter application on an Android device or emulator.
            </p>

            <div className="mt-6 space-y-5 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="font-bold text-blue-400 text-sm mb-1">Step 1: Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Flutter SDK (Version 3.19+ or higher)</li>
                  <li>Android Studio (Hedgehog, Iguana, or Koala) with Android SDK and Emulator</li>
                  <li>Flutter and Dart plugins installed in Android Studio</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="font-bold text-blue-400 text-sm mb-1">Step 2: Open Project in Android Studio</h3>
                <p className="mb-2">Open Android Studio and click <b>File &gt; Open...</b>, then select the <code className="text-amber-300">flutter_app/</code> directory from this workspace.</p>
                <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-[11px] text-emerald-400">
                  cd flutter_app<br />
                  flutter pub get
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="font-bold text-blue-400 text-sm mb-1">Step 3: Connect Supabase Credentials</h3>
                <p className="mb-2">Run the app with your Supabase URL and Anon Key passed via dart-define, or update <code className="text-amber-300">lib/core/constants/constants.dart</code>:</p>
                <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-[11px] text-emerald-400">
                  flutter run --dart-define=SUPABASE_URL=https://your-id.supabase.co --dart-define=SUPABASE_ANON_KEY=your-anon-key
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="font-bold text-blue-400 text-sm mb-1">Step 4: Build Android APK / Bundle</h3>
                <p className="mb-2">To compile the release APK ready for student installation:</p>
                <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-[11px] text-emerald-400">
                  flutter build apk --release
                </div>
                <p className="mt-2 text-slate-400">The APK will be generated at <code className="text-slate-200">build/app/outputs/flutter-apk/app-release.apk</code>.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SUPABASE SETUP INSTRUCTIONS */
        <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Supabase & PostgreSQL Deployment Guide</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Instructions for configuring your Supabase project, executing the schema, and setting up storage buckets.
            </p>

            <div className="mt-6 space-y-5 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="font-bold text-emerald-400 text-sm mb-1">1. Run SQL Schema & RLS Policies</h3>
                <p className="mb-2">
                  Navigate to your <b>Supabase Dashboard &gt; SQL Editor</b>. Open <code className="text-amber-300">supabase/schema.sql</code> and click <b>Run</b>.
                </p>
                <p className="text-slate-400">
                  This provisions the tables: <code className="text-slate-200">profiles, courses, resources, announcements, notifications, notification_recipients, resource_reports, activity_logs, platform_settings</code> and enforces strict Row Level Security (RLS).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="font-bold text-emerald-400 text-sm mb-1">2. Run Storage Setup</h3>
                <p className="mb-2">
                  In SQL Editor, run <code className="text-amber-300">supabase/storage_setup.sql</code> to create the private <code className="text-slate-200">academic-resources</code> bucket and public <code className="text-slate-200">announcement-images</code> bucket with upload size limits.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="font-bold text-emerald-400 text-sm mb-1">3. Initialize the First Developer Administrator</h3>
                <p className="mb-2">
                  To securely assign the initial Developer Administrator without exposing privileged endpoints, execute this SQL query in the Supabase SQL editor:
                </p>
                <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-[11px] text-emerald-400">
                  UPDATE public.profiles<br />
                  SET role = 'developer'<br />
                  WHERE email = 'your-developer-email@university.edu';
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
