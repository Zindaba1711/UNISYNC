import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/profile.dart';

class ProfileService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;

  Profile? _profile;
  bool _isLoading = false;
  String? _errorMessage;

  Profile? get profile => _profile;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadProfile(String userId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _supabase.from('profiles').select().eq('id', userId).single();
      _profile = Profile.fromJson(res);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Edit permitted profile fields (Full Name, Programme). Roles & IDs are strictly server-managed.
  Future<bool> updateProfile({
    required String fullName,
    required String programme,
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null) return false;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _supabase.from('profiles').update({
        'full_name': fullName.trim(),
        'programme': programme.trim(),
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', user.id);

      await loadProfile(user.id);
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
}
