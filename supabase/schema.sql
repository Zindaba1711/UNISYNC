-- ==============================================================================
-- UNISYNC — UNIVERSITY STUDENT PLATFORM & DEVELOPER ADMINISTRATION BACKEND
-- PostgreSQL Schema & Row Level Security (RLS) Policies for Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
CREATE TYPE user_role AS ENUM ('student', 'admin', 'developer');
CREATE TYPE resource_type AS ENUM ('lecture_note', 'past_paper');
CREATE TYPE resource_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE publication_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE notification_status AS ENUM ('draft', 'scheduled', 'sent', 'cancelled');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- 3. PROFILES TABLE
-- Note: Strict compliance with requirement: NO student_id column!
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    programme TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'developer')),
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code TEXT NOT NULL UNIQUE,
    course_name TEXT NOT NULL,
    department TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. ACADEMIC RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('lecture_note', 'past_paper')),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    examination_year INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. ANNOUNCEMENTS TABLE (UniSync Updates)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    image_path TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'academic' CHECK (category IN ('announcement', 'resource', 'academic', 'system', 'moderation')),
    target_programme TEXT, -- NULL means platform-wide (all students)
    destination_route TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. NOTIFICATION RECIPIENTS TABLE
CREATE TABLE IF NOT EXISTS public.notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    delivery_status TEXT NOT NULL DEFAULT 'delivered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_notification_user UNIQUE (notification_id, user_id)
);

-- 9. RESOURCE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.resource_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Insert Default Platform Settings
INSERT INTO public.platform_settings (key, value, description)
VALUES 
  ('platform_name', '"UniSync"', 'Platform display name'),
  ('tagline', '"Your University, Connected."', 'Platform brand tagline'),
  ('maintenance_mode', 'false', 'Enable campus maintenance lock notice'),
  ('maintenance_message', '"UniSync is undergoing scheduled maintenance. Services will resume shortly."', 'Notice banner text'),
  ('moderation_enabled', 'true', 'Require administrator approval before uploads appear in student searches'),
  ('max_file_size_mb', '25', 'Maximum allowed single document upload size in megabytes'),
  ('allowed_file_types', '["pdf", "doc", "docx", "ppt", "pptx"]', 'Permitted file extensions for notes and past papers')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_course ON public.resources(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_exam_year ON public.resources(examination_year);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user ON public.notification_recipients(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_resource_reports_status ON public.resource_reports(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_dev()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'developer')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_developer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'developer'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- PROFILES POLICIES
-- Everyone authenticated can view profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile (and CANNOT change their role)
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

-- Developers and Admins can update any profile (e.g. role change, suspension)
CREATE POLICY "Developers can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_developer());

-- COURSES POLICIES
-- All authenticated users can view active courses
CREATE POLICY "Courses are viewable by authenticated users"
  ON public.courses FOR SELECT
  TO authenticated
  USING (true);

-- Admins and Developers can insert, update, delete courses
CREATE POLICY "Admins and Developers can manage courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (public.is_admin_or_dev());

-- RESOURCES POLICIES
-- Students can only view APPROVED resources OR resources they uploaded themselves
CREATE POLICY "Students can view approved resources and their own uploads"
  ON public.resources FOR SELECT
  TO authenticated
  USING (
    status = 'approved' 
    OR uploaded_by = auth.uid() 
    OR public.is_admin_or_dev()
  );

-- Authenticated students can submit resources (always starts in pending status)
CREATE POLICY "Authenticated users can upload resources"
  ON public.resources FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() 
    AND (status = 'pending' OR public.is_admin_or_dev())
  );

-- Users can edit or delete their own resource ONLY while pending
CREATE POLICY "Users can update their own pending resources"
  ON public.resources FOR UPDATE
  TO authenticated
  USING (
    (uploaded_by = auth.uid() AND status = 'pending')
    OR public.is_admin_or_dev()
  );

-- Admins and Developers can manage and moderate all resources
CREATE POLICY "Admins and Developers can moderate resources"
  ON public.resources FOR ALL
  TO authenticated
  USING (public.is_admin_or_dev());

-- ANNOUNCEMENTS POLICIES
-- Authenticated users can view published announcements
CREATE POLICY "Users can view published announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    status = 'published' 
    OR public.is_admin_or_dev()
  );

