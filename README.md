# UNISYNC — UNIVERSITY STUDENT PLATFORM & DEVELOPER BACKEND

> **Tagline:** *Your University, Connected.*  
> **Brand Identity:** University Blue (`#1E56A0`), Navy Blue (`#163172`), Light Slate (`#F6F8FD`), White (`#FFFFFF`).  
> **Official US Monogram Logo:** Embedded in app branding assets.

---

## 1. PROJECT OVERVIEW

UniSync is an all-in-one university platform designed to simplify student life by enhancing collaboration, resource sharing, and campus communication. It provides seamless access to lecture notes, past examination papers, announcements, in-app notifications, and academic resources, backed by a dedicated developer administration dashboard and PostgreSQL via Supabase.

### Core Architectural Guarantee:
- **No Student IDs:** In strict compliance with university privacy guidelines, student identification numbers are **never requested, collected, stored, validated, or displayed** anywhere in UniSync. Accounts are identified via authenticated email addresses and Supabase UUIDs.

---

## 2. REPOSITORY & PROJECT STRUCTURE

```
/
├── flutter_app/                      # Native Flutter Android Application
│   ├── android/
│   │   └── app/src/main/AndroidManifest.xml
│   ├── pubspec.yaml                 # Flutter SDK & package dependencies
│   └── lib/
│       ├── main.dart                # App entry point & Supabase initialization
│       ├── core/
│       │   ├── constants/constants.dart
│       │   ├── theme/app_theme.dart # Light & Dark themes
│       │   └── utils/helpers.dart
│       ├── models/
│       │   ├── profile.dart         # No student_id field!
│       │   ├── course.dart
│       │   ├── resource.dart        # Lecture notes & past examination papers
│       │   ├── announcement.dart    # UniSync updates
│       │   └── notification.dart    # In-app notifications
│       ├── services/
│       │   ├── auth_service.dart
│       │   ├── resource_service.dart
│       │   ├── announcement_service.dart
│       │   ├── notification_service.dart
│       │   └── profile_service.dart
│       ├── screens/
│       │   ├── splash_screen.dart
│       │   ├── welcome_screen.dart
│       │   ├── login_screen.dart
│       │   ├── register_screen.dart # Strict NO student ID fields
│       │   ├── dashboard_screen.dart# 5-Tab Navigation + Unread badge
│       │   ├── notes_screen.dart    # Filter by course, search, download
│       │   ├── past_papers_screen.dart # Filter by course & exam year
│       │   ├── upload_resource_screen.dart # Moderation queue upload
│       │   ├── updates_screen.dart  # Announcements
│       │   ├── notifications_screen.dart # Read/unread notifications
│       │   └── profile_screen.dart  # Profile, my uploads, theme toggle
│       └── widgets/
│           ├── resource_card.dart
│           ├── announcement_card.dart
│           ├── notification_card.dart
│           ├── loading_indicator.dart
│           └── empty_state.dart
│
├── supabase/                         # Supabase Backend Configuration
│   ├── schema.sql                   # Complete PostgreSQL schema & RLS policies
│   └── storage_setup.sql            # Storage buckets & access policies
│
├── src/                             # Responsive Developer & Admin Web Dashboard
│   ├── components/
│   │   ├── AdminDashboard.tsx       # 10 Management views
│   │   ├── MobileSimulator.tsx      # Interactive Android phone student simulator
│   │   └── FlutterExplorer.tsx      # Flutter code explorer & setup guides
│   ├── services/
│   │   └── store.ts                 # Unified state engine & Supabase client hook
│   ├── types.ts                     # TypeScript data interfaces
│   └── App.tsx
│
└── README.md                        # Complete documentation & run guides
```

---

## 3. COMPLETED FEATURES LIST

### Student Mobile Application (Flutter)
1. **Student Registration & Authentication:**
   - Registration with Full Name, University Email, Password, and Programme of Study.
   - Strict omission of Student ID fields.
   - Secure login, password visibility toggle, session persistence, and logout.
2. **Student Dashboard:**
   - Welcome banner featuring the student's name and programme.
   - Live counts of available notes and past examination papers.
   - Quick-access shortcuts to browse notes, past papers, and upload documents.
   - Recent announcements and newly published lecture notes previews.
   - 5-Tab Navigation bar (Home, Notes, Past Papers, Updates, Profile).
   - Real-time unread notification count badge in top app bar.
3. **Lecture Notes:**
   - Search by document title.
   - Filter by academic course.
   - View description, uploader name, upload date, file type, and file size.
   - Signed download URL generation.
   - Flag/Report inappropriate content modal.
4. **Past Examination Papers:**
   - Filter by examination year (e.g., 2026, 2025, 2024, 2023, 2022).
   - Filter by course and keyword search.
   - Secure download and reporting.
5. **Academic Resource Uploads & Moderation:**
   - Document upload form (Title, Description, Course, Resource Type, Exam Year, File Selection).
   - Supported extensions: PDF, DOC, DOCX, PPT, PPTX up to 25MB.
   - Moderation workflow: Submissions enter `pending` status until approved by administrators.
6. **UniSync Updates & Announcements:**
   - Real-time campus announcements categorized by Academic, Examinations, and System Notices.
   - Detailed bottom sheet reader.
7. **In-App Notification System:**
   - Notifications screen with category badges (Moderation, Announcement, Academic, System).
   - Unread badges and auto-mark as read on open.
   - One-tap "Mark all as read".
