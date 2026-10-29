import JSZip from 'jszip';

export async function downloadFlutterProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file(
    'README.md',
    `# UniSync Flutter Application

## How to Open in Android Studio
1. Extract this ZIP file.
2. Launch Android Studio.
3. Click 'File' > 'Open...' and select the extracted folder.
4. Run 'flutter pub get' in the terminal.
5. Select an Android Emulator or connected physical device and click the Run (Green Play) button.
`
  );

  zip.file(
    'pubspec.yaml',
    `name: unisync
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
    - assets/images/
`
  );

  zip.file(
    'analysis_options.yaml',
    `include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_const_constructors: true
    prefer_const_literals_to_create_immutables: true
    avoid_print: false
`
  );

  // Android Configuration Folder
  const androidFolder = zip.folder('android')!;
  androidFolder.file(
    'build.gradle',
    `allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = '../build'
subprojects {
    project.buildDir = "\${rootProject.buildDir}/\${project.name}"
}
subprojects {
    project.evaluationDependsOn(':app')
}

tasks.register("clean", Delete) {
    delete rootProject.buildDir
}
`
  );

  androidFolder.file(
    'settings.gradle',
    `include ':app'

def localPropertiesFile = new File(rootProject.projectDir, "local.properties")
def properties = new Properties()

assert localPropertiesFile.exists() : "local.properties not found. Run 'flutter pub get' or 'flutter doctor'."
localPropertiesFile.withReader("UTF-8") { reader -> properties.load(reader) }

def flutterSdkPath = properties.getProperty("flutter.sdk")
assert flutterSdkPath != null : "flutter.sdk not set in local.properties"
apply from: "$flutterSdkPath/packages/flutter_tools/gradle/app_plugin_loader.gradle"
`
  );

  androidFolder.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx4G -XX:MaxMetaspaceSize=1G -XX:+HeapDumpOnOutOfMemoryError
android.useAndroidX=true
android.enableJetifier=true
`
  );

  const appFolder = androidFolder.folder('app')!;
  appFolder.file(
    'build.gradle',
    `def localProperties = new Properties()
def localPropertiesFile = rootProject.file('local.properties')
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader('UTF-8') { reader ->
        localProperties.load(reader)
    }
}

def flutterVersionCode = localProperties.getProperty('flutter.versionCode') ?: '1'
def flutterVersionName = localProperties.getProperty('flutter.versionName') ?: '1.0'

apply plugin: 'com.android.application'
apply from: "$flutterRoot/packages/flutter_tools/gradle/flutter.gradle"

android {
    namespace "com.unisync.app"
    compileSdkVersion 34

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    defaultConfig {
        applicationId "com.unisync.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        multiDexEnabled true
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
            shrinkResources false
        }
    }
}

flutter {
    source '../..'
}

dependencies {
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version"
}
`
  );

  const mainSrcFolder = appFolder.folder('src')?.folder('main')!;
  mainSrcFolder.file(
    'AndroidManifest.xml',
    `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.unisync.app">

    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28"/>

    <application
        android:label="UniSync"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:usesCleartextTraffic="false">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>
`
  );

  // Lib Folder
  const libFolder = zip.folder('lib')!;

  libFolder.file(
    'main.dart',
    `import 'package:flutter/material.dart';
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
}
`
  );

  // Core
  const coreFolder = libFolder.folder('core')!;
  coreFolder.folder('constants')!.file(
    'constants.dart',
    `import 'package:flutter/material.dart';

