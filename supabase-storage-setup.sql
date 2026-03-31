-- Create storage bucket for park photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('park-photos', 'park-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view park photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'park-photos');

CREATE POLICY "Authenticated users can upload park photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'park-photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own park photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'park-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
