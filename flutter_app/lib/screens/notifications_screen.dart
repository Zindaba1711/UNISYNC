import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/notification_service.dart';
import '../widgets/notification_card.dart';
import '../widgets/loading_indicator.dart';
import '../widgets/empty_state.dart';
import '../core/constants/constants.dart';
import '../models/notification.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<NotificationService>(context, listen: false).fetchNotifications();
    });
  }

  void _showNotificationDetail(InAppNotification notif) {
    // Automatically mark as read
    if (!notif.isRead) {
      Provider.of<NotificationService>(context, listen: false).markAsRead(notif.id);
    }

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primaryBlue.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.notifications_active, color: AppColors.primaryBlue, size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                notif.title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.lightBg,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                notif.category.toUpperCase(),
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              notif.message,
              style: const TextStyle(fontSize: 14, color: AppColors.textDark, height: 1.45),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final notifService = Provider.of<NotificationService>(context);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('In-App Notifications'),
        actions: [
          if (notifService.notifications.any((n) => !n.isRead))
            TextButton.icon(
              onPressed: () {
                notifService.markAllAsRead();
              },
              icon: const Icon(Icons.done_all, size: 18, color: AppColors.primaryBlue),
              label: const Text('Mark all read', style: TextStyle(color: AppColors.primaryBlue, fontSize: 13)),
            ),
        ],
      ),
      body: notifService.isLoading
          ? const LoadingIndicator(message: 'Loading notifications...')
          : notifService.notifications.isEmpty
              ? EmptyState(
                  icon: Icons.notifications_none,
                  title: 'No Notifications',
                  message: 'You have no notifications yet. Academic updates and moderation alerts will show here.',
                  onRetry: () => notifService.fetchNotifications(),
                  retryText: 'Refresh',
                )
              : RefreshIndicator(
                  onRefresh: () => notifService.fetchNotifications(),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: notifService.notifications.length,
                    itemBuilder: (ctx, idx) {
                      final item = notifService.notifications[idx];
                      return NotificationCard(
                        notification: item,
                        onTap: () => _showNotificationDetail(item),
                      );
                    },
                  ),
                ),
    );
  }
}
