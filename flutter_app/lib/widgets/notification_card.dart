import 'package:flutter/material.dart';
import '../models/notification.dart';
import '../core/constants/constants.dart';
import '../core/utils/helpers.dart';

class NotificationCard extends StatelessWidget {
  final InAppNotification notification;
  final VoidCallback onTap;

  const NotificationCard({
    super.key,
    required this.notification,
    required this.onTap,
  });

  IconData _getCategoryIcon(String cat) {
    switch (cat.toLowerCase()) {
      case 'announcement':
        return Icons.campaign;
      case 'resource':
        return Icons.menu_book;
      case 'academic':
        return Icons.school;
      case 'moderation':
        return Icons.assignment_turned_in;
      default:
        return Icons.notifications;
    }
  }

  Color _getCategoryColor(String cat) {
    switch (cat.toLowerCase()) {
      case 'announcement':
        return AppColors.primaryBlue;
      case 'resource':
        return const Color(0xFF10B981);
      case 'moderation':
        return const Color(0xFFF59E0B);
      default:
        return AppColors.primaryDark;
    }
  }

  @override
  Widget build(BuildContext context) {
    final catColor = _getCategoryColor(notification.category);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: notification.isRead ? Colors.white : const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: notification.isRead ? AppColors.borderLight : AppColors.primaryBlue.withOpacity(0.3),
          width: notification.isRead ? 1 : 1.2,
        ),
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: catColor.withOpacity(0.12),
            shape: BoxShape.circle,
          ),
          child: Icon(_getCategoryIcon(notification.category), color: catColor, size: 20),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                notification.title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: notification.isRead ? FontWeight.w600 : FontWeight.bold,
                  color: AppColors.textDark,
                ),
              ),
            ),
            if (!notification.isRead)
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.primaryBlue,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              notification.message,
              style: const TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.3),
            ),
            const SizedBox(height: 6),
            Text(
              Helpers.formatDateTime(notification.createdAt),
              style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
            ),
          ],
        ),
      ),
    );
  }
}