class AppConstants {
  static const String appName = 'UniSync';
  static const String appTagline = 'Your University, Connected.';
  static const String appVersion = '1.0.0 (MVP)';

  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://your-project-id.supabase.co',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'your-anon-key',
  );

  static const String academicResourcesBucket = 'academic-resources';
  static const String announcementImagesBucket = 'announcement-images';
  static const String profileImagesBucket = 'profile-images';

  static const List<String> programmes = [
    'Computer Science & Software Eng.',
    'Electrical & Electronic Engineering',
    'Mechanical & Mechatronic Eng.',
    'Civil & Environmental Engineering',
    'Business Administration & Finance',
    'Economics & Data Analytics',
    'Law & Legal Studies',
    'Medicine & Health Sciences',
    'Architecture & Urban Planning',
  ];

  static const List<String> allowedFileExtensions = [
    'pdf',
    'doc',
    'docx',
    'ppt',
    'pptx',
  ];

  static const int maxFileSizeMb = 25;
}

class AppColors {
  static const Color primaryBlue = Color(0xFF1E56A0);
  static const Color primaryDark = Color(0xFF163172);
  static const Color accentBlue = Color(0xFF007BFF);
  static const Color lightBg = Color(0xFFF6F8FD);
  static const Color cardLight = Colors.white;
  static const Color textDark = Color(0xFF1E293B);
  static const Color textMuted = Color(0xFF64748B);
  static const Color borderLight = Color(0xFFE2E8F0);

  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  static const Color darkBg = Color(0xFF0F172A);
  static const Color darkCard = Color(0xFF1E293B);
  static const Color darkBorder = Color(0xFF334155);
  static const Color textLight = Color(0xFFF8FAFC);
}
`
  );

  coreFolder.folder('theme')!.file(
    'app_theme.dart',
    `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/constants.dart';

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: AppColors.primaryBlue,
    scaffoldBackgroundColor: AppColors.lightBg,
    colorScheme: const ColorScheme.light(
      primary: AppColors.primaryBlue,
      secondary: AppColors.primaryDark,
      surface: AppColors.cardLight,
      error: AppColors.error,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: AppColors.accentBlue,
    scaffoldBackgroundColor: AppColors.darkBg,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.accentBlue,
      secondary: AppColors.primaryBlue,
      surface: AppColors.darkCard,
      error: AppColors.error,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
  );
}
`
  );

  coreFolder.folder('utils')!.file(
    'helpers.dart',
    `import 'package:intl/intl.dart';

class Helpers {
  static String formatDate(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat('MMM dd, yyyy').format(date);
  }

  static String formatDateTime(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat('MMM dd, yyyy • h:mm a').format(date);
  }

  static String formatBytes(int? bytes) {
    if (bytes == null || bytes <= 0) return '0 B';
    const suffixes = ['B', 'KB', 'MB', 'GB'];
    var i = 0;
    double dBytes = bytes.toDouble();
    while (dBytes >= 1024 && i < suffixes.length - 1) {
      dBytes /= 1024;
      i++;
    }
    return '\${dBytes.toStringAsFixed(1)} \${suffixes[i]}';
  }

