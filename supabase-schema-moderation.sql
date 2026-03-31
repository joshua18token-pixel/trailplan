-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Set Drew as super_admin
UPDATE profiles SET role = 'super_admin' WHERE email = 'agkurz@gmail.com';

-- Update parks table to allow hero_image updates
-- (hero_image column already exists from initial schema)

-- RLS policy for moderators to update parks
CREATE POLICY "Moderators can update parks"
  ON parks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'moderator')
    )
  );

-- RLS policy for moderators to delete comments
CREATE POLICY "Moderators can delete any comment"
  ON park_comments FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'moderator')
    )
  );

-- RLS policy for moderators to update comments (pin/unpin)
CREATE POLICY "Moderators can update any comment"
  ON park_comments FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'moderator')
    )
  );

-- RLS policy for super_admin to update profiles (promote/demote)
CREATE POLICY "Super admin can update any profile"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Allow moderators to delete photos
CREATE POLICY "Moderators can delete any photo"
  ON park_photos FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'moderator')
    )
  );
