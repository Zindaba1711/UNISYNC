import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/notification.dart';

class NotificationService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;

  List<InAppNotification> _notifications = [];
  bool _isLoading = false;
  int _unreadCount = 0;

  List<InAppNotification> get notifications => _notifications;
  bool get isLoading => _isLoading;
  int get unreadCount => _unreadCount;

  Future<void> fetchNotifications() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;

    _isLoading = true;
    notifyListeners();

    try {
      final res = await _supabase
          .from('notification_recipients')
          .select('*, notifications:notification_id(*)')
          .eq('user_id', user.id)
          .order('created_at', ascending: false);

      _notifications = (res as List)
          .map((e) => InAppNotification.fromRecipientJson(e))
          .toList();

      _unreadCount = _notifications.where((n) => !n.isRead).length;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(String recipientId) async {
    try {
      await _supabase
          .from('notification_recipients')
          .update({'is_read': true, 'read_at': DateTime.now().toIso8601String()})
          .eq('id', recipientId);

      final index = _notifications.indexWhere((n) => n.id == recipientId);
      if (index != -1) {
        _notifications[index] = _notifications[index].copyWith(
          isRead: true,
          readAt: DateTime.now(),
        );
        _unreadCount = _notifications.where((n) => !n.isRead).length;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error marking notification as read: $e');
    }
  }

  Future<void> markAllAsRead() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;

    try {
      await _supabase
          .from('notification_recipients')
          .update({'is_read': true, 'read_at': DateTime.now().toIso8601String()})
          .eq('user_id', user.id)
          .eq('is_read', false);

      _notifications = _notifications
          .map((n) => n.copyWith(isRead: true, readAt: DateTime.now()))
          .toList();
      _unreadCount = 0;
      notifyListeners();
    } catch (e) {
      debugPrint('Error marking all as read: $e');
    }
  }
}
