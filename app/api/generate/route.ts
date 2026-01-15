import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateParagraph } from '@/lib/claude'
import { validateParagraph } from '@/lib/validation'
import { calculateNextDrift } from '@/lib/drift'

const MIN_INTERVAL_MINUTES = 5
const MAX_INTERVAL_MINUTES = 10

/**
 * Verify the request is from a cron job
 */
function verifyCronRequest(request: NextRequest): boolean {
  // Check for Vercel Cron secret header
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET
  
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true
  }
  
  // Also allow Vercel Cron's special header
  const vercelCron = request.headers.get('x-vercel-cron')
  if (vercelCron) {
    return true
  }
  
  // For development, allow if CRON_SECRET is not set (but warn)
  if (!cronSecret) {
    console.warn('CRON_SECRET not set - allowing request (development mode)')
    return true
  }
  
  return false
}

/**
 * Check if enough time has passed since last update
 */
function shouldGenerate(lastUpdate: string | null): boolean {
  if (!lastUpdate) {
    return true // No previous update, generate immediately
  }
  
  const lastUpdateTime = new Date(lastUpdate).getTime()
  const now = Date.now()
  const minutesSinceUpdate = (now - lastUpdateTime) / (1000 * 60)
  
  // Use random interval between min and max
  const requiredInterval = 
    MIN_INTERVAL_MINUTES + 
    Math.random() * (MAX_INTERVAL_MINUTES - MIN_INTERVAL_MINUTES)
  
  return minutesSinceUpdate >= requiredInterval
}

export async function POST(request: NextRequest) {
  // Verify this is a cron request
  if (!verifyCronRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Fetch current story state, or create it if it doesn't exist
    let { data: state, error: stateError } = await supabaseAdmin
      .from('story_state')
      .select('*')
      .single()

    if (stateError || !state) {
      // Initialize story state if it doesn't exist
      const { data: newState, error: createError } = await supabaseAdmin
        .from('story_state')
        .insert({
          current_drift: 0.0,
          motifs: ['a door', 'a sound', 'a name', 'a recurring place'],
          last_update: null
        })
        .select()
        .single()

      if (createError || !newState) {
        console.error('Error creating story state:', createError)
        return NextResponse.json(
          { error: 'Failed to initialize story state' },
          { status: 500 }
        )
      }
      state = newState
    }

    // Check if enough time has passed
    if (!shouldGenerate(state.last_update)) {
      return NextResponse.json({
        message: 'Not enough time has passed since last update',
        skipped: true
      })
    }

    // Fetch all paragraphs for context
    const { data: allParagraphs, error: paragraphsError } = await supabaseAdmin
      .from('paragraphs')
      .select('content')
      .order('sequence', { ascending: true })

    if (paragraphsError) {
      console.error('Error fetching paragraphs:', paragraphsError)
      return NextResponse.json(
        { error: 'Failed to fetch paragraphs' },
        { status: 500 }
      )
    }

    const previousParagraphs = (allParagraphs || []).map(p => p.content)
    const lastParagraph = previousParagraphs[previousParagraphs.length - 1] || ''

    // Generate new paragraph
    let newParagraph: string
    let attempts = 0
    const maxAttempts = 2

    while (attempts < maxAttempts) {
      try {
        newParagraph = await generateParagraph({
          currentDrift: state.current_drift,
          motifs: state.motifs as string[],
          previousParagraphs,
          lastParagraph
        })

        // Validate the paragraph
        const validation = validateParagraph(newParagraph, previousParagraphs)
        
        if (validation.valid) {
          break // Valid paragraph, exit loop
        } else {
          console.warn(`Validation failed (attempt ${attempts + 1}):`, validation.error)
          attempts++
          if (attempts >= maxAttempts) {
            return NextResponse.json(
              { error: `Failed to generate valid paragraph after ${maxAttempts} attempts: ${validation.error}` },
              { status: 500 }
            )
          }
        }
      } catch (error) {
        console.error('Error generating paragraph:', error)
        attempts++
        if (attempts >= maxAttempts) {
          throw error
        }
      }
    }

    // Calculate new drift level
    const newDrift = calculateNextDrift(state.current_drift)

    // Insert new paragraph
    const { data: newParagraphData, error: insertError } = await supabaseAdmin
      .from('paragraphs')
      .insert({
        content: newParagraph!,
        drift_level: newDrift
      })
      .select()
      .single()

    if (insertError || !newParagraphData) {
      console.error('Error inserting paragraph:', insertError)
      return NextResponse.json(
        { error: 'Failed to save paragraph' },
        { status: 500 }
      )
    }

    // Update story state
    const { error: updateError } = await supabaseAdmin
      .from('story_state')
      .update({
        current_drift: newDrift,
        last_update: new Date().toISOString(),
        last_paragraph_id: newParagraphData.id
      })
      .eq('id', state.id)

    if (updateError) {
      console.error('Error updating story state:', updateError)
      return NextResponse.json(
        { error: 'Failed to update story state' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paragraph: {
        id: newParagraphData.id,
        content: newParagraphData.content,
        drift_level: newDrift,
        sequence: newParagraphData.sequence
      }
    })
  } catch (error) {
    console.error('Unexpected error in generate endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
