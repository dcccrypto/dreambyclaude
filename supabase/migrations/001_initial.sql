-- Create paragraphs table
CREATE TABLE IF NOT EXISTS paragraphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  drift_level FLOAT NOT NULL,
  sequence SERIAL UNIQUE NOT NULL
);

-- Create story_state table (singleton)
CREATE TABLE IF NOT EXISTS story_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_drift FLOAT NOT NULL DEFAULT 0.0,
  motifs JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_update TIMESTAMP WITH TIME ZONE,
  last_paragraph_id UUID REFERENCES paragraphs(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_paragraphs_sequence ON paragraphs(sequence);
CREATE INDEX IF NOT EXISTS idx_paragraphs_created_at ON paragraphs(created_at);
CREATE INDEX IF NOT EXISTS idx_story_state_id ON story_state(id);

-- Enable Row Level Security (RLS)
ALTER TABLE paragraphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_state ENABLE ROW LEVEL SECURITY;

-- Allow public read access to paragraphs
CREATE POLICY "Allow public read access to paragraphs"
  ON paragraphs FOR SELECT
  USING (true);

-- Allow public read access to story_state
CREATE POLICY "Allow public read access to story_state"
  ON story_state FOR SELECT
  USING (true);

-- Service role can do everything (for API routes)
-- Note: Service role bypasses RLS, so these policies are for explicit control
CREATE POLICY "Service role full access to paragraphs"
  ON paragraphs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to story_state"
  ON story_state FOR ALL
  USING (auth.role() = 'service_role');
