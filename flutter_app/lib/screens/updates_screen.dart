import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/announcement_service.dart';
import '../widgets/announcement_card.dart';
import '../widgets/loading_indicator.dart';
import '../widgets/empty_state.dart';
import '../core/constants/constants.dart';
import '../core/utils/helpers.dart';
import '../models/announcement.dart';

class UpdatesScreen extends StatefulWidget {
  const UpdatesScreen({super.key});

  @override
  State<UpdatesScreen> createState() => _UpdatesScreenState();
}

class _UpdatesScreenState extends State<UpdatesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AnnouncementService>(context, listen: false).fetchAnnouncements();
    });
  }

  void _showAnnouncementDetails(Announcement a) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.4,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.borderLight,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryBlue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  a.category.toUpperCase(),
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryBlue),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                a.title,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textDark),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.person_pin, size: 16, color: AppColors.primaryDark),
                  const SizedBox(width: 6),
                  Text(
                    a.authorName ?? 'UniSync Administration',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primaryDark),
                  ),
                  const Spacer(),
                  Text(
                    Helpers.formatDate(a.publishedAt ?? a.createdAt),
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(color: AppColors.borderLight),
              const SizedBox(height: 16),
              Text(
                a.message,
                style: const TextStyle(fontSize: 15, color: AppColors.textDark, height: 1.55),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<AnnouncementService>(context);

    return Scaffold(
      body: service.isLoading
          ? const LoadingIndicator(message: 'Loading UniSync announcements...')
          : service.announcements.isEmpty
              ? EmptyState(
                  icon: Icons.campaign_outlined,
                  title: 'No Updates at Present',
                  message: 'Official announcements and notices will appear here once published.',
                  onRetry: () => service.fetchAnnouncements(),
                  retryText: 'Refresh Updates',
                )
              : RefreshIndicator(
                  onRefresh: () => service.fetchAnnouncements(),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    itemCount: service.announcements.length,
                    itemBuilder: (ctx, idx) {
                      final item = service.announcements[idx];
                      return AnnouncementCard(
                        announcement: item,
                        onTap: () => _showAnnouncementDetails(item),
                      );
                    },
                  ),
                ),
    );
  }
}
