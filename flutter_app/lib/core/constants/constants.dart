import 'package:flutter/material.dart';

class AppConstants {
  static const String appName = 'UniSync';
  static const String appTagline = 'Your University, Connected.';
  static const String appVersion = '1.0.0 (MVP)';

  // Supabase Configuration
  // Note: Set these via flutter build/run with --dart-define or environment config
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://your-project-id.supabase.co',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'your-anon-key',
  );

  // Storage Buckets
  static const String academicResourcesBucket = 'academic-resources';
  static const String announcementImagesBucket = 'announcement-images';
  static const String profileImagesBucket = 'profile-images';

  // Academic Programmes
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

  // Allowed file extensions
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
  // Brand identity per specification:
  // - University blue as the primary colour.
  // - White as the main supporting colour.
  // - Navy blue for darker elements.
  // - Light grey for secondary backgrounds.
  static const Color primaryBlue = Color(0xFF1E56A0);       // University Blue
  static const Color primaryDark = Color(0xFF163172);       // Navy Blue
  static const Color accentBlue = Color(0xFF007BFF);        // Vibrant Accent
  static const Color lightBg = Color(0xFFF6F8FD);           // Light Grey / Slate
  static const Color cardLight = Colors.white;
  static const Color textDark = Color(0xFF1E293B);
  static const Color textMuted = Color(0xFF64748B);
  static const Color borderLight = Color(0xFFE2E8F0);

  // Status colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Dark Theme palette
  static const Color darkBg = Color(0xFF0F172A);
  static const Color darkCard = Color(0xFF1E293B);
  static const Color darkBorder = Color(0xFF334155);
  static const Color textLight = Color(0xFFF8FAFC);
}