-- Admins and Developers can manage announcements
CREATE POLICY "Admins and Developers can manage announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (public.is_admin_or_dev());

-- NOTIFICATIONS POLICIES
-- Students can only view their own recipient notifications
CREATE POLICY "Users can view their notifications"
  ON public.notification_recipients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_dev());

-- Students can mark only their own notifications as read
CREATE POLICY "Users can update their own notification read status"
  ON public.notification_recipients FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Only Admins and Developers can view raw notification broadcasts and dispatch them
CREATE POLICY "Admins and Developers can manage notification broadcasts"
  ON public.notifications FOR ALL
  TO authenticated
  USING (public.is_admin_or_dev());

CREATE POLICY "Admins and Developers can insert recipients"
  ON public.notification_recipients FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_dev());

-- RESOURCE REPORTS POLICIES
-- Students can submit reports
CREATE POLICY "Authenticated users can submit reports"
  ON public.resource_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Reporters can view their own reports
CREATE POLICY "Users can view their submitted reports"
  ON public.resource_reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid() OR public.is_admin_or_dev());

-- Admins and Developers can manage and resolve reports
CREATE POLICY "Admins and Developers can manage reports"
  ON public.resource_reports FOR ALL
  TO authenticated
  USING (public.is_admin_or_dev());

-- ACTIVITY LOGS POLICIES
-- Only Admins and Developers can view activity logs
CREATE POLICY "Admins and Developers can view activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.is_admin_or_dev());

-- Only system/authenticated staff can insert activity logs; modification is prohibited
CREATE POLICY "Staff can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_dev());

-- PLATFORM SETTINGS POLICIES
CREATE POLICY "Platform settings are viewable by authenticated users"
  ON public.platform_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Developers can manage platform settings"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (public.is_developer());

-- ==============================================================================
-- DATABASE TRIGGERS & AUTOMATION
-- ==============================================================================

-- 1. Automatic Profile Creation on auth.users Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, programme, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'programme', 'Computer Science'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Audit Activity Logger Function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
DECLARE
  v_actor_name TEXT;
BEGIN
  SELECT full_name INTO v_actor_name FROM public.profiles WHERE id = auth.uid();
  INSERT INTO public.activity_logs (actor_id, actor_name, action, entity_type, entity_id, details)
  VALUES (auth.uid(), COALESCE(v_actor_name, 'System'), p_action, p_entity_type, p_entity_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Stored Procedure: Dispatch Notification to Target Recipients
CREATE OR REPLACE FUNCTION public.dispatch_notification(
  p_notification_id UUID,
  p_target_programme TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  IF p_target_programme IS NULL OR p_target_programme = '' OR p_target_programme = 'ALL' THEN
    -- Broadcast to all active students
    INSERT INTO public.notification_recipients (notification_id, user_id)
    SELECT p_notification_id, id FROM public.profiles
    WHERE is_suspended = false
    ON CONFLICT (notification_id, user_id) DO NOTHING;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
  ELSE
    -- Target specific programme
    INSERT INTO public.notification_recipients (notification_id, user_id)
    SELECT p_notification_id, id FROM public.profiles
    WHERE programme = p_target_programme AND is_suspended = false
    ON CONFLICT (notification_id, user_id) DO NOTHING;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  UPDATE public.notifications
  SET status = 'sent', sent_at = now()
  WHERE id = p_notification_id;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- INITIAL SEED DATA FOR COURSES & PLATFORM SETUP
-- ==============================================================================
INSERT INTO public.courses (course_code, course_name, department) VALUES
  ('CS101', 'Introduction to Computer Science & Algorithms', 'School of Computing'),
  ('CS204', 'Data Structures and Algorithms', 'School of Computing'),
  ('SE302', 'Software Engineering Principles & Architecture', 'School of Computing'),
  ('DB201', 'Database Systems & SQL Design', 'School of Computing'),
  ('NET305', 'Computer Networks & Distributed Systems', 'School of Computing'),
  ('ENG101', 'Engineering Mathematics I', 'School of Engineering'),
  ('BUS201', 'Principles of Management & Entrepreneurship', 'School of Business'),
  ('LAW110', 'Legal Foundations & Constitutional Law', 'Faculty of Law'),
  ('MED105', 'Human Anatomy and Physiology', 'School of Medicine')
ON CONFLICT (course_code) DO NOTHING;