8. **Student Profile & Settings:**
   - Displays full name, email, programme of study, and member since date.
   - My Uploaded Resources with review status tags (`Approved`, `Under Review`, `Rejected`).
   - Edit permitted profile details (Name, Programme). Role changes are server-protected.
   - Light and dark theme support.

### Developer Administration Backend (Web Dashboard)
1. **Overview Dashboard:**
   - Live database statistics: Total Registered Users, Total Approved Resources, Total Pending Uploads, Total Courses, Total Announcements, Total Notifications.
   - Pending review queue shortcut and live administrative audit log feed.
2. **User Management:**
   - Search and filter by role (`student`, `admin`, `developer`).
   - View profile information (strictly no password exposure).
   - Suspend / Reactivate student accounts.
   - Assign user roles (restricted to Developer superadministrators).
3. **Course Management:**
   - Create new academic courses with course codes and department allocations.
   - Archive / Restore courses in the catalog.
4. **Resource Management:**
   - View all uploaded materials with search, course filters, and download access.
   - Remove inappropriate resources.
5. **Upload Reviews (Moderation Queue):**
   - Review pending student submissions.
   - Approve and publish immediately.
   - Reject with custom reason feedback sent to the student via in-app notification.
6. **Announcement Management:**
   - Create, edit, publish, and delete campus notices.
   - Option to automatically trigger in-app notification broadcasts upon publishing.
7. **Notification Management:**
   - Compose custom notifications with category selection.
   - Target all students or filter by academic programme.
   - Mandatory confirmation modal before platform-wide dispatch.
8. **Reports Queue:**
   - Review student-submitted reports regarding incorrect answers or copyright flags.
   - Mark reports as resolved or dismissed with resolution notes.
9. **Platform Settings:**
   - Adjust platform display name, brand tagline, and campus maintenance message.
   - Toggle resource moderation requirement.
   - Configure max file size and allowed extensions.
10. **Activity Logs (Audit Trail):**
    - Immutable audit logs recording actor, action type, entity ID, and timestamp.

---

## 4. DATABASE DESIGN & RLS POLICIES (`supabase/schema.sql`)

The database is built on PostgreSQL with Row Level Security (RLS) enabled across every table:

| Table | Description | RLS Policy Summary |
|---|---|---|
| `public.profiles` | User profiles (No `student_id`!) | Authenticated read; Users update own profile only (cannot modify role); Developers manage all |
| `public.courses` | Academic course catalog | Public/authenticated read; Admins & Developers manage |
| `public.resources` | Lecture notes & past papers | Students read `status = 'approved'` or own uploads; Students insert with `status = 'pending'`; Admins moderate |
| `public.announcements`| Campus updates | Authenticated read `status = 'published'`; Admins & Developers publish and edit |
| `public.notifications` | Broadcast notices | Admins create and dispatch |
| `public.notification_recipients` | Recipient inbox records | Users read and update `is_read` only on records matching their `user_id = auth.uid()` |
| `public.resource_reports` | Student flags & reports | Students insert; Admins review & resolve |
| `public.activity_logs` | Immutable audit trail | Admins read; System/staff insert |
| `public.platform_settings` | Governance configs | Authenticated read; Developers update |

---

## 5. SUPABASE SETUP INSTRUCTIONS

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor &gt; New Query**.
3. Copy and run the entire contents of `supabase/schema.sql`.
4. Copy and run the entire contents of `supabase/storage_setup.sql`.
5. Under **Project Settings &gt; API**, copy your **Project URL** and **anon public key**.
6. Set them in your `.env`:
   ```bash
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```

### Initial Administrator Assignment Procedure
To securely promote the first Developer Superadministrator without exposing public endpoints, run this query in the Supabase SQL Editor:
```sql
UPDATE public.profiles
SET role = 'developer'
WHERE email = 'developer@university.edu';
```

---

## 6. ANDROID STUDIO SETUP INSTRUCTIONS

1. Open **Android Studio**.
2. Select **File &gt; Open...** and choose the `flutter_app/` folder.
3. Open the built-in terminal in Android Studio and run:
   ```bash
   flutter pub get
   ```
4. Start an Android Virtual Device (AVD) from the **Device Manager**.
5. Launch the app in debug mode:
   ```bash
   flutter run --dart-define=SUPABASE_URL=https://your-project-id.supabase.co --dart-define=SUPABASE_ANON_KEY=your-anon-key
   ```
6. To generate the release APK for distribution:
   ```bash
   flutter build apk --release
   ```

---

## 7. LOCAL DEVELOPMENT & WEB DASHBOARD RUN INSTRUCTIONS

The web platform hosts the Developer Admin Dashboard and the interactive Android Simulator:
```bash
# Install dependencies
npm install

# Start local development server on port 3000
npm run dev

# Run TypeScript lint and compile check
npm run lint
npm run build
```

---

## 8. INCOMPLETE FEATURES & EXTERNAL CONFIGURATION REQUIREMENTS

The following items are intentionally excluded from the initial MVP release per Section 21:
- **Firebase Cloud Messaging (FCM):** In-app notifications are fully operational. To enable native lockscreen push alerts, configure `google-services.json` from the Firebase Console and configure the Supabase Edge Function FCM dispatcher.
- **AI Study Assistant:** Deferred to future expansion per MVP brief.
- **Student-to-student Chat & Campus Marketplace:** Deferred to post-MVP roadmap.
