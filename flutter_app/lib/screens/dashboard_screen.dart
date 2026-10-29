import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/resource_service.dart';
import '../services/announcement_service.dart';
import '../services/notification_service.dart';
import '../core/constants/constants.dart';
import 'notes_screen.dart';
import 'past_papers_screen.dart';
import 'updates_screen.dart';
import 'profile_screen.dart';
import 'notifications_screen.dart';
import 'upload_resource_screen.dart';
import '../widgets/resource_card.dart';
import '../widgets/announcement_card.dart';
import '../widgets/loading_indicator.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadDashboardData();
    });
  }

  void _loadDashboardData() {
    final resourceService = Provider.of<ResourceService>(context, listen: false);
    final announcementService = Provider.of<AnnouncementService>(context, listen: false);
    final notifService = Provider.of<NotificationService>(context, listen: false);

    resourceService.fetchCourses();
    resourceService.fetchLectureNotes();
    resourceService.fetchPastPapers();
    announcementService.fetchAnnouncements();
    notifService.fetchNotifications();
  }

  @override
  Widget build(BuildContext context) {
    final notifService = Provider.of<NotificationService>(context);

    final List<Widget> pages = [
      _buildHomeView(),
      const NotesScreen(),
      const PastPapersScreen(),
      const UpdatesScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.primaryBlue,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'US',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white),
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              AppConstants.appName,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined, size: 24),
                tooltip: 'Notifications',
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                  );
                },
              ),
              if (notifService.unreadCount > 0)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.error,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '${notifService.unreadCount}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      floatingActionButton: _currentIndex == 0 || _currentIndex == 1 || _currentIndex == 2
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const UploadResourceScreen()),
                );
              },
              backgroundColor: AppColors.primaryBlue,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.upload_file),
              label: const Text('Upload Resource'),
            )
          : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        backgroundColor: Colors.white,
        elevation: 8,
        indicatorColor: AppColors.primaryBlue.withOpacity(0.12),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: AppColors.primaryBlue),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book, color: AppColors.primaryBlue),
            label: 'Notes',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_outlined),
            selectedIcon: Icon(Icons.assignment, color: AppColors.primaryBlue),
            label: 'Past Papers',
          ),
          NavigationDestination(
            icon: Icon(Icons.campaign_outlined),
            selectedIcon: Icon(Icons.campaign, color: AppColors.primaryBlue),
            label: 'Updates',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: AppColors.primaryBlue),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildHomeView() {
    final authService = Provider.of<AuthService>(context);
    final resourceService = Provider.of<ResourceService>(context);
    final announcementService = Provider.of<AnnouncementService>(context);
    final studentName = authService.currentProfile?.fullName ?? 'Student';
    final programme = authService.currentProfile?.programme ?? 'University Student';

    return RefreshIndicator(
      onRefresh: () async {
        _loadDashboardData();
      },
      child: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          // Welcome Banner
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryDark, AppColors.primaryBlue],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryDark.withOpacity(0.2),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome, $studentName 👋',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  programme,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFFDCE7F9),
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Available Notes',
                              style: TextStyle(fontSize: 11, color: Color(0xFFE2E8F0)),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${resourceService.lectureNotes.length}',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Past Exam Papers',
                              style: TextStyle(fontSize: 11, color: Color(0xFFE2E8F0)),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${resourceService.pastPapers.length}',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),

          // Quick Access Actions
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildQuickAction(
                  icon: Icons.menu_book,
                  label: 'Browse Notes',
                  color: AppColors.primaryBlue,
                  onTap: () => setState(() => _currentIndex = 1),
                ),
                const SizedBox(width: 10),
                _buildQuickAction(
                  icon: Icons.history_edu,
                  label: 'Past Papers',
                  color: const Color(0xFFD97706),
                  onTap: () => setState(() => _currentIndex = 2),
                ),
                const SizedBox(width: 10),
                _buildQuickAction(
                  icon: Icons.upload_file,
                  label: 'Upload File',
                  color: const Color(0xFF10B981),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const UploadResourceScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Recent UniSync Announcements Section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Latest UniSync Updates',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark,
                  ),
                ),
                TextButton(
                  onPressed: () => setState(() => _currentIndex = 3),
                  child: const Text('View All', style: TextStyle(color: AppColors.primaryBlue)),
                ),
              ],
            ),
          ),
          if (announcementService.isLoading)
            const LoadingIndicator(message: 'Loading updates...')
          else if (announcementService.announcements.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Text('No announcements posted yet.', style: TextStyle(color: AppColors.textMuted)),
            )
          else
            ...announcementService.announcements.take(2).map(
                  (a) => AnnouncementCard(
                    announcement: a,
                    onTap: () => setState(() => _currentIndex = 3),
                  ),
                ),

          const SizedBox(height: 20),

          // Recent Academic Resources Section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recently Added Lecture Notes',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark,
                  ),
                ),
                TextButton(
                  onPressed: () => setState(() => _currentIndex = 1),
                  child: const Text('View All', style: TextStyle(color: AppColors.primaryBlue)),
                ),
              ],
            ),
          ),
          if (resourceService.isLoading)
            const LoadingIndicator(message: 'Loading resources...')
          else if (resourceService.lectureNotes.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Text('No approved lecture notes yet.', style: TextStyle(color: AppColors.textMuted)),
            )
          else
            ...resourceService.lectureNotes.take(3).map(
                  (res) => ResourceCard(
                    resource: res,
                    onDownload: () async {
                      final url = await resourceService.getDownloadUrl(res.filePath);
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(url != null ? 'Opening document...' : 'Preparing file...'),
                          backgroundColor: AppColors.primaryBlue,
                        ),
                      );
                    },
                    onReport: () {
                      _showReportModal(res.id);
                    },
                  ),
                ),
        ],
      ),
    );
  }

  Widget _buildQuickAction({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textDark),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showReportModal(String resourceId) {
    String selectedReason = 'Incorrect Content';
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Report Resource'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Why are you reporting this document?', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: selectedReason,
              decoration: const InputDecoration(labelText: 'Reason'),
              items: const [
                DropdownMenuItem(value: 'Incorrect Content', child: Text('Incorrect Content')),
                DropdownMenuItem(value: 'Inappropriate Content', child: Text('Inappropriate Content')),
                DropdownMenuItem(value: 'Corrupted File', child: Text('Corrupted File')),
                DropdownMenuItem(value: 'Copyright Infringement', child: Text('Copyright Infringement')),
                DropdownMenuItem(value: 'Other', child: Text('Other Issue')),
              ],
              onChanged: (v) {
                if (v != null) selectedReason = v;
              },
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              maxLines: 2,
              decoration: const InputDecoration(
                hintText: 'Additional details (optional)',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final service = Provider.of<ResourceService>(context, listen: false);
              await service.reportResource(
                resourceId: resourceId,
                reason: selectedReason,
                description: reasonController.text,
              );
              if (!mounted) return;
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Report submitted. Administrators will review this resource.'),
                  backgroundColor: AppColors.primaryBlue,
                ),
              );
            },
            child: const Text('Submit Report'),
          ),
        ],
      ),
    );
  }
}
