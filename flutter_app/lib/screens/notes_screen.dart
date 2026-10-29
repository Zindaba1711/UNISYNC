import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/resource_service.dart';
import '../widgets/resource_card.dart';
import '../widgets/loading_indicator.dart';
import '../widgets/empty_state.dart';
import '../core/constants/constants.dart';

class NotesScreen extends StatefulWidget {
  const NotesScreen({super.key});

  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  final _searchController = TextEditingController();
  String? _selectedCourseId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final res = Provider.of<ResourceService>(context, listen: false);
      res.fetchLectureNotes();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _triggerSearch() {
    final res = Provider.of<ResourceService>(context, listen: false);
    res.fetchLectureNotes(
      searchQuery: _searchController.text,
      courseId: _selectedCourseId,
    );
  }

  @override
  Widget build(BuildContext context) {
    final resourceService = Provider.of<ResourceService>(context);

    return Scaffold(
      body: Column(
        children: [
          // Search & Filter header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onSubmitted: (_) => _triggerSearch(),
                  decoration: InputDecoration(
                    hintText: 'Search notes by title...',
                    prefixIcon: const Icon(Icons.search, color: AppColors.textMuted),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              _triggerSearch();
                            },
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  ),
                ),
                const SizedBox(height: 10),
                // Course Dropdown Filter
                DropdownButtonFormField<String?>(
                  value: _selectedCourseId,
                  isExpanded: true,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.filter_list, color: AppColors.textMuted),
                    contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                  ),
                  hint: const Text('Filter by Course (All)'),
                  items: [
                    const DropdownMenuItem<String?>(
                      value: null,
                      child: Text('All Courses'),
                    ),
                    ...resourceService.courses.map((c) {
                      return DropdownMenuItem<String?>(
                        value: c.id,
                        child: Text('${c.courseCode} — ${c.courseName}', overflow: TextOverflow.ellipsis),
                      );
                    }),
                  ],
                  onChanged: (val) {
                    setState(() => _selectedCourseId = val);
                    _triggerSearch();
                  },
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),

          // Content list
          Expanded(
            child: resourceService.isLoading
                ? const LoadingIndicator(message: 'Retrieving approved lecture notes...')
                : resourceService.lectureNotes.isEmpty
                    ? EmptyState(
                        icon: Icons.menu_book,
                        title: 'No Lecture Notes Found',
                        message: 'Try adjusting your course filter or search keywords.',
                        onRetry: () {
                          _searchController.clear();
                          setState(() => _selectedCourseId = null);
                          _triggerSearch();
                        },
                        retryText: 'Reset Filters',
                      )
                    : RefreshIndicator(
                        onRefresh: () async {
                          _triggerSearch();
                        },
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          itemCount: resourceService.lectureNotes.length,
                          itemBuilder: (ctx, idx) {
                            final note = resourceService.lectureNotes[idx];
                            return ResourceCard(
                              resource: note,
                              onDownload: () async {
                                final url = await resourceService.getDownloadUrl(note.filePath);
                                if (!mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(url != null ? 'Opening document...' : 'Downloading document...'),
                                    backgroundColor: AppColors.primaryBlue,
                                  ),
                                );
                              },
                              onReport: () {
                                _showReportDialog(note.id);
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  void _showReportDialog(String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Report Lecture Note'),
        content: const Text('Flag this note for review by administrators if it is inaccurate or inappropriate.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final service = Provider.of<ResourceService>(context, listen: false);
              await service.reportResource(resourceId: id, reason: 'Reported by Student');
              if (!mounted) return;
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Note reported for administrator review.')),
              );
            },
            child: const Text('Confirm Report'),
          ),
        ],
      ),
    );
  }
}
