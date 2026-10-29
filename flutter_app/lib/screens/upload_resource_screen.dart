import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../services/resource_service.dart';
import '../core/constants/constants.dart';
import '../core/utils/helpers.dart';

class UploadResourceScreen extends StatefulWidget {
  const UploadResourceScreen({super.key});

  @override
  State<UploadResourceScreen> createState() => _UploadResourceScreenState();
}

class _UploadResourceScreenState extends State<UploadResourceScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  String _resourceType = 'lecture_note'; // 'lecture_note' or 'past_paper'
  String? _selectedCourseId;
  int? _examinationYear = 2026;
  File? _selectedFile;
  String? _selectedFileName;
  int? _selectedFileSize;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: AppConstants.allowedFileExtensions,
    );

    if (result != null && result.files.single.path != null) {
      final file = File(result.files.single.path!);
      final size = await file.length();

      // Check max size
      if (size > AppConstants.maxFileSizeMb * 1024 * 1024) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('File exceeds ${AppConstants.maxFileSizeMb}MB limit.'),
            backgroundColor: AppColors.error,
          ),
        );
        return;
      }

      setState(() {
        _selectedFile = file;
        _selectedFileName = result.files.single.name;
        _selectedFileSize = size;
      });
    }
  }

  Future<void> _submitUpload() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCourseId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a course.')),
      );
      return;
    }
    if (_selectedFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a document file.')),
      );
      return;
    }

    final service = Provider.of<ResourceService>(context, listen: false);
    final success = await service.uploadResource(
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      courseId: _selectedCourseId!,
      resourceType: _resourceType,
      examYear: _resourceType == 'past_paper' ? _examinationYear : null,
      file: _selectedFile!,
      fileName: _selectedFileName!,
    );

    if (!mounted) return;

    if (success) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: AppColors.success),
              SizedBox(width: 8),
              Text('Upload Submitted!'),
            ],
          ),
          content: const Text(
            'Your academic document has been uploaded and submitted for administrator review. Once verified, it will appear in student searches.',
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              child: const Text('Back to Dashboard'),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(service.errorMessage ?? 'Upload failed.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final resourceService = Provider.of<ResourceService>(context);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Upload Academic Resource'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Notice banner
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primaryBlue.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primaryBlue.withOpacity(0.2)),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.info_outline, color: AppColors.primaryBlue, size: 20),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'All uploads undergo review by UniSync administrators before becoming visible to ensure academic accuracy.',
                        style: TextStyle(fontSize: 12, color: AppColors.primaryDark, height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Resource Type Selector
              const Text(
                'Resource Type',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textDark),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: ChoiceChip(
                      label: const Center(child: Text('Lecture Note')),
                      selected: _resourceType == 'lecture_note',
                      onSelected: (val) {
                        if (val) setState(() => _resourceType = 'lecture_note');
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ChoiceChip(
                      label: const Center(child: Text('Past Exam Paper')),
                      selected: _resourceType == 'past_paper',
                      onSelected: (val) {
                        if (val) setState(() => _resourceType = 'past_paper');
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Title
              const Text(
                'Document Title',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textDark),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  hintText: 'e.g. CS204 Week 4 - Graph Algorithms & Traversal',
                  prefixIcon: Icon(Icons.title),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Title is required';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Course
              const Text(
                'Associated Course',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textDark),
              ),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _selectedCourseId,
                isExpanded: true,
                hint: const Text('Select course'),
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.school_outlined),
                ),
                items: resourceService.courses.map((c) {
                  return DropdownMenuItem(
                    value: c.id,
                    child: Text('${c.courseCode} — ${c.courseName}', overflow: TextOverflow.ellipsis),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedCourseId = val),
                validator: (v) => v == null ? 'Please select a course' : null,
              ),
              const SizedBox(height: 16),

              // Examination Year (if past paper)
              if (_resourceType == 'past_paper') ...[
                const Text(
                  'Examination Year',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textDark),
                ),
                const SizedBox(height: 6),
                DropdownButtonFormField<int>(
                  value: _examinationYear,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.calendar_today_outlined),
                  ),
                  items: [2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) {
                    return DropdownMenuItem(value: y, child: Text('$y'));
                  }).toList(),
                  onChanged: (val) => setState(() => _examinationYear = val),
                ),
                const SizedBox(height: 16),
              ],

              // Description
              const Text(
                'Description / Topic Outline',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textDark),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Describe key topics covered, lecturer details, or exam semester...',
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Description is required';
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // File Picker Area
              const Text(
                'Upload Document (PDF, DOC, DOCX, PPT, PPTX up to 25MB)',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textDark),
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: _pickFile,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                  decoration: BoxDecoration(
                    color: AppColors.lightBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _selectedFile != null ? AppColors.primaryBlue : AppColors.borderLight,
                      width: _selectedFile != null ? 1.5 : 1,
                    ),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        _selectedFile != null ? Icons.check_circle : Icons.cloud_upload_outlined,
                        size: 40,
                        color: _selectedFile != null ? AppColors.success : AppColors.primaryBlue,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _selectedFileName ?? 'Tap to select document from device',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: _selectedFileName != null ? AppColors.primaryDark : AppColors.textDark,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      if (_selectedFileSize != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          Helpers.formatBytes(_selectedFileSize),
                          style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Submit Button
              ElevatedButton(
                onPressed: resourceService.isLoading ? null : _submitUpload,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: resourceService.isLoading
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          ),
                          SizedBox(width: 12),
                          Text('Uploading & Submitting for Review...'),
                        ],
                      )
                    : const Text('Submit for Review', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
