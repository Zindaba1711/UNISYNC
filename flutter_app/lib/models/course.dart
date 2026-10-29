class Course {
  final String id;
  final String courseCode;
  final String courseName;
  final String? department;
  final bool isActive;
  final DateTime createdAt;

  Course({
    required this.id,
    required this.courseCode,
    required this.courseName,
    this.department,
    this.isActive = true,
    required this.createdAt,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['id'] as String,
      courseCode: json['course_code'] as String,
      courseName: json['course_name'] as String,
      department: json['department'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'course_code': courseCode,
      'course_name': courseName,
      'department': department,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
