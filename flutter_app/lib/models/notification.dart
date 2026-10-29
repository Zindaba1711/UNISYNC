class InAppNotification {
  final String id;
  final String notificationId;
  final String title;
  final String message;
  final String category;
  final String? destinationRoute;
  final bool isRead;
  final DateTime? readAt;
  final DateTime createdAt;

  InAppNotification({
    required this.id,
    required this.notificationId,
    required this.title,
    required this.message,
    required this.category,
    this.destinationRoute,
    this.isRead = false,
    this.readAt,
    required this.createdAt,
  });

  factory InAppNotification.fromRecipientJson(Map<String, dynamic> json) {
    final notif = json['notifications'] as Map<String, dynamic>? ?? {};
    return InAppNotification(
      id: json['id'] as String,
      notificationId: json['notification_id'] as String,
      title: notif['title'] as String? ?? json['title'] as String? ?? 'Campus Notification',
      message: notif['message'] as String? ?? json['message'] as String? ?? '',
      category: notif['category'] as String? ?? json['category'] as String? ?? 'system',
      destinationRoute: notif['destination_route'] as String?,
      isRead: json['is_read'] as bool? ?? false,
      readAt: json['read_at'] != null ? DateTime.parse(json['read_at'] as String) : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
    );
  }

  InAppNotification copyWith({bool? isRead, DateTime? readAt}) {
    return InAppNotification(
      id: id,
      notificationId: notificationId,
      title: title,
      message: message,
      category: category,
      destinationRoute: destinationRoute,
      isRead: isRead ?? this.isRead,
      readAt: readAt ?? this.readAt,
      createdAt: createdAt,
    );
  }
}
