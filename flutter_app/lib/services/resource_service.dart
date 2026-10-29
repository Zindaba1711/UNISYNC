import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/resource.dart';
import '../models/course.dart';
import '../core/constants/constants.dart';

class ResourceService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;

  List<AcademicResource> _lectureNotes = [];
  List<AcademicResource> _pastPapers = [];
  List<AcademicResource> _myUploads = [];
  List<Course> _courses = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<AcademicResource> get lectureNotes => _lectureNotes;
  List<AcademicResource> get pastPapers => _pastPapers;
  List<AcademicResource> get myUploads => _myUploads;
  List<Course> get courses => _courses;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Load all active courses
  Future<void> fetchCourses() async {
    try {
      final res = await _supabase
          .from('courses')
          .select()
          .eq('is_active', true)
          .order('course_code', ascending: true);

      _courses = (res as List).map((e) => Course.fromJson(e)).toList();
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching courses: $e');
    }
  }

  // Fetch Lecture Notes (Approved only for public browse)
  Future<void> fetchLectureNotes({String? searchQuery, String? courseId}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      var query = _supabase
          .from('resources')
          .select('*, courses:course_id(course_code, course_name), profiles:uploaded_by(full_name)')
          .eq('resource_type', 'lecture_note')
          .eq('status', 'approved');

      if (courseId != null && courseId.isNotEmpty) {
        query = query.eq('course_id', courseId);
      }
      if (searchQuery != null && searchQuery.trim().isNotEmpty) {
        query = query.ilike('title', '%${searchQuery.trim()}%');
      }

      final res = await query.order('created_at', ascending: false);
      _lectureNotes = (res as List).map((e) => AcademicResource.fromJson(e)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch Past Examination Papers
  Future<void> fetchPastPapers({String? searchQuery, String? courseId, int? examYear}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      var query = _supabase
          .from('resources')
          .select('*, courses:course_id(course_code, course_name), profiles:uploaded_by(full_name)')
          .eq('resource_type', 'past_paper')
          .eq('status', 'approved');

      if (courseId != null && courseId.isNotEmpty) {
        query = query.eq('course_id', courseId);
      }
      if (examYear != null && examYear > 0) {
        query = query.eq('examination_year', examYear);
      }
      if (searchQuery != null && searchQuery.trim().isNotEmpty) {
        query = query.ilike('title', '%${searchQuery.trim()}%');
      }

      final res = await query.order('examination_year', ascending: false);
      _pastPapers = (res as List).map((e) => AcademicResource.fromJson(e)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch student's own uploads (all statuses: pending, approved, rejected)
  Future<void> fetchMyUploads(String userId) async {
    try {
      final res = await _supabase
          .from('resources')
          .select('*, courses:course_id(course_code, course_name)')
          .eq('uploaded_by', userId)
          .order('created_at', ascending: false);

      _myUploads = (res as List).map((e) => AcademicResource.fromJson(e)).toList();
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching my uploads: $e');
    }
  }

  // Upload new resource with file storage
  Future<bool> uploadResource({
    required String title,
    required String description,
    required String courseId,
    required String resourceType,
    int? examYear,
    required File file,
    required String fileName,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final user = _supabase.auth.currentUser;
    if (user == null) {
      _errorMessage = 'User not authenticated.';
      _isLoading = false;
      notifyListeners();
      return false;
    }

    try {
      // 1. Upload document to Supabase Storage
      final fileExt = fileName.split('.').last.toLowerCase();
      final storagePath = '${user.id}/${DateTime.now().millisecondsSinceEpoch}_$fileName';

      await _supabase.storage.from(AppConstants.academicResourcesBucket).upload(
            storagePath,
            file,
            fileOptions: const FileOptions(cacheControl: '3600', upsert: false),
          );

      final fileSize = await file.length();

      // 2. Insert metadata to 'resources' table (status starts as pending)
      await _supabase.from('resources').insert({
        'title': title.trim(),
        'description': description.trim(),
        'course_id': courseId,
        'resource_type': resourceType,
        'examination_year': examYear,
        'file_path': storagePath,
        'file_name': fileName,
        'file_size': fileSize,
        'file_type': fileExt,
        'uploaded_by': user.id,
        'status': 'pending', // Moderation review process
      });

      // Refresh list
      await fetchMyUploads(user.id);
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

  // Generate signed download URL
  Future<String?> getDownloadUrl(String filePath) async {
    try {
      final res = await _supabase.storage
          .from(AppConstants.academicResourcesBucket)
          .createSignedUrl(filePath, 3600); // 1 hour link
      return res;
    } catch (e) {
      debugPrint('Error creating download link: $e');
      return null;
    }
  }

  // Report inappropriate content
  Future<bool> reportResource({
    required String resourceId,
    required String reason,
    String? description,
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null) return false;

    try {
      await _supabase.from('resource_reports').insert({
        'resource_id': resourceId,
        'reporter_id': user.id,
        'reason': reason,
        'description': description,
        'status': 'pending',
      });
      return true;
    } catch (e) {
      debugPrint('Error reporting resource: $e');
      return false;
    }
  }
}
