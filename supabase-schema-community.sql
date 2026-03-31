-- Park Comments (Discussion Posts)
CREATE TABLE IF NOT EXISTS park_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id TEXT NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  photo_url TEXT, -- Optional photo attachment
  pinned BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Park Photos (Gallery)
CREATE TABLE IF NOT EXISTS park_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id TEXT NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment Likes
CREATE TABLE IF NOT EXISTS park_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES park_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- RLS Policies for park_comments
ALTER TABLE park_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON park_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON park_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON park_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON park_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for park_photos
ALTER TABLE park_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos"
  ON park_photos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload photos"
  ON park_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
  ON park_photos FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for park_comment_likes
ALTER TABLE park_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON park_comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON park_comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON park_comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_park_comments_park_id ON park_comments(park_id);
CREATE INDEX idx_park_comments_pinned ON park_comments(pinned) WHERE pinned = true;
CREATE INDEX idx_park_photos_park_id ON park_photos(park_id);
CREATE INDEX idx_park_comment_likes_comment_id ON park_comment_likes(comment_id);

-- Function to update like count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE park_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE park_comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_like_count_trigger
AFTER INSERT OR DELETE ON park_comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();
