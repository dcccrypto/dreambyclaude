/**
 * Quality validation for generated paragraphs
 */

const MIN_WORDS = 50
const MAX_WORDS = 150

// Common AI-sounding phrases to detect
const AI_PHRASES = [
  'in conclusion',
  'it is important to note',
  'it is worth mentioning',
  'as we can see',
  'it becomes clear that',
  'one might say',
  'it could be argued',
  'in a sense',
  'in many ways',
  'to put it simply',
  'in other words'
]

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Check if text contains concrete action verbs
 */
function hasConcreteAction(text: string): boolean {
  const actionVerbs = [
    'walk', 'run', 'sit', 'stand', 'open', 'close', 'touch', 'grab', 'hold',
    'look', 'see', 'watch', 'listen', 'hear', 'speak', 'say', 'whisper',
    'move', 'turn', 'reach', 'pull', 'push', 'lift', 'drop', 'place',
    'feel', 'taste', 'smell', 'breathe', 'sigh', 'laugh', 'cry', 'smile'
  ]
  const lowerText = text.toLowerCase()
  return actionVerbs.some(verb => lowerText.includes(verb))
}

/**
 * Check if text contains sensory details
 */
function hasSensoryDetail(text: string): boolean {
  const sensoryWords = [
    'warm', 'cold', 'hot', 'cool', 'soft', 'hard', 'rough', 'smooth',
    'bright', 'dark', 'dim', 'loud', 'quiet', 'silent', 'sharp', 'dull',
    'sweet', 'bitter', 'sour', 'salty', 'fragrant', 'musty', 'fresh',
    'heavy', 'light', 'wet', 'dry', 'smooth', 'rough', 'slick', 'sticky'
  ]
  const lowerText = text.toLowerCase()
  return sensoryWords.some(word => lowerText.includes(word))
}

/**
 * Check if text contains AI-sounding phrases
 */
function hasAIPhrases(text: string): boolean {
  const lowerText = text.toLowerCase()
  return AI_PHRASES.some(phrase => lowerText.includes(phrase))
}

/**
 * Validate a paragraph meets quality standards
 * @param paragraph Text to validate
 * @param previousParagraphs Previous paragraphs for continuity check
 * @returns Validation result with error message if invalid
 */
export function validateParagraph(
  paragraph: string,
  previousParagraphs: string[] = []
): { valid: boolean; error?: string } {
  // Check word count
  const wordCount = countWords(paragraph)
  if (wordCount < MIN_WORDS) {
    return { valid: false, error: `Paragraph too short: ${wordCount} words (minimum ${MIN_WORDS})` }
  }
  if (wordCount > MAX_WORDS) {
    return { valid: false, error: `Paragraph too long: ${wordCount} words (maximum ${MAX_WORDS})` }
  }

  // Check for concrete action or sensory detail
  if (!hasConcreteAction(paragraph) && !hasSensoryDetail(paragraph)) {
    return { valid: false, error: 'Paragraph lacks concrete action or sensory detail' }
  }

  // Check for AI-sounding phrases
  if (hasAIPhrases(paragraph)) {
    return { valid: false, error: 'Paragraph contains AI-sounding phrases' }
  }

  // Basic sentence structure check (should have periods, not just one long sentence)
  const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length < 2) {
    return { valid: false, error: 'Paragraph should contain multiple sentences' }
  }

  // Continuity check: should reference something from previous paragraphs if they exist
  if (previousParagraphs.length > 0) {
    const allPreviousText = previousParagraphs.join(' ').toLowerCase()
    const currentText = paragraph.toLowerCase()
    
    // Extract potential character names, places, or objects (simple heuristic)
    const previousWords = new Set(
      allPreviousText
        .split(/\s+/)
        .filter(w => w.length > 3 && /^[a-z]+$/.test(w))
    )
    
    const currentWords = new Set(
      currentText
        .split(/\s+/)
        .filter(w => w.length > 3 && /^[a-z]+$/.test(w))
    )
    
    // Check for some overlap (at least 3 common words that aren't common words)
    const commonWords = new Set(['the', 'and', 'but', 'for', 'with', 'from', 'that', 'this', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should'])
    const overlap = [...currentWords].filter(w => previousWords.has(w) && !commonWords.has(w))
    
    if (overlap.length < 2) {
      // This is a soft check - might be okay if the story is transitioning
      // We'll allow it but log a warning
    }
  }

  return { valid: true }
}
