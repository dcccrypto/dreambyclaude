-- Seed initial story state with motifs
-- This will only run if story_state is empty
INSERT INTO story_state (id, current_drift, motifs, last_update)
SELECT 
  gen_random_uuid(),
  0.0,
  '["a door", "a sound", "a name", "a recurring place"]'::jsonb,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM story_state);

-- Seed with first paragraph (realistic literary fiction)
-- This will only run if paragraphs table is empty
INSERT INTO paragraphs (content, drift_level, sequence)
SELECT 
  'The morning light filtered through the window, casting long shadows across the wooden floor. She stood by the door, listening to the distant sound of traffic, her hand resting on the cool brass handle. The name on the envelope felt heavy in her pocket, a weight she had carried for days. Outside, the city moved in its usual rhythm, unaware of the small moment of decision happening in this quiet room.',
  0.0,
  1
WHERE NOT EXISTS (SELECT 1 FROM paragraphs);

-- Update story_state with the first paragraph
UPDATE story_state
SET last_paragraph_id = (SELECT id FROM paragraphs WHERE sequence = 1 LIMIT 1),
    last_update = NOW()
WHERE last_paragraph_id IS NULL;
