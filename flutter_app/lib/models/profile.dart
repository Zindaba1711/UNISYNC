class Profile {
  final String id;
  final String fullName;
  final String email;
  final String programme;
  final String role; // 'student', 'admin', 'developer'
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

  bool get isStudent => role == 'student';
  bool get isAdmin => role == 'admin' || role == 'developer';
  bool get isDeveloper => role == 'developer';

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

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'email': email,
      'programme': programme,
      'role': role,
      'is_suspended': isSuspended,
      'avatar_url': avatarUrl,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
