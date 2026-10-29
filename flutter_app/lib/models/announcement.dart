class Announcement {
  final String id;
  final String title;
  final String message;
  final String category;
  final String? imagePath;
  final String? authorId;
  final String? authorName;
  final String status; // 'draft', 'published', 'archived'
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

  bool get isPublished => status == 'published';

  factory Announcement.fromJson(Map<String, dynamic> json) {
    String? aName;
    if (json['profiles'] != null && json['profiles'] is Map) {
      aName = json['profiles']['full_name'] as String?;
    } else {
      aName = json['author_name'] as String?;
    }

    return Announcement(
      id: json['id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      category: json['category'] as String? ?? 'General',
      imagePath: json['image_path'] as String?,
      authorId: json['author_id'] as String?,
      authorName: aName ?? 'UniSync Administration',
      status: json['status'] as String? ?? 'published',
      publishedAt: json['published_at'] != null
          ? DateTime.parse(json['published_at'] as String)
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'category': category,
      'image_path': imagePath,
      'author_id': authorId,
      'status': status,
      'published_at': publishedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}
