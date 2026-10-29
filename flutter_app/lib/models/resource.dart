class AcademicResource {
  final String id;
  final String title;
  final String description;
  final String resourceType; // 'lecture_note' or 'past_paper'
  final String courseId;
  final String filePath;
  final String? fileName;
  final int? fileSize;
  final String? fileType;
  final String uploadedBy;
  final int? examinationYear;
  final String status; // 'pending', 'approved', 'rejected'
  final String? rejectionReason;
  final int downloadCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Joined fields for display
  final String? courseCode;
  final String? courseName;
  final String? uploaderName;

  AcademicResource({
    required this.id,
    required this.title,
    required this.description,
    required this.resourceType,
    required this.courseId,
    required this.filePath,
    this.fileName,
    this.fileSize,
    this.fileType,
    required this.uploadedBy,
    this.examinationYear,
    this.status = 'pending',
    this.rejectionReason,
    this.downloadCount = 0,
    required this.createdAt,
    required this.updatedAt,
    this.courseCode,
    this.courseName,
    this.uploaderName,
  });

  bool get isLectureNote => resourceType == 'lecture_note';
  bool get isPastPaper => resourceType == 'past_paper';
  bool get isApproved => status == 'approved';
  bool get isPending => status == 'pending';
  bool get isRejected => status == 'rejected';

  factory AcademicResource.fromJson(Map<String, dynamic> json) {
    String? cCode;
    String? cName;
    if (json['courses'] != null && json['courses'] is Map) {
      cCode = json['courses']['course_code'] as String?;
      cName = json['courses']['course_name'] as String?;
    } else {
      cCode = json['course_code'] as String?;
      cName = json['course_name'] as String?;
    }

    String? uName;
    if (json['profiles'] != null && json['profiles'] is Map) {
      uName = json['profiles']['full_name'] as String?;
    } else {
      uName = json['uploader_name'] as String?;
    }

    return AcademicResource(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      resourceType: json['resource_type'] as String,
      courseId: json['course_id'] as String,
      filePath: json['file_path'] as String,
      fileName: json['file_name'] as String?,
      fileSize: json['file_size'] as int?,
      fileType: json['file_type'] as String?,
      uploadedBy: json['uploaded_by'] as String,
      examinationYear: json['examination_year'] as int?,
      status: json['status'] as String? ?? 'pending',
      rejectionReason: json['rejection_reason'] as String?,
      downloadCount: json['download_count'] as int? ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
      courseCode: cCode,
      courseName: cName,
      uploaderName: uName,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'resource_type': resourceType,
      'course_id': courseId,
      'file_path': filePath,
      'file_name': fileName,
      'file_size': fileSize,
      'file_type': fileType,
      'uploaded_by': uploadedBy,
      'examination_year': examinationYear,
      'status': status,
      'rejection_reason': rejectionReason,
      'download_count': downloadCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
