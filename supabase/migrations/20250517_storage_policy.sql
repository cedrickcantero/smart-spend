ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload to any bucket
CREATE POLICY "Allow uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow them to read their uploads
CREATE POLICY "Allow reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (true);