-- ==============================================================================
-- UNISYNC — SUPABASE STORAGE BUCKETS & ACCESS POLICIES
-- ==============================================================================

-- 1. Create Storage Buckets
-- academic-resources: Private/Controlled bucket for notes and past examination papers.
-- announcement-images: Public bucket for UniSync updates headers and campus images.
-- profile-images: Public/Protected bucket for optional student avatars.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'academic-resources', 
    'academic-resources', 
    false, 
    26214400, -- 25 MB limit
    ARRAY[
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  ),
  (
    'announcement-images', 
    'announcement-images', 
    true, 
    5242880, -- 5 MB limit
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
  ),
  (
    'profile-images', 
    'profile-images', 
    true, 
    3145728, -- 3 MB limit
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- STORAGE ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- ACADEMIC RESOURCES BUCKET
-- Authenticated students and staff can read resources
CREATE POLICY "Authenticated users can download academic resources"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'academic-resources');

-- Authenticated students can upload documents
CREATE POLICY "Authenticated users can upload academic resources"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'academic-resources' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Resource owners and admins can delete or update
CREATE POLICY "Owners and Staff can manage academic resources storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'academic-resources' 
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'developer')
      )
    )
  );

-- ANNOUNCEMENT IMAGES BUCKET
-- Public read access
CREATE POLICY "Anyone can view announcement images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'announcement-images');

-- Only Admins and Developers can upload announcement images
CREATE POLICY "Staff can upload announcement images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'announcement-images' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
  );

CREATE POLICY "Staff can update or delete announcement images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'announcement-images' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
  );