  static bool isValidEmail(String email) {
    final emailRegex = RegExp(r'^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}\$');
    return emailRegex.hasMatch(email.trim());
  }
}
`
  );

  // Models
  const modelsFolder = libFolder.folder('models')!;
  modelsFolder.file(
    'profile.dart',
    `class Profile {
  final String id;
  final String fullName;
  final String email;
  final String programme;
  final String role;
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
}
`
  );

  modelsFolder.file(
    'course.dart',
    `class Course {
  final String id;
  final String courseCode;
  final String courseName;
  final String? department;
  final bool isActive;
  final DateTime createdAt;

  Course({
    required this.id,
    required this.courseCode,
    required this.courseName,
    this.department,
    this.isActive = true,
    required this.createdAt,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['id'] as String,
      courseCode: json['course_code'] as String,
      courseName: json['course_name'] as String,
      department: json['department'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : DateTime.now(),
    );
  }
}
`
  );

  modelsFolder.file(
    'resource.dart',
    `class AcademicResource {
  final String id;
  final String title;
  final String description;
  final String resourceType;
  final String courseId;
  final String filePath;
  final String? fileName;
  final int? fileSize;
  final String? fileType;
  final String uploadedBy;
  final int? examinationYear;
  final String status;
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

  factory AcademicResource.fromJson(Map<String, dynamic> json) {
    return AcademicResource(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      resourceType: json['resource_type'] as String,
      courseId: json['course_id'] as String,
      filePath: json['file_path'] as String,
      fileName: json['file_name'] as String?,
      fileSize: json['file_size'] as int?,
      fileType: json['file_type'] as String?,
      uploadedBy: json['uploaded_by'] as String,
      examinationYear: json['examination_year'] as int?,
      status: json['status'] as String? ?? 'pending',
      downloadCount: json['download_count'] as int? ?? 0,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : DateTime.now(),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : DateTime.now(),
      courseCode: json['courses'] != null ? json['courses']['course_code'] : null,
      courseName: json['courses'] != null ? json['courses']['course_name'] : null,
      uploaderName: json['profiles'] != null ? json['profiles']['full_name'] : null,
    );
  }
}
`
  );

  modelsFolder.file(
    'announcement.dart',
    `class Announcement {
  final String id;
  final String title;
  final String message;
  final String category;
  final String? imagePath;
  final String? authorId;
  final String? authorName;
  final String status;
  final DateTime? publishedAt;
  final DateTime createdAt;

  Announcement({
    required this.id,
    required this.title,
    required this.message,
    this.category = 'General',
    this.imagePath,
    this.authorId,
    this.authorName,
    this.status = 'published',
    this.publishedAt,
    required this.createdAt,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      category: json['category'] as String? ?? 'General',
      imagePath: json['image_path'] as String?,
      authorId: json['author_id'] as String?,
      authorName: json['profiles'] != null ? json['profiles']['full_name'] : 'UniSync Admin',
      status: json['status'] as String? ?? 'published',
      publishedAt: json['published_at'] != null ? DateTime.parse(json['published_at'] as String) : null,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : DateTime.now(),
    );
  }
}
`
  );

  modelsFolder.file(
    'notification.dart',
    `class InAppNotification {
  final String id;
  final String notificationId;
  final String title;
  final String message;
  final String category;
  final bool isRead;
  final DateTime createdAt;

  InAppNotification({
    required this.id,
    required this.notificationId,
    required this.title,
    required this.message,
    required this.category,
    this.isRead = false,
    required this.createdAt,
  });

  factory InAppNotification.fromRecipientJson(Map<String, dynamic> json) {
    final notif = json['notifications'] as Map<String, dynamic>? ?? {};
    return InAppNotification(
      id: json['id'] as String,
      notificationId: json['notification_id'] as String,
      title: notif['title'] as String? ?? 'Campus Notification',
      message: notif['message'] as String? ?? '',
      category: notif['category'] as String? ?? 'academic',
      isRead: json['is_read'] as bool? ?? false,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : DateTime.now(),
    );
  }
}
`
  );

  // Services
  const servicesFolder = libFolder.folder('services')!;
  servicesFolder.file(
    'auth_service.dart',
    `import 'package:flutter/material.dart';
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
      final res = await _supabase.auth.signInWithPassword(email: email.trim(), password: password);
      _currentUser = res.user;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Invalid email or password.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _supabase.auth.signOut();
    _currentUser = null;
    _currentProfile = null;
    notifyListeners();
  }
}
`
  );

  // Supabase Folder
  const supabaseFolder = zip.folder('supabase')!;
  supabaseFolder.file(
    'schema.sql',
    `-- UNISYNC DATABASE SCHEMA
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    programme TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'developer')),
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code TEXT NOT NULL UNIQUE,
    course_name TEXT NOT NULL,
    department TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id),
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    examination_year INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
`
  );

  supabaseFolder.file(
    'storage_setup.sql',
    `INSERT INTO storage.buckets (id, name, public) VALUES ('academic-resources', 'academic-resources', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('announcement-images', 'announcement-images', true) ON CONFLICT (id) DO NOTHING;
`
  );

  // Generate blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'unisync_flutter_project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
