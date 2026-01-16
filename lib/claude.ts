import { getDriftDescription } from './drift'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export interface GenerateParagraphParams {
  currentDrift: number
  motifs: string[]
  previousParagraphs: string[]
  lastParagraph: string
}

/**
 * Generate a new paragraph using Claude
 */
export async function generateParagraph(
  params: GenerateParagraphParams
): Promise<string> {
  const { currentDrift, motifs, previousParagraphs, lastParagraph } = params
  
  const driftDescription = getDriftDescription(currentDrift)
  
  // Build context from recent paragraphs (last 3-5 for continuity)
  const recentParagraphs = previousParagraphs.slice(-5).join('\n\n')
  
  const systemPrompt = `You are continuing a literary story that gradually becomes dreamlike over time. The story is a single, continuous narrative shared by all readers.

Current drift level: ${currentDrift.toFixed(2)} (${driftDescription})

Recurring motifs that should appear throughout the story: ${motifs.join(', ')}

CRITICAL RULES:
- Write exactly ONE paragraph that MUST be between 80-120 words. This is mandatory - count your words carefully.
- Include at least one concrete action or sensory detail
- Continue directly from the previous paragraph
- Maintain continuity with characters, places, and emotional tone
- As drift increases, introduce subtle dreamlike elements gradually
- Never conclude the story
- Never explain the concept or reference being an AI
- Write in third person
- Use literary, intentional prose
- Avoid abstract filler or excessive metaphor stacking
- Keep sentences clear and readable
- The surrealism should emerge through events and perception, not language excess

WORD COUNT REQUIREMENT: Your paragraph MUST contain at least 80 words and no more than 120 words. Paragraphs shorter than 80 words will be rejected.

${currentDrift > 0.3 ? `Note: The story is becoming more dreamlike. Introduce subtle distortions, unexpected connections, or altered perceptions, but maintain readability and concrete detail.` : ''}
${currentDrift > 0.6 ? `Note: The story is now strongly dreamlike. Events may be surreal, but each paragraph must still contain concrete actions and sensory details. Maintain the illusion of a coherent narrative.` : ''}`

  const userPrompt = `Continue the story with one paragraph. Here is the most recent paragraph:

${lastParagraph}

${recentParagraphs.length > 0 ? `\n\nPrevious context:\n${recentParagraphs}` : ''}

Write the next paragraph now.`

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamclaude.vercel.app',
        'X-Title': 'Dream by Claude'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        max_tokens: 400,
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', response.status, errorData)
      throw new Error(`OpenRouter API error: ${response.status} ${errorData}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Unexpected response format from OpenRouter')
    }

    // Extract just the paragraph (remove any quotes or formatting)
    let paragraph = data.choices[0].message.content.trim()
    
    // Remove quotes if the entire response is quoted
    if ((paragraph.startsWith('"') && paragraph.endsWith('"')) ||
        (paragraph.startsWith("'") && paragraph.endsWith("'"))) {
      paragraph = paragraph.slice(1, -1).trim()
    }
    
    return paragraph
  } catch (error) {
    console.error('Error generating paragraph:', error)
    throw error
  }
}
