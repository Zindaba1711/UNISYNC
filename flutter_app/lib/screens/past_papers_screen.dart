import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/resource_service.dart';
import '../widgets/resource_card.dart';
import '../widgets/loading_indicator.dart';
import '../widgets/empty_state.dart';
import '../core/constants/constants.dart';

class PastPapersScreen extends StatefulWidget {
  const PastPapersScreen({super.key});

  @override
  State<PastPapersScreen> createState() => _PastPapersScreenState();
}

class _PastPapersScreenState extends State<PastPapersScreen> {
  final _searchController = TextEditingController();
  String? _selectedCourseId;
  int? _selectedYear;

  final List<int> _years = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final res = Provider.of<ResourceService>(context, listen: false);
      res.fetchPastPapers();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _triggerSearch() {
    final res = Provider.of<ResourceService>(context, listen: false);
    res.fetchPastPapers(
      searchQuery: _searchController.text,
      courseId: _selectedCourseId,
      examYear: _selectedYear,
    );
  }

  @override
  Widget build(BuildContext context) {
    final resourceService = Provider.of<ResourceService>(context);

    return Scaffold(
      body: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onSubmitted: (_) => _triggerSearch(),
                  decoration: InputDecoration(
                    hintText: 'Search past examination papers...',
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
                Row(
                  children: [
                    // Course Filter
                    Expanded(
                      flex: 3,
                      child: DropdownButtonFormField<String?>(
                        value: _selectedCourseId,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.school, size: 18, color: AppColors.textMuted),
                          contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                        ),
                        hint: const Text('All Courses', style: TextStyle(fontSize: 13)),
                        items: [
                          const DropdownMenuItem<String?>(
                            value: null,
                            child: Text('All Courses', style: TextStyle(fontSize: 13)),
                          ),
                          ...resourceService.courses.map((c) {
                            return DropdownMenuItem<String?>(
                              value: c.id,
                              child: Text(c.courseCode, style: const TextStyle(fontSize: 13)),
                            );
                          }),
                        ],
                        onChanged: (val) {
                          setState(() => _selectedCourseId = val);
                          _triggerSearch();
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Year Filter
                    Expanded(
                      flex: 2,
                      child: DropdownButtonFormField<int?>(
                        value: _selectedYear,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.calendar_today, size: 16, color: AppColors.textMuted),
                          contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                        ),
                        hint: const Text('Year', style: TextStyle(fontSize: 13)),
                        items: [
                          const DropdownMenuItem<int?>(
                            value: null,
                            child: Text('All Years', style: TextStyle(fontSize: 13)),
                          ),
                          ..._years.map((y) {
                            return DropdownMenuItem<int?>(
                              value: y,
                              child: Text('$y', style: const TextStyle(fontSize: 13)),
                            );
                          }),
                        ],
                        onChanged: (val) {
                          setState(() => _selectedYear = val);
                          _triggerSearch();
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),

          Expanded(
            child: resourceService.isLoading
                ? const LoadingIndicator(message: 'Loading examination papers...')
                : resourceService.pastPapers.isEmpty
                    ? EmptyState(
                        icon: Icons.history_edu,
                        title: 'No Past Examination Papers Found',
                        message: 'Try selecting a different course or examination year.',
                        onRetry: () {
                          _searchController.clear();
                          setState(() {
                            _selectedCourseId = null;
                            _selectedYear = null;
                          });
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
                          itemCount: resourceService.pastPapers.length,
                          itemBuilder: (ctx, idx) {
                            final paper = resourceService.pastPapers[idx];
                            return ResourceCard(
                              resource: paper,
                              onDownload: () async {
                                final url = await resourceService.getDownloadUrl(paper.filePath);
                                if (!mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(url != null ? 'Opening examination paper...' : 'Downloading paper...'),
                                    backgroundColor: AppColors.primaryBlue,
                                  ),
                                );
                              },
                              onReport: () {
                                _showReportDialog(paper.id);
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
        title: const Text('Report Past Examination Paper'),
        content: const Text('Flag this paper for administrator verification if the year, course, or content is incorrect.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final service = Provider.of<ResourceService>(context, listen: false);
              await service.reportResource(resourceId: id, reason: 'Reported by Student');
              if (!mounted) return;
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Report submitted for review.')),
              );
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }
}
