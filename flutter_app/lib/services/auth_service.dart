import 'package:flutter/material.dart';
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

  AuthService() {
    _currentUser = _supabase.auth.currentUser;
    if (_currentUser != null) {
      fetchCurrentProfile();
    }
    _supabase.auth.onAuthStateChange.listen((data) {
      _currentUser = data.session?.user;
      if (_currentUser != null) {
        fetchCurrentProfile();
      } else {
        _currentProfile = null;
        notifyListeners();
      }
    });
  }

  Future<void> fetchCurrentProfile() async {
    if (_currentUser == null) return;
    try {
      final res = await _supabase
          .from('profiles')
          .select()
          .eq('id', _currentUser!.id)
          .maybeSingle();

      if (res != null) {
        _currentProfile = Profile.fromJson(res);
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching profile: $e');
    }
  }

  // Register student (Notice: Strictly NO student ID collected!)
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
        // Ensure profile row exists in case trigger takes a moment
        await _supabase.from('profiles').upsert({
          'id': user.id,
          'full_name': fullName.trim(),
          'email': email.trim(),
          'programme': programme.trim(),
          'role': 'student',
        });
        await fetchCurrentProfile();
        _isLoading = false;
        notifyListeners();
        return true;
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } on AuthException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Login
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
    } on AuthException catch (e) {
      _errorMessage = e.message;
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

  // Logout
  Future<void> logout() async {
    await _supabase.auth.signOut();
    _currentUser = null;
    _currentProfile = null;
    notifyListeners();
  }

  // Reset Password
  Future<bool> sendPasswordReset(String email) async {
    try {
      await _supabase.auth.resetPasswordForEmail(email.trim());
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
